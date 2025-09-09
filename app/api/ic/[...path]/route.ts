import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is the base URL for the IC replica
const IC_REPLICA_URL = 'http://127.0.0.1:4943';

async function handleRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } },
  method: 'GET' | 'POST' = 'GET'
) {
  try {
    const path = params.path.join('/');
    const url = new URL(`${IC_REPLICA_URL}/${path}${request.nextUrl.search}`);
    
    // Get request body if it's a POST request
    let body = null;
    if (method === 'POST') {
      try {
        body = await request.text();
      } catch (error) {
        console.error('Error reading request body:', error);
        throw new Error('Failed to read request body');
      }
    }
    
    console.log(`Proxying ${method} request to: ${url.toString()}`);
    
    let response;
    try {
      response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': method === 'POST' ? 'application/cbor' : 'application/json',
          'Accept': 'application/cbor, application/json',
          ...(method === 'POST' && body ? { 'Content-Length': Buffer.byteLength(body).toString() } : {})
        },
        body: method === 'POST' ? body : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`IC Replica returned error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`IC Replica error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error making request to IC Replica:', error);
      throw new Error(`Failed to connect to IC Replica: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Determine content type and handle response accordingly
    const contentType = response.headers.get('content-type') || '';
    const isCbor = contentType.includes('cbor');
    const isJson = contentType.includes('json');
    
    try {
      let responseData;
      let responseContentType = 'application/json';
      
      if (isCbor) {
        const buffer = await response.arrayBuffer();
        responseData = Buffer.from(buffer);
        responseContentType = 'application/cbor';
        console.log('Received CBOR response, length:', responseData.length);
      } else if (isJson) {
        responseData = await response.json();
        console.log('Received JSON response');
      } else {
        const text = await response.text();
        console.log('Received text response');
        try {
          // Try to parse as JSON if it looks like JSON
          responseData = JSON.parse(text);
        } catch {
          // Not JSON, keep as text
          responseData = text;
          responseContentType = 'text/plain';
        }
      }

      const responseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': responseContentType,
      };

      return new NextResponse(
        responseData instanceof Buffer ? responseData : JSON.stringify(responseData),
        {
          status: response.status,
          headers: responseHeaders,
        }
      );
      
    } catch (error) {
      console.error('Error processing response:', error);
      return new NextResponse(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'Failed to process response',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    console.error('IC Replica request error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, { params }, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, { params }, 'POST');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
