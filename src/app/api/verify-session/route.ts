import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: 'Server is missing Privy credentials in environment variables.' },
        { status: 500 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for server verification' },
        { status: 400 }
      );
    }

    const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    const response = await fetch(`https://auth.privy.io/api/v1/users/${encodeURIComponent(userId)}`, {
      headers: {
        'privy-app-id': appId,
        Authorization: `Basic ${basicAuth}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch user from Privy server API', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
