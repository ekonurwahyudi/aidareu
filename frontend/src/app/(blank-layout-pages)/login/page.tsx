// Next Imports
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

// Component Imports
import LoginV1Simple from '@views/pages/auth/LoginV1Simple'
import { authOptions } from '@/libs/auth'

const LoginPage = async () => {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboards/ecommerce')
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] p-6'>
      <LoginV1Simple />
    </div>
  )
}

export default LoginPage