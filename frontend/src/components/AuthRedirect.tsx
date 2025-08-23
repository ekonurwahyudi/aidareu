'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Type Imports

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports

const AuthRedirect = () => {
  const pathname = usePathname()

  const redirectUrl = `/login?redirectTo=${pathname}`
  const login = '/login'
  const homePage = themeConfig.homePageUrl

  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}

export default AuthRedirect
