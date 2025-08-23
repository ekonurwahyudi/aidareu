import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama_lengkap, email, no_hp, password, alasan_gabung, info_dari } = body

    // Validate required fields
    if (!nama_lengkap || !email || !no_hp || !password || !alasan_gabung || !info_dari) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
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

    // Validate phone number format
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
    if (!phoneRegex.test(no_hp)) {
      return NextResponse.json(
        { message: 'Format nomor HP tidak valid' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password minimal 8 karakter' },
        { status: 400 }
      )
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: 'Password harus mengandung huruf kecil, huruf besar, dan angka' },
        { status: 400 }
      )
    }

    // Call Laravel backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        nama_lengkap,
        email,
        no_hp,
        password,
        alasan_gabung,
        info_dari
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Terjadi kesalahan saat registrasi' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Registrasi berhasil! Silakan cek email Anda untuk kode verifikasi.',
      data: {
        user: data.user,
        verification_sent: true
      }
    })

  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}