<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DropZone from './DropZone.svelte';
	import { commandStore } from '$lib/stores/command.svelte';
	import StorySetup from '../../../../.storybook/StorySetup.svelte';

	const { Story } = defineMeta({
		title: 'Domain/DropZone',
		component: DropZone,
		tags: ['autodocs'],
		parameters: {
			// `commandStore` シングルトンの state leak 対策。各ストーリーを iframe 分離
			docs: {
				story: {
					inline: false,
					iframeHeight: '280px'
				}
			}
		}
	});
</script>

<Story name="Empty">
	{#snippet template()}
		<StorySetup setup={() => commandStore.clearDroppedFiles()}>
			{#snippet children()}
				<div class="w-full max-w-lg">
					<DropZone />
				</div>
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="WithFiles">
	{#snippet template()}
		<StorySetup setup={() => commandStore.setDroppedFiles([
			{ name: 'video1.mp4', size: 1024000, type: 'video/mp4' },
			{ name: 'video2.mp4', size: 2048000, type: 'video/mp4' },
			{ name: 'video3.mp4', size: 512000, type: 'video/mp4' }
		])}>
			{#snippet children()}
				<div class="w-full max-w-lg">
					<DropZone />
				</div>
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>
