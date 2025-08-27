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
import { toast } from 'react-toastify'

// Validation Schema
const schema = yup.object().shape({
  storeName: yup.string().required('Nama toko wajib diisi').min(3, 'Nama toko minimal 3 karakter'),
  subdomain: yup
    .string()
    .required('Subdomain wajib diisi')
    .min(3, 'Subdomain minimal 3 karakter')
    .matches(/^[a-z0-9-]+$/, 'Subdomain hanya boleh huruf kecil, angka, dan tanda -'),
  phoneNumber: yup.string().required('Nomor HP wajib diisi').min(8, 'Nomor HP minimal 10 digit'),
  category: yup.string().required('Kategori toko wajib dipilih'),
  description: yup.string().required('Deskripsi toko wajib diisi').min(10, 'Deskripsi minimal 10 karakter')
})

// Category mapping between UI labels and backend enum slugs
const CATEGORY_LABEL_TO_SLUG: Record<string, string> = {
  'Produk Digital': 'digital',
  'Fashion & Pakaian': 'fashion',
  'Elektronik & Gadget': 'elektronik',
  'Makanan & Minuman': 'makanan',
  'Kesehatan & Kecantikan': 'kesehatan',
  'Rumah & Taman': 'rumah_tangga',
  'Olahraga & Outdoor': 'olahraga',
  'Buku & Alat Tulis': 'buku_media',
  'Mainan & Bayi': 'mainan_hobi',
  'Otomotif': 'otomotif',
  'Jasa': 'jasa',
  'Lainnya': 'lainnya'
}

const CATEGORY_SLUG_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_LABEL_TO_SLUG).map(([label, slug]) => [slug, label])
)

const categories = Object.keys(CATEGORY_LABEL_TO_SLUG)

// Types
type StoreItem = {
  id: number
  uuid?: string
  name: string
  subdomain: string
  domain?: string
  phone: string
  category: string
  description: string
  url?: string
}

// Form values type aligned with form field names
type FormValues = {
  storeName: string
  subdomain: string
  phoneNumber: string
  category: string
  description: string
}

const TokoSaya = () => {
  // States
  const [storeData, setStoreData] = useState<Partial<StoreItem>>({})
  const [selectedStoreUuid, setSelectedStoreUuid] = useState<string | null>(null)
  const [initialSubdomain, setInitialSubdomain] = useState<string>('')
  const [loadingStore, setLoadingStore] = useState<boolean>(true)
  const [subdomainChecking, setSubdomainChecking] = useState(false)
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)

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
      storeName: '',
      subdomain: '',
      phoneNumber: '',
      category: '',
      description: ''
    }
  })

  const watchedSubdomain = watch('subdomain')

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  // Fetch current user's store(s) and prefill form
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStore(true)
        const res = await fetch('/api/public/stores', { cache: 'no-store' })
        const json = await res.json()
        const stores: StoreItem[] = json?.data || json?.stores || []
        if (Array.isArray(stores) && stores.length > 0) {
          const s = stores[0]
          setStoreData(s)
          if ((s as any).uuid) setSelectedStoreUuid((s as any).uuid as string)
          setInitialSubdomain(s.subdomain)
          // Prefill form values
          setValue('storeName', s.name || '')
          setValue('subdomain', s.subdomain || '')
          setValue('phoneNumber', s.phone || '')
          setValue('category', CATEGORY_SLUG_TO_LABEL[s.category as string] || CATEGORY_SLUG_TO_LABEL[(s as any).kategori_toko as string] || '')
          setValue('description', s.description || '')
          // For existing subdomain, mark as available to avoid false error
          setSubdomainAvailable(true)
        }
      } catch (err) {
        console.error('Failed to fetch stores:', err)
      } finally {
        setLoadingStore(false)
      }
    }

    fetchStores()
  }, [setValue])

  // Check subdomain availability
  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null)
      return
    }

    // If user hasn't changed the original subdomain, consider it valid
    if (initialSubdomain && subdomain === initialSubdomain) {
      setSubdomainAvailable(true)
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
  const onSubmit = async (values: FormValues) => {
    if (!selectedStoreUuid) return

    try {
      setIsSaving(true)

      // Prevent submit if subdomain invalid or taken
      if (values.subdomain && (!/^[a-z0-9-]+$/.test(values.subdomain) || values.subdomain.length < 3)) {
        toast.error('Subdomain tidak valid')
        setIsSaving(false)
        return
      }
      if (values.subdomain && subdomainAvailable === false && values.subdomain !== initialSubdomain) {
        toast.error('Subdomain sudah digunakan')
        setIsSaving(false)
        return
      }

      const payload: any = {
        nama_toko: values.storeName,
        subdomain: values.subdomain,
        no_hp_toko: values.phoneNumber,
        kategori_toko: CATEGORY_LABEL_TO_SLUG[values.category] || 'lainnya',
        deskripsi_toko: values.description
      }

      const res = await fetch(`/api/public/stores/${selectedStoreUuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Gagal menyimpan perubahan')
      } else {
        toast.success(data.message || 'Berhasil menyimpan perubahan')
        // Update initial subdomain if changed
        if (values.subdomain) setInitialSubdomain(values.subdomain)
        setIsEditing(false) // Disable edit mode after successful update
      }
    } catch (e) {
      console.error(e)
      toast.error('Terjadi kesalahan server')
    } finally {
      setIsSaving(false)
    }
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    label="No. Hp Toko"
                    placeholder="08123456789"
                    disabled={!isEditing}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message as string}
                    // InputProps={{
                    //   startAdornment: <InputAdornment position="start">+62</InputAdornment>
                    // }}
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
                    <Select {...field} label="Kategori" disabled={!isEditing}>
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
                    disabled={!isEditing}
                    error={!!errors.description}
                    helperText={errors.description?.message as string}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box className="flex justify-end gap-4 mt-6">
            {!isEditing ? (
              <Button
                variant="contained"
                onClick={handleEditToggle}
                endIcon={<i className="tabler-edit" />}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSaving || subdomainAvailable === false || subdomainChecking}
                  endIcon={<i className="tabler-check" />}
                >
                  {isSaving ? 'Mengupdate...' : 'Update'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TokoSaya
