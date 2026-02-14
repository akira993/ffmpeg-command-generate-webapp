<script lang="ts">
	import { t } from '$lib/i18n';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import LanguageSwitcher from '$lib/components/common/LanguageSwitcher.svelte';
</script>

<header class="border-b border-border">
	<div class="container mx-auto flex items-center justify-between px-4 py-3">
		<div>
			<h1 class="text-xl font-bold">{$t('header.title')}</h1>
			<p class="text-sm text-muted-foreground">{$t('header.subtitle')}</p>
		</div>
		<div class="flex items-center gap-1">
			<LanguageSwitcher />
			<ThemeToggle />
		</div>
	</div>
</header>
