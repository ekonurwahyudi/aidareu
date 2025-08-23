'use client'

// React Imports
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Types
import type { RBACContextType, User, Store, Permission, Role } from '@/types/rbac'

const RBACContext = createContext<RBACContextType | undefined>(undefined)

interface RBACProviderProps {
  children: ReactNode
}

export const RBACProvider = ({ children }: RBACProviderProps) => {
  // States
  const [user, setUser] = useState<User | null>(null)
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize RBAC data
  useEffect(() => {
    initializeRBAC()
  }, [])

  const initializeRBAC = async () => {
    try {
      setIsLoading(true)
      
      // Get current user data
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.data)
        
        // Set default store if user has stores
        if (userData.data.stores && userData.data.stores.length > 0) {
          setCurrentStore(userData.data.stores[0])
        }
        
        // Get user permissions
        await refreshPermissions()
      }
      
      // Get available roles
      const rolesResponse = await fetch('/api/rbac/roles', {
        credentials: 'include'
      })
      
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData.data)
      }
      
    } catch (error) {
      console.error('Failed to initialize RBAC:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPermissions = async () => {
    try {
      const response = await fetch('/api/rbac/permissions/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.data)
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error)
    }
  }

  const hasPermission = (permission: string, resource?: string): boolean => {
    if (!user) return false
    
    // Superadmin has all permissions
    if (user.roles.some(role => role.name === 'superadmin')) {
      return true
    }
    
    // Check specific permission
    return permissions.some(p => {
      if (resource) {
        return p.name === permission && p.resource === resource
      }
      return p.name === permission
    })
  }

  const hasRole = (roleName: string): boolean => {
    if (!user) return false
    return user.roles.some(role => role.name === roleName)
  }

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false
    
    // Superadmin can access everything
    if (hasRole('superadmin')) {
      return true
    }
    
    // Check specific permission for resource and action
    const permissionName = `${resource}.${action}`
    return hasPermission(permissionName, resource)
  }

  const switchStore = async (storeId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/stores/${storeId}/switch`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentStore(data.data)
        // Refresh permissions for new store context
        await refreshPermissions()
      } else {
        throw new Error('Failed to switch store')
      }
    } catch (error) {
      console.error('Failed to switch store:', error)
      throw error
    }
  }

  const contextValue: RBACContextType = {
    user,
    currentStore,
    permissions,
    roles,
    isLoading,
    hasPermission,
    hasRole,
    canAccess,
    switchStore,
    refreshPermissions
  }

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  )
}

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider')
  }
  return context
}

// HOC for role-based component protection
export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[]
) => {
  return (props: P) => {
    const { user, hasRole } = useRBAC()
    
    if (!user) {
      return <div>Loading...</div>
    }
    
    const hasAccess = allowedRoles.some(role => hasRole(role))
    
    if (!hasAccess) {
      return (
        <div className="text-center p-8">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

// HOC for permission-based component protection
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string[]
) => {
  return (props: P) => {
    const { user, hasPermission } = useRBAC()
    
    if (!user) {
      return <div>Loading...</div>
    }
    
    const hasAccess = requiredPermissions.every(permission => hasPermission(permission))
    
    if (!hasAccess) {
      return (
        <div className="text-center p-8">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}