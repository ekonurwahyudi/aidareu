'use client'

// React Imports
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Cart Context
import { useCart } from '@/contexts/CartContext'

// MUI Imports
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  Rating,
  Breadcrumbs,
  Link,
  Avatar,
  Alert,
  CircularProgress,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'

// Icon Imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteIcon from '@mui/icons-material/Favorite'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import CloseIcon from '@mui/icons-material/Close'

// Store Components
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'
import CartDrawer from '@/components/store/CartDrawer'

// Types
interface Product {
  id: string
  uuid: string
  name: string
  brand?: string | null
  price: number
  salePrice?: number | null
  rating: number
  reviews: number
  image: string
  images?: string[]
  colors?: Array<{ name: string; value: string }> | null
  isNew: boolean
  inStock: boolean
  slug: string
  category?: string
  description: string
  jenis_produk: string
  status_produk: string
  stock?: number
  url_produk?: string
  storeUuid?: string // tambahkan UUID Store di product
}

// CartItem interface is now imported from CartContext

// Styled Components
const ProductImageContainer = styled(Box)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#F5F5F5',
  position: 'relative',
  cursor: 'pointer',
  border: '1px solid #E0E0E0',
  '&:hover': { borderColor: '#BDBDBD' }
}))

const MainImageContainer = styled(Box)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#F5F5F5',
  position: 'relative',
  border: '1px solid #E0E0E0'
}))

const ImageGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1fr',
  gridTemplateRows: '1fr 1fr',
  gridTemplateAreas: `
    "main middle rightTop"
    "main middle rightBottom"
  `,
  columnGap: theme.spacing(3),     // jarak antar kolom (1–2–3)
  rowGap: theme.spacing(3),        // jarak antar baris (kanan atas–bawah)
  padding: theme.spacing(1.5),
  height: 560,
  alignItems: 'stretch',
  boxSizing: 'border-box',
  '& > *': { minHeight: 0 },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto',
    gridTemplateAreas: `
      "main"
      "middle"
      "rightTop"
      "rightBottom"
    `,
    columnGap: theme.spacing(2),
    rowGap: theme.spacing(2),
    padding: theme.spacing(1),
    height: 'auto'
  }
}))

// Carousel (mobile)
const CarouselContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  scrollSnapType: 'x mandatory',
  '& > *': { scrollSnapAlign: 'center' },
  '&::-webkit-scrollbar': { height: 6 },
  '&::-webkit-scrollbar-thumb': { backgroundColor: '#E0E0E0', borderRadius: 999 }
}))

const CarouselItem = styled(Box)(({ theme }) => ({
  flex: '0 0 80%',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #E0E0E0',
  backgroundColor: '#F5F5F5',
  height: 420,
  [theme.breakpoints.down('sm')]: { height: 360 }
}))

const ShowAllPhotosButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: 'white',
  color: '#424242',
  fontSize: '0.875rem',
  fontWeight: '500',
  padding: '6px 12px',
  borderRadius: '6px',
  textTransform: 'none',
  border: '1px solid #E0E0E0',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: '#F5F5F5'
  }
}))

const StickyFooter = styled(Box)(({ theme }) => ({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  transform: 'none',
  backgroundColor: 'white',
  borderRadius: 0,
  padding: theme.spacing(2.5),
  minHeight: 72,
  zIndex: 1000,
  boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderTop: '1px solid #E2E8F0',
  backdropFilter: 'blur(12px)',
  width: '100vw',
  maxWidth: '100vw',
  paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
  [theme.breakpoints.up('md')]: {
    bottom: `${16 + 0}px`, // Akan diatur dinamis via sx prop
    left: 'auto', // Akan diatur dinamis via sx prop  
    right: 'auto',
    transform: 'none',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: theme.spacing(2.5, 3.5),
    minHeight: 80,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid #E2E8F0',
    width: 'auto', // Akan diatur dinamis via sx prop
    maxWidth: 'none',
    paddingBottom: theme.spacing(2)
  }
}))


// Helper function to format currency in Rupiah
const formatRupiah = (amount: number): string => {
  return `Rp. ${Math.round(amount).toLocaleString('id-ID')}`
}

