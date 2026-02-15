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

	try {
		await loadTranslations(initLocale);
		locale.set(initLocale);
	} catch (e) {
		console.error('i18n init error:', e);
	}

	return {};
};
