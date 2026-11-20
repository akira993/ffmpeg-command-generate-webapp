<script lang="ts">
	import { locale, t } from '#lib/i18n/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	function toggle() {
		const next = $locale === 'ja' ? 'en' : 'ja';
		locale.set(next);
		localStorage.setItem('locale', next);
	}
</script>

<Button variant="ghost" size="sm" onclick={toggle} aria-label={$t('common.switchLanguage')}>
	{$locale === 'ja' ? 'EN' : 'JA'}
</Button>
