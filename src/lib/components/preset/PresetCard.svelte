<!--
  PresetCard.svelte — プリセットカードコンポーネント

  各プリセットをカード形式で表示。クリックで選択。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PresetDefinition } from '$lib/ffmpeg/types';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		preset: PresetDefinition;
		selected: boolean;
		onselect: (id: string) => void;
	}

	let { preset, selected, onselect }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="cursor-pointer transition-all hover:scale-[1.02]"
	onclick={() => onselect(preset.id)}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onselect(preset.id);
		}
	}}
>
	<Card.Root
		class="h-full {selected
			? 'border-primary bg-primary/5 ring-2 ring-primary'
			: 'hover:border-primary/50'}"
	>
		<Card.Header class="pb-2">
			<div class="flex items-center gap-2">
				<span class="text-2xl">{preset.icon}</span>
				<Card.Title class="text-sm">{$t(preset.nameKey)}</Card.Title>
			</div>
		</Card.Header>
		<Card.Content>
			<p class="text-xs text-muted-foreground">
				{$t(preset.descriptionKey)}
			</p>
		</Card.Content>
	</Card.Root>
</div>
