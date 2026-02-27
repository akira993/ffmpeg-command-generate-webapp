<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Select from './index.js';

	const { Story } = defineMeta({
		title: 'UI/Select',
		component: Select.Root,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Select.Root value="mp4">
			<Select.Trigger class="w-48">
				<span data-slot="select-value">MP4</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="mp4" label="MP4" />
				<Select.Item value="mkv" label="MKV" />
				<Select.Item value="avi" label="AVI" />
				<Select.Item value="webm" label="WebM" />
				<Select.Item value="mov" label="MOV" />
			</Select.Content>
		</Select.Root>
	{/snippet}
</Story>

<Story name="VideoCodecs">
	{#snippet template()}
		<div class="flex flex-col gap-2">
			<label for="video-codec-select" class="text-sm font-medium">Video Codec</label>
			<Select.Root value="libx264">
				<Select.Trigger class="w-56">
					<span data-slot="select-value">H.264 (libx264)</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="libx264" label="H.264 (libx264)" />
					<Select.Item value="libx265" label="H.265 / HEVC (libx265)" />
					<Select.Item value="libvpx-vp9" label="VP9 (libvpx-vp9)" />
					<Select.Item value="libaom-av1" label="AV1 (libaom-av1)" />
					<Select.Item value="copy" label="Copy (no re-encode)" />
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>

<Story name="WithGroups">
	{#snippet template()}
		<Select.Root value="">
			<Select.Trigger class="w-56">
				<span data-slot="select-value">Select format...</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>Video</Select.GroupHeading>
					<Select.Item value="mp4" label="MP4" />
					<Select.Item value="mkv" label="MKV" />
					<Select.Item value="webm" label="WebM" />
				</Select.Group>
				<Select.Separator />
				<Select.Group>
					<Select.GroupHeading>Audio</Select.GroupHeading>
					<Select.Item value="mp3" label="MP3" />
					<Select.Item value="aac" label="AAC" />
					<Select.Item value="flac" label="FLAC" />
				</Select.Group>
			</Select.Content>
		</Select.Root>
	{/snippet}
</Story>

<Story name="SmallSize">
	{#snippet template()}
		<Select.Root value="30">
			<Select.Trigger class="w-32" size="sm">
				<span data-slot="select-value">30 fps</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="24" label="24 fps" />
				<Select.Item value="30" label="30 fps" />
				<Select.Item value="60" label="60 fps" />
			</Select.Content>
		</Select.Root>
	{/snippet}
</Story>
