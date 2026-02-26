<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { getContext } from "svelte";
	import { DIALOG_CTX, type DialogContext } from "./dialog.svelte";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & { children?: Snippet } = $props();

	const ctx = getContext<DialogContext>(DIALOG_CTX);
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="dialog-close"
	class={cn(className)}
	onclick={() => ctx.setOpen(false)}
	{...restProps}
>
	{@render children?.()}
</button>
