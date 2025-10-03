'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Box, Container } from '@mui/material'

// Component Imports
import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'
import CartDrawer from '@/components/store/CartDrawer'
import CheckoutWizard from '@views/pages/wizard-examples/checkout/index'

// Cart Context
import { useCart } from '@/contexts/CartContext'

// Custom Hook
import { useStoreMetadata } from '../useStoreMetadata'

const CheckoutPage = () => {
  const params = useParams()
  const subdomain = params.subdomain as string

  // Use cart context
  const {
    cartItems,
    cartDrawerOpen,
    setCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    handleCartClick
  } = useCart()

  // Store data state
  const [storeData, setStoreData] = useState<any>(null)
  const [storeLoading, setStoreLoading] = useState(true)

  // Fetch store data from API
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setStoreLoading(true)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const response = await fetch(`${backendUrl}/api/store/${subdomain}`, {
          cache: 'no-store' // Prevent caching issues
        })
        const data = await response.json()

        if (data.success && data.data) {
          setStoreData(data.data)
        }
      } catch (error) {
        console.error('Error fetching store data:', error)
      } finally {
        setStoreLoading(false)
      }
    }

    if (subdomain) {
      fetchStoreData()
    }
  }, [subdomain])

  // Update metadata untuk halaman checkout
  useStoreMetadata({
    title: storeData
      ? `${storeData.settings?.site_title || storeData.store?.name} - Checkout`
      : 'Checkout',
    description: `Selesaikan pembelian Anda di ${storeData?.settings?.site_title || storeData?.store?.name || 'toko kami'}`,
    keywords: 'checkout, pembayaran, belanja online',
    ogTitle: storeData
      ? `Checkout - ${storeData.settings?.site_title || storeData.store?.name}`
      : 'Checkout',
    ogDescription: `Selesaikan pembelian Anda dengan aman dan mudah`,
    ogImage: storeData?.settings?.logo,
    favicon: storeData?.settings?.favicon
  })

  // Show loading skeleton while store data is loading
  if (storeLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FAFBFC' }}>
        <Box sx={{
          height: 80,
          bgcolor: 'white',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          px: 3
        }}>
          <Box sx={{
            width: 150,
            height: 40,
            bgcolor: '#F3F4F6',
            borderRadius: 1,
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </Box>
        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StoreHeader
        cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={handleCartClick}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        storeName={storeData?.store?.name || 'AiDareU Store'}
        storeLogo={storeData?.settings?.logo ? `http://localhost:8000/storage/${storeData.settings.logo}` : undefined}
      />

      <Box sx={{ flex: 1, py: { xs: 3, md: 6 }, bgcolor: '#FAFBFC' }}>
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3, md: 4, lg: 6 },
            maxWidth: { xs: '100%', sm: '100%', md: '95%', lg: '90%', xl: '1200px' }
          }}
        >
          <CheckoutWizard />
        </Container>
      </Box>

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

export default CheckoutPage
