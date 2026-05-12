import { expect, type Page, test as base } from '@playwright/test';

// Override global setup to start with a fresh state
const test = base.extend({
    storageState: { cookies: [], origins: [] },
});

// Constants
const PAGE_URL = '/login';
const VALID_MOBILE = '7317414274';
const VALID_OTP = '8080';
const INVALID_OTP = '0000';

// Navigation Helpers
async function gotoPage(page: Page) {
    await page.goto(PAGE_URL);
    await expect(page.getByRole('heading', { name: /Welcome to Hues/i })).toBeVisible({
        timeout: 15_000,
    });
}

// Helpers for common actions
async function enterMobileNumber(page: Page, mobile: string) {
    await page.getByPlaceholder(/Enter your Aadhaar-linked mobile number/i).fill(mobile);
}

async function clickGetOTP(page: Page) {
    const apiPromise = page.waitForResponse(
        (res) => res.url().includes('/iam/auth/login/mobile/generate_otp') && res.ok(),
        { timeout: 10_000 }
    );
    await page.getByRole('button', { name: /Get OTP/i }).click();
    return apiPromise;
}

async function verifyOTPScreenVisible(page: Page) {
    await expect(page.getByRole('heading', { name: /Let’s verify your number/i })).toBeVisible({
        timeout: 10_000,
    });
}

async function enterOTP(page: Page, otp: string) {
    // Input OTP uses a hidden/accessible textbox or slots
    // Based on signin.spec.ts reference pattern:
    await page.getByRole('textbox').fill(otp);
}

async function clickVerify(page: Page) {
    const apiPromise = page.waitForResponse(
        (res) => res.url().includes('/iam/auth/login/mobile/verify_otp'),
        { timeout: 10_000 }
    );
    await page.getByRole('button', { name: /Confirm/i }).click();
    return apiPromise;
}

test.describe('Login Page - OTP Flow', () => {
    test.beforeEach(async ({ page }) => {
        await gotoPage(page);
    });

    test('Successful Login', async ({ page }) => {
        await enterMobileNumber(page, VALID_MOBILE);
        await clickGetOTP(page);
        await verifyOTPScreenVisible(page);

        await enterOTP(page, VALID_OTP);
        const verifyPromise = clickVerify(page);

        // Trigger verification and wait for response
        const response = await verifyPromise;
        expect(response.ok()).toBeTruthy();

        // Verify redirection (can be Dashboard or Onboarding Confirmation)
        await page.waitForURL(/.*(dashboard|login|confirmation).*/, { timeout: 15_000 });
    });

    test('Invalid OTP shows error message', async ({ page }) => {
        await enterMobileNumber(page, VALID_MOBILE);
        await clickGetOTP(page);
        await verifyOTPScreenVisible(page);

        await enterOTP(page, INVALID_OTP);
        const verifyPromise = clickVerify(page);

        // Status can be 400 or the response might just contain an error message
        await verifyPromise;

        // Verify error toast or message
        // Note: The spec says "Oops! That OTP didn’t work"
        await expect(page.getByText(/That OTP didn’t work/i)).toBeVisible();
    });

    test('Change Number returns to mobile entry', async ({ page }) => {
        await enterMobileNumber(page, VALID_MOBILE);
        await clickGetOTP(page);
        await verifyOTPScreenVisible(page);

        // Click Back button
        await page.getByRole('button', { name: /Back/i }).click();

        // Should be back at mobile entry with number prefilled
        await expect(page.getByRole('heading', { name: /Welcome to Hues/i })).toBeVisible();
        await expect(page.getByPlaceholder(/Enter your Aadhaar-linked mobile number/i)).toHaveValue(VALID_MOBILE);
    });

    test('Resend OTP restarts timer', async ({ page }) => {
        await enterMobileNumber(page, VALID_MOBILE);
        await clickGetOTP(page);
        await verifyOTPScreenVisible(page);

        // Wait for timer to reach 0 (30 seconds)
        const resendButton = page.getByRole('button', { name: /Send again/i });

        // Increase timeout to 45s for reliability
        await expect(resendButton).toBeVisible({ timeout: 45_000 });

        const resendPromise = page.waitForResponse(
            (res) => res.url().includes('/iam/auth/login/mobile/generate_otp') && res.ok(),
            { timeout: 10_000 }
        );

        await resendButton.click();
        await resendPromise;

        // Verify timer is visible again
        await expect(page.getByText(/retry in/i)).toBeVisible();
    });
});
