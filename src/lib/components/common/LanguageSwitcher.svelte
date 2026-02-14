<script lang="ts">
	import { locale } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button';

	function toggle() {
		const next = $locale === 'ja' ? 'en' : 'ja';
		locale.set(next);
		localStorage.setItem('locale', next);
	}
</script>

<Button variant="ghost" size="sm" onclick={toggle} aria-label="Switch language">
	{$locale === 'ja' ? 'EN' : 'JA'}
</Button>
