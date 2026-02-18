<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<footer class="border-t border-border mt-auto">
	<div class="container mx-auto flex items-center justify-center gap-3 px-4 py-4 text-sm text-muted-foreground">
		<p>{$t('footer.description')}</p>
		<span class="text-border">|</span>
		<a
			href="/about-ffmpeg"
			class="underline-offset-4 hover:text-foreground hover:underline"
		>
			{$t('footer.aboutFfmpeg')}
		</a>
	</div>
</footer>
