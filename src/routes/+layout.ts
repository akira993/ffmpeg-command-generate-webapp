import { loadTranslations, locale, defaultLocale } from '$lib/i18n';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async () => {
	let initLocale = defaultLocale;

	if (browser) {
		const saved = localStorage.getItem('locale');
		if (saved) {
			initLocale = saved;
		} else if (navigator.language.startsWith('ja')) {
			initLocale = 'ja';
		} else {
			initLocale = 'en';
		}
	}

	await loadTranslations(initLocale);
	locale.set(initLocale);

	return {};
};
