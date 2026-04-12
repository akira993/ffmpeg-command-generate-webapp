<!--
  StorySetup.svelte — Storybook helper for state initialization

  Wraps a story in a component that runs the `setup` callback in `$effect.pre`.

  WHY NOT `{@const _ = untrack(() => ...)}`?
  Svelte 5's production build tree-shakes `{@const}` declarations when the
  declared identifier is unused in the template. The side effect inside the
  untrack() callback never runs in production, so store mutations silently
  fail. See the production bundle of PresetCard.stories-*.js: the rawCode
  string contains the `untrack` call, but the compiled template function
  `t => { ... }` does NOT. The mutation is gone.

  Effects registered via `$effect.pre` are part of Svelte's runtime and
  never tree-shaken. Runs synchronously before DOM updates — no flicker.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		setup,
		children
	}: { setup: () => void; children: Snippet } = $props();

	$effect.pre(() => {
		setup();
	});
</script>

{@render children()}
