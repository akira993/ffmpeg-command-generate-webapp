<!--
  DropZone.svelte — ドラッグ＆ドロップ対応ファイル入力コンポーネント

  機能:
  - ファイル・フォルダの両方をD&D受付
  - webkitGetAsEntry() でフォルダ内を再帰的に読み取り
  - ファイル名（＋相対パス）をストアに反映
  - 1ファイルなら個別モード、複数 or フォルダなら一括モードに自動切替
  - クリックでファイル選択ダイアログも開ける
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';
	import type { FileInfo } from '$lib/ffmpeg/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	// ドラッグオーバー時のスタイル制御
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	// ドロップ処理
	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		if (!e.dataTransfer?.items) return;

		const files: FileInfo[] = [];

		for (const item of Array.from(e.dataTransfer.items)) {
			if (item.kind !== 'file') continue;

			// webkitGetAsEntry でフォルダ対応
			const entry = item.webkitGetAsEntry?.();
			if (entry) {
				await readEntry(entry, files, '');
			} else {
				// フォールバック: 通常のファイル取得
				const file = item.getAsFile();
				if (file) {
					files.push({
						name: file.name,
						size: file.size,
						type: file.type
					});
				}
			}
		}

		if (files.length > 0) {
			commandStore.setDroppedFiles(files);
		}
	}

	/**
	 * FileSystemEntry を再帰的に読み取り、ファイル情報を収集する
	 */
	async function readEntry(entry: FileSystemEntry, files: FileInfo[], parentPath: string): Promise<void> {
		if (entry.isFile) {
			const fileEntry = entry as FileSystemFileEntry;
			const file = await getFile(fileEntry);
			files.push({
				name: file.name,
				relativePath: parentPath ? `${parentPath}/${file.name}` : undefined,
				size: file.size,
				type: file.type
			});
		} else if (entry.isDirectory) {
			const dirEntry = entry as FileSystemDirectoryEntry;
			const reader = dirEntry.createReader();
			const entries = await readAllEntries(reader);
			const currentPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;

			for (const childEntry of entries) {
				await readEntry(childEntry, files, currentPath);
			}
		}
	}

	/** FileSystemFileEntry からFileオブジェクトを取得 */
	function getFile(entry: FileSystemFileEntry): Promise<File> {
		return new Promise((resolve, reject) => {
			entry.file(resolve, reject);
		});
	}

	/** DirectoryReader から全エントリを取得（readEntries は100件ずつ返す） */
	function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
		return new Promise((resolve, reject) => {
			const allEntries: FileSystemEntry[] = [];

			function readBatch() {
				reader.readEntries((entries) => {
					if (entries.length === 0) {
						resolve(allEntries);
					} else {
						allEntries.push(...entries);
						readBatch(); // 再帰的に全件取得
					}
				}, reject);
			}

			readBatch();
		});
	}

	// クリックでファイル選択
	function handleClick() {
		fileInput?.click();
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;

		const files: FileInfo[] = Array.from(input.files).map((f) => ({
			name: f.name,
			size: f.size,
			type: f.type
		}));

		if (files.length > 0) {
			commandStore.setDroppedFiles(files);
		}

		// リセット（同じファイルを再選択可能にする）
		input.value = '';
	}

	function handleClear() {
		commandStore.clearDroppedFiles();
	}

	const MAX_DISPLAY_FILES = 5;
</script>

<div class="w-full">
	{#if commandStore.fileCount === 0}
		<!-- ドロップゾーン（未選択状態） -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors
				{isDragging
					? 'border-primary bg-primary/5 text-primary'
					: 'border-muted-foreground/25 text-muted-foreground hover:border-primary/50 hover:bg-muted/50'}"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			onclick={handleClick}
			role="button"
			tabindex="0"
		>
			<span class="mb-2 text-3xl">📁</span>
			<p class="text-sm font-medium">
				{$t('dropzone.title')}
			</p>
			<p class="mt-1 text-xs">
				{$t('dropzone.subtitle')}
			</p>
		</div>
	{:else}
		<!-- ファイル情報表示（選択済み状態） -->
		<div
			class="rounded-lg border border-border bg-muted/30 p-4"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			role="region"
		>
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-lg">✅</span>
					<span class="text-sm font-medium">
						{commandStore.fileCount}{$t('dropzone.filesDetected')}
					</span>
					{#if commandStore.batchMode}
						<Badge variant="secondary">{$t('dropzone.batchMode')}</Badge>
					{/if}
				</div>
				<Button variant="ghost" size="sm" onclick={handleClear}>
					{$t('dropzone.clear')}
				</Button>
			</div>

			<ul class="space-y-0.5 text-xs text-muted-foreground">
				{#each commandStore.droppedFiles.slice(0, MAX_DISPLAY_FILES) as file}
					<li class="truncate font-mono">
						{file.relativePath ?? file.name}
					</li>
				{/each}
				{#if commandStore.fileCount > MAX_DISPLAY_FILES}
					<li class="text-muted-foreground/70">
						... {$t('dropzone.moreFiles').replace('{{count}}', String(commandStore.fileCount - MAX_DISPLAY_FILES))}
					</li>
				{/if}
			</ul>
		</div>
	{/if}

	<!-- 非表示のファイル入力 -->
	<input
		bind:this={fileInput}
		type="file"
		multiple
		class="hidden"
		onchange={handleFileInput}
	/>
</div>
