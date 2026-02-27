<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Dialog from './index.js';
	import Button from '../button/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Dialog',
		component: Dialog.Root,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Dialog.Root>
			<Dialog.Trigger>
				<Button variant="outline">Open Dialog</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Dialog Title</Dialog.Title>
					<Dialog.Description>
						This is a dialog description. It provides additional context.
					</Dialog.Description>
				</Dialog.Header>
				<p class="text-sm">Dialog body content goes here.</p>
				<Dialog.Footer>
					<Dialog.Close>
						<Button variant="outline">Cancel</Button>
					</Dialog.Close>
					<Button>Confirm</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="WithForm">
	{#snippet template()}
		<Dialog.Root>
			<Dialog.Trigger>
				<Button>Edit Settings</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Settings</Dialog.Title>
					<Dialog.Description>
						Update your preferences below.
					</Dialog.Description>
				</Dialog.Header>
				<div class="flex flex-col gap-3 py-2">
					<div class="flex flex-col gap-1.5">
						<label for="dialog-name" class="text-sm font-medium">Name</label>
						<input
							id="dialog-name"
							type="text"
							placeholder="Enter name"
							class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="dialog-email" class="text-sm font-medium">Email</label>
						<input
							id="dialog-email"
							type="email"
							placeholder="email@example.com"
							class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Dialog.Close>
						<Button variant="outline">Cancel</Button>
					</Dialog.Close>
					<Button>Save</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="NoCloseButton">
	{#snippet template()}
		<Dialog.Root>
			<Dialog.Trigger>
				<Button variant="destructive">Delete</Button>
			</Dialog.Trigger>
			<Dialog.Content showCloseButton={false}>
				<Dialog.Header>
					<Dialog.Title>Are you sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<Dialog.Close>
						<Button variant="outline">Cancel</Button>
					</Dialog.Close>
					<Button variant="destructive">Delete</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>
