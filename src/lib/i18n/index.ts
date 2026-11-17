import stores from '@sveltekit-i18n/extension-stores';
import { I18n } from 'sveltekit-i18n';
import ja from './ja.json';
import en from './en.json';

export const defaultLocale = 'ja';

// 事前生成は全ページ同じ既定の言語で、経路の引数も利用者ごとの分岐もない。
// 公式は、この条件ならモジュールの1つのインスタンスで足りると説明している。
export const { t, locale, locales, loading, loadTranslations } = new I18n({
	loaders: [
		{
			locale: 'ja',
			namespace: '',
			loader: async () => ja,
		},
		{
			locale: 'en',
			namespace: '',
			loader: async () => en,
		},
	],
	extensions: [stores],
});
