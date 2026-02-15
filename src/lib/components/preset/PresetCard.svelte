<!--
  PresetCard.svelte — プリセットカードコンポーネント

  各プリセットをカード形式で表示。クリックで選択。
  Lucideアイコン + oklch CSSカスタムプロパティでカラフルに。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PresetDefinition } from '$lib/ffmpeg/types';
	import * as Card from '$lib/components/ui/card';
	import ImageIcon from '@lucide/svelte/icons/image';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import ArchiveIcon from '@lucide/svelte/icons/archive';
	import ClapperboardIcon from '@lucide/svelte/icons/clapperboard';
	import MusicIcon from '@lucide/svelte/icons/music';
	import RepeatIcon from '@lucide/svelte/icons/repeat';
	import ScissorsIcon from '@lucide/svelte/icons/scissors';
	import FilmIcon from '@lucide/svelte/icons/film';

	interface Props {
		preset: PresetDefinition;
		selected: boolean;
		onselect: (id: string) => void;
	}

	let { preset, selected, onselect }: Props = $props();

	const ICON_MAP: Record<string, typeof ImageIcon> = {
		image: ImageIcon,
		globe: GlobeIcon,
		archive: ArchiveIcon,
		clapperboard: ClapperboardIcon,
		music: MusicIcon,
		repeat: RepeatIcon,
		scissors: ScissorsIcon,
		film: FilmIcon
	};

	const IconComponent = $derived(ICON_MAP[preset.icon]);
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
			<div class="flex items-center gap-2.5">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
					style="background-color: var(--color-icon-{preset.iconColor}-bg); color: var(--color-icon-{preset.iconColor});"
				>
					{#if IconComponent}
						<IconComponent size={18} strokeWidth={2} />
					{:else}
						<span class="text-lg">{preset.icon}</span>
					{/if}
				</div>
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
