<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { onMount } from "svelte";

	type SliderProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		orientation?: "horizontal" | "vertical";
		disabled?: boolean;
		type?: string; // backward compat, ignored
		onValueChange?: (value: number) => void;
	};

	let {
		ref = $bindable(null),
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		orientation = "horizontal",
		disabled = false,
		type: _type,
		class: className,
		onValueChange,
		...restProps
	}: SliderProps = $props();

	let trackRef: HTMLSpanElement | undefined = $state();
	let isDragging = $state(false);

	const percentage = $derived(
		max !== min ? ((value - min) / (max - min)) * 100 : 0
	);

	function clampAndStep(raw: number): number {
		const stepped = Math.round((raw - min) / step) * step + min;
		return Math.min(max, Math.max(min, stepped));
	}

	function updateFromPointer(clientX: number) {
		if (!trackRef || disabled) return;
		const rect = trackRef.getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
		const newValue = clampAndStep(min + ratio * (max - min));
		if (newValue !== value) {
			value = newValue;
			onValueChange?.(newValue);
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (disabled) return;
		e.preventDefault();
		isDragging = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		updateFromPointer(e.clientX);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		updateFromPointer(e.clientX);
	}

	function handlePointerUp() {
		isDragging = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		let newValue = value;
		switch (e.key) {
			case "ArrowRight":
			case "ArrowUp":
				newValue = clampAndStep(value + step);
				break;
			case "ArrowLeft":
			case "ArrowDown":
				newValue = clampAndStep(value - step);
				break;
			case "Home":
				newValue = min;
				break;
			case "End":
				newValue = max;
				break;
			default:
				return;
		}
		e.preventDefault();
		if (newValue !== value) {
			value = newValue;
			onValueChange?.(newValue);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={ref}
	data-slot="slider"
	data-orientation={orientation}
	data-disabled={disabled || undefined}
	class={cn(
		"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
		className
	)}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	{...restProps}
>
	<span
		bind:this={trackRef}
		data-orientation={orientation}
		data-slot="slider-track"
		class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full"
	>
		<span
			data-slot="slider-range"
			class="bg-primary absolute h-full"
			style="width: {percentage}%"
		></span>
	</span>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<span
		data-slot="slider-thumb"
		role="slider"
		tabindex={disabled ? -1 : 0}
		aria-valuenow={value}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-orientation={orientation}
		aria-disabled={disabled || undefined}
		class="border-primary ring-ring/50 absolute block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
		style="left: calc({percentage}% - 0.5rem)"
		onkeydown={handleKeyDown}
	></span>
</div>
