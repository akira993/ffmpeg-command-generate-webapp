<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<footer class="border-t border-border mt-auto">
	<div class="container mx-auto flex items-center justify-between px-4 py-4 text-sm text-muted-foreground">
		<p>{$t('footer.description')}</p>
		<a
			href="https://github.com/akira993/ffmpeg-command-generate-webapp"
			target="_blank"
			rel="noopener noreferrer"
			class="hover:text-foreground transition-colors"
		>
			{$t('footer.github')}
		</a>
	</div>
</footer>
