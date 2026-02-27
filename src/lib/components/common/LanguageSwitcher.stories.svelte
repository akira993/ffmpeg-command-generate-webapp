<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	const { Story } = defineMeta({
		title: 'Domain/LanguageSwitcher',
		component: LanguageSwitcher,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<LanguageSwitcher />
	{/snippet}
</Story>

<Story name="InHeader">
	{#snippet template()}
		<div class="flex items-center gap-2 rounded-lg border bg-background p-3">
			<span class="text-sm font-medium">Language:</span>
			<LanguageSwitcher />
		</div>
	{/snippet}
</Story>
