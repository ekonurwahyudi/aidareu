'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import { Box, Container, Grid, Typography, Card, CardContent, Button, IconButton, Chip, Rating, Collapse } from '@mui/material'
import { styled } from '@mui/material/styles'

// Icon Imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StarIcon from '@mui/icons-material/Star'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityIcon from '@mui/icons-material/Visibility'

// Store Components
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'
import CartDrawer from '@/components/store/CartDrawer'

// Custom Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4, 0),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0 0 50px 50px',
  margin: theme.spacing(0, 2),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0, 1),
    borderRadius: '0 0 30px 30px',
    padding: theme.spacing(3, 0)
  }
}))

const PromotionCard = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  padding: theme.spacing(4),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8]
  }
}))

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6]
  }
}))

const StepCard = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}))

const TestimonialCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
  position: 'relative',
  background: 'linear-gradient(145deg, #f8f9ff 0%, #ffffff 100%)',
  border: '1px solid rgba(0,0,0,0.05)'
}))

// Types
interface Product {
  id: string
  name: string
  brand?: string | null
  price: number
  salePrice?: number | null
  rating: number
  reviews: number
  image: string
  colors?: Array<{ name: string; value: string }> | null
  isNew: boolean
  inStock: boolean
  slug?: string
  uuid?: string
}

interface CartItem {
  id: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
}

// Static Data
const heroSlides = [
  {
    title: 'Dapatkan Penawaran Terbaik',
    subtitle: 'Worksheet Edukatif untuk Si Kecil',
    description: 'Kembangkan kreativitas dan kemampuan belajar anak dengan worksheet berkualitas tinggi',
    discount: '30%',
    image: '/images/slide/slide1.png',
    cta: 'Belanja Sekarang',
    bgColor: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
  },
  {
    title: 'Koleksi Terlengkap',
    subtitle: 'Worksheet Anak Usia 2-9 Tahun',
    description: 'Dari menulis, menggambar hingga berhitung - semua ada di sini',
    discount: '45%',
    image: '/images/slide/slide2.png',
    cta: 'Lihat Koleksi',
    bgColor: 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
  },
  {
    title: 'Belajar Sambil Bermain',
    subtitle: 'Worksheet Interaktif & Menarik',
    description: 'Metode pembelajaran yang fun dan efektif untuk tumbuh kembang optimal',
    discount: '25%',
    image: '/images/slide/slide3.png',
    cta: 'Mulai Belajar',
    bgColor: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
  }
]

const promotions = [
  {
    title: 'Explore new arrivals',
    subtitle: 'Shop the latest from top brands',
    discount: null,
    image: '🏀',
    bgColor: '#FFF5F5',
    textColor: '#2D3748',
    buttonText: 'Show me all'
  },
  {
    title: 'Sale collection',
    subtitle: 'Up to 80% off retail',
    discount: '80%',
    image: '🎒',
    bgColor: '#F0FDF4',
    textColor: '#2D3748',
    buttonText: 'Show me all'
  },
  {
    title: 'Sale collection',
    subtitle: 'Up to 90% off retail',
    discount: '90%',
    image: '🐕',
    bgColor: '#F8FAFC',
    textColor: '#2D3748',
    buttonText: 'Show me all'
  }
]

const steps = [
  {
    number: '1',
    title: 'Filter & Discover',
    description: 'Smart filtering and suggestions make it easy to find',
    color: '#EF4444',
    image: '/images/step/step1.webp',
    bgColor: '#FEF2F2'
  },
  {
    number: '2',
    title: 'Add to cart',
    description: 'Easily select the correct items and add them to the cart',
    color: '#8B5CF6',
    image: '/images/step/step2.webp',
    bgColor: '#F5F3FF'
  },
  {
    number: '3',
    title: 'Fast shipping',
    description: 'The carrier will confirm and ship quickly to you',
    color: '#F59E0B',
    image: '/images/step/step3.webp',
    bgColor: '#FFFBEB'
  },
  {
    number: '4',
    title: 'Enjoy the product',
    description: 'Have fun and enjoy your 5-star quality products',
    color: '#EC4899',
    image: '/images/step/step4.webp',
    bgColor: '#FDF2F8'
  }
]

