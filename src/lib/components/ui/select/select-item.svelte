<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { getContext } from "svelte";
	import { SELECT_CTX, type SelectContext } from "./select.svelte";

	type SelectItemProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value: string;
		label?: string;
		disabled?: boolean;
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		disabled = false,
		children,
		...restProps
	}: SelectItemProps = $props();

	const ctx = getContext<SelectContext>(SELECT_CTX);

	const isSelected = $derived(ctx.value === value);
	let isHighlighted = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={ref}
	role="option"
	aria-selected={isSelected}
	aria-disabled={disabled || undefined}
	data-slot="select-item"
	data-highlighted={isHighlighted || undefined}
	data-disabled={disabled || undefined}
	data-value={value}
	class={cn(
		"data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	onclick={() => {
		if (!disabled) ctx.setValue(value);
	}}
	onmouseenter={() => {
		isHighlighted = true;
	}}
	onmouseleave={() => {
		isHighlighted = false;
	}}
	onkeydown={(e) => {
		if (!disabled && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			ctx.setValue(value);
		}
	}}
	{...restProps}
>
	<span class="absolute end-2 flex size-3.5 items-center justify-center">
		{#if isSelected}
			<CheckIcon class="size-4" />
		{/if}
	</span>
	{#if children}
		{@render children()}
	{:else}
		{label || value}
	{/if}
</div>
