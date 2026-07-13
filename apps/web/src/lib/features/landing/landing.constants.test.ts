import { describe, expect, it } from 'vitest';

import {
	demoPersonas,
	faqItems,
	featureItems,
	landingNavItems,
	showcaseTabs,
	useCaseItems
} from './landing.constants';

describe('landing content', () => {
	it('keeps navigation anchors unique and valid', () => {
		const hrefs = landingNavItems.map((item) => item.href);

		expect(new Set(hrefs).size).toBe(hrefs.length);
		expect(hrefs.every((href) => href.startsWith('/#'))).toBe(true);
	});

	it('provides complete showcase content for every product module', () => {
		expect(showcaseTabs.map((tab) => tab.id)).toEqual([
			'dashboard',
			'simulation',
			'report',
			'request-agent'
		]);
		expect(showcaseTabs.every((tab) => tab.highlights.length >= 2)).toBe(true);
	});

	it('contains the required marketing content without empty entries', () => {
		expect(featureItems).toHaveLength(6);
		expect(useCaseItems).toHaveLength(6);
		expect(faqItems).toHaveLength(7);
		expect(demoPersonas).toHaveLength(3);
		expect(
			[...featureItems, ...useCaseItems, ...faqItems, ...demoPersonas].every((item) =>
				Object.values(item).every((value) => String(value).trim().length > 0)
			)
		).toBe(true);
	});
});
