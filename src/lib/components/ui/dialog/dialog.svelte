<script lang="ts" module>
	export const DIALOG_CTX = Symbol("dialog-context");

	export type DialogContext = {
		readonly open: boolean;
		setOpen: (v: boolean) => void;
	};
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { setContext } from "svelte";

	type DialogProps = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children?: Snippet;
	};

	let {
		open = $bindable(false),
		onOpenChange,
		children,
	}: DialogProps = $props();

	setContext<DialogContext>(DIALOG_CTX, {
		get open() {
			return open;
		},
		setOpen(v: boolean) {
			open = v;
			onOpenChange?.(v);
		},
	});
</script>

{@render children?.()}
