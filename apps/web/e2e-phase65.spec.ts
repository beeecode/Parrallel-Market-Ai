import { expect, test } from '@playwright/test';

test('public landing page is interactive and routes visitors safely', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/');

	await expect(page).toHaveURL(/\/$/);
	await expect(
		page.getByRole('heading', { name: 'Simulate your market before you launch' })
	).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Landing page navigation' })).toBeVisible();
	await expect(page.getByText('Sample simulation metrics from the demo workspace')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Start Simulating' }).first()).toHaveAttribute(
		'href',
		'/login'
	);

	await page.getByRole('tab', { name: 'Report' }).click();
	await expect(
		page.getByRole('heading', { name: 'Turn reactions into practical insight' })
	).toBeVisible();
	await expect(page.getByText('Customer sentiment').last()).toBeVisible();

	const aiQuestion = page.getByRole('button', { name: 'Does it use real AI?' });
	await aiQuestion.click();
	await expect(aiQuestion).toHaveAttribute('aria-expanded', 'true');
	await expect(page.getByText(/current custom request agent uses deterministic/i)).toBeVisible();
	await aiQuestion.click();
	await expect(aiQuestion).toHaveAttribute('aria-expanded', 'false');

	await page.setViewportSize({ width: 390, height: 844 });
	await page.getByRole('button', { name: 'Open landing navigation' }).click();
	const drawer = page.getByLabel('Landing mobile navigation');
	await expect(drawer).toBeVisible();
	await drawer.getByRole('link', { name: 'Features' }).click();
	await expect(drawer).not.toBeVisible();
	await expect(page.locator('#features')).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
		.toBe(true);

	await page.getByRole('link', { name: 'Request a Custom Simulation' }).click();
	await expect(page).toHaveURL(/\/login\?returnTo=%2Frequest-simulation$/);
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Fdashboard$/);

	const browserStorage = await page.evaluate(() => ({
		local: Object.keys(localStorage),
		session: Object.keys(sessionStorage)
	}));
	expect(browserStorage.local).toEqual([]);
	expect(
		browserStorage.session.filter((key) => /auth|jwt|payload|session|token/i.test(key))
	).toEqual([]);
});
