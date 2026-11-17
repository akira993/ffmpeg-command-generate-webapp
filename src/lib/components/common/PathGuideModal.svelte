<!--
  PathGuideModal.svelte — コマンド実行方法ガイドモーダル

  ブラウザのセキュリティ制約によりフルパスが取得できないことを説明し、
  ユーザーがコマンドを正しく実行できるようガイドする。
-->
<script lang="ts">
	import { t } from '#lib/i18n/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import InfoIcon from '@lucide/svelte/icons/info';

	let {
		open = $bindable(false),
		showTrigger = true,
		onOpenInstallGuide
	}: {
		open?: boolean;
		showTrigger?: boolean;
		onOpenInstallGuide?: () => void;
	} = $props();

	function openInstallGuide() {
		open = false;
		if (onOpenInstallGuide) {
			// 少し遅延させてモーダルの閉じアニメーション後に開く
			setTimeout(() => {
				onOpenInstallGuide();
			}, 200);
		}
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button variant="outline" size="sm" {...props}>
					<InfoIcon size={14} class="mr-1" />
					{$t('pathGuide.buttonLabel')}
				</Button>
			{/snippet}
		</Dialog.Trigger>
	{/if}
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{$t('pathGuide.title')}</Dialog.Title>
			<Dialog.Description>
				{$t('pathGuide.description')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="max-h-[70vh] space-y-4 overflow-y-auto py-2">
			<!-- 手順 -->
			<ol class="list-inside list-decimal space-y-2 text-sm">
				<li>{$t('pathGuide.step1')}</li>
				<li>{$t('pathGuide.step2')}</li>
				<li>
					{$t('pathGuide.step3')}
					<code class="mt-1 block rounded bg-muted px-2 py-1 font-mono text-xs">
						cd /path/to/your/files
					</code>
				</li>
				<li>{$t('pathGuide.step4')}</li>
			</ol>

			<!-- ヒント -->
			<div class="rounded-md bg-muted/50 p-3">
				<p class="mb-2 text-sm font-medium">💡 {$t('pathGuide.tipTitle')}</p>
				<dl class="space-y-1 text-xs text-muted-foreground">
					<div>
						<dt class="font-medium">macOS:</dt>
						<dd>{$t('pathGuide.tipMac')}</dd>
					</div>
					<div>
						<dt class="font-medium">Windows:</dt>
						<dd>{$t('pathGuide.tipWindows')}</dd>
					</div>
					<div>
						<dt class="font-medium">Linux:</dt>
						<dd>{$t('pathGuide.tipLinux')}</dd>
					</div>
				</dl>
			</div>

			<!-- FFmpegインストールへの導線 -->
			<div class="rounded-md border border-primary/20 bg-primary/5 p-3">
				<p class="text-xs text-muted-foreground">
					<DownloadIcon size={12} class="mr-1 inline" />
					{$t('pathGuide.installPrompt')}
					<button
						type="button"
						class="font-medium text-primary underline-offset-4 hover:underline"
						onclick={openInstallGuide}
					>
						{$t('pathGuide.installLink')}
					</button>
				</p>
			</div>

			<!-- 注意書き -->
			<div class="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
				<p class="text-xs text-muted-foreground">
					⚠️ {$t('pathGuide.warning')}
				</p>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
