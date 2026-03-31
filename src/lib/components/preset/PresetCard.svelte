<!--
  PresetCard.svelte — プリセットカードコンポーネント

  各プリセットをカード形式で表示。クリックで選択。
  Lucideアイコン + oklch CSSカスタムプロパティでカラフルに。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PresetDefinition } from '$lib/ffmpeg/types';
	import * as Card from '$lib/components/ui/card';
	import { compactStore } from '$lib/stores/compact.svelte';
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
		index?: number;
	}

	let { preset, selected, onselect, index = 0 }: Props = $props();

	/** CSS custom properties for staggered entrance animation */
	const entranceStyle = $derived(
		compactStore.isCompact
			? `--stagger:${index}; --entrance-duration:300ms; --entrance-stagger:50ms; --entrance-y:0.9375rem`
			: `--stagger:${index}`
	);

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
{#if compactStore.isCompact}
	<div
		class="animate-card-entrance cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.97]"
		style={entranceStyle}
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
		<div
			class="flex h-full items-center gap-1.5 rounded-xl border px-3 py-2 shadow-sm bg-card text-card-foreground transition-shadow duration-200 {selected
				? 'border-primary bg-primary/5 ring-2 ring-primary shadow-lg shadow-primary/20'
				: 'hover:border-primary/50'}"
		>
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
			<span class="text-sm font-semibold leading-tight">{$t(preset.nameKey)}</span>
		</div>
	</div>
{:else}
	<div
		class="animate-card-entrance row-span-2 grid grid-rows-subgrid cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.97]"
		style={entranceStyle}
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
			class="row-span-2 grid grid-rows-subgrid gap-0 transition-shadow duration-200 {selected
				? 'border-primary bg-primary/5 ring-2 ring-primary shadow-lg shadow-primary/20'
				: 'hover:border-primary/50'}"
		>
			<Card.Header class="flex gap-2.5 pb-2">
				<div
					class="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-lg"
					style="background-color: var(--color-icon-{preset.iconColor}-bg); color: var(--color-icon-{preset.iconColor});"
				>
					{#if IconComponent}
						<IconComponent size={18} strokeWidth={2} />
					{:else}
						<span class="text-lg">{preset.icon}</span>
					{/if}
				</div>
				<Card.Title class="self-center text-sm">{$t(preset.nameKey)}</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-xs text-muted-foreground">
					{$t(preset.descriptionKey)}
				</p>
			</Card.Content>
		</Card.Root>
	</div>
{/if}
