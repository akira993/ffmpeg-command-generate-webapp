<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Card from './index.js';

	const { Story } = defineMeta({
		title: 'UI/Card',
		component: Card.Root,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Card.Root class="w-80">
			<Card.Header>
				<Card.Title>Card Title</Card.Title>
				<Card.Description>Card description text goes here.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-sm">Card content area. This is where the main content lives.</p>
			</Card.Content>
			<Card.Footer>
				<p class="text-xs text-muted-foreground">Footer text</p>
			</Card.Footer>
		</Card.Root>
	{/snippet}
</Story>

<Story name="Simple">
	{#snippet template()}
		<Card.Root class="w-80">
			<Card.Header>
				<Card.Title>Simple Card</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-sm">A card with just a title and content.</p>
			</Card.Content>
		</Card.Root>
	{/snippet}
</Story>

<Story name="WithAction">
	{#snippet template()}
		<Card.Root class="w-80">
			<Card.Header>
				<Card.Title>Card with Action</Card.Title>
				<Card.Description>This card has an action button.</Card.Description>
				<Card.Action>
					<button class="text-xs text-primary hover:underline">Edit</button>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<p class="text-sm">Content with action in header.</p>
			</Card.Content>
		</Card.Root>
	{/snippet}
</Story>

<Story name="PresetStyle">
	{#snippet template()}
		<Card.Root class="w-64 h-full hover:border-primary/50 cursor-pointer transition-all hover:scale-[1.02]">
			<Card.Header class="pb-2">
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
						style="background-color: var(--color-icon-violet-bg); color: var(--color-icon-violet);"
					>
						<span class="text-lg">🎬</span>
					</div>
					<Card.Title class="text-sm">Video Convert</Card.Title>
				</div>
			</Card.Header>
			<Card.Content>
				<p class="text-xs text-muted-foreground">Convert video to different format</p>
			</Card.Content>
		</Card.Root>
	{/snippet}
</Story>
