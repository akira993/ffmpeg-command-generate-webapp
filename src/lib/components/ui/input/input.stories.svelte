<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Input from './input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Input',
		component: Input,
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: 'select',
				options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url']
			},
			placeholder: { control: 'text' },
			disabled: { control: 'boolean' }
		}
	});
</script>

<Story name="Default" args={{ type: 'text', placeholder: 'Enter text...' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Email" args={{ type: 'email', placeholder: 'email@example.com' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Password" args={{ type: 'password', placeholder: 'Password' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Number" args={{ type: 'number', placeholder: '0' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Disabled" args={{ type: 'text', placeholder: 'Disabled', disabled: true }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="WithValue" args={{ type: 'text', value: 'Hello World' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>
