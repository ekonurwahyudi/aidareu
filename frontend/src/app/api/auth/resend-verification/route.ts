import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: 'Email harus diisi' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Call Laravel backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal mengirim ulang kode verifikasi' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Kode verifikasi baru telah dikirim ke email Anda',
      data: {
        email,
        sent: true
      }
    })

  } catch (error) {
    console.error('Resend verification API error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}