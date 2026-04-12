<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CommandOutput from './CommandOutput.svelte';
	import { untrack } from 'svelte';
	import { commandStore } from '$lib/stores/command.svelte';

	const { Story } = defineMeta({
		title: 'Domain/CommandOutput',
		component: CommandOutput,
		tags: ['autodocs'],
		parameters: {
			// `commandStore` シングルトンの state leak 対策。各ストーリーを iframe 分離
			docs: {
				story: {
					inline: false,
					iframeHeight: '220px'
				}
			}
		}
	});
</script>

<Story name="WithCommand">
	{#snippet template()}
		{@const _ = untrack(() => {
			commandStore.mode = 'preset';
			commandStore.applyPreset('video-convert');
		})}
		<div class="w-full max-w-2xl">
			<CommandOutput />
		</div>
	{/snippet}
</Story>

<Story name="Empty">
	{#snippet template()}
		{@const _ = untrack(() => {
			commandStore.mode = 'preset';
			commandStore.selectedPreset = null;
		})}
		<div class="w-full max-w-2xl">
			<CommandOutput />
		</div>
	{/snippet}
</Story>
