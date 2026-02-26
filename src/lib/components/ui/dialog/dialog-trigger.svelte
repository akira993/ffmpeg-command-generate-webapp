<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { getContext } from "svelte";
	import { DIALOG_CTX, type DialogContext } from "./dialog.svelte";
	import { cn, type WithElementRef } from "$lib/utils.js";

	type DialogTriggerProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		children?: Snippet;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	};

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		...restProps
	}: DialogTriggerProps = $props();

	const ctx = getContext<DialogContext>(DIALOG_CTX);

	const triggerProps = {
		onclick: () => ctx.setOpen(true),
	};
</script>

{#if child}
	{@render child({ props: triggerProps })}
{:else}
	<button
		bind:this={ref}
		type="button"
		data-slot="dialog-trigger"
		class={cn(className)}
		onclick={triggerProps.onclick}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
