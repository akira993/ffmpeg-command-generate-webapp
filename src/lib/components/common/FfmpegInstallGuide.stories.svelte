<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FfmpegInstallGuide from './FfmpegInstallGuide.svelte';

	const { Story } = defineMeta({
		title: 'Domain/FfmpegInstallGuide',
		component: FfmpegInstallGuide,
		tags: ['autodocs'],
		parameters: {
			docs: {
				story: {
					inline: false,
					iframeHeight: '640px'
				}
			}
		},
		args: { open: false, showTrigger: true }
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<FfmpegInstallGuide {...args} />
	{/snippet}
</Story>

<Story name="Open" args={{ open: true, showTrigger: false }}>
	{#snippet template(args)}
		<FfmpegInstallGuide {...args} />
	{/snippet}
</Story>
