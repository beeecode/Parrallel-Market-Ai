import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: '.',
	testMatch: 'e2e-phase2.spec.ts',
	outputDir: 'test-results',
	timeout: 30_000,
	use: {
		baseURL: 'http://127.0.0.1:5173',
		channel: 'chrome',
		colorScheme: 'dark',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'corepack yarn preview --host 127.0.0.1 --port 5173',
		url: 'http://127.0.0.1:5173/dashboard',
		reuseExistingServer: true,
		timeout: 120_000,
		stdout: 'ignore',
		stderr: 'pipe'
	}
});
