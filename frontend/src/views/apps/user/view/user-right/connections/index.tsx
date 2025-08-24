'use client'

// Next Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars: mapping platform ke icon + warna
const socialAccountsArr = [
  {
    title: 'Instagram',
    icon: 'tabler-brand-instagram',
    color: '#E4405F', // Instagram pink
    placeholder: 'https://instagram.com/username'
  },
  {
    title: 'Facebook',
    icon: 'tabler-brand-facebook',
    color: '#1877F2', // Facebook blue
    placeholder: 'https://facebook.com/username'
  },
  {
    title: 'TikTok',
    icon: 'tabler-brand-tiktok',
    color: '#000000', // TikTok black
    placeholder: 'https://tiktok.com/@username'
  },
  {
    title: 'YouTube',
    icon: 'tabler-brand-youtube',
    color: '#FF0000', // YouTube red
    placeholder: 'https://youtube.com/@channel'
  }
]

const ConnectionsTab = () => {
  // State untuk URL tiap akun
  const [urls, setUrls] = useState<Record<string, string>>({})

  const handleChange = (platform: string, value: string) => {
    setUrls({ ...urls, [platform]: value })
  }

  const handleSubmit = (platform: string) => {
    console.log(`Submit ${platform}:`, urls[platform] || '')
    // TODO: panggil API untuk simpan url akun
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title="Social Accounts"
            subheader="Tambahkan URL akun sosial media Anda"
          />
          <CardContent className="flex flex-col gap-4">
            {socialAccountsArr.map((item, index) => (
              <Box
                key={index}
                className="flex items-center justify-between gap-4"
              >
                {/* Icon + nama */}
                <div className="flex items-center gap-3 w-1/4">
                  <i
                    className={`${item.icon}`}
                    style={{ fontSize: 28, color: item.color }}
                  />
                  <Typography className="font-medium" color="text.primary">
                    {item.title}
                  </Typography>
                </div>

                {/* Input URL */}
                <div className="flex-grow">
                  <CustomTextField
                    fullWidth
                    type="url"
                    placeholder={item.placeholder}
                    value={urls[item.title] || ''}
                    onChange={(e) => handleChange(item.title, e.target.value)}
                  />
                </div>

                {/* Tombol Submit */}
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSubmit(item.title)}
                >
                  Submit
                </Button>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ConnectionsTab
