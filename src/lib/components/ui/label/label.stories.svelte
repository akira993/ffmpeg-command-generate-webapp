<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Label from './label.svelte';

	const { Story } = defineMeta({
		title: 'UI/Label',
		component: Label,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Label>Label text</Label>
	{/snippet}
</Story>

<Story name="WithInput">
	{#snippet template()}
		<div class="flex flex-col gap-2">
			<Label for="demo-input">Email address</Label>
			<input
				id="demo-input"
				type="email"
				placeholder="email@example.com"
				class="border-input bg-background flex h-9 w-60 rounded-md border px-3 py-1 text-sm"
			/>
		</div>
	{/snippet}
</Story>
