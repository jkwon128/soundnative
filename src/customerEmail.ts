// The email address a user typed into Polar's hosted checkout, captured
// once payment status is checked (see CheckoutSuccessScreen) and reused
// wherever the app needs to send something to "the user" — e.g. the Notes
// email feature — without asking for an address a second time.
const CUSTOMER_EMAIL_KEY = 'soundnative_customerEmail'

export function saveCustomerEmail(email: string): void {
  try {
    localStorage.setItem(CUSTOMER_EMAIL_KEY, email)
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

export function loadCustomerEmail(): string | null {
  try {
    return localStorage.getItem(CUSTOMER_EMAIL_KEY)
  } catch {
    return null
  }
}

export function clearCustomerEmail(): void {
  try {
    localStorage.removeItem(CUSTOMER_EMAIL_KEY)
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}
