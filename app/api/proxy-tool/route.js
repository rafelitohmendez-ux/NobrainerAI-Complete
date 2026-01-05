import { NextResponse } from 'next/server';

export async function POST(req) {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { url, method = 'POST', headers = {}, body } = await req.json();

    console.log('Proxy request details:', { url, method, headers, body });

    const proxyResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      console.error('External request failed:', errorText);
      return NextResponse.json(
        { 
          error: `External request failed: ${errorText}`,
          details: errorText 
        }, 
        { status: 500 }
      );
    }

    const responseData = await proxyResponse.json();
    console.log('Proxy response:', responseData);
    
    return NextResponse.json(responseData, {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Detailed proxy error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.toString() 
      }, 
      { status: 500 }
    );
  }
}

