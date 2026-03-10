<script lang="ts">
	import { t } from '$lib/i18n';
	import { compactStore } from '$lib/stores/compact.svelte';
</script>

<footer class="border-t border-border mt-auto {compactStore.isCompact ? 'pb-14 sm:pb-0' : 'pb-16 sm:pb-0'}">
	<div class="container mx-auto flex items-center justify-center gap-3 px-4 text-sm text-muted-foreground {compactStore.isCompact ? 'py-1' : 'py-4'}">
		<p>{$t('footer.description')}</p>
		<span class="text-border">|</span>
		<a
			href="/about-ffmpeg"
			class="underline-offset-4 hover:text-foreground hover:underline"
		>
			{$t('footer.aboutFfmpeg')}
		</a>
		<span class="text-border">|</span>
		<a
			href="/privacy"
			class="underline-offset-4 hover:text-foreground hover:underline"
		>
			{$t('footer.privacy')}
		</a>
	</div>
</footer>
