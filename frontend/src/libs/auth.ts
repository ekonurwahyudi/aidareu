// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        console.log('NextAuth authorize called with:', { email, apiUrl: process.env.API_URL })

        try {
          const apiUrl = process.env.API_URL || 'http://localhost:8000/api'
          const url = `${apiUrl}/auth/login`
          console.log('Making request to:', url)
          console.log('API_URL env:', process.env.API_URL)
          
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
          })

          console.log('Response status:', res.status)
          console.log('Response ok:', res.ok)

          const contentType = res.headers.get('content-type') || ''
          let data: any = null

          if (contentType.includes('application/json')) {
            data = await res.json()
            console.log('Response data:', data)
          } else {
            const text = await res.text()
            console.log('Non-JSON response:', text.slice(0, 200))
            throw new Error(JSON.stringify({ message: ['Invalid response from API'], detail: text.slice(0, 200) }))
          }

          if (!res.ok) {
            // pastikan ada array of messages dengan pesan spesifik dari backend
            const message = Array.isArray(data?.message) ? data.message : [data?.message || 'Login failed']
            console.log('Login failed with message:', message)
            throw new Error(JSON.stringify({ message }))
          }

          // Check if user requires email verification
          if (data?.requires_verification) {
            throw new Error(JSON.stringify({ 
              message: ['Email verification required'], 
              requires_verification: true,
              user: data.user,
              token: data.token
            }))
          }

          // kembalikan user object non-sensitif
          return data
        } catch (e: any) {
          // bungkus agar NextAuth bisa menampilkan ke UI
          throw new Error(e?.message || JSON.stringify({ message: ['Unexpected error'] }))
        }
      }
    })
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        token.name = user.name
        // Persist API token from Laravel if available
        // @ts-ignore
        if ((user as any).token) {
          // @ts-ignore
          token.apiToken = (user as any).token
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        session.user.name = token.name
        // @ts-ignore
        session.user.apiToken = (token as any).apiToken
      }

      return session
    }
  }
}

// Conditionally add Google provider only if env vars are present to avoid runtime errors in development
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  ;(authOptions.providers as any).push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  )
}
