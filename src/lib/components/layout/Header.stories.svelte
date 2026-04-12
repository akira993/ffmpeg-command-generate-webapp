<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from './Header.svelte';
	import { compactStore } from '$lib/stores/compact.svelte';
	import StorySetup from '../../../../.storybook/StorySetup.svelte';

	const { Story } = defineMeta({
		title: 'Layout/Header',
		component: Header,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen',
			// `compactStore` シングルトンの state leak 対策。docs view で各ストーリーを
			// iframe 分離して isPWA / isCompact の干渉を防ぐ
			docs: {
				story: {
					inline: false,
					iframeHeight: '140px'
				}
			}
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<p class="px-4 py-2 text-xs text-muted-foreground">
			非 PWA 環境 (<code>isPWA=false</code>): コンパクトモード切替ボタンは表示されない。
			title は <code>text-xl</code>、subtitle は表示される。
		</p>
		<Header />
	{/snippet}
</Story>

<Story name="PWANormal">
	{#snippet template()}
		<StorySetup setup={() => {
			compactStore.isPWA = true;
			compactStore.isCompact = false;
		}}>
			{#snippet children()}
				<p class="px-4 py-2 text-xs text-muted-foreground">
					PWA スタンドアロン環境 (<code>isPWA=true</code>) で通常表示。
					Smartphone アイコンのトグルボタンが右端に表示される。
				</p>
				<Header />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="Compact">
	{#snippet template()}
		<StorySetup setup={() => {
			compactStore.isPWA = true;
			compactStore.isCompact = true;
		}}>
			{#snippet children()}
				<p class="px-4 py-2 text-xs text-muted-foreground">
					PWA + コンパクトモード有効。title が <code>text-xl → text-sm</code> に縮小、
					subtitle が非表示、トグルボタンは Monitor アイコン + <code>bg-primary/10</code> の
					アクティブスタイル。
				</p>
				<Header />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>
