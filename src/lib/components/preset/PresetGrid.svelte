<!--
  PresetGrid.svelte — プリセット一覧のグリッド表示

  全プリセットをカードのグリッドで表示し、選択状態を管理する。
-->
<script lang="ts">
	import { commandStore } from '#lib/stores/command.svelte.js';
	import { getAllPresets } from '#lib/ffmpeg/presets.js';
	import type { PresetId } from '#lib/ffmpeg/types.js';
	import { compactStore } from '#lib/stores/compact.svelte.js';
	import PresetCard from './PresetCard.svelte';

	const presets = getAllPresets();

	function handleSelect(id: string) {
		commandStore.applyPreset(id as PresetId);
	}
</script>

<div class="grid grid-cols-2 {compactStore.isCompact ? 'auto-rows-fr gap-2' : 'gap-3'} lg:grid-cols-3 xl:grid-cols-4">
	{#each presets as preset, i (preset.id)}
		<PresetCard
			{preset}
			selected={commandStore.selectedPreset === preset.id}
			onselect={handleSelect}
			index={i}
		/>
	{/each}
</div>
