'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import type { ButtonProps } from '@mui/material/Button'
import Divider from '@mui/material/Divider'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import BillingCard from '@components/dialogs/billing-card'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

type DataType = {
  name: string
  imgSrc: string
  imgAlt: string
  cardNumber: string
  cardStatus?: string
  badgeColor?: ThemeColor
}

// Vars
const data: DataType[] = [
  {
    name: 'Eko Wahyudi',
    imgAlt: 'Mastercard',
    badgeColor: 'primary',
    cardStatus: 'Primary',
    cardNumber: '5577 0000 5577 9865',
    imgSrc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/1199px-Bank_Central_Asia.svg.png'
  },
]

const PaymentMethod = () => {
  // States
  const [creditCard, setCreditCard] = useState(0)

  const handleAddCard = () => {
    setCreditCard(-1)
  }

  const handleClickOpen = (index: number) => {
    setCreditCard(index)
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

  const editButtonProps = (index: number): ButtonProps => ({
    variant: 'tonal',
    children: 'Edit',
    size: 'small',
    onClick: () => handleClickOpen(index)
  })

  return (
    <>
      <Card>
        <CardHeader
           title="Domain Toko"
        subheader="Pengaturan Toko agar lebih mudah dikenali."
        sx={{ pb: 1 }}
      
          action={<OpenDialogOnElementClick element={Button} elementProps={addButtonProps} dialog={BillingCard} />}
        />
      <Divider className="mlb-4" />
        <CardContent className='flex flex-col gap-4'>
          {data.map((item, index) => (
            <div
              key={index}
              className='flex justify-between border rounded sm:items-center p-6 flex-col !items-start sm:flex-row gap-2'
            >
              <div className='flex flex-col items-start gap-2'>
                <img src={item.imgSrc} alt={item.imgAlt} height={25} />
                <div className='flex items-center gap-2'>
                  <Typography className='font-medium' color='text.primary'>
                    {item.name}
                  </Typography>
                  {item.cardStatus ? (
                    <Chip color={item.badgeColor} label={item.cardStatus} size='small' variant='tonal' />
                  ) : null}
                </div>
                <Typography>
                  {item.cardNumber && item.cardNumber.slice(0, -4).replace(/[0-9]/g, '*') + item.cardNumber.slice(-4)}
                </Typography>
              </div>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-end gap-4'>
                  <OpenDialogOnElementClick
                    element={Button}
                    elementProps={editButtonProps(index)}
                    dialog={BillingCard}
                    dialogProps={{ data: data[creditCard] }}
                  />
                  <Button variant='tonal' color='error' size='small'>
                    Delete
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

export default PaymentMethod
