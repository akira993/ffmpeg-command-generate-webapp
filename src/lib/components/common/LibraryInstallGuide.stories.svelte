<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LibraryInstallGuide from './LibraryInstallGuide.svelte';

	const { Story } = defineMeta({
		title: 'Domain/LibraryInstallGuide',
		component: LibraryInstallGuide,
		tags: ['autodocs'],
		parameters: {
			docs: {
				story: {
					inline: false,
					iframeHeight: '720px'
				}
			}
		},
		args: { open: false, showTrigger: true }
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<LibraryInstallGuide {...args} />
	{/snippet}
</Story>

<Story name="Open" args={{ open: true, showTrigger: false }}>
	{#snippet template(args)}
		<LibraryInstallGuide {...args} />
	{/snippet}
</Story>
