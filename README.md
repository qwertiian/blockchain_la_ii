# 🥖 The Loyalty Card That Can't Be Copied
### *Ramesh's Artisan Bakery — Web3 Loyalty Punch Card*

A tamper-proof digital loyalty punch card for Ramesh's bakery regulars. Designed so morning commuters buying bread on their way to work can earn stamps in seconds without ever touching a crypto extension, writing down a seed phrase, or even knowing a blockchain is involved.

---

## 🎯 Problem Statement & Scenario

Ramesh runs a small bakery and previously tracked loyalty using paper cards (**10 stamps = 1 free artisan cake**). He was losing revenue for months: customers photocopied paper punch cards, and busy counter staff stamped whatever they were handed. 

Ramesh needed stamps to live somewhere a photocopier cannot reach:
* **The Regulars:** People in a morning queue who will not install browser extensions, will not write down a 12-word recovery phrase, and will walk away if prompted to "Connect a Web3 Wallet".
* **The Solution:** An intuitive digital punch card where login collapses self-custodial key management and embedded wallet creation into a single step, and where the server establishes customer identity from something the client cannot forge.

---

## 🔑 1. Login Methods Enabled

To keep the bakery queue moving under one minute, the app provides login methods customers already own:

1. **Email One-Time Passcode (OTP) [Primary Path]:**
   * Implemented with `@privy-io/react-auth` headless `useLoginWithEmail` hook (`sendCode` and `loginWithCode`).
   * Customer enters their email, receives a 6-digit passcode, and logs in within seconds.
2. **Google Social Sign-In:**
   * Instant 1-tap OAuth login configured through Privy without requiring external extensions.
3. **No External Wallets on First Screen:**
   * External browser extensions (like MetaMask / Phantom) are removed from the customer's primary path (`showWalletLoginFirst: false`). The first screen looks like a warm, minimalist artisan bakery card.

---

## ⚡ 2. Zero-Click Embedded Wallet (Base Sepolia)

By the time the customer sees their signed-in loyalty punch card, **they already own an embedded wallet without having clicked anything that says "create wallet"**:
* Configured in `src/app/providers.tsx`:
  ```typescript
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  defaultChain: baseSepolia,
  supportedChains: [baseSepolia],
  ```
* **Network:** Configured for **Base Sepolia** (EVM Chain ID `84532`).
* **Self-Custodial & Invisible:** The wallet key is provisioned automatically behind the scenes using Shamir's Secret Sharing (SSS) and TEE infrastructure. The customer simply sees their digital punch card.

---

## 🛡️ 3. How the Server Establishes Who Is Asking

### The Core Vulnerability with Naive Implementations
In a naive app, the browser sends `{ userId: "did:privy:customer123" }` in the POST body to `/api/award-stamp`. Any user with cURL or browser DevTools can tamper with that payload to stamp someone else's card or credit themselves fraudulently. **A signed-in session in the browser proves nothing to your server.**

### How Ramesh's Server Derives Trustworthy Identity
1. **Client Sends Cryptographic Bearer Token:**
   When interacting with `/api/loyalty`, the client calls `getAccessToken()` from Privy and transmits it in the standard header:
   ```http
   Authorization: Bearer <privy_jwt_token>
   ```
2. **Cryptographic Verification with `@privy-io/server-auth`:**
   In `src/app/api/loyalty/route.ts`, the server initializes a secure backend `PrivyClient`:
   ```typescript
   import { PrivyClient } from '@privy-io/server-auth';

   const privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!);
   const verifiedClaims = await privy.verifyAuthToken(token);
   ```
3. **Unforgeable Identity Derivation:**
   The server extracts the customer's identity directly from the signed JWT claims:
   ```typescript
   const customerUserId = verifiedClaims.userId;
   ```
   * The server **never** trusts client-supplied user IDs from the body.
   * If an attacker modifies the token, `verifyAuthToken()` throws an invalid signature error and the server responds with `HTTP 401 Unauthorized`.
   * Forgery test button included in the UI under **"Under the Hood"** demonstrates server rejection of forged requests.

---

## 🥐 4. Counter Staff Stamping & Loyalty Logic

* **10 Stamps = 1 Free Cake:**
  * Customers view a visual 10-slot bakery punch card (slots 1–9 show croissant stamps `🥐`, slot 10 shows a celebration cake `🎂`).
