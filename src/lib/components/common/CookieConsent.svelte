<script lang="ts">
	import { t } from '$lib/i18n';
	import { consentStore } from '$lib/stores/consent.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

{#if consentStore.showBanner}
	<div
		class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-lg"
	>
		<div
			class="container mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
		>
			<p class="text-center text-sm text-muted-foreground sm:text-left">
				{$t('consent.message')}
				<a
					href="/privacy"
					class="text-primary underline-offset-4 hover:underline"
				>
					{$t('consent.learnMore')}
				</a>
			</p>
			<div class="flex shrink-0 gap-2">
				<Button variant="outline" size="sm" onclick={() => consentStore.reject()}>
					{$t('consent.reject')}
				</Button>
				<Button size="sm" onclick={() => consentStore.accept()}>
					{$t('consent.accept')}
				</Button>
			</div>
		</div>
	</div>
{/if}
