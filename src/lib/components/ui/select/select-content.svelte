<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { getContext, tick } from "svelte";
	import { SELECT_CTX, type SelectContext } from "./select.svelte";

	type SelectContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		sideOffset?: number;
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: SelectContentProps = $props();

	const ctx = getContext<SelectContext>(SELECT_CTX);

	let portalEl: HTMLDivElement | undefined = $state();
	let top = $state(0);
	let left = $state(0);
	let width = $state(0);
	let dropUp = $state(false);

	function updatePosition() {
		const trigger = ctx.triggerEl;
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;
		dropUp = spaceBelow < 200 && spaceAbove > spaceBelow;
		width = rect.width;
		left = rect.left;
		if (dropUp) {
			top = rect.top - sideOffset;
		} else {
			top = rect.bottom + sideOffset;
		}
	}

	$effect(() => {
		if (ctx.open) {
			tick().then(updatePosition);
		}
	});

	$effect(() => {
		if (!ctx.open) return;

		function handleClickOutside(e: MouseEvent) {
			const target = e.target as Node;
			if (portalEl && !portalEl.contains(target) && !ctx.triggerEl?.contains(target)) {
				ctx.setOpen(false);
			}
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				ctx.setOpen(false);
				ctx.triggerEl?.focus();
			}
		}

		function handleScroll() {
			updatePosition();
		}

		window.addEventListener("mousedown", handleClickOutside, true);
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("scroll", handleScroll, true);
		window.addEventListener("resize", updatePosition);

		return () => {
			window.removeEventListener("mousedown", handleClickOutside, true);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("scroll", handleScroll, true);
			window.removeEventListener("resize", updatePosition);
		};
	});
</script>

{#if ctx.open}
	<div
		bind:this={portalEl}
		style="position: fixed; z-index: 50; top: {dropUp ? 'auto' : top + 'px'}; bottom: {dropUp
			? window.innerHeight - top + 'px'
			: 'auto'}; left: {left}px; min-width: {width}px;"
	>
		<div
			bind:this={ref}
			role="listbox"
			data-slot="select-content"
			data-state="open"
			data-side={dropUp ? "top" : "bottom"}
			class={cn(
				"bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 relative max-h-[18.75rem] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
				dropUp ? "slide-in-from-bottom-2" : "slide-in-from-top-2",
				className
			)}
			{...restProps}
		>
			{@render children?.()}
		</div>
	</div>
{/if}