// Helper function to render HTML content from TipTap editor
const renderHtmlDescription = (htmlString: string, descriptionRef: React.RefObject<HTMLDivElement>) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return (
      <Typography variant="body1" sx={{ color: '#9CA3AF', fontStyle: 'italic' }}>
        Tidak ada deskripsi untuk produk ini.
      </Typography>
    )
  }

  // If it's plain text without HTML tags, return as paragraph
  if (!htmlString.includes('<')) {
    return (
      <Typography variant="body1" sx={{
        lineHeight: 1.8,
        color: '#475569',
        whiteSpace: 'pre-wrap'
      }}>
        {htmlString}
      </Typography>
    )
  }

  // Pre-process HTML to fix links before rendering
  let processedHtml = htmlString

  // Fix all href attributes in the HTML string before rendering - multiple patterns
  processedHtml = processedHtml.replace(/href=['"]([^'"]*)['"]/g, (match, href) => {
    let cleanHref = href

    console.log('Processing href:', href) // Debug log

    // Remove any localhost prefixes (more comprehensive)
    if (href.includes('localhost:8080') || href.includes('localhost:8000') || href.includes('127.0.0.1')) {
      // Extract the actual URL after /store/ or similar patterns
      const patterns = ['/store/', '/api/', '/_next/']
      for (const pattern of patterns) {
        if (href.includes(pattern)) {
          const urlParts = href.split(pattern)
          if (urlParts.length > 1) {
            cleanHref = urlParts[1]
            break
          }
        }
      }
    }

    // Remove any remaining protocol and host if it's still a localhost reference
    cleanHref = cleanHref.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/, '')

    // Add https:// if needed (but not for internal links, mailto, tel, etc.)
    if (!cleanHref.startsWith('http://') && !cleanHref.startsWith('https://') &&
        !cleanHref.startsWith('/') && !cleanHref.startsWith('#') &&
        !cleanHref.startsWith('mailto:') && !cleanHref.startsWith('tel:') &&
        cleanHref.length > 0) {
      cleanHref = `https://${cleanHref}`
    }

    console.log('Processed href:', cleanHref) // Debug log

    return `href="${cleanHref}" target="_blank" rel="noopener noreferrer"`
  })

  // Import TipTap editor styles and render as HTML with proper styling
  return (
    <Box
      ref={descriptionRef}
      sx={{
        // Import the TipTap editor styles
        '& .ProseMirror': {
          outline: 'none',
          padding: 0,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          lineHeight: 1.6,
          color: '#475569',
        },
        // Enhanced Lists
        '& ul, & ol': {
          paddingLeft: '1.5rem',
          margin: '0.5rem 0',
        },
        '& ul': {
          listStyleType: 'disc',
        },
        '& ul ul': {
          listStyleType: 'circle',
        },
        '& ul ul ul': {
          listStyleType: 'square',
        },
        '& ol': {
          listStyleType: 'decimal',
        },
        '& li': {
          margin: '0.25rem 0',
          paddingLeft: '0.25rem',
        },
        // Enhanced headings
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          lineHeight: 1.2,
          fontWeight: 600,
          marginTop: '1.5rem',
          marginBottom: '0.5rem',
        },
        '& h1': { fontSize: '2rem' },
        '& h2': { fontSize: '1.75rem' },
        '& h3': { fontSize: '1.5rem' },
        '& h4': { fontSize: '1.25rem' },
        '& h5': { fontSize: '1.125rem' },
        '& h6': { fontSize: '1rem' },
        // Enhanced code styling
        '& code': {
          backgroundColor: '#f6f8fa',
          color: '#e36209',
          padding: '0.15rem 0.3rem',
          borderRadius: '0.25rem',
          fontFamily: 'Fira Code, JetBrains Mono, Consolas, monospace',
          fontSize: '0.875em',
        },
        '& pre': {
          background: '#1a1a1a',
          color: '#f8f8f2',
          fontFamily: 'Fira Code, JetBrains Mono, Consolas, monospace',
          padding: '1rem',
          borderRadius: '0.5rem',
          overflowX: 'auto',
          margin: '1rem 0',
          '& code': {
            color: 'inherit',
            padding: 0,
            background: 'none',
            fontSize: '0.875rem',
          },
        },
        // Enhanced image styling
        '& img, & img.editor-image': {
          maxWidth: '100%',
          height: 'auto',
          margin: '0.5rem 0',
          borderRadius: '8px',
          display: 'block',
        },
        // Enhanced links
        '& a, & a.editor-link': {
          color: '#2563eb',
          textDecoration: 'underline',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: '#1d4ed8',
            textDecoration: 'none',
          },
        },
        // Enhanced blockquotes
        '& blockquote': {
          padding: '1rem 1.5rem',
          borderLeft: '4px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          margin: '1rem 0',
          borderRadius: '0 0.5rem 0.5rem 0',
          fontStyle: 'italic',
          color: '#6b7280',
        },
        // Enhanced horizontal rules
        '& hr': {
          border: 'none',
          borderTop: '2px solid #e5e7eb',
          margin: '2rem 0',
          borderRadius: '1px',
        },
        // Highlight styles
        '& mark': {
          borderRadius: '0.25rem',
          padding: '0.1rem 0.2rem',
          fontWeight: 500,
        },
        // Text alignment
        '& .has-text-align-left': { textAlign: 'left' },
        '& .has-text-align-center': { textAlign: 'center' },
        '& .has-text-align-right': { textAlign: 'right' },
        '& .has-text-align-justify': { textAlign: 'justify' },
        // Paragraph spacing
        '& p': {
          margin: '0.5rem 0',
        },
        // Better spacing for nested elements
        '& ul ul, & ol ol, & ul ol, & ol ul': {
          marginTop: '0.25rem',
          marginBottom: '0.25rem',
        },
      }}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  )
}

