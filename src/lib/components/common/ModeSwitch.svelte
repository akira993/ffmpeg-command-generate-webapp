<!--
  ModeSwitch.svelte — プリセット / アドバンスドモード切替

  Shadcn SvelteのTabsListスタイルに統一しつつ、
  背景ピルがスライドするSegmentedControl風アニメーションを実装。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';

	const options = [
		{ value: 'preset',   labelKey: 'mode.preset'   },
		{ value: 'advanced', labelKey: 'mode.advanced' }
	] as const;

	function select(value: 'preset' | 'advanced') {
		commandStore.mode = value;
	}

	const activeIndex = $derived(options.findIndex((o) => o.value === commandStore.mode));
</script>

<!-- 外枠: inline-grid grid-cols-2 で均等幅を保証 -->
<div
	class="bg-muted text-muted-foreground relative inline-grid h-9 grid-cols-2 items-center rounded-lg p-[0.1875rem]"
	role="tablist"
	aria-label="mode switch"
>
	<!-- スライドする背景ピル: TabsTrigger の active 状態と同じ bg-background / rounded-md / shadow-sm -->
	<span
		class="dark:bg-input/30 dark:border-input absolute top-[0.1875rem] bottom-[0.1875rem] w-[calc(50%-0.1875rem)] rounded-md border border-transparent bg-background shadow-sm transition-[left] duration-200 ease-in-out"
		style="left: {activeIndex === 0 ? '0.1875rem' : 'calc(50%)'}"
		aria-hidden="true"
	></span>

	{#each options as option}
		<button
			role="tab"
			aria-selected={commandStore.mode === option.value}
			class="text-foreground dark:text-muted-foreground relative z-10 inline-flex h-[calc(100%-0.0625rem)] items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors duration-200
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
				disabled:pointer-events-none disabled:opacity-50
				{commandStore.mode === option.value
					? 'dark:text-foreground text-foreground'
					: 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'}"
			onclick={() => select(option.value)}
		>
			{$t(option.labelKey)}
		</button>
	{/each}
</div>
