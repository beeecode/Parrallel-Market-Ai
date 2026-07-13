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

test('authenticated desktop workflow uses Payload data and saves a business message', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await login(page);
	const uniqueSuffix = Date.now();

	const browserStorage = await page.evaluate(() => ({
		local: Object.keys(localStorage),
		session: Object.keys(sessionStorage)
	}));
	expect(browserStorage.local).toEqual([]);
	expect(
		browserStorage.session.filter((key) => /auth|jwt|payload|session|token/i.test(key))
	).toEqual([]);
	const sessionCookie = (await page.context().cookies()).find(
		(cookie) => cookie.name === 'parallel_market_session'
	);
	expect(sessionCookie?.httpOnly).toBe(true);

	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Success Probability' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Revenue Forecast' })).toBeVisible();
	await expect(page.getByText('Total Customers Simulated')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Simulation Activity' })).toBeVisible();
	await expect(page.getByText('Daniel Adeyemi').filter({ visible: true })).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
		.toBe(true);

	await page.getByRole('link', { name: 'Products' }).click();
	await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
	await expect(page.getByText('Shawarma Spot Menu').first()).toBeVisible();
	await page.getByRole('button', { name: 'New Product' }).click();
	const productName = `E2E Product ${uniqueSuffix}`;
	await page.getByLabel('Product name').fill(productName);
	await page.getByLabel('Category').fill('Food delivery');
	await page.getByLabel('Description').fill('A controlled E2E product creation test.');
	await page.getByLabel('Current price').fill('4200');
	await page.getByLabel('Target market').fill('Urban delivery customers');
	await page.getByLabel('Target location').fill('Lagos, Nigeria');
	await page.getByRole('button', { name: 'Create Product' }).click();
	await expect(page).toHaveURL(/\/products\/\d+$/);
	await expect(page.getByRole('heading', { name: productName })).toBeVisible();

	await page.getByRole('button', { name: 'Create Simulation' }).click();
	const simulationTitle = `E2E Simulation ${uniqueSuffix}`;
	await expect(page).toHaveURL(/\/simulations\/new$/);
	await page.getByLabel('Product').selectOption({ label: productName });
	await page.getByLabel('Customer count').fill('250');
	await page.getByLabel('Simulation title').fill(simulationTitle);
	await page.getByLabel('Target audience').fill('Busy professionals ordering lunch online.');
	await page.getByLabel('Target location').fill('Lagos, Nigeria');
	await page.getByLabel('Simulation goal').fill('Validate pricing, trust, and purchase intent.');
	await page.getByLabel('Customer segments').fill('Professionals, Students');
	await page.getByRole('button', { name: 'Create Simulation' }).click();
	await expect(page).toHaveURL(/\/simulations\/\d+\/live$/);
	await expect(
		page.getByRole('heading', { name: `Live Simulation - ${simulationTitle}` })
	).toBeVisible();
	await expect(page.getByText('No customer agents yet')).toBeVisible();

	await page.getByRole('link', { name: 'Customers' }).click();
	await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
	await expect(page.getByText('Tunde').first()).toBeVisible();

	await page.getByRole('link', { name: 'Insights' }).click();
	await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();
	await expect(page.getByText('Pricing Insight')).toBeVisible();

	await page.getByRole('link', { name: 'Settings' }).click();
	await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
	await expect(page.getByText(email).first()).toBeVisible();

	await page.getByRole('link', { name: 'Simulations' }).click();
	await expect(
		page.getByRole('heading', { name: 'Live Simulation - Shawarma Spot Menu' })
	).toBeVisible();
	await page.getByRole('button', { name: /Bola/ }).click();
	await expect(
		page
			.getByRole('log', { name: 'Live simulation conversation' })
			.getByText('Do you have a smaller pack?')
	).toBeVisible();

	const message = `E2E business reply ${Date.now()}`;
	await page.getByLabel('Type a message').fill(message);
	await page.getByRole('button', { name: 'Send message' }).click();
	await expect(
		page.getByRole('log', { name: 'Live simulation conversation' }).getByText(message)
	).toBeVisible();

	await page.getByRole('link', { name: 'Reports' }).click();
	await expect(
		page.getByRole('heading', { name: 'Simulation Report - Shawarma Spot Menu' })
	).toBeVisible();
	await page.getByRole('link', { name: 'View Detail' }).click();
	await expect(page).toHaveURL(/\/reports\/\d+$/);
	await expect(
		page.getByRole('heading', { name: 'Simulation Report - Shawarma Spot Menu' })
	).toBeVisible();
	await page.getByRole('tab', { name: 'Recommendations' }).click();
	await expect(page.getByText('Add WhatsApp ordering')).toBeVisible();

	await page.setViewportSize({ width: 390, height: 844 });
	await page.getByRole('button', { name: 'Open navigation menu' }).click();
	const drawer = page.getByLabel('Mobile navigation drawer');
	await expect(drawer).toBeVisible();
	await drawer.getByRole('link', { name: 'Simulations' }).click();
	await expect(page).toHaveURL(/\/simulations$/);
	await expect(drawer).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
		.toBe(true);

	await page.getByRole('button', { name: 'Open navigation menu' }).click();
	await drawer.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/login$/);
	expect(
		(await page.context().cookies()).find((cookie) => cookie.name === 'parallel_market_session')
	).toBeUndefined();
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Fdashboard$/);
});

test('invalid login is safe and protected routes redirect', async ({ page }) => {
	await page.goto('/reports');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Freports$/);
	await page.getByLabel('Email address').fill('unknown@example.com');
	await page.getByLabel('Password').fill('incorrect-password');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByRole('alert')).toContainText('The email or password is incorrect.');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Freports$/);
});
