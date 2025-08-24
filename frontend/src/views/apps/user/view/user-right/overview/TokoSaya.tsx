'use client'

// React Imports
import { useState,useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// Validation Schema
const schema = yup.object().shape({
  storeName: yup.string().required('Nama toko wajib diisi').min(3, 'Nama toko minimal 3 karakter'),
  subdomain: yup
    .string()
    .required('Subdomain wajib diisi')
    .min(3, 'Subdomain minimal 3 karakter')
    .matches(/^[a-z0-9-]+$/, 'Subdomain hanya boleh huruf kecil, angka, dan tanda -'),
  phoneNumber: yup.string().required('Nomor HP wajib diisi').min(10, 'Nomor HP minimal 10 digit'),
  category: yup.string().required('Kategori toko wajib dipilih'),
  description: yup.string().required('Deskripsi toko wajib diisi').min(10, 'Deskripsi minimal 10 karakter')
})

const categories = [
  'Produk Digital',
  'Fashion & Pakaian',
  'Elektronik & Gadget',
  'Makanan & Minuman',
  'Kesehatan & Kecantikan',
  'Rumah & Taman',
  'Olahraga & Outdoor',
  'Buku & Alat Tulis',
  'Mainan & Bayi',
  'Otomotif',
  'Lainnya'
]

const TokoSaya = () => {
  // States
  const [storeData, setStoreData] = useState<any>({})
  const [subdomainChecking, setSubdomainChecking] = useState(false)
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null)

  // Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      storeName: storeData.storeName || '',
      subdomain: storeData.subdomain || '',
      phoneNumber: storeData.phoneNumber || '',
      category: storeData.category || '',
      description: storeData.description || ''
    }
  })

  const watchedSubdomain = watch('subdomain')

  // Check subdomain availability
  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null)
      return
    }

    setSubdomainChecking(true)
    try {
      const res = await fetch(`/api/stores/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`)
      const data = await res.json()
      setSubdomainAvailable(res.ok ? data.available : null)
    } catch (err) {
      console.error(err)
      setSubdomainAvailable(null)
    }
    setSubdomainChecking(false)
  }

  // Debounce check
  useEffect(() => {
    if (checkTimeout) clearTimeout(checkTimeout)
    if (watchedSubdomain) {
      const timeout = setTimeout(() => checkSubdomainAvailability(watchedSubdomain), 800)
      setCheckTimeout(timeout)
    } else {
      setSubdomainAvailable(null)
    }
    return () => {
      if (checkTimeout) clearTimeout(checkTimeout)
    }
  }, [watchedSubdomain])

  // Auto-generate subdomain
  const generateSubdomain = (storeName: string) => {
    return storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Submit
  const onSubmit = (data: any) => {
    console.log('Data toko:', data)
    setStoreData(data)
    // TODO: simpan ke backend Laravel
  }

  return (
    <Card>
      <CardHeader title="Pengaturan Toko" subheader='Pengaturan Toko agar lebih mudah dikenali.' sx={{ pb: 1 }} />
      <Divider className='mlb-4' />
      <CardContent>
        <Box component="form"  onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={7}>
            {/* Nama Toko */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="storeName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nama Toko"
                    error={!!errors.storeName}
                    helperText={errors.storeName?.message as string}
                    onChange={(e) => {
                      field.onChange(e)
                      setValue('subdomain', generateSubdomain(e.target.value))
                    }}
                  />
                )}
              />
            </Grid>

            {/* Subdomain */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="subdomain"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Subdomain"
                    error={!!errors.subdomain || subdomainAvailable === false}
                    helperText={
                      errors.subdomain?.message ||
                      (subdomainAvailable === false
                        ? 'Subdomain sudah digunakan'
                        : subdomainAvailable === true
                        ? 'Subdomain tersedia'
                        : subdomainChecking
                        ? 'Mengecek...'
                        : '')
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">https://</InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          {subdomainChecking ? (
                            <CircularProgress size={20} />
                          ) : subdomainAvailable === true ? (
                            <i className="tabler-check text-success" />
                          ) : subdomainAvailable === false ? (
                            <i className="tabler-x text-error" />
                          ) : null}
                          <span className="ml-2">.aidareu.com</span>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            {/* No HP */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="No. HP"
                    placeholder="08123456789"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message as string}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">+62</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>

            {/* Kategori */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Kategori</InputLabel>
                    <Select {...field} label="Kategori">
                      {categories.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.category?.message as string}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Deskripsi */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Deskripsi Toko"
                    error={!!errors.description}
                    helperText={errors.description?.message as string}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box className="flex justify-end mt-6">
            <Button
              variant="contained"
              type="submit"
              disabled={subdomainAvailable === false || subdomainChecking}
              endIcon={<i className="tabler-arrow-right" />}
            >
              Simpan
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TokoSaya
