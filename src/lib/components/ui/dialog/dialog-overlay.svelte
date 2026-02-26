<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { getContext } from "svelte";
	import { DIALOG_CTX, type DialogContext } from "./dialog.svelte";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const ctx = getContext<DialogContext>(DIALOG_CTX);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={ref}
	data-slot="dialog-overlay"
	data-state={ctx.open ? "open" : "closed"}
	class={cn(
		"animate-in fade-in-0 fixed inset-0 z-50 bg-black/50",
		className
	)}
	onclick={() => ctx.setOpen(false)}
	{...restProps}
></div>
