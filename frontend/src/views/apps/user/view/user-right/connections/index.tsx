'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Types
type SocialMedia = {
  uuid: string
  store_uuid: string
  platform: string
  url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

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
  // States
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMedia[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  // Fetch social media accounts from API
  const fetchSocialMedia = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/social-media', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const accounts = result.data || []
          setSocialMediaAccounts(accounts)
          
          // Initialize URLs from existing data
          const initialUrls: Record<string, string> = {}
          accounts.forEach((account: SocialMedia) => {
            initialUrls[account.platform] = account.url
          })
          setUrls(initialUrls)
        }
      } else {
        console.error('Failed to fetch social media accounts')
      }
    } catch (error) {
      console.error('Error fetching social media accounts:', error)
      toast.error('Gagal memuat data akun sosial media')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (platform: string, value: string) => {
    setUrls({ ...urls, [platform]: value })
  }

  const handleSubmit = async (platform: string) => {
    const url = urls[platform] || ''
    
    if (!url.trim()) {
      toast.error('URL tidak boleh kosong')
      return
    }

    try {
      setUpdating({ ...updating, [platform]: true })
      
      // Check if account already exists
      const existingAccount = socialMediaAccounts.find(acc => acc.platform === platform)
      
      const payload = {
        platform: platform,
        url: url.trim(),
        is_active: true
      }

      const apiUrl = existingAccount 
        ? `/api/social-media/${existingAccount.uuid}` 
        : '/api/social-media'
      
      const method = existingAccount ? 'PUT' : 'POST'
      
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        toast.success(existingAccount ? 'Akun berhasil diperbarui' : 'Akun berhasil ditambahkan')
        fetchSocialMedia() // Refresh data
      } else {
        toast.error(result.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving social media account:', error)
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setUpdating({ ...updating, [platform]: false })
    }
  }

  useEffect(() => {
    fetchSocialMedia()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title="Social Accounts"
            subheader="Tambahkan URL akun sosial media Anda"
          />
          <CardContent className="flex flex-col gap-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <CircularProgress />
                <Typography className="ml-4">Memuat data akun sosial media...</Typography>
              </div>
            ) : (
              socialAccountsArr.map((item, index) => (
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
                      disabled={updating[item.title]}
                    />
                  </div>

                  {/* Tombol Update */}
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSubmit(item.title)}
                    disabled={updating[item.title]}
                  >
                    {updating[item.title] ? 'Updating...' : 'Update'}
                  </Button>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ConnectionsTab
