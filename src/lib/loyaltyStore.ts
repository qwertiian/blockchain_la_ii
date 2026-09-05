// In-memory loyalty ledger for Ramesh's Bakery
// Keyed by verified Privy User ID (DID) derived directly on the server

export interface StampEvent {
  id: string;
  type: 'stamp_awarded' | 'cake_redeemed';
  timestamp: string;
  staffId: string;
  note: string;
}

export interface CustomerLoyalty {
  userId: string;
  stamps: number; // 0 to 10
  freeCakesEarned: number;
  freeCakesRedeemed: number;
  history: StampEvent[];
}

// Global in-memory store preserved across warm server invocations
const loyaltyLedger = new Map<string, CustomerLoyalty>();

export function getCustomerLoyalty(userId: string): CustomerLoyalty {
  const existing = loyaltyLedger.get(userId);
  if (existing) {
    return existing;
  }

  const initial: CustomerLoyalty = {
    userId,
    stamps: 0,
    freeCakesEarned: 0,
    freeCakesRedeemed: 0,
    history: [],
  };
  loyaltyLedger.set(userId, initial);
  return initial;
}

export function awardStamp(userId: string, staffId = 'Staff-Counter-01'): CustomerLoyalty {
  const record = getCustomerLoyalty(userId);

  if (record.stamps < 10) {
    record.stamps += 1;
    const isCakeEarned = record.stamps === 10;
    if (isCakeEarned) {
      record.freeCakesEarned += 1;
    }

    record.history.unshift({
      id: `stamp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'stamp_awarded',
      timestamp: new Date().toISOString(),
      staffId,
      note: isCakeEarned
        ? '10th stamp awarded! Customer earned a FREE artisan cake!'
        : `Stamp #${record.stamps} awarded for fresh bread purchase`,
    });
  }

  loyaltyLedger.set(userId, record);
  return record;
}

export function redeemFreeCake(userId: string): { success: boolean; record: CustomerLoyalty; message: string } {
  const record = getCustomerLoyalty(userId);

  if (record.stamps >= 10 || record.freeCakesEarned > record.freeCakesRedeemed) {
    record.freeCakesRedeemed += 1;
    record.stamps = 0; // Reset card for the next 10 stamps
    record.history.unshift({
      id: `redeem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'cake_redeemed',
      timestamp: new Date().toISOString(),
      staffId: 'Staff-Counter-01',
      note: 'Free artisan cake redeemed successfully!',
    });
    loyaltyLedger.set(userId, record);
    return { success: true, record, message: 'Free cake redeemed successfully!' };
  }

  return {
    success: false,
    record,
    message: 'Customer needs 10 stamps to redeem a free cake.',
  };
}
