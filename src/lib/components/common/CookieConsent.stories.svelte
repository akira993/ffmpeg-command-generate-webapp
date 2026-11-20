<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { consentStore } from '#lib/stores/consent.svelte.js';
	import StorySetup from '../../../../.storybook/StorySetup.svelte';
	import CookieConsent from './CookieConsent.svelte';

	const { Story } = defineMeta({
		title: 'Domain/CookieConsent',
		component: CookieConsent,
		tags: ['autodocs'],
		parameters: {
			docs: {
				story: {
					inline: false,
					iframeHeight: '180px'
				}
			}
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<StorySetup setup={() => { consentStore.status = 'undecided'; }}>
			{#snippet children()}
				<CookieConsent />
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="Accepted">
	{#snippet template()}
		<StorySetup setup={() => { consentStore.status = 'accepted'; }}>
			{#snippet children()}
				<CookieConsent />
				<p class="text-sm text-muted-foreground">同意済みのため、Cookie 同意バナーは表示されません。</p>
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>

<Story name="Rejected">
	{#snippet template()}
		<StorySetup setup={() => { consentStore.status = 'rejected'; }}>
			{#snippet children()}
				<CookieConsent />
				<p class="text-sm text-muted-foreground">拒否済みのため、Cookie 同意バナーは表示されません。</p>
			{/snippet}
		</StorySetup>
	{/snippet}
</Story>
