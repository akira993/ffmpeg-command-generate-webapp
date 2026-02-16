<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { locale } from '$lib/i18n';

	let { children } = $props();

	// HTML lang属性をロケールに連動
	$effect(() => {
		document.documentElement.lang = $locale ?? 'ja';
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="container mx-auto flex-1 px-4 py-6">
		{@render children()}
	</main>
	<Footer />
</div>
