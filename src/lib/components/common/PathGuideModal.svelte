<!--
  PathGuideModal.svelte — コマンド実行方法ガイドモーダル

  ブラウザのセキュリティ制約によりフルパスが取得できないことを説明し、
  ユーザーがコマンドを正しく実行できるようガイドする。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" {...props}>
				ℹ️ {$t('pathGuide.buttonLabel')}
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{$t('pathGuide.title')}</Dialog.Title>
			<Dialog.Description>
				{$t('pathGuide.description')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-2">
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

			<!-- 注意書き -->
			<div class="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
				<p class="text-xs text-muted-foreground">
					⚠️ {$t('pathGuide.warning')}
				</p>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
