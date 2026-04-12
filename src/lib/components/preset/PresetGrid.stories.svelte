<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PresetGrid from './PresetGrid.svelte';
	import { commandStore } from '$lib/stores/command.svelte';
	import { compactStore } from '$lib/stores/compact.svelte';
	import StorySetup from '../../../../.storybook/StorySetup.svelte';

	const { Story } = defineMeta({
		title: 'Domain/PresetGrid',
		component: PresetGrid,
		tags: ['autodocs'],
		parameters: {
			// `compactStore` / `commandStore` シングルトンの state leak 対策。
			// docs view で各ストーリーを iframe 分離
			docs: {
				story: {
					inline: false,
					iframeHeight: '420px'
				}
			}
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<StorySetup setup={() => {
			compactStore.isCompact = false;
			commandStore.selectedPreset = null;
		}}>
			{#snippet children()}
				<p class="mb-4 text-sm text-muted-foreground">
					通常モード: <code>grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4</code>。
					PresetCard は Card.Root + Subgrid レイアウト、説明文表示。
				</p>
				<PresetGrid />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="WithSelection">
	{#snippet template()}
		<StorySetup setup={() => {
			compactStore.isCompact = false;
			commandStore.applyPreset('video-convert');
		}}>
			{#snippet children()}
				<p class="mb-4 text-sm text-muted-foreground">
					通常モード + プリセット選択状態 (<code>video-convert</code>)。
					選択カードに <code>ring-2 ring-primary</code> のスタイルが付く。
				</p>
				<PresetGrid />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="Compact">
	{#snippet template()}
		<StorySetup setup={() => {
			compactStore.isCompact = true;
			commandStore.selectedPreset = null;
		}}>
			{#snippet children()}
				<p class="mb-4 text-sm text-muted-foreground">
					コンパクトモード: <code>auto-rows-fr gap-2</code>。カード自体も flex 独自レイアウトに切替。
					全カードが同一高さで整列。
				</p>
				<PresetGrid />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="CompactWithSelection">
	{#snippet template()}
		<StorySetup setup={() => {
			compactStore.isCompact = true;
			commandStore.applyPreset('audio-extract');
		}}>
			{#snippet children()}
				<p class="mb-4 text-sm text-muted-foreground">
					コンパクトモード + プリセット選択状態 (<code>audio-extract</code>)。
				</p>
				<PresetGrid />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>
