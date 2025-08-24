// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import EditUserInfo from '@components/dialogs/edit-user-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'

// Vars
const userData = {
  name: 'Eko Wahyudi',
  no_hp: '08121555423',
  email: 'eko@gmail.com',
  status: 'active',
  role: 'owner',
  bergabung: '24 Agustus 2025'
}

const UserDetails = () => {
  // Vars
  const buttonProps = (children: string, color: ThemeColor, variant: ButtonProps['variant']): ButtonProps => ({
    children,
    color,
    variant
  })

  return (
    <>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='flex flex-col items-center gap-4'>
                <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} />
                <Typography variant='h5'>{`${userData.name}`}</Typography>
              </div>
              <Chip label='Owner' color='warning' size='small' variant='tonal' />
            </div>
            <div className='flex items-center justify-around flex-wrap gap-4'>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='primary' skin='light'>
                  <i className='tabler-box' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5' className='text-center'>10</Typography>
                  <Typography>Product</Typography>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='success' skin='light'>
                  <i className='tabler-cash-register' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5' className='text-center'>Rp. 4.762.200</Typography>
                  <Typography>Billing Revenue</Typography>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Typography variant='h5'>Details</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Nama Lengkap:
                </Typography>
                <Typography>{userData.name}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  No Hp:
                </Typography>
                <Typography>{userData.no_hp}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Email:
                </Typography>
                <Typography color='text.primary'>{userData.email}</Typography>
              </div>
              <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Status:
              </Typography>
              <Chip label='Active' variant='tonal' color='success' size='small' />
            </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  Bergabung Sejak:
                </Typography>
                <Typography color='text.primary'>{userData.bergabung}</Typography>
              </div>
            </div>
          </div>
          <div className='flex gap-4 justify-center'>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{
                ...buttonProps('Edit', 'primary', 'tonal'),
                startIcon: <i className='tabler-user-edit' />
              }}
              dialog={EditUserInfo}
              dialogProps={{ data: userData }}
            />
            <OpenDialogOnElementClick 
              element={Button}
              elementProps={{
                ...buttonProps('Ganti Password', 'warning', 'tonal'),
                startIcon: <i className='tabler-password-fingerprint' />
              }}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'suspend-account' }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default UserDetails
