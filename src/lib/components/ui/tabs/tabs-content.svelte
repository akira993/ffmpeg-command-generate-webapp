<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { getContext } from "svelte";
	import { TABS_CTX, type TabsContext } from "./tabs.svelte";

	type TabsContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value: string;
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		value,
		class: className,
		children,
		...restProps
	}: TabsContentProps = $props();

	const ctx = getContext<TabsContext>(TABS_CTX);

	const isActive = $derived(ctx.value === value);
</script>

{#if isActive}
	<div
		bind:this={ref}
		role="tabpanel"
		data-slot="tabs-content"
		data-state={isActive ? "active" : "inactive"}
		tabindex={0}
		class={cn("flex-1 outline-none", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
