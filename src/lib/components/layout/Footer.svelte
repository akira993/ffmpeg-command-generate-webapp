<script lang="ts">
	import { t } from '$lib/i18n';
	import { compactStore } from '$lib/stores/compact.svelte';
</script>

<footer class="footer-dynamic-pb border-t border-border mt-auto">
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

<style>
	/* モバイル: 固定バーの高さ + 余白分のパディング（CSS変数は +page.svelte で設定） */
	.footer-dynamic-pb {
		padding-bottom: calc(var(--mobile-bar-h, 4rem) + 0.75rem);
	}

	/* デスクトップ: 固定バーなし → パディング不要 */
	@media (min-width: 640px) {
		.footer-dynamic-pb {
			padding-bottom: 0;
		}
	}
</style>
