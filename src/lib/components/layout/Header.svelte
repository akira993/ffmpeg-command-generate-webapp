<script lang="ts">
	import { t } from '$lib/i18n';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import LanguageSwitcher from '$lib/components/common/LanguageSwitcher.svelte';
	import { compactStore } from '$lib/stores/compact.svelte';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
</script>

<header class="border-b border-border">
	<div class="container mx-auto flex items-center justify-between px-4 py-3">
		<div>
			<h1 class="text-xl font-bold">{$t('header.title')}</h1>
			{#if !compactStore.isCompact}
				<p class="text-sm text-muted-foreground">{$t('header.subtitle')}</p>
			{/if}
		</div>
		<div class="flex items-center gap-1">
			{#if compactStore.isPWA}
				<button
					onclick={() => compactStore.toggle()}
					class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
					aria-label={compactStore.isCompact ? $t('header.normalMode') : $t('header.compactMode')}
					title={compactStore.isCompact ? $t('header.normalMode') : $t('header.compactMode')}
				>
					<SmartphoneIcon size={18} strokeWidth={2} />
				</button>
			{/if}
			<LanguageSwitcher />
			<ThemeToggle />
		</div>
	</div>
</header>
