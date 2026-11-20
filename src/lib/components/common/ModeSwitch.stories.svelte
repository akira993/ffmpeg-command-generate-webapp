<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { commandStore } from '#lib/stores/command.svelte.js';
	import StorySetup from '../../../../.storybook/StorySetup.svelte';
	import ModeSwitch from './ModeSwitch.svelte';

	const { Story } = defineMeta({
		title: 'Domain/ModeSwitch',
		component: ModeSwitch,
		tags: ['autodocs'],
		parameters: {
			docs: {
				story: {
					inline: false,
					iframeHeight: '112px'
				}
			}
		}
	});
</script>

<Story name="Preset">
	{#snippet template()}
		<StorySetup setup={() => { commandStore.mode = 'preset'; }}>
			{#snippet children()}
				<ModeSwitch />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="Advanced">
	{#snippet template()}
		<StorySetup setup={() => { commandStore.mode = 'advanced'; }}>
			{#snippet children()}
				<ModeSwitch />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>
