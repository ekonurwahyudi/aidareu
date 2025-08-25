'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import CustomTextField from '@core/components/mui/TextField'

const ProductOrganize = () => {
  // States
  const [vendor, setVendor] = useState('')
  const [category, setCategory] = useState('')
  const [collection, setCollection] = useState('')
  const [status, setStatus] = useState('')

  return (
    <Card>
      <CardHeader title='Setting Produk' />
      <CardContent>
        <form onSubmit={e => e.preventDefault()} className='flex flex-col gap-6'>
          <div className='flex items-end gap-4'>
            <CustomTextField
              select
              fullWidth
              label='Kategori'
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <MenuItem value='Household'>Produk Rumah</MenuItem>
              <MenuItem value='Office'>Office</MenuItem>
              <MenuItem value='Electronics'>Electronics</MenuItem>
              <MenuItem value='Management'>Management</MenuItem>
              <MenuItem value='Automotive'>Automotive</MenuItem>
            </CustomTextField>
          </div>
          <CustomTextField select fullWidth label='Status' value={status} onChange={e => setStatus(e.target.value)}>
            <MenuItem value='Published'>Published</MenuItem>
            <MenuItem value='Inactive'>Inactive</MenuItem>
          </CustomTextField>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProductOrganize
