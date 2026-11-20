<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ActionButtons from './ActionButtons.svelte';

	const { Story } = defineMeta({
		title: 'Domain/ActionButtons',
		component: ActionButtons,
		tags: ['autodocs'],
		args: {
			onInstallGuide: fn(),
			onPathGuide: fn(),
			onLibraryGuide: fn()
		}
	});
</script>

<Story name="Default" args={{ variant: 'default' }}>
	{#snippet template(args)}
		<ActionButtons
			variant={args.variant}
			onInstallGuide={args.onInstallGuide}
			onPathGuide={args.onPathGuide}
			onLibraryGuide={args.onLibraryGuide}
		/>
	{/snippet}
</Story>

<Story name="Mobile" args={{ variant: 'mobile' }}>
	{#snippet template(args)}
		<div class="mx-auto max-w-sm">
			<ActionButtons
				variant={args.variant}
				onInstallGuide={args.onInstallGuide}
				onPathGuide={args.onPathGuide}
				onLibraryGuide={args.onLibraryGuide}
			/>
		</div>
	{/snippet}
</Story>
