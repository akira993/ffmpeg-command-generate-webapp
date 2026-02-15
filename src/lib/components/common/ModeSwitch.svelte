<!--
  ModeSwitch.svelte — プリセット / アドバンスドモード切替

  ToggleGroupを使用して2つのモードを切り替える。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';

	function handleValueChange(value: string | undefined) {
		if (value === 'preset' || value === 'advanced') {
			commandStore.mode = value;
		}
	}
</script>

<ToggleGroup.Root
	type="single"
	value={commandStore.mode}
	onValueChange={handleValueChange}
	class="inline-flex"
>
	<ToggleGroup.Item value="preset" class="px-4">
		{$t('mode.preset')}
	</ToggleGroup.Item>
	<ToggleGroup.Item value="advanced" class="px-4">
		{$t('mode.advanced')}
	</ToggleGroup.Item>
</ToggleGroup.Root>
