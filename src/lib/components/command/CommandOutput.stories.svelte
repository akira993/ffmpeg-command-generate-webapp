<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CommandOutput from './CommandOutput.svelte';
	import { commandStore } from '$lib/stores/command.svelte';

	const { Story } = defineMeta({
		title: 'Domain/CommandOutput',
		component: CommandOutput,
		tags: ['autodocs']
	});
</script>

<Story name="WithCommand">
	{#snippet template()}
		{@const _ = (() => {
			commandStore.mode = 'preset';
			commandStore.applyPreset('video-convert');
		})()}
		<div class="w-full max-w-2xl">
			<CommandOutput />
		</div>
	{/snippet}
</Story>

<Story name="Empty">
	{#snippet template()}
		{@const _ = (() => {
			commandStore.mode = 'preset';
			commandStore.selectedPreset = null;
		})()}
		<div class="w-full max-w-2xl">
			<CommandOutput />
		</div>
	{/snippet}
</Story>
