<script lang="ts" module>
	export const TABS_CTX = Symbol("tabs-context");

	export type TabsContext = {
		readonly value: string;
		setValue: (v: string) => void;
	};
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { setContext } from "svelte";

	type TabsProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: string;
		onValueChange?: (value: string) => void;
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		onValueChange,
		children,
		...restProps
	}: TabsProps = $props();

	setContext<TabsContext>(TABS_CTX, {
		get value() {
			return value;
		},
		setValue(v: string) {
			value = v;
			onValueChange?.(v);
		},
	});
</script>

<div
	bind:this={ref}
	data-slot="tabs"
	class={cn("flex flex-col gap-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
