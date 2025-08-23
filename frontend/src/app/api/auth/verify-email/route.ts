import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email dan kode verifikasi harus diisi' },
        { status: 400 }
      )
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { message: 'Kode verifikasi harus 6 digit angka' },
        { status: 400 }
      )
    }

    // Call Laravel backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        code
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Kode verifikasi tidak valid' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Verifikasi email berhasil!',
      data: {
        user: data.user,
        verified: true
      }
    })

  } catch (error) {
    console.error('Email verification API error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}