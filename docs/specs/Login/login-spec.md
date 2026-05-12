# Feature: Mobile Login via OTP

## Status: implemented

## Route
`src/app/[locale]/(auth)/login/page.jsx`

## Flow
User authenticates using an Aadhaar-linked mobile number and a 4-digit OTP.

## Overview
Secure authentication flow that anchors user identity to their Aadhaar-linked mobile number, providing a seamless entry point into the HUES platform.

---

## Data Model

### Auth Session

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | JWT for authenticated requests |
| `refresh_token` | string | Token to obtain new access tokens |
| `userId` | string | Unique identifier for the authenticated user |

---

## Features

### 1. Mobile Number Entry
**Description:** User enters their 10-digit Aadhaar-linked mobile number to request a verification code.

**Location:** Login Page (Initial Step)

**Behavior:**
- Default country code is fixed to `+91`.
- Input accepts numeric values only.
- Validates that the number is exactly 10 digits before allowing "Get OTP".
- On "Get OTP", calls the generate OTP API.

**API:** `POST /iam/auth/login/mobile/generate_otp`

---

### 2. OTP Verification
**Description:** User enters the 4-digit code received on their mobile device.

**Trigger:** Successful OTP generation.

**UI:** 4-slot OTP Input field with a countdown timer.

**Form Fields:**

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| OTP | Number | Yes | 4 digits | Must match the code sent to the device |

**On Success:**
- Store `token` and `refresh_token` in local storage.
- Update user onboarding states (PAN, Aadhaar, Enterprise status).
- Redirect to Dashboard or specific Onboarding step based on user state.

**On Error:**
- Show error toast (e.g., "Invalid OTP").
- Allow user to retry or go back to change the mobile number.

**API:** `POST /iam/auth/login/mobile/verify_otp`

---

### 3. Resend OTP
**Trigger:** "Send again" button click after 30-second countdown.

**Behavior:**
- Restarts the 30-second timer.
- Triggers the generate OTP API again for the same mobile number.

**API:** `POST /iam/auth/login/mobile/generate_otp`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/iam/auth/login/mobile/generate_otp` | Generates and sends OTP to the mobile number |
| POST | `/iam/auth/login/mobile/verify_otp` | Verifies OTP and returns user session tokens |

---

## Business Rules
1. Mobile number must be Aadhaar-linked (enforced by user intent/system verification).
2. OTP is a 4-digit numeric code.
3. Resend OTP is disabled until the 30-second countdown completes.
4. Successful login must initialize local storage with user permissions and onboarding status.

---

## Acceptance Criteria
- [ ] User can enter a 10-digit mobile number.
- [ ] Verification fails for non-numeric or incorrect length mobile numbers.
- [ ] OTP screen displays the last 4 digits of the mobile number it was sent to.
- [ ] OTP input allows only 4 digits.
- [ ] Successful verification redirects to `/dashboard` (or the appropriate onboarding route).
- [ ] "Back" button on OTP screen returns to the mobile number input.

---

## UI Behavior

### Entry Point
- User navigates to the `/login` route.

### Forms & Inputs
- **Mobile Input:** Placeholder "Enter your Aadhaar-linked mobile number".
- **OTP Input:** 4 discrete slots using `input-otp`.

### Loading States
- "Get OTP" button shows a spinner during API call.
- "Confirm" button shows a spinner during verification.

### Success Behavior
- Success toast: "You’re verified!"
- Immediate redirection based on `handleOtpRedirection` logic.

### Error Behavior
- Error toast for invalid OTP: "Oops! That OTP didn’t work One more try should do the trick!"
- Validation message for invalid phone number.

---

## Test Scenarios

### Login Flow

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Successful Login | User on Login page | Enters "7317414274", clicks "Get OTP", enters "8080", clicks "Confirm" | User redirected to Dashboard |
| 2 | Invalid OTP | User on OTP screen | Enters "0000", clicks "Confirm" | Error message "Oops! That OTP didn’t work" shown |
| 3 | Resend OTP | Timer reaches 0 | Clicks "Send again" | New OTP sent, timer resets to 30s |
| 4 | Change Number | User on OTP screen | Clicks "Back" | Returns to mobile entry with "7317414274" prefilled |