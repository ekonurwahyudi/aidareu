// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import CustomTextField from '@core/components/mui/TextField'
import ShippingOptions from '@/components/shipping/ShippingOptions'
import PaymentMethods from '@/components/payment/PaymentMethods'

// Cart Context
import { useCart } from '@/contexts/CartContext'
import type { CartItem } from '@/contexts/CartContext' // impor tipe untuk anotasi

// Helper function to format currency in Rupiah
const formatRupiah = (amount: number): string => {
  return `Rp. ${Math.round(amount).toLocaleString('id-ID')}`
}

const StepCart = ({ handleNext }: { handleNext: () => void }) => {
  // States
  const [openCollapse, setOpenCollapse] = useState<boolean>(true)
  const [openFade, setOpenFade] = useState<boolean>(true)

  // Customer Information States
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    city: '',
    district: ''
  })

  // Payment Method State
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  // Shipping State
  const [selectedShipping, setSelectedShipping] = useState<any>(null)

  // Location API States
  const [provinces, setProvinces] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  // Cart Context
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    getTotalPrice,
    getTotalItems
  } = useCart()

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load cities when province changes
  useEffect(() => {
    if (customerInfo.province) {
      loadCities(customerInfo.province)
      setCustomerInfo(prev => ({ ...prev, city: '', district: '' }))
      setCities([])
      setDistricts([])
    }
  }, [customerInfo.province])

  // Load districts when city changes
  useEffect(() => {
    if (customerInfo.city) {
      loadDistricts(customerInfo.city)
      setCustomerInfo(prev => ({ ...prev, district: '' }))
      setDistricts([])
    }
  }, [customerInfo.city])

  useEffect(() => {
    if (!openFade) {
      setTimeout(() => {
        setOpenCollapse(false)
      }, 300)
    }
  }, [openFade])

  // API Functions
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      const data = await response.json()
      setProvinces(data)
    } catch (error) {
      console.error('Error loading provinces:', error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  const loadCities = async (provinceId: string) => {
    setLoadingCities(true)
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`)
      const data = await response.json()
      setCities(data)
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setLoadingCities(false)
    }
  }

  const loadDistricts = async (cityId: string) => {
    setLoadingDistricts(true)
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`)
      const data = await response.json()
      setDistricts(data)
    } catch (error) {
      console.error('Error loading districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  // Handle form changes
  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
  }

  // Check if all products are digital
  const isAllDigitalProducts = () => {
    return cartItems.length > 0 && cartItems.every(item => item.jenis_produk === 'digital')
  }

  // Get store UUID from cart items (assuming all items are from the same store)
  const getStoreUuid = () => {
    if (cartItems.length > 0 && cartItems[0].storeUuid) {
      return cartItems[0].storeUuid
    }
    return ''
  }

  // Calculate total weight of cart items (in grams)
  const getTotalWeight = () => {
    if (isAllDigitalProducts()) return 0
    // Default weight per item is 500g if not specified
    return cartItems.reduce((total, item) => {
      const itemWeight = (item as any).weight || 500 // 500g default
      return total + (itemWeight * item.quantity)
    }, 0)
  }

  // Get province name from ID
  const getProvinceName = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId)
    return province ? province.name : ''
  }

  // Get city name from ID
  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId)
    return city ? city.name : ''
  }

  // Get district name from ID
  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId)
    return district ? district.name : ''
  }

  // Validation function
  const isFormValid = () => {
    const isDigital = isAllDigitalProducts()

    if (isDigital) {
      // For digital products, only require basic info
      return (
        customerInfo.name.trim() !== '' &&
        customerInfo.phone.trim() !== '' &&
        customerInfo.email.trim() !== '' &&
        cartItems.length > 0
      )
    } else {
      // For physical products, require all info including address and shipping
      return (
        customerInfo.name.trim() !== '' &&
        customerInfo.phone.trim() !== '' &&
        customerInfo.email.trim() !== '' &&
        customerInfo.address.trim() !== '' &&
        customerInfo.province !== '' &&
        customerInfo.city !== '' &&
        customerInfo.district !== '' &&
        selectedShipping !== null &&
        cartItems.length > 0
      )
    }
  }

  // Handle shipping option selection
  const handleShippingSelect = (shippingOption: any) => {
    setSelectedShipping(shippingOption)
  }

  // Handle payment method selection
  const handlePaymentSelect = (paymentMethod: any) => {
    setSelectedPayment(paymentMethod)
  }

  // Get total price including shipping
  const getTotalWithShipping = () => {
    const baseTotal = getTotalPrice()
    const shippingCost = selectedShipping ? selectedShipping.cost : 0
    return baseTotal + shippingCost
  }

  return (
    <Grid container spacing={{ xs: 3, md: 4, lg: 6 }}>
      <Grid size={{ xs: 12, lg: 8 }} className='flex flex-col gap-4'>
        <Collapse  in={openCollapse}>
          <Fade in={openFade} timeout={{ exit: 300 }}>
            <Alert
              severity='warning'
              icon={<i className='tabler-alert-triangle' />}
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpenFade(false)
                  }}
                >
                  <i className='tabler-x' />
                </IconButton>
              }
            >
              <AlertTitle>Perhatian!!</AlertTitle>
              <Typography color='warning.main'>
                - Cek detail pesanan sebelum melanjutkan checkout
              </Typography>
              <Typography color='warning.main'>
                - Pastikan data informasi yang dimasukkan dengan benar
              </Typography>
            </Alert>
          </Fade>
        </Collapse>
        <Typography variant='h5'>Keranjang Belanja ({getTotalItems()} Item{getTotalItems() !== 1 ? 's' : ''})</Typography>

        {cartItems.length === 0 ? (
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              bgcolor: '#f9f9f9'
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Keranjang belanja Anda kosong
            </Typography>
            <Typography color="text.disabled" sx={{ mb: 3 }}>
              Tambahkan produk ke keranjang untuk melanjutkan checkout
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/store"
              sx={{ bgcolor: '#E91E63', '&:hover': { bgcolor: '#C2185B' } }}
            >
              Lanjut Belanja
            </Button>
          </Box>
        ) : (
          <div className='border rounded'>
            {cartItems.map((product: CartItem, index: number) => (
              <div
                key={product.id}
                className='flex flex-col sm:flex-row items-center gap-4 p-6 relative [&:not(:last-child)]:border-be'
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {product.image && product.image !== '/placeholder.jpg' ? (
                    <img
                      height={80}
                      width={80}
                      src={product.image}
                      alt={product.name}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: '2rem' }}>📦</Typography>
                  )}
                </Box>
                <IconButton
                  size='small'
                  className='absolute block-start-4 inline-end-4'
                  onClick={() => removeFromCart(product.id)}
                >
                  <i className='tabler-x text-lg' />
                </IconButton>
                <div className='flex flex-col sm:flex-row items-center sm:justify-between is-full'>
                  <div className='flex flex-col items-center gap-2 sm:items-start'>
                    <Typography color='text.primary' className='font-medium'>
                      {product.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                      Dijual oleh: {product.brand || 'AiDareU Store'}
                    </Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ mb: 1 }}>
                      UUID Toko: {product.storeUuid || '-'}
                    </Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ mb: 1 }}>
                      Jenis Produk: {product.jenis_produk === 'digital' ? (
                        <Chip size='small' label='Digital' color='info' variant='outlined' sx={{ fontSize: '0.7rem', height: '20px' }} />
                      ) : (
                        <Chip size='small' label='Fisik' color='default' variant='outlined' sx={{ fontSize: '0.7rem', height: '20px' }} />
                      )}
                    </Typography>
                    <div className='flex items-center gap-4'>
                      <Chip variant='tonal' size='small' color='success' label='Tersedia' />
                    </div>
                    <CustomTextField
                      size='small'
                      type='number'
                      value={product.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1
                        if (newQuantity > 0) {
                          updateCartQuantity(product.id, newQuantity)
                        }
                      }}
                      inputProps={{ min: 1 }}
                      className='block max-is-[152px]'
                    />
                  </div>
                  <div className='flex flex-col justify-between items-center gap-4 sm:items-end'>
                    <div className='flex flex-col items-end'>
                      {product.salePrice ? (
                        <>
                          <Typography color='primary.main' className='font-medium'>
                            {formatRupiah(product.salePrice)}
                          </Typography>
                          <Typography className='line-through text-sm' color='text.disabled'>
                            {formatRupiah(product.price)}
                          </Typography>
                        </>
                      ) : (
                        <Typography color='primary.main' className='font-medium'>
                          {formatRupiah(product.price)}
                        </Typography>
                      )}
                    </div>
                    <Button
                      variant='tonal'
                      size='small'
                      onClick={() => removeFromCart(product.id)}
                    >
                      Hapus dari keranjang
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {cartItems.length > 0 && (
          <Typography
            href='/store'
            component={Link}
            className='flex items-center justify-between gap-4 plb-2 pli-5 border border-primary rounded'
            color='primary.main'
          >
            Tambah lebih banyak produk dari toko
            <DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' className='text-base' />
          </Typography>
        )}

        {/* Customer Information Section */}
        <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 3, color: '#1E293B' }}>
              Informasi Data
            </Typography>

            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Nama Lengkap'
                  placeholder='Masukkan nama lengkap'
                  value={customerInfo.name}
                  onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Nomor HP'
                  placeholder='Masukkan nomor HP'
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label='Email'
                  type='email'
                  placeholder='Masukkan alamat email'
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  required
                />
              </Grid>

              {/* Location Dropdowns - Hidden for digital products */}
              {!isAllDigitalProducts() && (
                <>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth required>
                      <InputLabel>Provinsi</InputLabel>
                      <Select
                        value={customerInfo.province}
                        label='Provinsi'
                        onChange={(e) => handleCustomerInfoChange('province', e.target.value)}
                        disabled={loadingProvinces}
                      >
                        {loadingProvinces ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Loading...
                          </MenuItem>
                        ) : (
                          provinces.map((province) => (
                            <MenuItem key={province.id} value={province.id}>
                              {province.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth required>
                      <InputLabel>Kota/Kabupaten</InputLabel>
                      <Select
                        value={customerInfo.city}
                        label='Kota/Kabupaten'
                        onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                        disabled={!customerInfo.province || loadingCities}
                      >
                        {loadingCities ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Loading...
                          </MenuItem>
                        ) : (
                          cities.map((city) => (
                            <MenuItem key={city.id} value={city.id}>
                              {city.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth required>
                      <InputLabel>Kecamatan</InputLabel>
                      <Select
                        value={customerInfo.district}
                        label='Kecamatan'
                        onChange={(e) => handleCustomerInfoChange('district', e.target.value)}
                        disabled={!customerInfo.city || loadingDistricts}
                      >
                        {loadingDistricts ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Loading...
                          </MenuItem>
                        ) : (
                          districts.map((district) => (
                            <MenuItem key={district.id} value={district.id}>
                              {district.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Address Detail */}
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label='Alamat Lengkap'
                      placeholder='Masukkan alamat lengkap (nama jalan, nomor rumah, RT/RW, dll)'
                      multiline
                      rows={3}
                      value={customerInfo.address}
                      onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                      required
                    />
                  </Grid>
                </>
              )}

              {/* Digital products note */}
              {isAllDigitalProducts() && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      p: 3,
                      border: '1px solid #E3F2FD',
                      borderRadius: 2,
                      bgcolor: '#F3F9FF',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" color="info.main" sx={{ fontWeight: 'medium' }}>
                      💾 Produk Digital
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Alamat pengiriman tidak diperlukan untuk produk digital
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Shipping Options Section - Only show for physical products */}
        {!isAllDigitalProducts() && customerInfo.province && customerInfo.city && customerInfo.district && (
          <ShippingOptions
            storeUuid={getStoreUuid()}
            destinationProvince={getProvinceName(customerInfo.province)}
            destinationCity={getCityName(customerInfo.city)}
            destinationDistrict={getDistrictName(customerInfo.district)}
            weight={getTotalWeight()}
            onShippingSelect={handleShippingSelect}
            selectedShipping={selectedShipping}
          />
        )}

        {/* Payment Method Section */}
        {getStoreUuid() && (
          <PaymentMethods
            storeUuid={getStoreUuid()}
            onPaymentSelect={handlePaymentSelect}
            selectedPayment={selectedPayment}
          />
        )}
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Box
          sx={{
            position: { xs: 'static', lg: 'sticky' },
            top: { lg: 20 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: 'fit-content',
            alignSelf: 'flex-start',
            zIndex: 1
          }}
        >
        <div className='border rounded'>
          <CardContent className='flex flex-col gap-4'>
            <Typography color='text.primary' className='font-medium'>
              Voucher
            </Typography>
            <div className='flex gap-4'>
              <CustomTextField fullWidth size='small' placeholder='Masukkan Kode Promo' />
              <Button variant='tonal' className='normal-case'>
                Gunakan
              </Button>
            </div>
          </CardContent>
          <Divider />
          <CardContent className='flex gap-4 flex-col'>
            <Typography color='text.primary' className='font-medium'>
              Detail Harga
            </Typography>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap justify-between'>
                <Typography color='text.primary'>Total Belanja</Typography>
                <Typography color='text.primary'>{formatRupiah(getTotalPrice())}</Typography>
              </div>
              <div className='flex items-center flex-wrap justify-between'>
                <Typography color='text.primary'>Diskon Kupon</Typography>
                <Typography href='/' component={Link} onClick={e => e.preventDefault()} color='primary.main'>
                  0
                </Typography>
              </div>
              <div className='flex items-center flex-wrap justify-between'>
                <Typography color='text.primary'>Total Pesanan</Typography>
                <Typography color='text.primary'>{formatRupiah(getTotalPrice())}</Typography>
              </div>
              {!isAllDigitalProducts() && (
                <div className='flex items-center flex-wrap justify-between'>
                  <Typography color='text.primary'>Biaya Pengiriman</Typography>
                  {selectedShipping ? (
                    <div className='flex flex-col items-end'>
                      <Typography color='text.primary'>
                        {formatRupiah(selectedShipping.cost)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {selectedShipping.courier} - {selectedShipping.service_name}
                      </Typography>
                    </div>
                  ) : (
                    <Typography color='text.secondary'>
                      Pilih pengiriman
                    </Typography>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className='flex items-center flex-wrap justify-between'>
              <Typography color='text.primary' className='font-medium'>
                Total
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {formatRupiah(getTotalWithShipping())}
              </Typography>
            </div>
          </CardContent>
        </div>
        <div className='flex justify-normal sm:justify-end xl:justify-normal'>
          <Button
            className='max-sm:is-full lg:is-full'
            variant='contained'
            onClick={handleNext}
            disabled={!isFormValid()}
            sx={{
              bgcolor: '#E91E63',
              '&:hover': { bgcolor: '#C2185B' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {cartItems.length === 0
              ? 'Keranjang Kosong'
              : !isFormValid()
                ? 'Lengkapi Data Dulu'
                : `Bayar Sekarang - ${formatRupiah(getTotalWithShipping())}`
            }
          </Button>
        </div>
        </Box>
      </Grid>
    </Grid>
  )
}

export default StepCart
