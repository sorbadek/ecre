import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const IC_API_URL = 'http://127.0.0.1:4943';

// Common CORS headers
const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin),
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.nextUrl.searchParams.get('url') || '', IC_API_URL);
    
    if (!url.toString().startsWith(IC_API_URL)) {
      const origin = request.headers.get('origin') || '*';
      return new NextResponse(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    // Get the IC API version from the URL path
    const isV2 = url.pathname.includes('/api/v2/');
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/cbor',
    };
    
    // Add IC-specific headers for v2 API
    if (isV2) {
      headers['X-Request-Id'] = crypto.randomUUID();
      headers['X-Ic-Api-Version'] = '0.18.0';
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    // Get the response as an ArrayBuffer to handle binary data
    const buffer = await response.arrayBuffer();
    
    // Create a new response with the binary data
    const origin = request.headers.get('origin') || '*';
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': 'application/cbor',
        ...corsHeaders(origin),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.nextUrl.searchParams.get('url') || '', IC_API_URL);
    
    if (!url.toString().startsWith(IC_API_URL)) {
      const origin = request.headers.get('origin') || '*';
      return new NextResponse(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    // Get the raw request body as an ArrayBuffer
    const body = await request.arrayBuffer();
    
    // Get the IC API version from the URL path
    const isV2 = url.pathname.includes('/api/v2/');
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/cbor',
      'Accept': 'application/cbor',
    };
    
    // Add IC-specific headers for v2 API
    if (isV2) {
      headers['X-Request-Id'] = crypto.randomUUID();
      headers['X-Ic-Api-Version'] = '0.18.0';
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: headers,
      body: body,
    });

    // Get the response as an ArrayBuffer to handle binary data
    const buffer = await response.arrayBuffer();
    
    // Create a new response with the binary data
    const origin = request.headers.get('origin') || '*';
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': 'application/cbor',
        ...corsHeaders(origin),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
