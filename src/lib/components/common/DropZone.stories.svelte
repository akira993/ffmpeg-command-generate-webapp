<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DropZone from './DropZone.svelte';
	import { commandStore } from '$lib/stores/command.svelte';

	const { Story } = defineMeta({
		title: 'Domain/DropZone',
		component: DropZone,
		tags: ['autodocs']
	});
</script>

<Story name="Empty">
	{#snippet template()}
		{@const _ = commandStore.clearDroppedFiles()}
		<div class="w-full max-w-lg">
			<DropZone />
		</div>
	{/snippet}
</Story>

<Story name="WithFiles">
	{#snippet template()}
		{@const _ = commandStore.setDroppedFiles([
			{ name: 'video1.mp4', size: 1024000, type: 'video/mp4' },
			{ name: 'video2.mp4', size: 2048000, type: 'video/mp4' },
			{ name: 'video3.mp4', size: 512000, type: 'video/mp4' }
		])}
		<div class="w-full max-w-lg">
			<DropZone />
		</div>
	{/snippet}
</Story>
