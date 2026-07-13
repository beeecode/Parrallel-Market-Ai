import { defineConfig } from '@playwright/test';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { config as loadEnvironment } from 'dotenv';

loadEnvironment({ path: resolve(process.cwd(), '../cms/.env'), quiet: true });

const payloadSecret = process.env.PAYLOAD_SECRET;
if (!payloadSecret) {
	throw new Error('PAYLOAD_SECRET is required in apps/cms/.env for authenticated E2E tests.');
}

process.env.E2E_USER_EMAIL ??= 'demo-owner@parallel-market-ai.local';
process.env.E2E_USER_PASSWORD ??=
	createHash('sha256')
		.update(`${payloadSecret}:demo-business-owner`)
		.digest('base64url')
		.slice(0, 28) + 'Aa1!';

export default defineConfig({
	testDir: '.',
	testMatch: ['e2e-phase4.spec.ts', 'e2e-phase5.spec.ts', 'e2e-phase65.spec.ts'],
	outputDir: 'test-results',
	timeout: 180_000,
	expect: {
		timeout: 30_000
	},
	use: {
		baseURL: 'http://localhost:5187',
		channel: 'chrome',
		colorScheme: 'dark',
		trace: 'retain-on-failure'
	},
	webServer: [
		{
			command: 'corepack yarn workspace @parallel-market-ai/cms dev',
			url: 'http://127.0.0.1:3001/admin',
			reuseExistingServer: true,
			timeout: 180_000,
			stdout: 'ignore',
			stderr: 'pipe'
		},
		{
			command: 'corepack yarn preview --host localhost --port 5187',
			env: {
				CMS_API_URL: 'http://localhost:3001',
				FRONTEND_MOCK_MODE: 'false'
			},
			url: 'http://localhost:5187/login',
			reuseExistingServer: false,
			timeout: 120_000,
			stdout: 'ignore',
			stderr: 'pipe'
		}
	]
});
