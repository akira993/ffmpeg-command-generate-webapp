<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> & { children?: Snippet } = $props();
</script>

<h2
	bind:this={ref}
	data-slot="dialog-title"
	class={cn("text-lg leading-none font-semibold", className)}
	{...restProps}
>
	{@render children?.()}
</h2>
