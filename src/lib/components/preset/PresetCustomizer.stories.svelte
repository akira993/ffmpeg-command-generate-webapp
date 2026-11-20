<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { untrack } from 'svelte';
	import type { PresetId } from '#lib/ffmpeg/types.js';
	import { commandStore } from '#lib/stores/command.svelte.js';
	import StorySetup from '../../../../.storybook/StorySetup.svelte';
	import PresetCustomizer from './PresetCustomizer.svelte';

	const { Story } = defineMeta({
		title: 'Domain/PresetCustomizer',
		component: PresetCustomizer,
		tags: ['autodocs'],
		parameters: {
			docs: {
				story: {
					inline: false,
					iframeHeight: '720px'
				}
			}
		}
	});

	function setupPreset(preset: PresetId) {
		untrack(() => {
			commandStore.clearDroppedFiles();
			commandStore.applyPreset(preset);
		});
	}
</script>

<Story name="Default">
	{#snippet template()}
		<StorySetup setup={() => setupPreset('video-convert')}>
			{#snippet children()}
				<PresetCustomizer />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="AudioExtract">
	{#snippet template()}
		<StorySetup setup={() => setupPreset('audio-extract')}>
			{#snippet children()}
				<PresetCustomizer />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="ImageConvert">
	{#snippet template()}
		<StorySetup setup={() => setupPreset('image-convert')}>
			{#snippet children()}
				<PresetCustomizer />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>
