import { NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { getCustomerLoyalty, awardStamp, redeemFreeCake } from '@/lib/loyaltyStore';

const EXPECTED_STAFF_PIN = process.env.STAFF_PIN || '1234';

function getPrivyServerClient(): PrivyClient {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Server is missing Privy credentials in environment variables.');
  }

  return new PrivyClient(appId, appSecret);
}

// Helper: Extract and cryptographically verify the customer's Privy JWT token.
// DERIVES identity strictly on the server from the signed claims — cannot be forged by the browser!
async function verifyCustomerFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return { error: 'Missing or malformed Authorization header. Expected Bearer <token>', status: 401 };
  }

  const token = authHeader.replace(/^bearer\s+/i, '').trim();
  if (!token) {
    return { error: 'Empty bearer token provided', status: 401 };
  }

  try {
    const privy = getPrivyServerClient();
    // Cryptographically verifies signature, expiration, and issuer against Privy public keys
    const verifiedClaims = await privy.verifyAuthToken(token);

    // Derived identity that the client CANNOT forge
    const customerUserId = verifiedClaims.userId;

    // Optionally fetch full user record from Privy
    let userDetails = null;
    try {
      userDetails = await privy.getUser(customerUserId);
    } catch {
      // Non-fatal if Privy user fetch is throttled
    }

    return {
      userId: customerUserId,
      claims: verifiedClaims,
      userDetails,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid or expired authentication token';
    return { error: `Authentication failed: ${message}`, status: 401 };
  }
}

// GET /api/loyalty - Fetch customer's verified stamp balance
export async function GET(request: Request) {
  try {
    const authResult = await verifyCustomerFromRequest(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId, claims, userDetails } = authResult;
    const loyalty = getCustomerLoyalty(userId);

    // Find verified embedded wallet if provisioned
    const embeddedWallet = userDetails?.linkedAccounts.find(
      (acc) => acc.type === 'wallet' && acc.walletClientType === 'privy'
    );

    return NextResponse.json({
      success: true,
      derivedUserId: userId,
      verifiedAt: new Date().toISOString(),
      loyalty,
      embeddedWalletAddress: embeddedWallet && 'address' in embeddedWallet ? embeddedWallet.address : null,
      serverClaims: {
        appId: claims.appId,
        issuedAt: claims.issuedAt,
        expiration: claims.expiration,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/loyalty - Staff awards a stamp or customer redeems a cake
export async function POST(request: Request) {
  try {
    const authResult = await verifyCustomerFromRequest(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId } = authResult;
    const body = await request.json().catch(() => ({}));
    const { action, staffPin } = body;

    // Action 1: Staff awards an unforgeable stamp
    if (action === 'stamp') {
      // Validate staff authorization PIN
      if (!staffPin || String(staffPin).trim() !== EXPECTED_STAFF_PIN) {
        return NextResponse.json(
          {
            error: 'Invalid staff counter PIN. Only Ramesh and authorized counter staff can stamp loyalty cards.',
          },
          { status: 403 }
        );
      }

      const updated = awardStamp(userId, 'Staff-Counter-01');
      return NextResponse.json({
        success: true,
        action: 'stamp_awarded',
        loyalty: updated,
        message: updated.stamps === 10
          ? 'Congratulations! 10th stamp awarded. Customer earned 1 FREE Artisan Cake!'
          : `Stamp #${updated.stamps} awarded successfully.`,
      });
    }

    // Action 2: Customer redeems their free cake at 10 stamps
    if (action === 'redeem') {
      const result = redeemFreeCake(userId);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        action: 'cake_redeemed',
        loyalty: result.record,
        message: result.message,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: "stamp" or "redeem"' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