* **Staff Counter PIN Protection:**
  * To prevent customers from stamping their own cards, awarding a stamp requires counter staff authorization (`staffPin: "1234"`).
  * Counter staff enters their PIN on the customer's screen or counter terminal.
  * Verified server ledger records stamp index, timestamp, and staff identifier.
* **Cake Redemption:**
  * Once 10 stamps are reached, the card unlocks the **"Redeem Free Cake"** celebration button, which increments `freeCakesRedeemed` and resets the card for the next round.

---

## 🌧️ 5. Honest Handling of Dull States

The application explicitly and honestly handles edge cases and imperfect network states:
1. **App Initializing:**
   * When Privy's SDK is loading (`ready === false`), a warm artisan bakery loader ("Opening Ramesh's Bakery...") is displayed instead of a blank or broken screen.
2. **Login Abandoned or Cancelled Halfway:**
   * If a customer closes the OTP modal, enters an expired code, or cancels OAuth, the app catches `state.status === 'error'` and displays a clear message with a 1-click **"Change Email / Try Again"** option.
3. **Failed Stamp Requests:**
   * If an incorrect staff PIN is entered, the server returns `HTTP 403 Forbidden` with an explicit reason. The modal displays: *"Invalid staff counter PIN. Only Ramesh and authorized counter staff can stamp loyalty cards."*
   * Network timeouts or expired sessions present actionable retry prompts.

---

## 📊 6. The 8 Scored Test Cases Mapping (80 Points)

| # | Test Case / Rubric Requirement | File Location & Implementation Details |
|---|--------------------------------|----------------------------------------|
| **1** | **Customer First Screen (Non-crypto)** | [src/components/BakeryLoginForm.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/components/BakeryLoginForm.tsx) — Bakery-first UI, zero Web3 jargon, email OTP primary path. |
| **2** | **Zero-Click Embedded Wallet** | [src/app/providers.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/app/providers.tsx) — `createOnLogin: 'users-without-wallets'`. Customer owns wallet on first login without clicking "create". |
| **3** | **Network Configuration (Base Sepolia)** | [src/app/providers.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/app/providers.tsx) — Configured with `baseSepolia` (`chainId: 84532`) as default and supported chain. |
| **4** | **Server-Side Token Verification** | [src/app/api/loyalty/route.ts](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/app/api/loyalty/route.ts) — Backend route validating Bearer token via `@privy-io/server-auth` (`verifyAuthToken`). |
| **5** | **Identity Derivation on Server** | [src/app/api/loyalty/route.ts](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/app/api/loyalty/route.ts) — Server derives `claims.userId` directly from JWT; blocks client-forged IDs with HTTP 401. |
| **6** | **Staff Stamping & Balance Display** | [src/components/BakeryPunchCard.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/components/BakeryPunchCard.tsx) & [src/components/StaffCounterModal.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/components/StaffCounterModal.tsx) — 10-stamp visual punch card, staff PIN (`1234`), cake redemption. |
| **7** | **Honest Dull State Handling** | Handled across [page.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/app/page.tsx), [BakeryLoginForm.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/components/BakeryLoginForm.tsx), and [StaffCounterModal.tsx](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/src/components/StaffCounterModal.tsx) (initializing, abandoned login, failed stamps). |
| **8** | **Documentation & Clean Security** | [README.md](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/README.md), [.env.example](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/.env.example), [.gitignore](file:///home/ajatshatru-kaushik/Desktop/Blockchain_Lab/la_2/.gitignore) — Full documentation of login methods, identity derivation, and zero committed secrets. |

---

## 💻 Tech Stack

* **Frontend:** [Next.js 16 (App Router)](https://nextjs.org), React 19, TypeScript
* **Styling:** Vanilla Tailwind CSS with custom artisan bakery theme
* **Client Auth & Wallets:** [`@privy-io/react-auth`](https://www.npmjs.com/package/@privy-io/react-auth)
* **Server Verification:** [`@privy-io/server-auth`](https://www.npmjs.com/package/@privy-io/server-auth) & [`@privy-io/node`](https://www.npmjs.com/package/@privy-io/node)
* **Blockchain Network:** Base Sepolia Testnet (via [`viem`](https://viem.sh))

---

## 🚀 Running Locally

### 1. Clone the repository:
```bash
git clone https://github.com/qwertiian/blockchain_la_ii.git
cd blockchain_la_ii
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Setup environment variables:
Create a `.env.local` file (modeled after `.env.example`):
```env
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
STAFF_PIN=1234
```

### 4. Run the development server:
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.
