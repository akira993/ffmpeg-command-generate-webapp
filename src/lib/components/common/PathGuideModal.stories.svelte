<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import PathGuideModal from './PathGuideModal.svelte';

	const { Story } = defineMeta({
		title: 'Domain/PathGuideModal',
		component: PathGuideModal,
		tags: ['autodocs'],
		parameters: {
			docs: {
				story: {
					inline: false,
					iframeHeight: '720px'
				}
			}
		},
		args: { open: false, showTrigger: true, onOpenInstallGuide: fn() }
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<PathGuideModal {...args} />
	{/snippet}
</Story>

<Story name="Open" args={{ open: true, showTrigger: false }}>
	{#snippet template(args)}
		<PathGuideModal {...args} />
	{/snippet}
</Story>

<Story name="OpenWithTrigger" args={{ open: true }}>
	{#snippet template(args)}
		<PathGuideModal {...args} />
	{/snippet}
</Story>
