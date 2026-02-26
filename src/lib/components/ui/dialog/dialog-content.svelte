<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { getContext } from "svelte";
	import { DIALOG_CTX, type DialogContext } from "./dialog.svelte";
	import * as Dialog from "./index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";

	type DialogContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
		showCloseButton?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		children,
		showCloseButton = true,
		...restProps
	}: DialogContentProps = $props();

	const ctx = getContext<DialogContext>(DIALOG_CTX);

	$effect(() => {
		if (!ctx.open) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault();
				ctx.setOpen(false);
			}
		}

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = originalOverflow;
		};
	});
</script>

{#if ctx.open}
	<Dialog.Overlay />
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={ref}
		role="dialog"
		aria-modal="true"
		data-slot="dialog-content"
		data-state="open"
		class={cn(
			"bg-background animate-in fade-in-0 zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
			className
		)}
		onclick={(e) => e.stopPropagation()}
		onkeydown={() => {}}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<button
				type="button"
				class="ring-offset-background focus:ring-ring absolute end-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
				onclick={() => ctx.setOpen(false)}
			>
				<XIcon />
				<span class="sr-only">Close</span>
			</button>
		{/if}
	</div>
{/if}
