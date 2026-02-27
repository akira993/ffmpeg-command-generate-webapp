<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Tabs from './index.js';

	const { Story } = defineMeta({
		title: 'UI/Tabs',
		component: Tabs.Root,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Tabs.Root value="tab1">
			<Tabs.List>
				<Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
				<Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
				<Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="tab1">
				<p class="p-4 text-sm">Content for Tab 1</p>
			</Tabs.Content>
			<Tabs.Content value="tab2">
				<p class="p-4 text-sm">Content for Tab 2</p>
			</Tabs.Content>
			<Tabs.Content value="tab3">
				<p class="p-4 text-sm">Content for Tab 3</p>
			</Tabs.Content>
		</Tabs.Root>
	{/snippet}
</Story>

<Story name="ScriptTypes">
	{#snippet template()}
		<Tabs.Root value="bash">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="bash">Bash</Tabs.Trigger>
				<Tabs.Trigger value="powershell">PowerShell</Tabs.Trigger>
				<Tabs.Trigger value="cmd">cmd</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="bash">
				<pre class="mt-2 rounded-md bg-muted/30 p-4 font-mono text-sm">#!/bin/bash
for f in *.mp4; do
  ffmpeg -i "$f" -c:v libx264 "${`$\{f%.mp4\}`}.mkv"
done</pre>
			</Tabs.Content>
			<Tabs.Content value="powershell">
				<pre class="mt-2 rounded-md bg-muted/30 p-4 font-mono text-sm">Get-ChildItem *.mp4 | ForEach-Object {'{'}
  ffmpeg -i $_.Name -c:v libx264 "$($_.BaseName).mkv"
{'}'}</pre>
			</Tabs.Content>
			<Tabs.Content value="cmd">
				<pre class="mt-2 rounded-md bg-muted/30 p-4 font-mono text-sm">for %%f in (*.mp4) do (
  ffmpeg -i "%%f" -c:v libx264 "%%~nf.mkv"
)</pre>
			</Tabs.Content>
		</Tabs.Root>
	{/snippet}
</Story>

<Story name="WithDisabledTab">
	{#snippet template()}
		<Tabs.Root value="active">
			<Tabs.List>
				<Tabs.Trigger value="active">Active</Tabs.Trigger>
				<Tabs.Trigger value="disabled" disabled>Disabled</Tabs.Trigger>
				<Tabs.Trigger value="other">Other</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="active">
				<p class="p-4 text-sm">This tab is active.</p>
			</Tabs.Content>
			<Tabs.Content value="other">
				<p class="p-4 text-sm">Other tab content.</p>
			</Tabs.Content>
		</Tabs.Root>
	{/snippet}
</Story>
