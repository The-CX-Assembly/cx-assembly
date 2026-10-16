import { createHmac } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import type { BrowserContext, Page } from '@playwright/test';

/** True when the app under test has a database (CI runs against the Firestore emulator). */
export const HAS_DB = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

// A built-in super admin (src/modules/users/services/users.service.ts): needs no database record.
const ADMIN_EMAIL = 'abhishekroks12345@gmail.com';

function sessionSecret(): string {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (existsSync('.env.local')) {
    const match = readFileSync('.env.local', 'utf8').match(/^ADMIN_SESSION_SECRET=(.*)$/m);
    if (match) return match[1].trim();
  }
  throw new Error('Set ADMIN_SESSION_SECRET (or add it to .env.local) to run admin tests.');
}

/** Signs in as a super admin by setting the same signed cookie the app issues. */
export async function signInAsAdmin(context: BrowserContext, baseURL: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ email: ADMIN_EMAIL, iat: now, exp: now + 3600 })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  await context.addCookies([{ name: 'cx_admin_session', value: `${payload}.${signature}`, url: baseURL }]);
}

/** Opens the join form from a CTA and returns the dialog. */
export async function openJoinForm(page: Page, cta: string) {
  const button = page.locator(`[data-cta="${cta}"]`).first();
  await button.scrollIntoViewIfNeeded();
  await button.click();
  const dialog = page.locator('dialog.join-dialog[open]');
  await dialog.waitFor();
  return dialog;
}
