import { expect, test, type Page } from '@playwright/test';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

if (!email || !password) {
	throw new Error('E2E_USER_EMAIL and E2E_USER_PASSWORD must be available to Playwright.');
}

async function login(page: Page): Promise<void> {
	let lastError: unknown;

	for (let attempt = 0; attempt < 3; attempt += 1) {
		await page.goto('/login');
		await page.getByLabel('Email address').fill(email);
		await page.getByLabel('Password').fill(password);
		await page.getByRole('button', { name: 'Sign in' }).click();

		try {
			await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
			return;
		} catch (cause) {
			lastError = cause;
		}
	}

	throw lastError;
}

async function continueStep(page: Page): Promise<void> {
	await page.getByRole('button', { name: /Continue|Review request/ }).click();
}

async function fillVisibleStep(page: Page, label: string, value: string): Promise<void> {
	const field = page.getByLabel(label);
	if (!(await field.isVisible({ timeout: 1000 }).catch(() => false))) return;

	await field.fill(value);
	await continueStep(page);
}

test('authenticated user completes a custom simulation request', async ({ page }) => {
	const uniqueSuffix = Date.now();

	await page.setViewportSize({ width: 1366, height: 960 });
	await login(page);
	await page.getByRole('link', { name: 'Request Simulation' }).click();
	await expect(page).toHaveURL(/\/request-simulation$/);
	await expect(page.getByRole('heading', { name: 'Request Simulation' })).toBeVisible();

	await fillVisibleStep(page, 'Your name', 'Daniel Adeyemi');
	await fillVisibleStep(page, 'Email address', email);
	await fillVisibleStep(page, 'Company', 'Amazing Taste Delicacies');
	await page.getByLabel('Business type').fill('Food delivery');
	await continueStep(page);
	await page.getByLabel('Product or service').fill(`Phase 5 Shawarma Menu ${uniqueSuffix}`);
	await continueStep(page);
	await page
		.getByLabel('Product description')
		.fill('A premium shawarma menu for mobile-first ordering and WhatsApp commerce.');
	await continueStep(page);
	await page.getByLabel('Target market').fill('Lagos food delivery customers');
	await continueStep(page);
	await page.getByLabel('Target location').fill('Lagos, Nigeria');
	await continueStep(page);
	await page
		.getByLabel('Target customers')
		.fill('Young professionals and students who order lunch online.');
	await continueStep(page);
	await page.getByLabel('Current price').fill('4200');
	await continueStep(page);
	await page.getByLabel('Currency').selectOption('NGN');
	await continueStep(page);
	await page
		.getByLabel('Business challenge')
		.fill('Delivery fee objections, price sensitivity, and checkout trust concerns.');
	await continueStep(page);
	await page
		.getByLabel('Simulation goal')
		.fill('Test price sensitivity and conversion probability before changing the offer.');
	await continueStep(page);
	await page.getByLabel('Budget').fill('150000');
	await continueStep(page);
	await page.getByLabel('Timeline').fill('Within 2 weeks');
	await continueStep(page);

	await expect(page.getByText('Summary preview')).toBeVisible();
	await expect(page.getByText(`Product: Phase 5 Shawarma Menu ${uniqueSuffix}`)).toBeVisible();
	await page.getByRole('button', { name: 'Submit request' }).click();
	await expect(page.getByText('Your custom simulation request is in.')).toBeVisible();
	await expect(page.getByText(/CSR-\d{5}/)).toBeVisible();
	await expect(page.getByText('new')).toBeVisible();

	const browserStorage = await page.evaluate(() => ({
		local: Object.keys(localStorage),
		session: Object.keys(sessionStorage)
	}));
	expect(browserStorage.local).toEqual([]);
	expect(
		browserStorage.session.filter((key) => /auth|jwt|payload|session|token/i.test(key))
	).toEqual([]);

	await page.getByRole('link', { name: 'Start another request' }).click();
	await expect(page.getByText('Request submitted')).not.toBeVisible();

	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/request-simulation');
	await expect(page.getByRole('heading', { name: 'Request Simulation' })).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
		.toBe(true);

	await page.context().clearCookies();
	await page.goto('/request-simulation');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Frequest-simulation$/);
});
