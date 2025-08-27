'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import type { ButtonProps } from '@mui/material/Button'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { toast } from 'react-toastify'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import BillingCard from '@components/dialogs/billing-card'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

type BankAccount = {
  uuid: string
  store_uuid: string
  account_name: string
  bank_name: string
  account_number: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

// Bank logo mapping
const BANK_LOGOS: Record<string, string> = {
  'BCA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/1199px-Bank_Central_Asia.svg.png',
  'BNI': 'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/300px-BNI_logo.svg.png',
  'BRI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/189px-BANK_BRI_logo.svg.png',
  'Mandiri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/320px-Bank_Mandiri_logo_2016.svg.png'
}

const RekeningBank = () => {
  // States
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

  // Fetch bank accounts from API
  const fetchBankAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/public/bank-accounts', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBankAccounts(result.data || [])
        }
      } else {
        console.error('Failed to fetch bank accounts')
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      toast.error('Gagal memuat data rekening bank')
    } finally {
      setLoading(false)
    }
  }

  // Delete bank account
  const handleDelete = async (uuid: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rekening ini?')) return

    try {
      const response = await fetch(`/api/public/bank-accounts/${uuid}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Rekening berhasil dihapus')
        fetchBankAccounts() // Refresh data
      } else {
        toast.error('Gagal menghapus rekening')
      }
    } catch (error) {
      console.error('Error deleting bank account:', error)
      toast.error('Terjadi kesalahan saat menghapus rekening')
    }
  }

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const handleAddCard = () => {
    setSelectedAccount(null)
  }

  const handleEditCard = (account: BankAccount) => {
    setSelectedAccount(account)
  }

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return ''
    if (accountNumber.length <= 4) return accountNumber
    const maskedPart = '*'.repeat(accountNumber.length - 4)
    const lastFour = accountNumber.slice(-4)
    return maskedPart + lastFour
  }

  // Vars
  const addButtonProps: ButtonProps = {
    variant: 'contained',
    children: 'Tambah Rekening',
    size: 'small',
    color: 'primary',
    startIcon: <i className='tabler-plus' />,
    onClick: handleAddCard
  }

  const editButtonProps = (account: BankAccount): ButtonProps => ({
    variant: 'tonal',
    children: 'Edit',
    size: 'small',
    onClick: () => handleEditCard(account)
  })

  return (
    <>
      <Card>
        <CardHeader
          title="Rekening Bank"
          subheader="Kelola rekening bank untuk penarikan dana dari toko."
          sx={{ pb: 1 }}
          action={<OpenDialogOnElementClick element={Button} elementProps={addButtonProps} dialog={BillingCard} dialogProps={{ onSuccess: fetchBankAccounts }} />}
        />
        <Divider className="mlb-4" />
        <CardContent className='flex flex-col gap-4'>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <CircularProgress />
              <Typography className="ml-4">Memuat data rekening...</Typography>
            </div>
          ) : bankAccounts.length === 0 ? (
            <Typography className="text-center py-8" color="textSecondary">
              Belum ada rekening bank yang terdaftar. Klik "Tambah Rekening" untuk menambah rekening baru.
            </Typography>
          ) : (
            bankAccounts.map((account, index) => (
              <div
                key={account.uuid}
                className='flex justify-between border rounded sm:items-center p-6 flex-col !items-start sm:flex-row gap-2'
              >
                <div className='flex flex-col items-start gap-2'>
                  <img 
                    src={BANK_LOGOS[account.bank_name] || BANK_LOGOS['BCA']} 
                    alt={account.bank_name} 
                    height={25} 
                    style={{ objectFit: 'contain' }}
                  />
                  <div className='flex items-center gap-2'>
                    <Typography className='font-medium' color='text.primary'>
                      {account.account_name}
                    </Typography>
                    {account.is_primary && (
                      <Chip color="primary" label="Primary" size='small' variant='tonal' />
                    )}
                  </div>
                  <Typography>
                    {account.bank_name} - {maskAccountNumber(account.account_number)}
                  </Typography>
                </div>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-end gap-4'>
                    <OpenDialogOnElementClick
                      element={Button}
                      elementProps={editButtonProps(account)}
                      dialog={BillingCard}
                      dialogProps={{ 
                        data: {
                          cardNumber: account.account_number,
                          name: account.account_name,
                          bank: account.bank_name,
                          uuid: account.uuid,
                          is_primary: account.is_primary
                        },
                        onSuccess: fetchBankAccounts 
                      }}
                    />
                    <Button 
                      variant='tonal' 
                      color='error' 
                      size='small'
                      onClick={() => handleDelete(account.uuid)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default RekeningBank
