# Paid Leagues Setup Guide

This guide explains how to configure the FC League paid-leagues feature with **Vercel**, **IntaSend**, and **Firebase Admin**.

The application is designed to fail closed: paid checkout and prize payouts remain unavailable until the required server-side environment variables are configured.

## 1. Important security step

The IntaSend live keys previously shared in chat should be **revoked and regenerated** before use. Never commit IntaSend secret keys, Firebase private keys, or webhook challenges to GitHub.

Use Vercel’s Environment Variables screen for all production secrets.

## 2. Vercel project

Open the Vercel project connected to this repository:

1. Go to [Vercel](https://vercel.com/dashboard).
2. Open the `fc-league-app` project.
3. Select **Settings**.
4. Select **Environment Variables**.
5. Add each variable listed below.
6. Select **Production**, **Preview**, and **Development** where appropriate.
7. Save the variables.
8. Redeploy the latest deployment from the **Deployments** tab.

For initial testing, use IntaSend test credentials and set:

```text
INTASEND_TEST_MODE=true
```

Do not use live IntaSend keys while `INTASEND_TEST_MODE=true`.

## 3. IntaSend variables

### `INTASEND_PUBLISHABLE_KEY`

Your IntaSend publishable key. It identifies the IntaSend account used for checkout.

Use the test/sandbox publishable key during testing and the live publishable key only after the test flow works.

### `INTASEND_SECRET_KEY`

Your IntaSend secret key. This is used only by the Vercel serverless functions for checkout and payouts.

Important:

- Never prefix this with `VITE_`.
- Never expose it in React code.
- Never commit it to GitHub.
- Use a newly rotated key if the previous live key was shared publicly.

### `INTASEND_TEST_MODE`

Use:

```text
true
```

for sandbox testing.

Use:

```text
false
```

only after checkout and payout testing has been completed successfully.

### `INTASEND_WEBHOOK_CHALLENGE`

This must exactly match the challenge configured for the webhook in the IntaSend dashboard.

Create a long random value, for example:

```text
fc-league-webhook-CHANGE-ME-to-a-long-random-value
```

For stronger security, generate a random value locally instead of using the example.

### `APP_URL`

Set this to the production app URL:

```text
https://fc-league-app.vercel.app
```

## 4. Firebase Admin variables

The browser Firebase configuration already used by FC League is not sufficient for secure server-side payout authorization. The Vercel API routes also need Firebase Admin credentials.

### `FIREBASE_ADMIN_PROJECT_ID`

This is the Firebase project ID. It is usually the same value as:

```text
VITE_FIREBASE_PROJECT_ID
```

Example format:

```text
my-firebase-project
```

### `FIREBASE_ADMIN_CLIENT_EMAIL`

This is the service-account client email from Firebase or Google Cloud IAM.

Example format:

```text
firebase-adminsdk-xxxxx@my-firebase-project.iam.gserviceaccount.com
```

### `FIREBASE_ADMIN_PRIVATE_KEY`

This is the private key from the Firebase Admin service-account JSON file.

When entering it in Vercel, preserve the newline escapes:

```text
-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENT\n-----END PRIVATE KEY-----\n
```

Do not upload the service-account JSON file to GitHub.

## 5. Create or retrieve Firebase Admin credentials

If you do not already have a service account:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select the FC League Firebase project.
3. Open **Project settings**.
4. Open the **Service accounts** tab.
5. Select **Generate new private key**.
6. Download the JSON file temporarily.
7. Copy the following values into Vercel:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`
8. Delete the downloaded JSON file after saving the values securely.

Do not commit the JSON file.

## 6. Configure the IntaSend webhook

In the IntaSend dashboard:

1. Open **Webhooks**.
2. Add a webhook destination.
3. Use this URL:

```text
https://fc-league-app.vercel.app/api/webhooks/intasend
```

4. Use the exact same value configured in Vercel as `INTASEND_WEBHOOK_CHALLENGE`.
5. Enable collection/payment events.
6. Enable payout/disbursement events if available in the account.
7. Save the webhook.

The application uses webhook events as the authoritative payment status. A browser redirect is not treated as proof that a player paid.

The supported collection states include:

- `PENDING`
- `PROCESSING`
- `COMPLETE`
- `FAILED`

## 7. Test the paid-league flow

Keep test mode enabled and complete this sequence:

1. Create a new tournament.
2. Enable **Make this a paid league**.
3. Set an entry fee.
4. Confirm the prize pool preview.
5. Copy the invite link or scan the QR code.
6. Open the invite on another device or browser.
7. Enter a player name and Kenyan phone number.
8. Select **Pay**.
9. Complete the IntaSend sandbox checkout.
10. Confirm that the IntaSend webhook is received.
11. Complete every match.
12. Confirm the winner is shown at the top of the standings.
13. As the host, enter the winner’s Kenyan M-Pesa number.
14. Select **Release funds**.
15. Confirm the payout status in the IntaSend dashboard.

The app calculates the prize pool as:

```text
Prize pool = total entry fees × 75%
```

FC League keeps 25%. IntaSend processing fees are configured to be paid by the player at checkout.

## 8. Switch to live mode

Only switch to live mode after the complete sandbox flow works:

1. Replace the test publishable key with the rotated live publishable key.
2. Replace the test secret key with the rotated live secret key.
3. Set:

```text
INTASEND_TEST_MODE=false
```

4. Confirm the IntaSend webhook is configured for the live account.
5. Redeploy the Vercel project.
6. Run one low-value live checkout.
7. Verify that the payment webhook arrives.
8. Verify that the host-only release control is visible.
9. Confirm the payout amount before releasing any live funds.

## 9. API endpoints

The paid-league feature uses these routes:

| Route | Purpose |
|---|---|
| `/api/payments/checkout` | Creates an IntaSend checkout session |
| `/api/payments/payout` | Authenticates the host and releases the winner payout |
| `/api/webhooks/intasend` | Receives and records IntaSend payment and payout events |

## 10. Troubleshooting

### Checkout says IntaSend is not configured

Check that these variables exist in the Vercel environment used by the deployment:

```text
INTASEND_PUBLISHABLE_KEY
INTASEND_SECRET_KEY
INTASEND_TEST_MODE
```

Then redeploy. Environment variable changes do not affect an already-built deployment until it is redeployed.

### Webhook events are not appearing

Check:

- The webhook URL is exactly correct.
- The challenge matches `INTASEND_WEBHOOK_CHALLENGE` exactly.
- The webhook is configured in the same IntaSend environment as `INTASEND_TEST_MODE`.
- The Vercel deployment is live and accessible.
- The webhook route is returning a successful response.

### Release funds is unavailable

The release button is intentionally disabled unless:

- The user is authenticated.
- The user owns the league.
- Every match is complete.
- The winner has a valid Kenyan phone number.
- The payout amount matches the stored prize pool.
- Firebase Admin credentials are configured on Vercel.

### A payout cannot be submitted twice

This is intentional. The server stores a payout record and refuses duplicate release attempts once a payout is pending or submitted.

## 11. Current platform policy

The current paid-league policy is:

- Platform share: **25%**
- Winner prize pool: **75% of collected entry fees**
- IntaSend processing fees: **paid by the player**
- Payout destination: **winner’s Kenyan M-Pesa number**
- Payout authorization: **host clicks Release funds after the final standings are confirmed**
