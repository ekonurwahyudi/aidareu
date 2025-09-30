// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'

// Vars
const products = [
  {
    imgSrc: '/images/pages/google-home.png',
    imgAlt: 'Google Home',
    productName: 'Google - Google Home - White',
    soldBy: 'Google',
    inStock: true,
    price: 299,
    originalPrice: 359
  },
  {
    imgSrc: '/images/pages/iPhone-11.png',
    imgAlt: 'Apple iPhone',
    productName: 'Apple iPhone 11 (64GB, Black)',
    soldBy: 'Apple',
    inStock: false,
    price: 899,
    originalPrice: 999
  }
]

const StepConfirmation = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex items-center flex-col text-center gap-4'>
          <Typography variant='h4'>Terima Kasih! 😇</Typography>
          <Typography>
            Orderan Kamu <span className='font-medium text-textPrimary'>#1536548131</span> Sedang diProses!
          </Typography>
          <div>
            <Typography>
              Silahkan lakukan pembayaran sesuai dengan jumlah yang tertera di Orderan Kamu!  
            </Typography>
            <Typography>
              Kemudian jangan lupa konfirmasi ke kami ya!
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            sx={{
              bgcolor: '#25D366',
              '&:hover': { bgcolor: '#128C7E' },
              borderRadius: 3,
              boxShadow: 'none',
              filter: 'none',
              '&:focus': { boxShadow: 'none', filter: 'none' },
              '&:focus-visible': { boxShadow: 'none', filter: 'none' },
              '&:active': { boxShadow: 'none', filter: 'none' },
              '&.MuiButton-root': { boxShadow: 'none' },
              '&.MuiButton-contained': { boxShadow: 'none' },
              mt: 2
            }}
            onClick={() => window.open('https://wa.me/628121555423', '_blank')}
          >
            Konfirmasi Pembayaran
          </Button>
          <div className='flex items-center'>
            <i className='tabler-clock text-xl' />
            <Typography>Time placed: 25/05/2020 13:35</Typography>
          </div>
        </div>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <div className='flex flex-col md:flex-row border rounded'>
          <div className='flex flex-col is-full items-center p-6 sm:items-start max-md:[&:not(:last-child)]:border-be md:[&:not(:last-child)]:border-ie'>
            <div className='flex items-center gap-2 mbe-4'>
              <i className='tabler-map-pin text-xl text-textPrimary' />
              <Typography color='text.primary' className='font-medium'>
                Informasi Pembeli
              </Typography>
            </div>
            <Typography>Nama : John Doe</Typography>
            <Typography>Email : john.doe@example.com</Typography>
            <Typography>No. Hp : +123456789</Typography>
            <Typography>Alamat : 4135 Parkway Street,</Typography>
          </div>
          <div className='flex flex-col is-full items-center p-6 sm:items-start max-md:[&:not(:last-child)]:border-be md:[&:not(:last-child)]:border-ie'>
            <div className='flex items-center gap-2 mbe-4'>
              <i className='tabler-credit-card text-xl text-textPrimary' />
              <Typography color='text.primary' className='font-medium'>
                Informasi Pembayaran
              </Typography>
            </div>
            <Typography>Nama : John Doe</Typography>
            <Typography>Bank : Bank Mandiri</Typography>
            <Typography>No. Rekening : <strong>1234567890</strong></Typography>
          </div>

          <div className='flex flex-col is-full items-center p-6 sm:items-start'>
            <div className='flex items-center gap-2 mbe-4'>
              <i className='tabler-ship text-xl text-textPrimary' />
              <Typography color='text.primary' className='font-medium'>
                Metode Pengiriman
              </Typography>
            </div>
            {/* Jika jenis produk "Digital" maka link download akan dikirim penjual */}
            <Typography className='mbe-4'>Ekpedisi: J&T</Typography>
            <Typography>Standard Delivery</Typography>
            <Typography>Estimasi Tiba: 28 Oktober 2025</Typography>
          </div>
        </div>
      </Grid>
      <Grid size={{ xs: 12, md: 8, xl: 9 }}>
        <div className='border rounded'>
          {products.map((product, index) => (
            <div
              key={index}
              className='flex flex-col sm:flex-row items-center gap-4 p-6 [&:not(:last-child)]:border-be'
            >
              <img height={80} width={80} src={product.imgSrc} alt={product.imgAlt} />
              <div className='flex justify-between is-full flex-col sm:flex-row items-center gap-2'>
                <div className='flex flex-col items-center sm:items-start gap-2'>
                  <Typography color='text.primary' className='font-medium'>
                    {product.productName}
                  </Typography>
                  <div className='flex flex-col items-baseline gap-2'>
                    <div className='flex gap-0.5'>
                      <Typography>Sold By:</Typography>
                      <Typography href='/' component={Link} onClick={e => e.preventDefault()} color='primary.main'>
                        {product.soldBy}
                      </Typography>
                    </div>
                    {product.inStock && <Chip variant='tonal' size='small' color='success' label='In Stock' />}
                  </div>
                </div>
                <div className='flex items-center'>
                  <Typography color='primary.main'>{`$${product.price}/`}</Typography>
                  <Typography color='text.disabled' className='line-through'>{`$${product.originalPrice}`}</Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Grid>
      <Grid size={{ xs: 12, md: 4, xl: 3 }}>
        <div className='border rounded'>
          <CardContent className='flex gap-4 flex-col'>
            <Typography color='text.primary' className='font-medium'>
              Price Details
            </Typography>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center justify-between gap-2'>
                <Typography color='text.primary'>Order Total</Typography>
                <Typography color='text.primary'>$1198.00</Typography>
              </div>
              <div className='flex items-center justify-between gap-2'>
                <Typography color='text.primary'>Charges</Typography>
                <div className='flex gap-2'>
                  <Typography color='text.disabled' className='line-through'>
                    $5.00
                  </Typography>
                  <Chip variant='tonal' size='small' color='success' label='Free' />
                </div>
              </div>
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className='flex items-center justify-between gap-2'>
              <Typography color='text.primary' className='font-medium'>
                Total
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                $1198.00
              </Typography>
            </div>
          </CardContent>
        </div>
      </Grid>
    </Grid>
  )
}

export default StepConfirmation
