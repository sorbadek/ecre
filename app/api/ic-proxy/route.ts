import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const IC_API_URL = 'http://127.0.0.1:4943';
const ALLOWED_ORIGINS = ['http://127.0.0.1:4943', 'http://localhost:3000'];

// Common CORS headers
const corsHeaders = (origin: string | null) => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id, X-Ic-Api-Version',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };

  // In development, allow all origins for easier testing
  if (process.env.NODE_ENV === 'production') {
    headers['Access-Control-Allow-Origin'] = origin || '*';
    return headers;
  }

  // In production, only allow whitelisted origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (origin) {
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
  }

  return headers;
};

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);
  
  // If no origin is allowed, return 403
  if (!headers['Access-Control-Allow-Origin']) {
    return new Response('Not allowed by CORS', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      ...headers,
      // Ensure these headers are always set for preflight
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id, X-Ic-Api-Version',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    },
  });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    const urlParam = request.nextUrl.searchParams.get('url');
    if (!urlParam) {
      return new NextResponse(JSON.stringify({ error: 'URL parameter is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    // Parse the target URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(urlParam);
    } catch (e) {
      // If URL is not absolute, prepend the IC API URL
      targetUrl = new URL(urlParam, IC_API_URL);
    }

    // Ensure the URL is pointing to our IC replica
    if (!targetUrl.toString().startsWith(IC_API_URL)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid URL',
        message: `URL must point to ${IC_API_URL}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    // Prepare headers for the IC request
    const icHeaders: Record<string, string> = {
      'Accept': 'application/cbor',
    };
    
    // Copy relevant headers from the original request
    const forwardHeaders = [
      'x-request-id',
      'x-ic-api-version',
      'accept',
    ];

    forwardHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        icHeaders[header] = value;
      }
    });

    // Forward the request to the IC replica
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: icHeaders,
      credentials: 'omit', // Don't send credentials to the IC replica
    });

    // Get the response as an ArrayBuffer to handle binary data
    const buffer = await response.arrayBuffer();
    
    // Create a new response with the binary data
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/cbor',
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
      JSON.stringify({ 
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : String(error) 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    const urlParam = request.nextUrl.searchParams.get('url');
    if (!urlParam) {
      return new NextResponse(JSON.stringify({ error: 'URL parameter is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    // Parse the target URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(urlParam);
    } catch (e) {
      // If URL is not absolute, prepend the IC API URL
      targetUrl = new URL(urlParam, IC_API_URL);
    }

    // Ensure the URL is pointing to our IC replica
    if (!targetUrl.toString().startsWith(IC_API_URL)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid URL',
        message: `URL must point to ${IC_API_URL}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    // Get the raw request body as an ArrayBuffer
    const body = await request.arrayBuffer();
    
    // Prepare headers for the IC request
    const icHeaders: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/cbor',
      'Accept': 'application/cbor',
    };
    
    // Copy relevant headers from the original request
    const forwardHeaders = [
      'x-request-id',
      'x-ic-api-version',
      'content-type',
      'accept',
    ];

    forwardHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        icHeaders[header] = value;
      }
    });

    // Forward the request to the IC replica
    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: icHeaders,
      body: body,
      credentials: 'omit', // Don't send credentials to the IC replica
    });

    // Get the response as an ArrayBuffer to handle binary data
    const buffer = await response.arrayBuffer();
    
    // Create a new response with the binary data
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/cbor',
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
      JSON.stringify({ 
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : String(error) 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      }
    );
  }
}
