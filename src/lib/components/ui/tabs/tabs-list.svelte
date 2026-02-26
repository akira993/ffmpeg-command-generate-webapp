<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type TabsListProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: TabsListProps = $props();
</script>

<div
	bind:this={ref}
	role="tablist"
	data-slot="tabs-list"
	class={cn(
		"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
