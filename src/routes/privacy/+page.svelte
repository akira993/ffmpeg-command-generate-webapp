<!--
  /privacy — プライバシーポリシー

  GDPR（EU）・CCPA（カリフォルニア）対応のプライバシーポリシーを
  日本語/英語で切り替え表示する。
-->
<script lang="ts">
	import { locale } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
</script>

<svelte:head>
	<meta name="robots" content="noindex, follow" />
	{#if $locale === 'ja'}
		<title>プライバシーポリシー | FFmpegコマンドジェネレーター</title>
		<meta name="description" content="FFmpegコマンドジェネレーター（cmd-gen.com）のプライバシーポリシー。Cookie・Google Analyticsの使用、GDPR・CCPAに基づくユーザーの権利について説明します。" />
	{:else}
		<title>Privacy Policy | FFmpeg Command Generator</title>
		<meta name="description" content="Privacy Policy for FFmpeg Command Generator (cmd-gen.com). Learn about our use of cookies, Google Analytics, and your rights under GDPR and CCPA." />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://www.cmd-gen.com/privacy" />
	<link rel="canonical" href="https://www.cmd-gen.com/privacy" />
	<link rel="alternate" hreflang="ja" href="https://www.cmd-gen.com/privacy" />
	<link rel="alternate" hreflang="en" href="https://www.cmd-gen.com/privacy" />
	<link rel="alternate" hreflang="x-default" href="https://www.cmd-gen.com/privacy" />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8 pb-12">
	<!-- 戻るリンク -->
	<div>
		<Button variant="ghost" size="sm" href="/">
			<ArrowLeftIcon />
			{#if $locale === 'ja'}トップに戻る{:else}Back to Home{/if}
		</Button>
	</div>

	{#if $locale === 'ja'}
		<!-- ===== 日本語 ===== -->
		<article class="space-y-8">
			<header>
				<h1 class="text-2xl font-bold tracking-tight">プライバシーポリシー</h1>
				<p class="mt-2 text-sm text-muted-foreground">最終更新日: 2026年2月25日</p>
			</header>

			<!-- 1. はじめに -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">1. はじめに</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpegコマンドジェネレーター（以下「本サービス」、URL: https://www.cmd-gen.com）は、
					ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
					本プライバシーポリシーでは、本サービスが収集するデータ、その利用目的、
					およびユーザーの権利について説明します。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスはフロントエンドのみで動作する静的Webアプリケーションであり、
					サーバーサイドでのデータ処理やユーザーアカウントの管理は行っていません。
				</p>
			</section>

			<!-- 2. 収集するデータ -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">2. 収集するデータ</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスでは、Google Analytics 4（GA4）を使用して以下の情報を収集することがあります：
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>ページビュー（閲覧したページのURL）</li>
					<li>デバイス情報（ブラウザの種類、OS、画面解像度）</li>
					<li>おおよその地理的位置（国・地域レベル）</li>
					<li>リファラー（どのサイトから訪問したか）</li>
					<li>サイト内での操作イベント</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスは、氏名、メールアドレス、住所などの個人を直接特定できる情報を収集しません。
				</p>
			</section>

			<!-- 3. Cookieについて -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">3. Cookieについて</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスでは、以下のCookieを使用する場合があります：
				</p>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="py-2 pr-4 text-left font-medium">Cookie名</th>
								<th class="py-2 pr-4 text-left font-medium">目的</th>
								<th class="py-2 text-left font-medium">有効期限</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/50">
								<td class="py-2 pr-4"><code>_ga</code></td>
								<td class="py-2 pr-4">ユーザーの識別（Google Analytics）</td>
								<td class="py-2">2年間</td>
							</tr>
							<tr class="border-b border-border/50">
								<td class="py-2 pr-4"><code>_ga_*</code></td>
								<td class="py-2 pr-4">セッション状態の管理（Google Analytics）</td>
								<td class="py-2">2年間</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-sm leading-relaxed text-muted-foreground">
					これらのCookieは、ユーザーが同意した場合にのみ設定されます。
					同意しない場合でも、匿名化された限定的な計測が行われますが、Cookieは使用されません。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					また、本サービスはユーザーの設定（テーマ、言語など）を保存するために
					<code>localStorage</code> を使用しますが、これはCookieではなく、
					サーバーに送信されることはありません。
				</p>
			</section>

			<!-- 4. データの利用目的 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">4. データの利用目的</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					収集したデータは、以下の目的にのみ使用します：
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>サイトの利用状況の把握と改善</li>
					<li>ユーザー体験の向上</li>
					<li>技術的な問題の特定と修正</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					収集したデータを第三者に販売することはありません。
				</p>
			</section>

			<!-- 5. Google Analytics -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">5. Google Analytics</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスでは、Google LLC が提供する Google Analytics 4 を使用しています。
					Google Analytics は、Cookieを使用してユーザーのサイト利用状況を分析します。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスでは、Google Consent Mode v2 を導入しており、
					ユーザーの同意状態に応じてデータ収集の範囲を制御しています。
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>
						Googleのプライバシーポリシー:
						<a
							href="https://policies.google.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary underline-offset-4 hover:underline"
						>https://policies.google.com/privacy</a>
					</li>
					<li>
						Google Analyticsのオプトアウト:
						<a
							href="https://tools.google.com/dlpage/gaoptout"
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary underline-offset-4 hover:underline"
						>https://tools.google.com/dlpage/gaoptout</a>
					</li>
				</ul>
			</section>

			<!-- 6. GDPR -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">6. EUユーザーの権利（GDPR）</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					欧州経済領域（EEA）に居住するユーザーは、EU一般データ保護規則（GDPR）に基づき、
					以下の権利を有します：
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li><strong>アクセス権</strong> — ご自身に関するデータへのアクセスを要求する権利</li>
					<li><strong>訂正権</strong> — 不正確なデータの訂正を要求する権利</li>
					<li><strong>削除権（忘れられる権利）</strong> — データの削除を要求する権利</li>
					<li><strong>処理制限権</strong> — データ処理の制限を要求する権利</li>
					<li><strong>データポータビリティ権</strong> — データの移転を要求する権利</li>
					<li><strong>異議申立権</strong> — データ処理に対して異議を申し立てる権利</li>
					<li><strong>同意撤回権</strong> — いつでもCookieの同意を撤回する権利</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Cookieの同意は、ブラウザのlocalStorageからデータ（キー: <code>cookie-consent</code>）を
					削除することで、いつでも撤回できます。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					データ処理の法的根拠は、ユーザーの同意（GDPR第6条1項(a)）です。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					これらの権利を行使される場合は、本ページ下部のお問い合わせフォームよりご連絡ください。
				</p>
			</section>

			<!-- 7. CCPA -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">7. カリフォルニア州ユーザーの権利（CCPA）</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					カリフォルニア州消費者プライバシー法（CCPA）に基づき、カリフォルニア州に居住するユーザーは
					以下の権利を有します：
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li><strong>知る権利</strong> — 収集される個人情報のカテゴリと目的を知る権利</li>
					<li><strong>削除要求権</strong> — 個人情報の削除を要求する権利</li>
					<li><strong>オプトアウト権</strong> — 個人情報の販売を拒否する権利</li>
					<li><strong>差別禁止</strong> — 権利を行使したことによる差別を受けない権利</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスは、ユーザーの個人情報を第三者に販売または共有することはありません。
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					これらの権利を行使される場合は、本ページ下部のお問い合わせフォームよりご連絡ください。
				</p>
			</section>

			<!-- 8. データの保持期間 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">8. データの保持期間</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Google Analyticsで収集されたデータは、Googleのデフォルト設定に従い、
					14ヶ月間保持された後、自動的に削除されます。
				</p>
			</section>

			<!-- 9. 子供のプライバシー -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">9. 子供のプライバシー</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本サービスは、13歳未満の子供を対象としていません。
					13歳未満の子供から意図的に個人情報を収集することはありません。
				</p>
			</section>

			<!-- 10. ポリシーの変更 -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">10. ポリシーの変更</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本プライバシーポリシーは、必要に応じて更新されることがあります。
					重要な変更がある場合は、本ページで通知します。
					最新の内容を定期的にご確認ください。
				</p>
			</section>

			<!-- 11. お問い合わせ -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">11. お問い合わせ</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					本プライバシーポリシーに関するご質問やご要望がございましたら、
					以下のお問い合わせフォームよりご連絡ください。
					フォームでは以下の種類のお問い合わせを受け付けています：
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>個人情報の開示請求</li>
					<li>個人情報の訂正・追加・削除の依頼</li>
					<li>個人情報の利用停止・消去の依頼</li>
					<li>プライバシーポリシーに関する一般的なご質問</li>
					<li>その他</li>
				</ul>
				<div class="mt-2">
					<Button
						variant="outline"
						size="sm"
						href="https://docs.google.com/forms/d/e/1FAIpQLSdBDarenhXZ7TeQEDZiS-SbMCcAIA8NlSnT9qrnjdzDly9AjA/viewform?usp=dialog"
						target="_blank"
						rel="noopener noreferrer"
					>
						<ExternalLinkIcon />
						お問い合わせフォームを開く
					</Button>
				</div>
			</section>
		</article>

	{:else}
		<!-- ===== English ===== -->
		<article class="space-y-8">
			<header>
				<h1 class="text-2xl font-bold tracking-tight">Privacy Policy</h1>
				<p class="mt-2 text-sm text-muted-foreground">Last updated: February 25, 2026</p>
			</header>

			<!-- 1. Introduction -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">1. Introduction</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					FFmpeg Command Generator ("the Service", URL: https://www.cmd-gen.com) respects
					your privacy and is committed to protecting your personal information.
					This Privacy Policy explains what data we collect, how we use it,
					and your rights regarding your data.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The Service is a frontend-only static web application. We do not process data
					on a server or manage user accounts.
				</p>
			</section>

			<!-- 2. Data We Collect -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">2. Data We Collect</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					We use Google Analytics 4 (GA4) to collect the following information:
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>Page views (URLs of pages visited)</li>
					<li>Device information (browser type, operating system, screen resolution)</li>
					<li>Approximate geographic location (country/region level)</li>
					<li>Referrer (which site you came from)</li>
					<li>On-site interaction events</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					We do not collect personally identifiable information such as names, email addresses, or physical addresses.
				</p>
			</section>

			<!-- 3. Cookies -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">3. Cookies</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The Service may use the following cookies:
				</p>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border">
								<th class="py-2 pr-4 text-left font-medium">Cookie</th>
								<th class="py-2 pr-4 text-left font-medium">Purpose</th>
								<th class="py-2 text-left font-medium">Duration</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/50">
								<td class="py-2 pr-4"><code>_ga</code></td>
								<td class="py-2 pr-4">User identification (Google Analytics)</td>
								<td class="py-2">2 years</td>
							</tr>
							<tr class="border-b border-border/50">
								<td class="py-2 pr-4"><code>_ga_*</code></td>
								<td class="py-2 pr-4">Session state management (Google Analytics)</td>
								<td class="py-2">2 years</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-sm leading-relaxed text-muted-foreground">
					These cookies are only set when you give your consent. If you decline,
					limited anonymous measurement is performed without cookies.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The Service also uses <code>localStorage</code> to save your preferences
					(theme, language, etc.), but this is not a cookie and is never sent to any server.
				</p>
			</section>

			<!-- 4. Purpose of Data Collection -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">4. Purpose of Data Collection</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					We use the collected data solely for:
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>Understanding site usage and making improvements</li>
					<li>Improving user experience</li>
					<li>Identifying and fixing technical issues</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					We do not sell collected data to third parties.
				</p>
			</section>

			<!-- 5. Google Analytics -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">5. Google Analytics</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The Service uses Google Analytics 4, provided by Google LLC.
					Google Analytics uses cookies to analyze how users interact with the site.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					We have implemented Google Consent Mode v2 to control the scope of data
					collection based on your consent preferences.
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>
						Google's Privacy Policy:
						<a
							href="https://policies.google.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary underline-offset-4 hover:underline"
						>https://policies.google.com/privacy</a>
					</li>
					<li>
						Google Analytics opt-out:
						<a
							href="https://tools.google.com/dlpage/gaoptout"
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary underline-offset-4 hover:underline"
						>https://tools.google.com/dlpage/gaoptout</a>
					</li>
				</ul>
			</section>

			<!-- 6. GDPR -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">6. Your Rights Under GDPR (EU Users)</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					If you reside in the European Economic Area (EEA), you have the following rights
					under the General Data Protection Regulation (GDPR):
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li><strong>Right of access</strong> — to request access to your personal data</li>
					<li><strong>Right to rectification</strong> — to request correction of inaccurate data</li>
					<li><strong>Right to erasure</strong> — to request deletion of your data</li>
					<li><strong>Right to restrict processing</strong> — to request restriction of data processing</li>
					<li><strong>Right to data portability</strong> — to request transfer of your data</li>
					<li><strong>Right to object</strong> — to object to data processing</li>
					<li><strong>Right to withdraw consent</strong> — to withdraw cookie consent at any time</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					You can withdraw your cookie consent at any time by clearing the data
					(key: <code>cookie-consent</code>) from your browser's localStorage.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The legal basis for data processing is your consent (GDPR Article 6(1)(a)).
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					To exercise any of these rights, please use the contact form at the bottom of this page.
				</p>
			</section>

			<!-- 7. CCPA -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">7. Your Rights Under CCPA (California Users)</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Under the California Consumer Privacy Act (CCPA), California residents have
					the following rights:
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li><strong>Right to know</strong> — the categories and purposes of personal information collected</li>
					<li><strong>Right to delete</strong> — to request deletion of your personal information</li>
					<li><strong>Right to opt-out</strong> — to opt out of the sale of your personal information</li>
					<li><strong>Right to non-discrimination</strong> — to not be discriminated against for exercising your rights</li>
				</ul>
				<p class="text-sm leading-relaxed text-muted-foreground">
					We do not sell or share your personal information with third parties.
				</p>
				<p class="text-sm leading-relaxed text-muted-foreground">
					To exercise any of these rights, please use the contact form at the bottom of this page.
				</p>
			</section>

			<!-- 8. Data Retention -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">8. Data Retention</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Data collected through Google Analytics is retained for 14 months
					(Google's default setting) and then automatically deleted.
				</p>
			</section>

			<!-- 9. Children's Privacy -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">9. Children's Privacy</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					The Service is not directed at children under the age of 13.
					We do not knowingly collect personal information from children under 13.
				</p>
			</section>

			<!-- 10. Changes to This Policy -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">10. Changes to This Policy</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					This Privacy Policy may be updated from time to time.
					Any significant changes will be communicated on this page.
					We encourage you to review this page periodically.
				</p>
			</section>

			<!-- 11. Contact Us -->
			<section class="space-y-3">
				<h2 class="text-xl font-semibold">11. Contact Us</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					If you have any questions or requests regarding this Privacy Policy,
					please reach out through the contact form below.
					The form accepts the following types of inquiries:
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-muted-foreground">
					<li>Request for disclosure of personal information</li>
					<li>Request for correction, addition, or deletion of personal information</li>
					<li>Request for suspension of use or erasure of personal information</li>
					<li>General questions regarding the Privacy Policy</li>
					<li>Other</li>
				</ul>
				<div class="mt-2">
					<Button
						variant="outline"
						size="sm"
						href="https://docs.google.com/forms/d/e/1FAIpQLSdBDarenhXZ7TeQEDZiS-SbMCcAIA8NlSnT9qrnjdzDly9AjA/viewform?usp=dialog"
						target="_blank"
						rel="noopener noreferrer"
					>
						<ExternalLinkIcon />
						Open Contact Form
					</Button>
				</div>
			</section>
		</article>
	{/if}
</div>
