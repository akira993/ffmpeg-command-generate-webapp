<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	let dark = $state(false);

	onMount(() => {
		// Read initial state from <html> class (set by inline script in app.html)
		dark = document.documentElement.classList.contains('dark');
	});

	function toggle() {
		dark = !dark;
		localStorage.setItem('theme', dark ? 'dark' : 'light');
		if (dark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
</script>

<Button variant="ghost" size="icon" onclick={toggle} aria-label="Toggle theme">
	{#if dark}
		<SunIcon size={20} />
	{:else}
		<MoonIcon size={20} />
	{/if}
</Button>