// Helper function to get product icon
const getProductIcon = (productName: string) => {
  const name = productName.toLowerCase()
  if (name.includes('bag') || name.includes('tote')) return '👜'
  if (name.includes('dress')) return '👗'
  if (name.includes('jacket') || name.includes('blazer')) return '🧥'
  if (name.includes('sweater')) return '👕'
  if (name.includes('shoe')) return '👟'
  return '📦' // default
}

function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Use cart context
  const {
    cartItems,
    cartDrawerOpen,
    setCartDrawerOpen,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getTotalItems,
    handleCartClick
  } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const openPhotoDialog = () => setPhotoDialogOpen(true)
  const closePhotoDialog = () => setPhotoDialogOpen(false)

  // Sticky footer state management - simplified and more reliable
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [stickyHeight, setStickyHeight] = useState<number>(0)
  const [isFooterVisible, setIsFooterVisible] = useState<boolean>(false)
  const [stickyOffset, setStickyOffset] = useState<number>(0)
  const [containerLeft, setContainerLeft] = useState<number>(0)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [stickyReady, setStickyReady] = useState<boolean>(false)
  const descriptionRef = useRef<HTMLDivElement>(null)

  // Initialize measurements and set up resize listener
  useEffect(() => {
    const updateMeasurements = () => {
      if (stickyRef.current) {
        setStickyHeight(stickyRef.current.offsetHeight)
      }
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerLeft(rect.left)
        setContainerWidth(rect.width)
      }
    }

    // Multiple measurement attempts to ensure reliability
    const measureWithDelay = () => {
      updateMeasurements()
      setTimeout(() => {
        updateMeasurements()
        setStickyReady(true) // Mark sticky as ready after initial measurements
      }, 100)
      setTimeout(updateMeasurements, 300)
      setTimeout(updateMeasurements, 1000) // Final measurement after everything loads
    }

    measureWithDelay()

    const handleResize = () => {
      updateMeasurements()
    }

    const handleLoad = () => {
      updateMeasurements()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('load', handleLoad)
    document.addEventListener('DOMContentLoaded', updateMeasurements)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('DOMContentLoaded', updateMeasurements)
    }
  }, [isMobile, product]) // Add product dependency to remeasure when product loads

  // Calculate sticky footer offset based on footer visibility
  useEffect(() => {
    const updateOffset = () => {
      const footerEl = footerRef.current
      if (!footerEl) {
        setStickyOffset(0)
        return
      }

      const rect = footerEl.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const overlap = viewportHeight - rect.top
      const gap = 16 // Safe distance between sticky and footer

      setStickyOffset(Math.max(0, overlap + gap))
    }

    const handleScroll = () => {
      updateOffset()
    }

    updateOffset()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateOffset)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateOffset)
    }
  }, [])

  // Intersection Observer for footer visibility - keep sticky visible longer
  useEffect(() => {
    const footerEl = footerRef.current
    if (!footerEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Only hide sticky when footer overlaps significantly with the sticky area
        const rect = footerEl.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const stickyBottom = stickyHeight || 80 // Default sticky height

        // Hide sticky only when footer top is very close to where sticky would be
        setIsFooterVisible(entry.isIntersecting && rect.top < viewportHeight - stickyBottom - 20)
      },
      {
        root: null,
        threshold: [0, 0.1, 0.5, 1], // Multiple thresholds for better detection
        rootMargin: '0px 0px 0px 0px' // No margin, use manual calculation instead
      }
    )

    observer.observe(footerEl)
    return () => observer.disconnect()
  }, [product, stickyHeight]) // Re-observe when product or sticky height changes

  // Add click handlers to prevent Next.js router from intercepting external links
  useEffect(() => {
    if (descriptionRef.current && product?.description) {
      const links = descriptionRef.current.querySelectorAll('a[href^="http"]')
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (href) {
          // Add click handler to prevent Next.js router from intercepting
          link.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            window.open(href, '_blank', 'noopener,noreferrer')
          })
        }
      })
    }
  }, [product?.description])

  // Cart state is now managed by CartContext

  // Fetch product by slug
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching product with slug:', slug)

        // Fetch directly from backend instead of using Next.js API route
        const backendUrl = 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/api/public/products?per_page=1000`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store'
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API response error:', errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseText = await response.text()
        console.log('Raw API response:', responseText.substring(0, 500))

        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          throw new Error('Invalid response format')
        }

        console.log('Parsed data:', data)

        if (data.status === 'success' && data.data && data.data.data) {
          // Transform and find product by slug
          const transformedProducts: Product[] = data.data.data.map((product: any) => ({
            id: product.uuid || product.id?.toString(),
            uuid: product.uuid,
            name: product.nama_produk,
            brand: product.store?.name || 'Premium Collection',
            price: parseFloat(product.harga_produk || '0'),
            salePrice: product.harga_diskon ? parseFloat(product.harga_diskon) : null,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 100) + 10,
            image: Array.isArray(product.upload_gambar_produk) && product.upload_gambar_produk.length > 0
              ? `http://localhost:8000/storage/${product.upload_gambar_produk[0]}`
              : '/placeholder.jpg',
            images: Array.isArray(product.upload_gambar_produk) && product.upload_gambar_produk.length > 0
              ? product.upload_gambar_produk.map((img: string) => `http://localhost:8000/storage/${img}`)
              : ['/placeholder.jpg'],
            colors: null,
            isNew: product.status_produk === 'active' && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            inStock: product.jenis_produk === 'digital' || (product.stock && product.stock > 0),
            slug: product.nama_produk.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
            category: product.category?.judul_kategori || 'Produk',
            description: product.deskripsi || 'No description available for this product.',
            jenis_produk: product.jenis_produk,
            status_produk: product.status_produk,
            stock: product.stock || 0,
            url_produk: product.url_produk,
            storeUuid: product.store?.uuid || product.uuid_store || undefined // mapping UUID Store
          }))

          console.log('Looking for slug:', slug)
          console.log('Available slugs:', transformedProducts.map(p => p.slug))

          // Log the first product to see what fields we have
          if (data.data.data.length > 0) {
            console.log('Raw product sample:', data.data.data[0])
            console.log('Available fields:', Object.keys(data.data.data[0]))
            console.log('deskripsi field:', data.data.data[0].deskripsi)
          }

          // Find product by slug
          const foundProduct = transformedProducts.find((p: Product) => p.slug === slug)

          if (foundProduct) {
            console.log('Found product:', foundProduct.name)
            console.log('Product description:', foundProduct.description)

            // Find raw product data
            const rawProduct = data.data.data.find((p: any) =>
              p.nama_produk.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === slug
            )
            console.log('Raw product deskripsi:', rawProduct?.deskripsi)

            setProduct(foundProduct)
          } else {
            setError('Produk tidak ditemukan')
          }
        } else {
          setError('Produk tidak ditemukan')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError(error instanceof Error ? error.message : 'Gagal memuat produk')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const handleAddToCart = () => {
    if (!product) {
      console.log('No product found, cannot add to cart')
      return
    }

    console.log('Adding product to cart:', {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity
    })

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      image: product.image,
      brand: product.brand ?? undefined, // kirim nama toko ke cart
      storeUuid: product.storeUuid ?? undefined, // kirim UUID Store ke cart
      jenis_produk: product.jenis_produk ?? 'fisik' // kirim jenis produk ke cart
    }, quantity)

    console.log('Product added to cart successfully')
  }

  const handleBack = () => {
    router.push('/store')
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleBuyNow = () => {
    console.log('handleBuyNow called')
    console.log('Product type:', product?.jenis_produk)

    // Always add to cart and redirect to checkout for both digital and physical products
    console.log('Adding to cart and redirecting to checkout')
    handleAddToCart()
    // Redirect to checkout page
    console.log('Navigating to checkout...')
    router.push('/store/checkout')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <StoreHeader cartItemCount={getTotalItems()} onCartClick={handleCartClick} />
        <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} sx={{ color: '#E91E63' }} />
        </Container>
        <StoreFooter />
      </Box>
    )
  }

  if (error || !product) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <StoreHeader cartItemCount={getTotalItems()} onCartClick={handleCartClick} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Produk tidak ditemukan'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ color: '#E91E63' }}
          >
            Kembali ke Toko
          </Button>
        </Container>
        <StoreFooter />
      </Box>
    )
  }

  // Siapkan array gambar untuk galeri (min 4 item, diisi ulang jika kurang)
  const baseImages: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image]

  const displayImages = [...baseImages]
  while (displayImages.length < 4) {
    displayImages.push(displayImages[displayImages.length - 1])
  }
  const mainImage = displayImages[selectedImageIndex] || displayImages[0]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FAFBFC' }}>
      <StoreHeader
        cartItemCount={getTotalItems()}
        onCartClick={handleCartClick}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onAddToCart={handleAddToCart}
      />

      <Container
        ref={containerRef}
        maxWidth="lg"
        sx={{
          py: 6,
          flex: 1,
          // Padding bawah dinamis agar deskripsi tidak tertutup sticky
          pb: { xs: `calc(${stickyHeight || 80}px + env(safe-area-inset-bottom) + 16px)`, md: 0 }
        }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            component="button"
            variant="body2"
            onClick={handleBack}
            sx={{ textDecoration: 'none', color: '#64748B', '&:hover': { color: '#E91E63' } }}
          >
            Toko
          </Link>
          <Typography variant="body2" color="text.primary">
            {product.category || 'Produk'}
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        {/* Di dalam return -> area galeri */}
        <Grid container spacing={8}>
          {/* Product Images Gallery */}
          <Grid item xs={12} md={12} ml={'-5px'}>
            {isMobile ? (
              <CarouselContainer>
                {displayImages.map((img, idx) => (
                  <CarouselItem key={idx} onClick={() => setSelectedImageIndex(idx)}>
                    {img && img !== '/placeholder.jpg' ? (
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                        {getProductIcon(product.name)}
                      </Box>
                    )}
                    {/* Hapus tombol Show all photos di mobile */}
                  </CarouselItem>
                ))}
              </CarouselContainer>
            ) : (
              <ImageGrid>
                {/* Main (kiri) */}
                <MainImageContainer sx={{ gridArea: 'main', height: '100%', position: 'relative' }}>
                  {mainImage && mainImage !== '/placeholder.jpg' ? (
                    <img
                      src={mainImage}
                      alt={`${product.name} main`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>
                      {getProductIcon(product.name)}
                    </Box>
                  )}
                  <ShowAllPhotosButton
                    startIcon={<VisibilityIcon fontSize="small" />}
                    onClick={openPhotoDialog}
                  >
                    Show all photos
                  </ShowAllPhotosButton>
                </MainImageContainer>

                {/* Middle (tengah, tinggi) */}
                <ProductImageContainer
                  sx={{
                    gridArea: 'middle',
                    height: '100%',
                    border: selectedImageIndex === 1 ? '2px solid #424242' : '1px solid #E0E0E0'
                  }}
                  onClick={() => setSelectedImageIndex(1)}
                >
                  <img src={displayImages[1]} alt={`${product.name} 2`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </ProductImageContainer>

                {/* Right top */}
                <ProductImageContainer
                  sx={{
                    gridArea: 'rightTop',
                    height: '100%',
                    border: selectedImageIndex === 2 ? '2px solid #424242' : '1px solid #E0E0E0'
                  }}
                  onClick={() => setSelectedImageIndex(2)}
                >
                  <img src={displayImages[2]} alt={`${product.name} 3`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </ProductImageContainer>

                {/* Right bottom */}
                <ProductImageContainer
                  sx={{
                    gridArea: 'rightBottom',
                    height: '100%',
                    border: selectedImageIndex === 3 ? '2px solid #424242' : '1px solid #E0E0E0'
                  }}
                  onClick={() => setSelectedImageIndex(3)}
                >
                  <img src={displayImages[3]} alt={`${product.name} 4`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </ProductImageContainer>
              </ImageGrid>
            )}
          </Grid>
        </Grid>
        {/* Dialog popup berisi semua foto untuk desktop */}
        <Dialog open={photoDialogOpen} onClose={closePhotoDialog} fullWidth maxWidth="md">
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Semua Foto
            <IconButton onClick={closePhotoDialog} aria-label="close">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {displayImages.map((img, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid #E0E0E0',
                      backgroundColor: '#F5F5F5',
                      height: 200
                    }}
                  >
                    {img && img !== '/placeholder.jpg' ? (
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                        {getProductIcon(product.name)}
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>
        {/* Product Info Below Gallery */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#1E293B', lineHeight: 1.2 }}>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={product.rating} readOnly size="small" sx={{ color: '#F59E0B' }} />
              <Typography variant="body2" sx={{ fontWeight: '600', color: '#1E293B' }}>
                {product.rating}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
              {product.reviews} reviews
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: product.inStock ? '#10B981' : '#EF4444'
              }}
            />
            <Typography variant="body2" color={product.inStock ? 'success.main' : 'error.main'} sx={{ fontWeight: '600' }}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: product.jenis_produk === 'digital' ? '#E91E63' : '#C2185B'
              }}
            />
            <Typography variant="body2" color={product.jenis_produk === 'digital' ? 'error.main' : 'danger.main'} sx={{ fontWeight: '600' }}>
              {product.jenis_produk === 'digital' ? 'Produk Digital' : 'Produk Fisik'}
            </Typography>
          </Box>
            
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
              {product.salePrice ? (
                <>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 'bold', color: '#1E293B' }}
                  >
                    {formatRupiah(product.salePrice)}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: 'line-through',
                      color: '#94A3B8'
                    }}
                  >
                    {formatRupiah(product.price)}
                  </Typography>
                  <Chip
                    label={`${Math.round(((product.price - product.salePrice) / product.price) * 100)}% off`}
                    size="small"
                    sx={{
                      bgcolor: '#FEF3C7',
                      color: '#92400E',
                      fontWeight: 'bold'
                    }}
                  />
                </>
              ) : (
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 'bold', color: '#1E293B' }}
                >
                  {formatRupiah(product.price)}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Product Description Section */}
          <Box sx={{ mb: 25, mt: 7 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#1E293B' }}>
                Deskripsi Produk
            </Typography>
            <Box sx={{
              p: 5,
              bgcolor: 'white',
              ml: '-3px',
              borderRadius: '12px',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              {renderHtmlDescription(product.description, descriptionRef)}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Hide footer on mobile for cleaner sticky footer experience */}
      <div ref={footerRef} style={{ display: isMobile ? 'none' : 'block' }}>
        <StoreFooter />
      </div>

      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
      />

      {/* StickyFooter: always show on mobile, only show when footer not visible on desktop */}
      {(isMobile || !isFooterVisible) && stickyReady && product && (
        <StickyFooter
          ref={stickyRef}
          sx={{
            bottom: { xs: 0, md: `${1 + stickyOffset}px` },
            left: { xs: 0, md: `${containerLeft}px` },
            width: { xs: '100vw', md: `${containerWidth}px` }
          }}
        >
          {/* Left Side - Product Image, Name, Price (Hidden on Mobile) */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 2,
            flex: 1
          }}>
            <Avatar
              src={product.image}
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: '#F7FAFC',
                border: '1px solid #E2E8F0'
              }}
              variant="rounded"
            >
              {getProductIcon(product.name)}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" sx={{
                fontWeight: '600',
                color: '#1E293B',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
                mb: 0.5,
                fontSize: '1rem'
              }}>
                {product.name}
              </Typography>

              {/* Harga dengan strike dan persentase diskon jika ada salePrice */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  color: '#10B981',
                  lineHeight: 1,
                  fontSize: '1.1rem'
                }}>
                  {product.salePrice ? formatRupiah(product.salePrice) : formatRupiah(product.price)}
                </Typography>

                {product.salePrice && (
                  <>
                    <Typography variant="body2" sx={{ color: '#94A3B8', textDecoration: 'line-through' }}>
                      {formatRupiah(product.price)}
                    </Typography>
                    <Chip
                      label={`${Math.round(((product.price - product.salePrice) / product.price) * 100)}% off`}
                      size="small"
                      sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 'bold' }}
                    />
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Right Side - Quantity Controls and Action Buttons */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, md: 2 },
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-end' }
          }}>
            {/* Quantity Controls */}
            {product.jenis_produk === 'fisik' && product.inStock && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px 0 0 8px',
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    color: '#64748B',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                      borderColor: '#CBD5E0'
                    }
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderLeft: 'none',
                    borderRight: 'none',
                    width: { xs: 40, md: 50 },
                    height: { xs: 36, md: 40 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'white',
                    borderTop: '1px solid #E2E8F0',
                    borderBottom: '1px solid #E2E8F0'
                  }}
                >
                  <Typography variant="body1" sx={{
                    fontWeight: '600',
                    color: '#1E293B',
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}>
                    {quantity}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setQuantity(quantity + 1)}
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '0 8px 8px 0',
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    color: '#64748B',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                      borderColor: '#CBD5E0'
                    }
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, width: { xs: '100%', md: 'auto' } }}>
              <Button
                variant="outlined"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                sx={{
                  borderColor: '#E2E8F0',
                  color: '#64748B',
                  minWidth: { xs: 44, md: 100 },
                  width: { xs: 44, md: 'auto' },
                  height: { xs: 44, md: 44 },
                  px: { xs: 0, md: 2 },
                  textTransform: 'none',
                  fontWeight: '600',
                  borderRadius: '12px',
                  fontSize: { xs: '0.8rem', md: '0.95rem' },
                  '& .MuiButton-startIcon': { m: 0 },
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                    borderColor: '#CBD5E0',
                    color: '#1E293B'
                  }
                }}
                startIcon={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShoppingCartIcon fontSize="small" />
                  </Box>
                }
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Cart</Box>
              </Button>

              <Button
                variant="contained"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                sx={{
                  bgcolor: '#E91E63',
                  color: 'white',
                  flexGrow: { xs: 1, md: 0 },
                  minWidth: { xs: 'unset', md: 140 },
                  height: { xs: 44, md: 44 },
                  textTransform: 'none',
                  fontWeight: '600',
                  borderRadius: '12px',
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  boxShadow: '0 4px 12px rgba(233, 30, 99, 0.25)',
                  '&:hover': {
                    bgcolor: '#C2185B',
                  }
                }}
              >
                {isMobile ? 'Beli Sekarang' : 'Beli Sekarang'}
              </Button>
            </Box>
          </Box>
        </StickyFooter>
      )}
    </Box>
  )
}

export default ProductDetailPage