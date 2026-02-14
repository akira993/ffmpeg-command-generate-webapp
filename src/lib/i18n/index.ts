import i18n, { type Config } from 'sveltekit-i18n';
import ja from './ja.json';
import en from './en.json';

const config: Config = {
	loaders: [
		{
			locale: 'ja',
			key: '',
			loader: async () => ja
		},
		{
			locale: 'en',
			key: '',
			loader: async () => en
		}
	]
};

export const defaultLocale = 'ja';

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
