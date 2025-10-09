// API utility functions

/**
 * Get backend URL from environment variables
 * Fallback to localhost:8888 for development if not set
 */
export const getBackendUrl = (): string => {
  // For client-side (browser)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8888'
  }

  // For server-side
  return process.env.API_URL?.replace('/api', '') || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8888'
}

/**
 * Get API URL from environment variables
 * Fallback to localhost:8888/api for development if not set
 */
export const getApiUrl = (): string => {
  // For client-side (browser)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api'
  }

  // For server-side
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api'
}

/**
 * Get frontend URL from environment variables
 * Fallback to localhost:3002 for development if not set
 */
export const getFrontendUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
}

/**
 * Get storage URL for uploaded files
 * @param path - The storage path from backend
 */
export const getStorageUrl = (path: string): string => {
  if (!path) return ''
  return `${getBackendUrl()}/storage/${path}`
}
