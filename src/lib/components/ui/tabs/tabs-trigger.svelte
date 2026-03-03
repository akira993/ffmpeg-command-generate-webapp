<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { getContext } from "svelte";
	import { TABS_CTX, type TabsContext } from "./tabs.svelte";

	type TabsTriggerProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		value: string;
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		value,
		class: className,
		disabled,
		children,
		...restProps
	}: TabsTriggerProps = $props();

	const ctx = getContext<TabsContext>(TABS_CTX);

	const isActive = $derived(ctx.value === value);
</script>

<button
	bind:this={ref}
	role="tab"
	data-slot="tabs-trigger"
	data-state={isActive ? "active" : "inactive"}
	aria-selected={isActive}
	tabindex={isActive ? 0 : -1}
	{disabled}
	class={cn(
		"data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-0.0625rem)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[0.1875rem] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	onclick={() => {
		if (!disabled) ctx.setValue(value);
	}}
	{...restProps}
>
	{@render children?.()}
</button>
