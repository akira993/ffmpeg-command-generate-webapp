<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import CookieConsent from '$lib/components/common/CookieConsent.svelte';
	import { locale } from '$lib/i18n';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { consentStore } from '$lib/stores/consent.svelte';

	let { children } = $props();

	// HTML lang属性をロケールに連動（SSR時はdocumentが存在しないためガード）
	$effect(() => {
		if (browser) {
			document.documentElement.lang = $locale ?? 'ja';
		}
	});

	onMount(() => {
		consentStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<Header />
	<main class="container mx-auto flex-1 px-4 py-6">
		{@render children()}
	</main>
	<Footer />
</div>
<CookieConsent />
