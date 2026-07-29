<!--
  /about-ffmpeg — FFmpegとは？ SEO記事ページ

  FFmpegの概要・歴史・設計思想・ユースケース・比較表を
  日本語/英語で切り替え表示する。8000文字以上のコンテンツ。
-->
<script lang="ts">
	import { locale, t } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
</script>

<svelte:head>
	<!-- Twitter Card（twitter:card は他の twitter: タグより先に配置） -->
	<meta name="twitter:card" content="summary_large_image" />
	{#if $locale === 'ja'}
		<title>FFmpegとは？ — 歴史・設計思想・使い方を徹底解説 | FFmpegコマンドジェネレーター</title>
		<meta name="description" content="FFmpegとは何か？ 25年以上の歴史を持つオープンソース動画・音声処理ツールの設計思想、主な機能、コマンド例、FFmpeg 8.1最新情報、JPEG→AVIF/H.264→AV1の圧縮比較データを詳しく解説します。" />
		<meta property="og:title" content="FFmpegとは？ — 歴史・設計思想・使い方を徹底解説" />
		<meta property="og:description" content="25年以上の歴史を持つオープンソース動画・音声処理ツールFFmpegの完全ガイド" />
		<meta property="og:image" content="https://www.cmd-gen.com/og-about-ja.png?v=2" />
		<meta property="og:image:alt" content="FFmpegとは？ — 歴史・設計思想・使い方を徹底解説" />
		<meta property="og:locale" content="ja_JP" />
		<meta property="og:locale:alternate" content="en_US" />
		<meta name="twitter:title" content="FFmpegとは？ — 歴史・設計思想・使い方を徹底解説" />
		<meta name="twitter:description" content="25年以上の歴史を持つオープンソース動画・音声処理ツールFFmpegの完全ガイド" />
		<meta name="twitter:image" content="https://www.cmd-gen.com/og-about-ja.png?v=2" />
		<meta name="twitter:image:alt" content="FFmpegとは？" />
	{:else}
		<title>What is FFmpeg? — History, Design, and Use Cases | FFmpeg Command Generator</title>
		<meta name="description" content="What is FFmpeg? A comprehensive guide to the open-source multimedia framework with 25+ years of history. Learn about its design philosophy, features, command examples, FFmpeg 8.1 updates, and JPEG→AVIF/H.264→AV1 compression benchmarks." />
		<meta property="og:title" content="What is FFmpeg? — History, Design, and Use Cases" />
		<meta property="og:description" content="A comprehensive guide to FFmpeg, the open-source multimedia framework" />
		<meta property="og:image" content="https://www.cmd-gen.com/og-about-en.png?v=2" />
		<meta property="og:image:alt" content="What is FFmpeg? — History, Design, and Use Cases" />
		<meta property="og:locale" content="en_US" />
		<meta property="og:locale:alternate" content="ja_JP" />
		<meta name="twitter:title" content="What is FFmpeg? — History, Design, and Use Cases" />
		<meta name="twitter:description" content="A comprehensive guide to FFmpeg, the open-source multimedia framework" />
		<meta name="twitter:image" content="https://www.cmd-gen.com/og-about-en.png?v=2" />
		<meta name="twitter:image:alt" content="What is FFmpeg?" />
	{/if}
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://www.cmd-gen.com/about-ffmpeg" />
	<meta property="og:site_name" content="FFmpeg Command Generator" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<link rel="canonical" href="https://www.cmd-gen.com/about-ffmpeg" />
	<link rel="alternate" hreflang="ja" href="https://www.cmd-gen.com/about-ffmpeg" />
	<link rel="alternate" hreflang="en" href="https://www.cmd-gen.com/about-ffmpeg" />
	<link rel="alternate" hreflang="x-default" href="https://www.cmd-gen.com/about-ffmpeg" />

	<!-- JSON-LD 構造化データ -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Article",
				"headline": "FFmpegとは？ — 歴史・設計思想・使い方を徹底解説",
				"alternativeHeadline": "What is FFmpeg? — History, Design, and Use Cases",
				"description": "FFmpegの概要・歴史・設計思想・ユースケース・圧縮比較データを徹底解説する完全ガイド",
				"url": "https://www.cmd-gen.com/about-ffmpeg",
				"inLanguage": ["ja", "en"],
				"publisher": {
					"@type": "Organization",
					"name": "cmd-gen.com",
					"url": "https://www.cmd-gen.com/"
				},
				"mainEntityOfPage": {
					"@type": "WebPage",
					"@id": "https://www.cmd-gen.com/about-ffmpeg"
				},
				"about": {
					"@type": "SoftwareApplication",
					"name": "FFmpeg",
					"url": "https://ffmpeg.org/"
				}
			},
			{
				"@type": "HowTo",
				"name": "FFmpegコマンドの使い方",
				"description": "FFmpegの代表的なコマンド例を紹介",
				"step": [
					{
						"@type": "HowToStep",
						"name": "動画をH.264で圧縮",
						"text": "ffmpeg -i input.mov -c:v libx264 -crf 23 -c:a aac output.mp4"
					},
					{
						"@type": "HowToStep",
						"name": "AV1で高効率圧縮",
						"text": "ffmpeg -i input.mp4 -c:v libsvtav1 -crf 30 -preset 6 -c:a libopus output.mp4"
					},
					{
						"@type": "HowToStep",
						"name": "画像をAVIFに変換",
						"text": "ffmpeg -i photo.jpg -c:v libsvtav1 -crf 30 -pix_fmt yuv420p10le photo.avif"
					},
					{
						"@type": "HowToStep",
						"name": "動画から音声を抽出",
						"text": "ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3"
					}
				]
			}
		]
	})}</script>`}
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8 pb-12">
	<!-- 戻るリンク -->
	<div>
		<a href="/" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
			<ArrowLeftIcon size={14} />
			{$locale === 'ja' ? 'コマンドジェネレーターに戻る' : 'Back to Command Generator'}
		</a>
	</div>

	{#if $locale === 'ja'}
		<!-- ===== 日本語コンテンツ ===== -->
		<article class="space-y-8">
			<header class="space-y-3">
				<h1 class="text-3xl font-bold tracking-tight">FFmpegとは？</h1>
				<p class="text-lg text-muted-foreground">
					25年以上の歴史を持つ、世界で最も使われているオープンソースのマルチメディア処理フレームワーク
				</p>
			</header>

			<!-- 概要 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">概要</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpegは、動画・音声・画像などのマルチメディアデータを処理するためのオープンソースソフトウェアです。
					コマンドラインツールとして提供され、フォーマット変換、圧縮、トリミング、結合、ストリーミングなど、
					ほぼすべてのマルチメディア処理を実行できます。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					YouTube、Netflix、VLC media player、OBS Studio、Handbrake、Instagram など、
					世界中の著名なサービスやアプリケーションがFFmpegをバックエンドに採用しており、
					事実上のマルチメディア処理の標準ツールとして広く利用されています。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					LGPLおよびGPLライセンスで公開されており、誰でも無料で利用・改変・再配布が可能です。
					対応するコーデック・フォーマット数は数百にのぼり、その網羅性は他に類を見ません。
				</p>
			</section>

			<!-- 歴史 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">歴史と開発の経緯</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpegは2000年にFabrice Bellardによって開発が開始されました。
					プロジェクト名の「FF」は「Fast Forward」の略で、「mpeg」はMoving Picture Experts Groupに由来します。
					当初はLinux環境向けの動画処理ツールとして誕生しましたが、
					その後macOS、Windows、FreeBSDなど多数のプラットフォームに対応しています。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					2004年にMichael Niedermayerがリードメンテナーを引き継ぎ、
					プロジェクトの安定化とコーデック対応の拡大を推進しました。
					2011年にはプロジェクトの方向性を巡る議論からLibavがフォークされましたが、
					2015年に多くの開発者がFFmpegに戻り、再びメインプロジェクトとして統合的な開発が続いています。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					2024〜2025年にかけてはFFmpeg 7.x系がリリースされ、AV1エンコーダーの最適化、
					Vulkanベースのハードウェアアクセラレーション対応、VVC（H.266）デコーダーの追加など、
					最新の映像技術への対応が進んでいます。
					2025年8月にはFFmpeg 8.0 "Huffman"、2026年3月にはFFmpeg 8.1 "Hoare" がリリースされ、
					GPU処理パイプラインの成熟が大きなテーマとなっています。
				</p>
			</section>

			<!-- 設計思想 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">設計思想とアーキテクチャ</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpegの設計は「Unixの哲学」に強く影響されています。
					一つのツールが一つのことを極めてうまくやる、という原則に従い、
					コマンドラインインターフェースを通じて柔軟なパイプライン処理を実現しています。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpegプロジェクトは複数のコンポーネントで構成されています：
				</p>
				<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
					<li><strong>ffmpeg</strong> — メインの変換・処理コマンドラインツール</li>
					<li><strong>ffprobe</strong> — メディアファイルの情報を解析・表示するツール</li>
					<li><strong>ffplay</strong> — シンプルなメディアプレーヤー</li>
					<li><strong>libavcodec</strong> — コーデックライブラリ（エンコード・デコード）</li>
					<li><strong>libavformat</strong> — コンテナフォーマットの処理</li>
					<li><strong>libavfilter</strong> — 映像・音声フィルター処理</li>
					<li><strong>libswscale</strong> — 映像スケーリング・色空間変換</li>
					<li><strong>libswresample</strong> — 音声リサンプリング</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					このモジュール構造により、FFmpegは単なるコマンドラインツールではなく、
					他のソフトウェアに組み込み可能な強力なライブラリ群としても機能します。
					VLCやChromium、Androidのメディアフレームワークなど、
					多くのプロジェクトがlibavcodecやlibavformatを直接利用しています。
				</p>
			</section>

			<!-- 主な利用シーン -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">主な利用シーン</h2>
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">動画フォーマット変換</h3>
						<p class="text-xs text-muted-foreground">MP4→WebM、MOV→MP4など、あらゆるフォーマット間で変換</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">動画圧縮・エンコード</h3>
						<p class="text-xs text-muted-foreground">H.264、H.265、AV1など最新コーデックで効率的な圧縮</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">音声抽出・変換</h3>
						<p class="text-xs text-muted-foreground">動画から音声のみを抽出、MP3↔AAC↔FLAC変換</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">画像圧縮</h3>
						<p class="text-xs text-muted-foreground">JPEG→AVIF、PNG→WebPなど次世代フォーマットへの変換</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">トリミング・切り出し</h3>
						<p class="text-xs text-muted-foreground">開始/終了時刻を指定した動画・音声の部分切り出し</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">GIF生成</h3>
						<p class="text-xs text-muted-foreground">動画からアニメーションGIFを高品質で生成</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">ライブストリーミング</h3>
						<p class="text-xs text-muted-foreground">RTMP、HLS、DASHプロトコルでのライブ配信</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">バッチ処理</h3>
						<p class="text-xs text-muted-foreground">数千ファイルの一括変換をスクリプトで自動化</p>
					</div>
				</div>
			</section>

			<!-- コマンド例 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">代表的なコマンド例</h2>
				<div class="space-y-4">
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">動画をH.264で圧縮</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i input.mov -c:v libx264 -crf 23 -c:a aac output.mp4
						</code>
					</div>
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">AV1で高効率圧縮（SVT-AV1）</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i input.mp4 -c:v libsvtav1 -crf 30 -preset 6 -c:a libopus output.mp4
						</code>
					</div>
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">画像をAVIFに変換</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i photo.jpg -c:v libsvtav1 -crf 30 -pix_fmt yuv420p10le photo.avif
						</code>
					</div>
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">動画から音声を抽出</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3
						</code>
					</div>
				</div>
			</section>

			<!-- JPEG→AVIF 比較表 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">JPEG→AVIF 圧縮比較（写真10,000枚）</h2>
				<p class="text-sm text-muted-foreground">
					一般的なデジタル写真（12MP、平均4MB/枚のJPEG）をAVIFに変換した場合の目安です。
					品質はSSIM 0.95以上（視覚的にほぼ同等）を維持した条件での比較データです。
				</p>
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-3 py-2 text-left font-medium">項目</th>
								<th class="px-3 py-2 text-right font-medium">JPEG（元）</th>
								<th class="px-3 py-2 text-right font-medium">AVIF（CRF 30）</th>
								<th class="px-3 py-2 text-right font-medium">AVIF（CRF 20）</th>
							</tr>
						</thead>
						<tbody>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">1枚あたりサイズ</td>
								<td class="px-3 py-1.5 text-right font-mono">4.0 MB</td>
								<td class="px-3 py-1.5 text-right font-mono">0.6 MB</td>
								<td class="px-3 py-1.5 text-right font-mono">1.2 MB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">10,000枚合計</td>
								<td class="px-3 py-1.5 text-right font-mono">40 GB</td>
								<td class="px-3 py-1.5 text-right font-mono">6 GB</td>
								<td class="px-3 py-1.5 text-right font-mono">12 GB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">削減率</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono text-green-600 dark:text-green-400">-85%</td>
								<td class="px-3 py-1.5 text-right font-mono text-green-600 dark:text-green-400">-70%</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">視覚品質（SSIM）</td>
								<td class="px-3 py-1.5 text-right font-mono">基準</td>
								<td class="px-3 py-1.5 text-right font-mono">0.95+</td>
								<td class="px-3 py-1.5 text-right font-mono">0.98+</td>
							</tr>
							<tr>
								<td class="px-3 py-1.5">変換速度（1枚）</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono">~2秒</td>
								<td class="px-3 py-1.5 text-right font-mono">~5秒</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-xs text-muted-foreground">
					※ 数値は実測値ではなく、画像の内容、解像度、エンコード設定により大きく変わる目安値です。
				</p>
			</section>

			<!-- H.264→AV1 比較表 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">H.264→AV1 動画圧縮比較（100本）</h2>
				<p class="text-sm text-muted-foreground">
					1080p、30fps、平均ビットレート8Mbpsの動画（各5分）をAV1に変換した場合の目安比較です。
					VMaF 93以上（高品質維持）の条件でのベンチマークデータです。
				</p>
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-3 py-2 text-left font-medium">項目</th>
								<th class="px-3 py-2 text-right font-medium">H.264（元）</th>
								<th class="px-3 py-2 text-right font-medium">AV1（SVT-AV1, preset 6）</th>
							</tr>
						</thead>
						<tbody>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">1本あたりサイズ</td>
								<td class="px-3 py-1.5 text-right font-mono">300 MB</td>
								<td class="px-3 py-1.5 text-right font-mono">120 MB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">100本合計</td>
								<td class="px-3 py-1.5 text-right font-mono">30 GB</td>
								<td class="px-3 py-1.5 text-right font-mono">12 GB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">削減率</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono text-green-600 dark:text-green-400">-60%</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">エンコード速度（1本5分の動画）</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono">~3分</td>
							</tr>
							<tr>
								<td class="px-3 py-1.5">視覚品質（VMAF）</td>
								<td class="px-3 py-1.5 text-right font-mono">基準</td>
								<td class="px-3 py-1.5 text-right font-mono">93+</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-xs text-muted-foreground">
					※ SVT-AV1は速度と品質のバランスに優れ、Homebrew ffmpegで標準利用可能な実用的な選択肢です。
					表の数値は実測値ではなく、ハードウェア、ソース映像の特性、設定により大きく変わる目安値です。
				</p>
			</section>

			<!-- 最新情報 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">最新のFFmpeg（2024〜2026年）</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg 7.0（2024年4月リリース）では、VVC（H.266）デコーダーの実験的サポート、
					IAMF（Immersive Audio Model and Formats）対応、マルチスレッド対応のffmpeg CLIなどが追加されました。
					FFmpeg 7.1（2024年9月）ではxHE-AACデコーダー、外部libvvenc経由のVVCエンコード、
					Vulkan H.264/H.265エンコーダーなどが追加されました。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg 8.0 "Huffman"（2025年8月）では、RealVideo 6.0デコーダー、APVのデコード・パーサー・
					raw bitstream mux/demuxと外部libopenapv経由のエンコード、Vulkan AV1エンコーダーなどが追加されました。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					2026年7月時点で8.1系の最新安定版は<strong>FFmpeg 8.1.2 "Hoare"（2026年6月17日リリース）</strong>です。
					8.1.2は重要なバグ修正のみを含むpoint releaseで、新機能は含みません。以下の新機能は
					2026年3月16日にリリースされたFFmpeg 8.1で追加されたものです。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg 8.1ではVulkanコンピュートコーデックの最適化、ProResのVulkanエンコーダーとhwaccel、
					DPXのVulkan hwaccel、swscaleのVulkan対応が追加されました。Vulkanコーデックの初期化も高速化されています。
					Windows向けにはD3D12 H.264/AV1エンコーダーと、スケーリング・動き推定・デインターレース用の
					<code>vf_scale_d3d12</code>、<code>vf_mestimate_d3d12</code>、<code>vf_deinterlace_d3d12</code>が追加されました。
					Rockchip H.264/HEVCハードウェアエンコーダーも追加されています。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					JPEG-XSではパーサーとraw bitstreamのmux/demuxが追加されました。エンコードとデコードは、
					外部ライブラリlibsvtjpegxsを有効にしたビルド（<code>--enable-libsvtjpegxs</code>）で利用できます。
					MPEG-H 3D Audioのデコードも外部<code>mpeghdec</code>経由です。
					また、xHE-AAC Mps212デコードが実験的機能として追加されました。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					そのほか、EXIFメタデータ解析、外部libcairo経由の<code>drawvg</code>フィルター、
					LCEVCパーサーとmetadata bitstream filter、ffmpeg CLIのtiled HEIF対応、HXVS/HXVT IPカメラ形式用の
					<code>hxvs</code> demuxer、IAMF Projection mode Ambisonic Audio Elementsのmux/demuxが追加されています。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					コードネーム "Hoare" は、2026年3月5日に逝去したコンピュータ科学者
					Sir Charles Antony Richard Hoare（クイックソートの考案者）に敬意を表して名付けられました。
				</p>
			</section>

			<!-- 本Webアプリの紹介 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">FFmpegコマンドジェネレーターについて</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpegは非常に強力ですが、コマンドライン操作に慣れていないユーザーにとっては
					オプションの多さが障壁になることがあります。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					このWebアプリ「FFmpegコマンドジェネレーター」は、GUIで直感的にオプションを選択するだけで
					最適なFFmpegコマンドを自動生成します。
					プリセット機能により、動画圧縮（AV1）、画像圧縮（AVIF/WebP）、音声抽出、
					GIF生成など、よくあるユースケースをワンクリックで設定できます。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					ドラッグ＆ドロップでファイルを読み込むだけで入力ファイル名が自動反映され、
					複数ファイルの一括処理スクリプトの生成にも対応しています。
					生成されたコマンドをコピーしてターミナルに貼り付けるだけで、
					すぐにFFmpegを実行できます。
				</p>
			</section>

			<!-- 参考リンク -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">参考リンク</h2>
				<ul class="space-y-2">
					<li>
						<a href="https://ffmpeg.org/" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg公式サイト <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://github.com/FFmpeg/FFmpeg" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg GitHubリポジトリ <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://ja.wikipedia.org/wiki/FFmpeg" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg — Wikipedia <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://trac.ffmpeg.org/wiki" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg Wiki（公式ドキュメント） <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://gitlab.com/AOMediaCodec/SVT-AV1" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							SVT-AV1（AV1高速エンコーダー） <ExternalLinkIcon size={12} />
						</a>
					</li>
				</ul>
			</section>

			<!-- CTAセクション -->
			<section class="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
				<h2 class="text-lg font-semibold">FFmpegコマンドを簡単に生成</h2>
				<p class="text-sm text-muted-foreground">
					GUIで直感的にオプションを選択するだけ。コマンドライン不要でFFmpegを活用できます。
				</p>
				<a href="/">
					<Button>コマンドジェネレーターを使う</Button>
				</a>
			</section>
		</article>

	{:else}
		<!-- ===== English Content ===== -->
		<article class="space-y-8">
			<header class="space-y-3">
				<h1 class="text-3xl font-bold tracking-tight">What is FFmpeg?</h1>
				<p class="text-lg text-muted-foreground">
					The world's most widely used open-source multimedia processing framework, with over 25 years of history
				</p>
			</header>

			<!-- Overview -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">Overview</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg is an open-source software suite for processing multimedia data including video, audio, and images.
					Provided as a command-line tool, it can perform virtually all multimedia processing tasks:
					format conversion, compression, trimming, concatenation, streaming, and more.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					YouTube, Netflix, VLC media player, OBS Studio, Handbrake, Instagram, and countless other
					prominent services and applications use FFmpeg as their backend.
					It is the de facto standard tool for multimedia processing worldwide.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Released under LGPL and GPL licenses, FFmpeg is free for anyone to use, modify, and redistribute.
					It supports hundreds of codecs and formats — an unparalleled level of coverage.
				</p>
			</section>

			<!-- History -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">History and Development</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg development began in 2000 by Fabrice Bellard.
					The "FF" in the project name stands for "Fast Forward," and "mpeg" refers to the
					Moving Picture Experts Group. Originally created as a video processing tool
					for Linux, it has since expanded to support macOS, Windows, FreeBSD, and many more platforms.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					In 2004, Michael Niedermayer took over as lead maintainer, driving project stabilization
					and codec expansion. In 2011, a disagreement over project direction led to the Libav fork,
					but by 2015 most developers returned to FFmpeg, which continues as the unified main project.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					In 2024–2025, FFmpeg 7.x series was released with AV1 encoder optimizations,
					Vulkan-based hardware acceleration, VVC (H.266) decoder support, and more.
					FFmpeg 8.0 "Huffman" was released in August 2025, followed by FFmpeg 8.1 "Hoare" in March 2026,
					with GPU processing pipeline maturity as a major theme.
				</p>
			</section>

			<!-- Design Philosophy -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">Design Philosophy and Architecture</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg's design is strongly influenced by the Unix philosophy: each tool does one thing
					and does it extremely well. Through its command-line interface, it enables flexible
					pipeline processing for complex multimedia workflows.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The FFmpeg project consists of several components:
				</p>
				<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
					<li><strong>ffmpeg</strong> — Main conversion and processing CLI tool</li>
					<li><strong>ffprobe</strong> — Media file analysis and information display</li>
					<li><strong>ffplay</strong> — Simple media player</li>
					<li><strong>libavcodec</strong> — Codec library (encoding/decoding)</li>
					<li><strong>libavformat</strong> — Container format handling</li>
					<li><strong>libavfilter</strong> — Video and audio filter processing</li>
					<li><strong>libswscale</strong> — Video scaling and color space conversion</li>
					<li><strong>libswresample</strong> — Audio resampling</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					This modular architecture means FFmpeg isn't just a CLI tool — it's a powerful set of
					libraries that can be embedded in other software. VLC, Chromium, and Android's media
					framework all directly use libavcodec and libavformat.
				</p>
			</section>

			<!-- Use Cases -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">Common Use Cases</h2>
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">Video Format Conversion</h3>
						<p class="text-xs text-muted-foreground">Convert between any formats: MP4→WebM, MOV→MP4, etc.</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">Video Compression</h3>
						<p class="text-xs text-muted-foreground">Efficient compression with H.264, H.265, AV1, and more</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">Audio Extraction & Conversion</h3>
						<p class="text-xs text-muted-foreground">Extract audio from videos, convert between MP3↔AAC↔FLAC</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">Image Compression</h3>
						<p class="text-xs text-muted-foreground">Convert to next-gen formats: JPEG→AVIF, PNG→WebP</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">Trimming & Cutting</h3>
						<p class="text-xs text-muted-foreground">Extract segments with precise start/end timestamps</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">GIF Generation</h3>
						<p class="text-xs text-muted-foreground">Create high-quality animated GIFs from videos</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">Live Streaming</h3>
						<p class="text-xs text-muted-foreground">Stream via RTMP, HLS, and DASH protocols</p>
					</div>
					<div class="rounded-lg border border-border p-3 space-y-1">
						<h3 class="text-sm font-medium">Batch Processing</h3>
						<p class="text-xs text-muted-foreground">Automate conversion of thousands of files with scripts</p>
					</div>
				</div>
			</section>

			<!-- Command Examples -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">Common Command Examples</h2>
				<div class="space-y-4">
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">Compress video with H.264</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i input.mov -c:v libx264 -crf 23 -c:a aac output.mp4
						</code>
					</div>
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">High-efficiency AV1 compression (SVT-AV1)</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i input.mp4 -c:v libsvtav1 -crf 30 -preset 6 -c:a libopus output.mp4
						</code>
					</div>
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">Convert image to AVIF</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i photo.jpg -c:v libsvtav1 -crf 30 -pix_fmt yuv420p10le photo.avif
						</code>
					</div>
					<div class="space-y-1.5">
						<h3 class="text-sm font-medium">Extract audio from video</h3>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3
						</code>
					</div>
				</div>
			</section>

			<!-- JPEG→AVIF Comparison -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">JPEG→AVIF Compression Comparison (10,000 Photos)</h2>
				<p class="text-sm text-muted-foreground">
					Estimated results for converting typical digital photos (12MP, ~4MB/photo JPEG) to AVIF,
					maintaining SSIM 0.95+ (visually near-identical quality).
				</p>
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-3 py-2 text-left font-medium">Metric</th>
								<th class="px-3 py-2 text-right font-medium">JPEG (Original)</th>
								<th class="px-3 py-2 text-right font-medium">AVIF (CRF 30)</th>
								<th class="px-3 py-2 text-right font-medium">AVIF (CRF 20)</th>
							</tr>
						</thead>
						<tbody>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Size per photo</td>
								<td class="px-3 py-1.5 text-right font-mono">4.0 MB</td>
								<td class="px-3 py-1.5 text-right font-mono">0.6 MB</td>
								<td class="px-3 py-1.5 text-right font-mono">1.2 MB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Total (10,000)</td>
								<td class="px-3 py-1.5 text-right font-mono">40 GB</td>
								<td class="px-3 py-1.5 text-right font-mono">6 GB</td>
								<td class="px-3 py-1.5 text-right font-mono">12 GB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Reduction</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono text-green-600 dark:text-green-400">-85%</td>
								<td class="px-3 py-1.5 text-right font-mono text-green-600 dark:text-green-400">-70%</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Visual Quality (SSIM)</td>
								<td class="px-3 py-1.5 text-right font-mono">Baseline</td>
								<td class="px-3 py-1.5 text-right font-mono">0.95+</td>
								<td class="px-3 py-1.5 text-right font-mono">0.98+</td>
							</tr>
							<tr>
								<td class="px-3 py-1.5">Encode time (per photo)</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono">~2s</td>
								<td class="px-3 py-1.5 text-right font-mono">~5s</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-xs text-muted-foreground">
					* These are estimates, not measured results, and vary significantly with image content, resolution, and encoding settings.
				</p>
			</section>

			<!-- H.264→AV1 Comparison -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">H.264→AV1 Video Compression Comparison (100 Videos)</h2>
				<p class="text-sm text-muted-foreground">
					Estimated results for converting 1080p, 30fps, ~8Mbps videos (5 min each) to AV1,
					maintaining VMAF 93+ (high visual quality).
				</p>
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-3 py-2 text-left font-medium">Metric</th>
								<th class="px-3 py-2 text-right font-medium">H.264 (Original)</th>
								<th class="px-3 py-2 text-right font-medium">AV1 (SVT-AV1, preset 6)</th>
							</tr>
						</thead>
						<tbody>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Size per video</td>
								<td class="px-3 py-1.5 text-right font-mono">300 MB</td>
								<td class="px-3 py-1.5 text-right font-mono">120 MB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Total (100 videos)</td>
								<td class="px-3 py-1.5 text-right font-mono">30 GB</td>
								<td class="px-3 py-1.5 text-right font-mono">12 GB</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Reduction</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono text-green-600 dark:text-green-400">-60%</td>
							</tr>
							<tr class="border-b border-border">
								<td class="px-3 py-1.5">Encode time (5-min video)</td>
								<td class="px-3 py-1.5 text-right">—</td>
								<td class="px-3 py-1.5 text-right font-mono">~3 min</td>
							</tr>
							<tr>
								<td class="px-3 py-1.5">Visual Quality (VMAF)</td>
								<td class="px-3 py-1.5 text-right font-mono">Baseline</td>
								<td class="px-3 py-1.5 text-right font-mono">93+</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-xs text-muted-foreground">
					* SVT-AV1 offers excellent speed-quality balance and is available in Homebrew ffmpeg by default.
					The table contains estimates, not measured results, and the values vary significantly with hardware, source content, and settings.
				</p>
			</section>

			<!-- Latest Info -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">Latest FFmpeg (2024–2026)</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg 7.0 (April 2024) introduced experimental VVC (H.266) decoder support,
					IAMF (Immersive Audio Model and Formats) support, and a multi-threaded ffmpeg CLI.
					FFmpeg 7.1 (September 2024) added the xHE-AAC decoder, VVC encoding through the external
					libvvenc library, and Vulkan H.264/H.265 encoders.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg 8.0 "Huffman" (August 2025) added the RealVideo 6.0 decoder, APV decoding, parsing,
					raw bitstream muxing/demuxing and encoding through the external libopenapv library, and a Vulkan AV1 encoder.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					As of July 2026, the latest stable release in the 8.1 branch is
					<strong>FFmpeg 8.1.2 "Hoare" (released June 17, 2026)</strong>.
					FFmpeg 8.1.2 is a point release containing important bug fixes only and no new features.
					The features below were introduced in FFmpeg 8.1, released March 16, 2026.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg 8.1 added Vulkan compute codec optimizations, a ProRes Vulkan encoder and hwaccel,
					DPX Vulkan hwaccel, and Vulkan support in swscale. Vulkan codec initialization was also sped up.
					For Windows, it added D3D12 H.264/AV1 encoders and the <code>vf_scale_d3d12</code>,
					<code>vf_mestimate_d3d12</code>, and <code>vf_deinterlace_d3d12</code> filters for scaling,
					motion estimation, and deinterlacing. Rockchip H.264/HEVC hardware encoders were also added.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					For JPEG-XS, FFmpeg 8.1 added a parser and raw bitstream muxer/demuxer. Encoding and decoding
					are available in builds configured with the external libsvtjpegxs library
					(<code>--enable-libsvtjpegxs</code>). MPEG-H 3D Audio decoding is likewise provided through
					the external <code>mpeghdec</code> library. Experimental xHE-AAC Mps212 decoding was also added.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Other additions include EXIF metadata parsing, the <code>drawvg</code> filter through external
					libcairo, an LCEVC parser and metadata bitstream filter, tiled HEIF support in the ffmpeg CLI,
					the <code>hxvs</code> demuxer for HXVS/HXVT IP camera formats, and muxing/demuxing for
					IAMF Projection mode Ambisonic Audio Elements.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The codename "Hoare" honors Sir Charles Antony Richard Hoare, the inventor of Quicksort,
					who passed away on March 5, 2026.
				</p>
			</section>

			<!-- About This Web App -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">About FFmpeg Command Generator</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg is incredibly powerful, but its vast number of options can be overwhelming
					for users unfamiliar with command-line tools.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					This web app, "FFmpeg Command Generator," automatically generates optimal FFmpeg commands
					through an intuitive GUI. Preset features let you configure common use cases with one click:
					video compression (AV1), image compression (AVIF/WebP), audio extraction, GIF generation, and more.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Simply drag and drop files to auto-detect filenames, and it even generates batch processing
					scripts for multiple files. Copy the generated command and paste it into your terminal
					to immediately start processing.
				</p>
			</section>

			<!-- Reference Links -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold border-b border-border pb-2">Reference Links</h2>
				<ul class="space-y-2">
					<li>
						<a href="https://ffmpeg.org/" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg Official Website <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://github.com/FFmpeg/FFmpeg" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg GitHub Repository <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://en.wikipedia.org/wiki/FFmpeg" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg — Wikipedia <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://trac.ffmpeg.org/wiki" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							FFmpeg Wiki (Official Docs) <ExternalLinkIcon size={12} />
						</a>
					</li>
					<li>
						<a href="https://gitlab.com/AOMediaCodec/SVT-AV1" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
							SVT-AV1 (High-Speed AV1 Encoder) <ExternalLinkIcon size={12} />
						</a>
					</li>
				</ul>
			</section>

			<!-- CTA Section -->
			<section class="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
				<h2 class="text-lg font-semibold">Generate FFmpeg Commands Easily</h2>
				<p class="text-sm text-muted-foreground">
					Simply select options with an intuitive GUI. No command-line expertise needed.
				</p>
				<a href="/">
					<Button>Use the Command Generator</Button>
				</a>
			</section>
		</article>
	{/if}
</div>
