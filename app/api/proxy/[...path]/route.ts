import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is the configuration for CORS headers
const corsHeaders = (request: NextRequest) => ({
  'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': request.headers.get('access-control-request-headers') || 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin',
});

// This function handles OPTIONS requests (preflight)
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    // Get the target URL from query params or construct it from path
    const targetUrl = request.nextUrl.searchParams.get('url') || 
      (params?.path ? `http://127.0.0.1:4943/api/v2/${params.path.join('/')}${request.nextUrl.search}` : null);
    
    if (!targetUrl) {
      return new NextResponse(JSON.stringify({ error: 'Target URL is required' }), {
        status: 400,
        headers: {
          ...corsHeaders(request),
          'Content-Type': 'application/json',
        },
      });
    }
    
    const url = new URL(targetUrl);
    
    // Forward the request to the target URL
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(
          Array.from(request.headers.entries())
            .filter(([key]) => 
              key.toLowerCase() === 'authorization' || 
              key.toLowerCase() === 'accept' ||
              key.toLowerCase().startsWith('x-')
            )
        ),
      },
      credentials: 'include',
    });

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        ...corsHeaders(request),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        ...corsHeaders(request),
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    // Get the target URL from query params or construct it from path
    const targetUrl = request.nextUrl.searchParams.get('url') || 
      (params?.path ? `http://127.0.0.1:4943/api/v2/${params.path.join('/')}${request.nextUrl.search}` : null);
    
    if (!targetUrl) {
      return new NextResponse(JSON.stringify({ error: 'Target URL is required' }), {
        status: 400,
        headers: {
          ...corsHeaders(request),
          'Content-Type': 'application/json',
        },
      });
    }
    
    const url = new URL(targetUrl);
    
    const body = await request.json();
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(
          Array.from(request.headers.entries())
            .filter(([key]) => 
              key.toLowerCase() === 'authorization' || 
              key.toLowerCase() === 'accept' ||
              key.toLowerCase().startsWith('x-')
            )
        ),
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        ...corsHeaders(request),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        ...corsHeaders(request),
        'Content-Type': 'application/json',
      },
    });
  }
}
