<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ThemeToggle from './ThemeToggle.svelte';

	const { Story } = defineMeta({
		title: 'Domain/ThemeToggle',
		component: ThemeToggle,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<ThemeToggle />
	{/snippet}
</Story>

<Story name="InHeader">
	{#snippet template()}
		<div class="flex items-center gap-2 rounded-lg border bg-background p-3">
			<span class="text-sm font-medium">Theme:</span>
			<ThemeToggle />
		</div>
	{/snippet}
</Story>
