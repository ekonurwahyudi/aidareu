// Component Imports
import ProductDigitalList from '@/views/apps/products-digital'

// Type Imports
import type { ProductDigital } from '@/views/apps/products-digital/ProductDigitalCard'

const getProductsDigital = async (): Promise<{ products: ProductDigital[] }> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products-digital`, {
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error('Failed to fetch products digital')
    }

    const response = await res.json()

    return { products: response.data || [] }
  } catch (error) {
    console.error('Error fetching products digital:', error)
    return { products: [] }
  }
}

const ProductsDigitalPage = async () => {
  const data = await getProductsDigital()

  return <ProductDigitalList productData={data?.products} />
}

export default ProductsDigitalPage
