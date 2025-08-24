'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const DomainToko = () => {
  // States
  const [selectedToko, setSelectedToko] = useState('')
  const [domain, setDomain] = useState('')

  return (
    <Card>
      <CardHeader
        title="Domain Toko"
        subheader="Pengaturan Toko agar lebih mudah dikenali."
        sx={{ pb: 1 }}
      />
      <Divider className="mlb-4" />
      <CardContent className="flex flex-col gap-4">
        <form>
          <Grid container spacing={4}>
            {/* Dropdown pilih Toko */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label="Pilih Toko"
                value={selectedToko}
                onChange={(e) => setSelectedToko(e.target.value)}
              >
                <MenuItem value="">-- Pilih Toko --</MenuItem>
                <MenuItem value="toko1">Toko 1</MenuItem>
                <MenuItem value="toko2">Toko 2</MenuItem>
                <MenuItem value="toko3">Toko 3</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Input domain */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label="Domain"
                placeholder="contoh: tokosaya.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </Grid>

            {/* Tombol submit */}
            <Grid size={{ xs: 12 }} className="flex gap-4">
              <Button variant="contained" type="submit">
                Simpan
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default DomainToko