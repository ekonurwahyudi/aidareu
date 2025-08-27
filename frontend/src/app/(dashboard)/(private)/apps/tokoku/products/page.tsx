'use client'

// React Imports
import { Suspense, useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'

// Context Imports
import { RBACProvider } from '@/contexts/rbacContext'

// Component Imports
import ProductListTable from '@/views/apps/tokoku/products/list/ProductListTable'
import ProductCard from '@/views/apps/tokoku/products/list/ProductCard'

const eCommerceProductsList = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh component when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, forcing component refresh...')
        setRefreshKey(prev => prev + 1)
      }
    }

    const handleFocus = () => {
      console.log('Window focused, forcing component refresh...')
      setRefreshKey(prev => prev + 1)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <RBACProvider>
      <Grid container spacing={6}>
        {/* <Grid size={{ xs: 12 }}>
          <ProductCard />
        </Grid> */}
        <Grid size={{ xs: 12 }}>
          <Suspense fallback={
            <div className="flex justify-center items-center p-8">
              <CircularProgress />
            </div>
          }>
            <ProductListTable key={refreshKey} />
          </Suspense>
        </Grid>
      </Grid>
    </RBACProvider>
  )
}

export default eCommerceProductsList
