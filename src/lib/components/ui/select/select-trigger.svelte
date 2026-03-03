<script lang="ts">
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { getContext, onMount } from "svelte";
	import { SELECT_CTX, type SelectContext } from "./select.svelte";

	type SelectTriggerProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		size?: "sm" | "default";
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		disabled,
		...restProps
	}: SelectTriggerProps = $props();

	const ctx = getContext<SelectContext>(SELECT_CTX);

	onMount(() => {
		if (ref) ctx.triggerEl = ref;
	});

	function handleClick() {
		if (!disabled) ctx.setOpen(!ctx.open);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			ctx.setOpen(true);
		}
	}
</script>

<button
	bind:this={ref}
	type="button"
	role="combobox"
	aria-expanded={ctx.open}
	aria-haspopup="listbox"
	data-slot="select-trigger"
	data-size={size}
	data-state={ctx.open ? "open" : "closed"}
	{disabled}
	class={cn(
		"border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus-visible:ring-[0.1875rem] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{@render children?.()}
	<ChevronDownIcon class="size-4 opacity-50" />
</button>
