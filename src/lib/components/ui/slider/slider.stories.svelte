<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Slider from './slider.svelte';

	const { Story } = defineMeta({
		title: 'UI/Slider',
		component: Slider,
		tags: ['autodocs'],
		argTypes: {
			value: { control: { type: 'number', min: 0, max: 100, step: 1 } },
			min: { control: 'number' },
			max: { control: 'number' },
			step: { control: 'number' },
			disabled: { control: 'boolean' }
		}
	});
</script>

<Story name="Default" args={{ value: 50, min: 0, max: 100, step: 1 }}>
	{#snippet template(args)}
		<div class="w-80">
			<Slider {...args} />
		</div>
	{/snippet}
</Story>

<Story name="WithRange" args={{ value: 30, min: 0, max: 51, step: 1 }}>
	{#snippet template(args)}
		<div class="w-80">
			<p class="mb-2 text-sm">CRF: {args.value}</p>
			<Slider {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Disabled" args={{ value: 50, min: 0, max: 100, disabled: true }}>
	{#snippet template(args)}
		<div class="w-80">
			<Slider {...args} />
		</div>
	{/snippet}
</Story>

<Story name="CustomStep" args={{ value: 0, min: 0, max: 100, step: 10 }}>
	{#snippet template(args)}
		<div class="w-80">
			<p class="mb-2 text-sm">Step: 10 | Value: {args.value}</p>
			<Slider {...args} />
		</div>
	{/snippet}
</Story>
