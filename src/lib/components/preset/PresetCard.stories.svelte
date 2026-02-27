<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PresetCard from './PresetCard.svelte';
	import { PRESETS } from '$lib/ffmpeg/presets';

	const { Story } = defineMeta({
		title: 'Domain/PresetCard',
		component: PresetCard,
		tags: ['autodocs']
	});

	const presetList = Object.values(PRESETS);
</script>

<Story name="Default">
	{#snippet template()}
		<div class="w-64">
			<PresetCard
				preset={presetList[0]}
				selected={false}
				onselect={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Selected">
	{#snippet template()}
		<div class="w-64">
			<PresetCard
				preset={presetList[0]}
				selected={true}
				onselect={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="AllPresets">
	{#snippet template()}
		<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
			{#each presetList as preset}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="SelectedInGrid">
	{#snippet template()}
		<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={i === 0}
					onselect={() => {}}
				/>
			{/each}
		</div>
	{/snippet}
</Story>
