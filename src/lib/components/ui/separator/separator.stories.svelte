<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Separator from './separator.svelte';

	const { Story } = defineMeta({
		title: 'UI/Separator',
		component: Separator,
		tags: ['autodocs'],
		argTypes: {
			orientation: {
				control: 'select',
				options: ['horizontal', 'vertical']
			}
		}
	});
</script>

<Story name="Horizontal" args={{ orientation: 'horizontal' }}>
	{#snippet template(args)}
		<div class="w-80">
			<p class="text-sm">Section A</p>
			<Separator {...args} class="my-3" />
			<p class="text-sm">Section B</p>
		</div>
	{/snippet}
</Story>

<Story name="Vertical" args={{ orientation: 'vertical' }}>
	{#snippet template(args)}
		<div class="flex h-8 items-center gap-3">
			<span class="text-sm">Left</span>
			<Separator {...args} />
			<span class="text-sm">Right</span>
		</div>
	{/snippet}
</Story>
