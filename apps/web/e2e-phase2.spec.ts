import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test.use({ channel: 'chrome', colorScheme: 'dark' });

test('desktop routes and core local interactions work', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('http://127.0.0.1:5173/');
	await expect(page).toHaveURL('http://127.0.0.1:5173/dashboard');
	await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

	const dashboardOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth
	);
	expect(dashboardOverflow).toBe(false);

	await page.getByRole('link', { name: 'Simulations' }).click();
	await expect(
		page.getByRole('heading', { name: 'Live Simulation - Shawarma Spot Menu' })
	).toBeVisible();

	await page.getByRole('tab', { name: 'Activity Feed' }).click();
	await expect(page.getByText('Price objection detected')).toBeVisible();

	await page.getByRole('tab', { name: 'Live Chat' }).click();
	await page.getByLabel('Type a message').fill('Please add extra pepper.');
	await page.getByRole('button', { name: 'Send message' }).click();
	await expect(page.getByText('Please add extra pepper.')).toBeVisible();

	await page.getByRole('link', { name: 'Reports' }).click();
	await expect(
		page.getByRole('heading', { name: 'Simulation Report - Shawarma Spot Menu' })
	).toBeVisible();
	await page.getByRole('tab', { name: 'Recommendations' }).click();
	await expect(page.getByText('Add WhatsApp ordering')).toBeVisible();
});

test('mobile navigation and responsive dashboard work', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('http://127.0.0.1:5173/dashboard');

	const mobileOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth
	);
	expect(mobileOverflow).toBe(false);

	const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });
	await menuToggle.click();
	await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
	await page.getByRole('link', { name: 'Simulations' }).click();
	await expect(page).toHaveURL('http://127.0.0.1:5173/simulations');
	await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
	await expect(page.getByText('Okay cool. Do you have pepper extra?')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();

	const simulationOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth
	);
	expect(simulationOverflow).toBe(false);

	await page.screenshot({
		fullPage: true,
		path: join(tmpdir(), 'parallel-market-ai-mobile-simulations.png')
	});
});