const testimonials = [
  {
    name: 'Ibu Sarah',
    location: 'Jakarta',
    text: 'Worksheet-nya sangat membantu anak saya belajar menulis, sekarang dia lebih semangat belajar di rumah!',
    rating: 5,
    avatar: '/images/avatars/sarah.jpg',
    package: 'Paket Lengkap',
  },
  {
    name: 'Bunda Rina',
    location: 'Surabaya',
    text: 'Kualitas gambarnya bagus banget, anak saya suka sekali dengan aktivitas mewarnainya',
    rating: 5,
    avatar: '/images/avatars/rina.jpg',
    package: 'Paket Premium',
  },
  {
    name: 'Ibu Maya',
    location: 'Bandung',
    text: 'Harga terjangkau tapi isinya lengkap. Anak jadi lebih fokus dan tidak main gadget terus',
    rating: 5,
    avatar: '/images/avatars/maya.jpg',
    package: 'Paket Premium',
  }
]

// Helper function to get product icon
const getProductIcon = (productName: string) => {
  const name = productName.toLowerCase()
  if (name.includes('bag') || name.includes('tote')) return '👜'
  if (name.includes('dress')) return '👗'
  if (name.includes('jacket') || name.includes('blazer')) return '🧥'
  if (name.includes('sweater')) return '👕'
  if (name.includes('shoe')) return '👟'
  return '👕' // default
}

