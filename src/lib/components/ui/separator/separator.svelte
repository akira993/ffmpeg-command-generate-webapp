<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	type SeparatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: "horizontal" | "vertical";
		decorative?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		orientation = "horizontal",
		decorative = true,
		"data-slot": dataSlot = "separator",
		...restProps
	}: SeparatorProps = $props();
</script>

<div
	bind:this={ref}
	role={decorative ? "none" : "separator"}
	aria-orientation={!decorative ? orientation : undefined}
	data-slot={dataSlot}
	data-orientation={orientation}
	class={cn(
		"bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-full data-[orientation=vertical]:w-px",
		className
	)}
	{...restProps}
></div>
