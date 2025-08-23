import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')?.trim()

    if (!subdomain) {
      return NextResponse.json(
        { available: false, message: 'Subdomain parameter is required' },
        { status: 400 }
      )
    }

    // Validate subdomain format (allow lowercase letters, numbers, and hyphen to match UI)
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return NextResponse.json(
        { 
          available: false,
          message: 'Subdomain hanya boleh berisi huruf kecil, angka, dan tanda -'
        },
        { status: 200 }
      )
    }

    if (subdomain.length < 3) {
      return NextResponse.json(
        { 
          available: false,
          message: 'Subdomain minimal 3 karakter'
        },
        { status: 200 }
      )
    }

    // Call Laravel backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

    let response: Response
    try {
      response = await fetch(`${backendUrl}/api/stores/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      })
    } catch (e) {
      console.error('Backend fetch error (check-subdomain):', e)
      return NextResponse.json(
        { available: false, message: 'Gagal menghubungi server, coba lagi.' },
        { status: 502 }
      )
    }

    const contentType = response.headers.get('content-type') || ''
    let data: any = {}

    if (contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (e) {
        console.error('Backend returned invalid JSON:', e)
        return NextResponse.json(
          { available: false, message: 'Respons server tidak valid.' },
          { status: 502 }
        )
      }
    } else {
      const text = await response.text()
      data = { message: text }
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          available: false,
          message: data?.message || 'Error checking subdomain availability'
        },
        { status: response.status }
      )
    }

    // Normalize expected shape
    const available = Boolean(data?.available)
    const message = typeof data?.message === 'string' ? data.message : (available ? 'Subdomain tersedia' : 'Subdomain tidak tersedia')

    return NextResponse.json({ available, message }, { status: 200 })

  } catch (error) {
    console.error('Check subdomain API error:', error)
    return NextResponse.json(
      { 
        available: false,
        message: 'Terjadi kesalahan server'
      },
      { status: 500 }
    )
  }
}