<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Footer from './Footer.svelte';
	import { untrack } from 'svelte';
	import { compactStore } from '$lib/stores/compact.svelte';

	const { Story } = defineMeta({
		title: 'Layout/Footer',
		component: Footer,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<p class="px-4 py-2 text-xs text-muted-foreground">
			通常モード: 縦パディング <code>py-4</code>。
		</p>
		<Footer />
	{/snippet}
</Story>

<Story name="Compact">
	{#snippet template()}
		{@const _ = untrack(() => {
			compactStore.isCompact = true;
		})}
		<p class="px-4 py-2 text-xs text-muted-foreground">
			コンパクトモード: 縦パディング <code>py-4 → py-1</code> に圧縮。
			モバイル (sm 未満) 時は <code>--mobile-bar-h</code> CSS 変数に応じて
			下パディングが動的に調整される。
		</p>
		<Footer />
	{/snippet}
</Story>
