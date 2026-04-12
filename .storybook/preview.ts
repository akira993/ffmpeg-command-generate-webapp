import type { Preview } from '@storybook/sveltekit';
import { untrack } from 'svelte';
import '../src/app.css';
import { loadTranslations, locale } from '../src/lib/i18n';
import { compactStore } from '../src/lib/stores/compact.svelte';

// Pre-load both locales so switching is instant
loadTranslations('ja');
loadTranslations('en');

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		a11y: {
			test: 'todo'
		}
	},
	globalTypes: {
		theme: {
			description: 'Theme',
			toolbar: {
				title: 'Theme',
				icon: 'paintbrush',
				items: ['light', 'dark'],
				dynamicTitle: true
			}
		},
		locale: {
			description: 'Locale',
			toolbar: {
				title: 'Locale',
				icon: 'globe',
				items: ['ja', 'en'],
				dynamicTitle: true
			}
		}
	},
	initialGlobals: {
		theme: 'light',
		locale: 'ja'
	},
	decorators: [
		(storyFn, context) => {
			// Theme switching
			const theme = context.globals.theme;
			document.documentElement.classList.toggle('dark', theme === 'dark');

			// Locale switching
			const loc = context.globals.locale || 'ja';
			locale.set(loc);
			document.documentElement.lang = loc;

			// Reset compact mode state to defaults before each story.
			// Stories that need compact/pwa must opt in via <CompactDecorator>.
			// This prevents global state from leaking between stories.
			// Wrapped in untrack() to avoid Svelte 5 state_unsafe_mutation,
			// since Storybook svelte-csf runs decorators in a reactive context.
			untrack(() => {
				compactStore.isCompact = false;
				compactStore.isPWA = false;
			});

			return storyFn();
		}
	]
};

export default preview;
