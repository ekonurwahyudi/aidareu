'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

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
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material'
import { styled } from '@mui/material/styles'

// Icon Imports
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// Custom Styled Components
const ProductImage = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 500,
  backgroundColor: '#F8FAFC',
  borderRadius: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12rem',
  position: 'relative',
  overflow: 'hidden'
}))

const ColorOption = styled(Box)<{ selected?: boolean; color: string }>(({ theme, selected, color }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: color,
  border: selected ? '3px solid #3B82F6' : '2px solid rgba(0,0,0,0.1)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    borderColor: selected ? '#3B82F6' : '#6B7280'
  }
}))

const SizeOption = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
  minWidth: 48,
  height: 48,
  borderRadius: '12px',
  border: selected ? '2px solid #3B82F6' : '1px solid #D1D5DB',
  backgroundColor: selected ? '#EBF4FF' : 'white',
  color: selected ? '#3B82F6' : '#374151',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: selected ? '#EBF4FF' : '#F9FAFB',
    borderColor: '#3B82F6'
  }
}))

const AddToCartButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  textTransform: 'none',
  minHeight: 56,
  '&:hover': {
    transform: 'scale(1.02)'
  }
}))

// Types
interface ProductDetail {
  id: string
  name: string
  brand?: string | null
  price: number
  salePrice?: number | null
  rating: number
  reviews: number
  inStock: boolean
  description?: string | null
  images?: string[] | null
  colors?: Array<{ name: string; value: string }> | null
  sizes?: string[] | null
  category: string
  features?: string[]
}

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

const ProductDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const uuid = searchParams.get('uuid')
        const query = uuid ? `?uuid=${uuid}` : ''
        const response = await fetch(`/api/products/${params.id}${query}`)
        const data = await response.json()

        if (data.success) {
          setProduct(data.data)
        } else {
          console.error('Product not found')
          // Redirect to store if product not found
          router.push('/store')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        router.push('/store')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router, searchParams])

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change))
  }

  const handleAddToCart = () => {
    if (!product) return

    // In real app, this would add to cart and redirect to checkout
    console.log('Adding to cart:', {
      productId: product.id,
      quantity,
      size: selectedSize,
      color: product.colors?.[selectedColor],
      price: product.salePrice || product.price
    })

    // Redirect to checkout
    router.push('/front-pages/checkout')
  }

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pt: 4, pb: 8 }}>
        <Container maxWidth="xl">
          <Grid container spacing={8}>
            <Grid item xs={12} md={7}>
              <Box sx={{ height: 500, bgcolor: '#F0F0F0', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading...</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Box key={index} sx={{ height: 40, bgcolor: '#F0F0F0', borderRadius: 1 }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  }

  if (!product) {
    return (
      <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pt: 4, pb: 8 }}>
        <Container maxWidth="xl">
          <Typography variant="h4">Product not found</Typography>
        </Container>
      </Box>
    )
  }

  const breadcrumbs = [
    <Link key="home" color="inherit" href="/store" sx={{ textDecoration: 'none' }}>
      Home
    </Link>,
    <Link key="category" color="inherit" href="/store" sx={{ textDecoration: 'none' }}>
      {product.category}
    </Link>,
    <Typography key="product" color="text.primary">
      {product.name}
    </Typography>
  ]

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pt: 4, pb: 8 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }} separator="/">
          {breadcrumbs}
        </Breadcrumbs>

        <Grid container spacing={8}>
          {/* Product Images */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 24,
                  left: 24,
                  bgcolor: 'white',
                  color: isFavorite ? 'error.main' : 'text.secondary',
                  zIndex: 1,
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'grey.100' }
                }}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>

              <ProductImage>
                {(() => {
                  const primaryImage = product.images?.find(img => img && img !== '/placeholder.jpg') ?? product.images?.[0] ?? null
                  return primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '24px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        // Show fallback icon
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = `<div style="font-size: 12rem;">${getProductIcon(product.name)}</div>`
                        }
                      }}
                    />
                  ) : (
                    getProductIcon(product.name)
                  )
                })()}
              </ProductImage>
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Product Title & Price */}
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {product.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {product.salePrice ? (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#22C55E' }}>
                        Rp {product.salePrice.toLocaleString('id-ID')}
                      </Typography>
                      <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                        Rp {product.price.toLocaleString('id-ID')}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#22C55E' }}>
                      Rp {product.price.toLocaleString('id-ID')}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={product.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {product.rating} • {product.reviews} reviews
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={product.inStock ? "In Stock" : "Out of Stock"}
                  color={product.inStock ? "success" : "error"}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {product.colors.map((color, index) => (
                      <ColorOption
                        key={index}
                        color={color.value}
                        selected={selectedColor === index}
                        onClick={() => setSelectedColor(index)}
                        title={color.name}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Size
                    </Typography>
                    <Button variant="text" sx={{ color: '#3B82F6', textTransform: 'none', fontWeight: 'bold' }}>
                      See sizing chart
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {product.sizes.map((size) => (
                      <SizeOption
                        key={size}
                        selected={selectedSize === size}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </SizeOption>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Quantity & Add to Cart */}
              <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: '50px', bgcolor: 'white' }}>
                  <IconButton onClick={() => handleQuantityChange(-1)}>
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ px: 3, fontWeight: 'bold', minWidth: 40, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton onClick={() => handleQuantityChange(1)}>
                    <AddIcon />
                  </IconButton>
                </Box>

                <AddToCartButton
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={!product.inStock || Boolean(product.sizes && product.sizes.length > 0 && !selectedSize)}
                  sx={{
                    bgcolor: '#1F2937',
                    '&:hover': { bgcolor: '#374151' },
                    '&:disabled': { bgcolor: '#D1D5DB', color: '#9CA3AF' }
                  }}
                >
                  {!product.inStock ? 'Out of Stock' : 'Add to cart'}
                </AddToCartButton>
              </Box>

              {/* Product Details Accordions */}
              <Box>
                {product.description && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Description
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {product.description}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}

                {product.features && product.features.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Features + Care
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        {product.features.map((feature, index) => (
                          <Typography key={index} variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                            • {feature}
                          </Typography>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ProductDetailPage