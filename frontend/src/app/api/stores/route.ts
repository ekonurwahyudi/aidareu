import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nama_toko, subdomain, no_hp_toko, kategori_toko, deskripsi_toko } = body

    // Validate required fields
    if (!nama_toko || !subdomain || !no_hp_toko || !kategori_toko || !deskripsi_toko) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Validate subdomain format
    if (!/^[a-z0-9]+$/.test(subdomain)) {
      return NextResponse.json(
        { message: 'Subdomain hanya boleh huruf kecil dan angka' },
        { status: 400 }
      )
    }

    if (subdomain.length < 3) {
      return NextResponse.json(
        { message: 'Subdomain minimal 3 karakter' },
        { status: 400 }
      )
    }

    // Validate phone number
    if (!/^[0-9+\-\s]+$/.test(no_hp_toko)) {
      return NextResponse.json(
        { message: 'Format nomor HP tidak valid' },
        { status: 400 }
      )
    }

    // Call Laravel backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        nama_toko,
        sub_domain: subdomain,
        no_hp_toko,
        kategori_toko,
        deskripsi_toko
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal membuat toko' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      message: 'Toko berhasil dibuat!',
      data: {
        store: data.store
      }
    })

  } catch (error) {
    console.error('Store creation API error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call Laravel backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/stores`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal mengambil data toko' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      data: data.stores || []
    })

  } catch (error) {
    console.error('Get stores API error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}