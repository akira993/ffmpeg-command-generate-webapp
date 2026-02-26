<script lang="ts" module>
	export const SELECT_CTX = Symbol("select-context");

	export type SelectContext = {
		readonly open: boolean;
		readonly value: string;
		setOpen: (v: boolean) => void;
		setValue: (v: string) => void;
		triggerEl: HTMLElement | null;
	};
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { setContext } from "svelte";

	type SelectProps = {
		open?: boolean;
		value?: string;
		type?: string;
		onValueChange?: (value: string) => void;
		onOpenChange?: (open: boolean) => void;
		children?: Snippet;
	};

	let {
		open = $bindable(false),
		value = $bindable(""),
		type: _type,
		onValueChange,
		onOpenChange,
		children,
	}: SelectProps = $props();

	let triggerEl = $state<HTMLElement | null>(null);

	setContext<SelectContext>(SELECT_CTX, {
		get open() {
			return open;
		},
		get value() {
			return value;
		},
		setOpen(v: boolean) {
			open = v;
			onOpenChange?.(v);
		},
		setValue(v: string) {
			value = v;
			onValueChange?.(v);
			open = false;
			onOpenChange?.(false);
		},
		get triggerEl() {
			return triggerEl;
		},
		set triggerEl(el: HTMLElement | null) {
			triggerEl = el;
		},
	});
</script>

{@render children?.()}