const StorePage = () => {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  const handleCartClick = () => {
    setCartDrawerOpen(true)
  }

  const addToCart = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const product = products.find(p => p.id === productId)
    if (!product) return

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === productId)
      if (existingItem) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice ?? undefined,
          image: product.image,
          quantity: 1
        }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        const data = await response.json()

        if (data.success && data.data) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const toggleFavorite = (productId: string) => {
    setFavoriteProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleProductClick = (slugOrId: string, uuid?: string) => {
    const query = uuid ? `?uuid=${uuid}` : ''
    router.push(`/store/${slugOrId}${query}`)
  }

  const handleFaqClick = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [currentSlide])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StoreHeader cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} onCartClick={handleCartClick} />

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          background: 'transparent',
          color: 'inherit',
          py: { xs: 3, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 50px 50px',
          margin: { xs: 1, md: 2 },
          marginTop: { xs: 1, md: 2 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Banner kiri (gambar saja) */}
            <Grid item xs={12} md={8}>
              <Box sx={{ position: 'relative', height: { xs: 280, md: 420 }, borderRadius: 3, overflow: 'hidden' }}>
                <Box
                  component="img"
                  src="/images/slide/slide1.png"
                  alt="Banner 1"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>

            {/* Banner kanan (dua gambar) */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={12}>
                  <Box sx={{ position: 'relative', height: { xs: 180, md: 200 }, borderRadius: 3, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src="/images/slide/slide2.png"
                      alt="Banner 2"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={12}>
                  <Box sx={{ position: 'relative', height: { xs: 180, md: 200 }, borderRadius: 3, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src="/images/slide/slide3.png"
                      alt="Banner 3"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Promotions Section
      <Container maxWidth="lg" sx={{ py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {promotions.map((promo, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <PromotionCard sx={{ bgcolor: promo.bgColor, color: promo.textColor }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.7, mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {promo.title}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 'bold',
                          mb: 2,
                          lineHeight: 1.3,
                          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                        }}
                      >
                        {promo.subtitle}
                      </Typography>
                      {promo.discount && (
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 'bold',
                            color: '#22C55E',
                            mb: 2,
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                          }}
                        >
                          {promo.discount}
                        </Typography>
                      )}
                      <Button
                        variant="text"
                        sx={{
                          color: promo.textColor,
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          p: 0,
                          '&:hover': { bgcolor: 'transparent' }
                        }}
                      >
                        {promo.buttonText} →
                      </Button>
                    </Box>
                    <Box sx={{ fontSize: { xs: '3rem', sm: '4rem' } }}>{promo.image}</Box>
                  </Box>
                </CardContent>
              </PromotionCard>
            </Grid>
          ))}
        </Grid>
      </Container> */}

      {/* Products Section */}
      <Container id="products" maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2 rem' }
              }}
            >
              New Arrivals. <span style={{ color: '#9CA3AF' }}>Daftar Produk</span>
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <IconButton sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {loading ? (
            // Loading skeleton - responsive columns
            Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
                <ProductCard>
                  <Box sx={{
                    height: { xs: 200, sm: 250, md: 300 },
                    bgcolor: '#F0F0F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="body2">Loading...</Typography>
                  </Box>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ height: 20, bgcolor: '#F0F0F0', mb: 2, borderRadius: 1 }} />
                    <Box sx={{ height: 16, bgcolor: '#E0E0E0', mb: 2, borderRadius: 1 }} />
                    <Box sx={{ height: 24, bgcolor: '#F0F0F0', mb: 2, borderRadius: 1 }} />
                  </CardContent>
                </ProductCard>
              </Grid>
            ))
          ) : (
            products.map((product) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard onClick={() => handleProductClick(product.slug ?? product.id, product.uuid ?? product.id)}>
                  <Box sx={{ position: 'relative' }}>
                    {product.isNew && (
                      <Chip
                        label="New in"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: { xs: 8, sm: 12, md: 16 },
                          left: { xs: 8, sm: 12, md: 16 },
                          bgcolor: 'white',
                          color: 'text.primary',
                          fontWeight: 'bold',
                          zIndex: 1,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      />
                    )}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 12, md: 16 },
                        right: { xs: 8, sm: 12, md: 16 },
                        bgcolor: 'white',
                        color: favoriteProducts.includes(product.id) ? 'error.main' : 'text.secondary',
                        zIndex: 1,
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(product.id)
                      }}
                    >
                      {favoriteProducts.includes(product.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                    </IconButton>

                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        bgcolor: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: 2
                      }}
                    >
                      {product.image && product.image !== '/placeholder.jpg' ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            const imgEl = e.currentTarget as HTMLImageElement
                            imgEl.style.display = 'none'
                            const nextEl = imgEl.nextElementSibling as HTMLElement | null
                            if (nextEl) {
                              nextEl.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: product.image && product.image !== '/placeholder.jpg' ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: { xs: '4rem', sm: '6rem', md: '8rem' }
                        }}
                      >
                        {getProductIcon(product.name)}
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                        lineHeight: 1.3
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: '#E91E63',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}
                      >
                        🏪
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {product.brand || 'Premium Collection'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {product.salePrice ? (
                        <>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: '#22C55E',
                              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                            }}
                          >
                            Rp {product.salePrice.toLocaleString('id-ID')}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            Rp {product.price.toLocaleString('id-ID')}
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: '#22C55E',
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                          }}
                        >
                          Rp {product.price.toLocaleString('id-ID')}
                        </Typography>
                      )}
                    </Box>


                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          flex: 1,
                          bgcolor: '#E91E63',
                          '&:hover': { bgcolor: '#C2185B' },
                          borderRadius: 2,
                          py: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                        onClick={() => handleProductClick(product.slug ?? product.id, product.uuid ?? product.id)}
                      >
                        Lihat Produk
                      </Button>
                      <IconButton
                        sx={{
                          bgcolor: '#F8F9FA',
                          border: '1px solid #E2E8F0',
                          borderRadius: 2,
                          width: 48,
                          height: 48,
                          '&:hover': {
                            bgcolor: '#E91E63',
                            color: 'white',
                            borderColor: '#E91E63'
                          }
                        }}
                        onClick={(e) => addToCart(product.id, e)}
                      >
                        <ShoppingCartIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </ProductCard>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Shopping Steps */}
      <Box id="faq" sx={{ bgcolor: '#F8FAFC', py: 6 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Cara Berbelanja
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Proses mudah dan cepat untuk mendapatkan produk impian Anda
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} justifyContent="center">
            {steps.map((step, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* Gambar step dari /public/images/step/ */}
                  <Box
                    sx={{
                      width: { xs: 140, sm: 160, md: 180 },
                      height: { xs: 120, sm: 140, md: 160 },
                      borderRadius: '16px',
                      bgcolor: step.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      overflow: 'hidden',
                      border: `3px solid ${step.color}`
                    }}
                  >
                    <Box
                      component="img"
                      src={step.image}
                      alt={`${step.title} image`}
                      sx={{
                        width: '85%',
                        height: '85%',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      color: step.color
                    }}
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textAlign: 'center',
                      lineHeight: 1.6,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      maxWidth: 220
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Container id="testimonials" maxWidth="lg" sx={{ py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: '#FEF3C7',
              color: '#92400E',
              px: 3,
              py: 1,
              borderRadius: '50px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Testimoni
          </Box>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              color: '#1E293B'
            }}
          >
            Dipercaya Ribuan Orang Tua
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.125rem' },
              mb: 4
            }}
          >
            Lihat apa kata orang tua yang sudah merasakan manfaat worksheet kami
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  bgcolor: 'white',
                  borderRadius: '20px',
                  p: 4,
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                  }
                }}
              >
                {/* Navigation arrows for mobile */}
                {index === 0 && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: -20,
                    transform: 'translateY(-50%)',
                    display: { xs: 'block', md: 'none' }
                  }}>
                    <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }}>
                      <ArrowBackIcon />
                    </IconButton>
                  </Box>
                )}

                {index === testimonials.length - 1 && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    right: -20,
                    transform: 'translateY(-50%)',
                    display: { xs: 'block', md: 'none' }
                  }}>
                    <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>
                )}

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: '#475569',
                    fontStyle: 'italic'
                  }}
                >
                  "{testimonial.text}"
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}
                  >
                    👩
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        color: '#1E293B'
                      }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Typography
                      component="div"
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={testimonial.rating}
                    readOnly
                    size="small"
                    sx={{ color: '#F59E0B' }}
                  />
                </Box>
                    </Typography>
                  </Box>
                </Box>

               

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: '#FEF3C7',
                    color: '#92400E',
                    px: 2,
                    py: 0.5,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {testimonial.package}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              color: '#1E293B'
            }}
          >
            Pertanyaan yang Sering Diajukan
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: '1.125rem',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Temukan jawaban untuk pertanyaan umum tentang worksheet kami
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {[
            {
              question: "Apakah worksheet ini cocok untuk semua usia?",
              answer: "Worksheet kami dirancang khusus untuk anak usia 2-9 tahun dengan tingkat kesulitan yang bervariasi. Setiap worksheet sudah disesuaikan dengan tahap perkembangan anak."
            },
            {
              question: "Bagaimana cara download setelah pembelian?",
              answer: "Setelah pembayaran berhasil, Anda akan menerima email konfirmasi dengan link download. File dapat diunduh langsung dan dicetak di rumah."
            },
            {
              question: "Apakah bisa dicetak berulang kali?",
              answer: "Ya, setelah pembelian Anda bisa mencetak worksheet sebanyak yang dibutuhkan untuk kebutuhan anak di rumah."
            },
            {
              question: "Berapa lama mendapat update gratis?",
              answer: "Anda akan mendapatkan update gratis selama 1 tahun untuk worksheet yang sudah dibeli, termasuk materi tambahan dan perbaikan."
            },
            {
              question: "Apakah ada garansi jika tidak puas?",
              answer: "Kami memberikan garansi 30 hari uang kembali jika Anda tidak puas dengan kualitas worksheet yang dibeli."
            }
          ].map((faq, index) => (
            <Box
              key={index}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                mb: 2,
                overflow: 'hidden',
                bgcolor: 'white'
              }}
            >
              <Box
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': { bgcolor: '#F8FAFC' }
                }}
                onClick={() => handleFaqClick(index)}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    color: '#1E293B'
                  }}
                >
                  {faq.question}
                </Typography>
                <ExpandMoreIcon
                  sx={{
                    color: 'text.secondary',
                    fontSize: '1.5rem',
                    transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </Box>

              <Collapse in={expandedFaq === index}>
                <Box sx={{ px: 3, pb: 3, borderTop: '1px solid #F1F5F9' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      fontSize: '1rem'
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>
      </Container>

      <StoreFooter />

      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
      />
    </Box>
  )
}

export default StorePage