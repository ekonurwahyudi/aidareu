'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Third-party Imports
import { toast } from 'react-toastify'

// Types
type StoreItem = {
  id: number
  uuid: string
  name: string
  subdomain: string
  domain?: string
  phone: string
  category: string
  description: string
  url?: string
}

const DomainToko = () => {
  // States
  const [stores, setStores] = useState<StoreItem[]>([])
  const [selectedStoreUuid, setSelectedStoreUuid] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // Fetch stores
  const fetchStores = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/public/stores', { cache: 'no-store' })
      const json = await res.json()
      const storesData: StoreItem[] = json?.data || json?.stores || []
      
      if (Array.isArray(storesData)) {
        setStores(storesData)
        
        // Auto select first store if available
        if (storesData.length > 0) {
          const firstStore = storesData[0]
          setSelectedStoreUuid(firstStore.uuid)
          setDomain(firstStore.domain || '')
        }
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err)
      toast.error('Gagal memuat data toko')
    } finally {
      setLoading(false)
    }
  }

  // Handle store selection change
  const handleStoreChange = (storeUuid: string) => {
    setSelectedStoreUuid(storeUuid)
    const selectedStore = stores.find(store => store.uuid === storeUuid)
    setDomain(selectedStore?.domain || '')
  }

  // Handle domain update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStoreUuid) {
      toast.error('Pilih toko terlebih dahulu')
      return
    }

    try {
      setSaving(true)
      
      const payload = {
        domain: domain.trim()
      }

      const res = await fetch(`/api/public/stores/${selectedStoreUuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success('Domain berhasil diperbarui!')
        // Update local state
        setStores(stores.map(store => 
          store.uuid === selectedStoreUuid 
            ? { ...store, domain: domain.trim() }
            : store
        ))
      } else {
        toast.error(data.message || 'Gagal memperbarui domain')
      }
    } catch (error) {
      console.error('Error updating domain:', error)
      toast.error('Terjadi kesalahan saat memperbarui domain')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  const selectedStore = stores.find(store => store.uuid === selectedStoreUuid)

  return (
    <Card>
      <CardHeader
        title="Domain Toko"
        subheader="Pengaturan Toko agar lebih mudah dikenali."
        sx={{ pb: 1 }}
      />
      <Divider className="mlb-4" />
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Dropdown pilih Toko */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label="Pilih Toko"
                value={selectedStoreUuid}
                onChange={(e) => handleStoreChange(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">-- Pilih Toko --</MenuItem>
                {stores.map((store) => (
                  <MenuItem key={store.uuid} value={store.uuid}>
                    {store.name}
                  </MenuItem>
                ))}
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
                helperText="Domain kustom untuk toko (tanpa https://)"
                disabled={loading || !selectedStoreUuid}
              />
            </Grid>

            {/* Store Info */}
            {selectedStore && (
              <Grid size={{ xs: 12 }}>
                <Box className="p-4 bg-gray-50 rounded-lg">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Nama Toko:</strong> {selectedStore.name}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        <strong>Subdomain:</strong> {selectedStore.subdomain}.aidareu.com
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2">
                        <strong>Domain Saat Ini:</strong> {selectedStore.domain || 'Belum diatur'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Tombol submit */}
            <Grid size={{ xs: 12 }} className="flex justify-end gap-4">
              <Button 
                variant="outlined" 
                onClick={() => window.open('https://www.domainesia.com/', '_blank')}
                startIcon={<i className="tabler-external-link" />}
              >
                Cek Domain
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={saving || !selectedStoreUuid}
                endIcon={<i className="tabler-check" />}
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default DomainToko