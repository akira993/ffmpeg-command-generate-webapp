/**
 * contrast.test.ts — デザインシステム総合テスト
 *
 * docs/css-design.md に定義されたルールをすべてテストで担保する。
 *
 * テスト区分:
 *   1. CSS構文ルール (lint-css.sh 相当) — oklch限定・in oklab・hex禁止
 *   2. カラートークン値 — docs/css-design.md の定義値と app.css の一致
 *   3. タイポグラフィ clamp() トークン値 — docs 記載値との一致
 *   4. WCAGコントラスト基準 — ライト/ダーク両テーマ
 *
 * app.css または docs/css-design.md を変更したら、
 * 対応するトークン定数をこのファイルでも更新すること。
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { oklchLuminance, contrastRatio, WCAG } from './contrast';

// ─── ファイルパス ─────────────────────────────────────────────────────────────

const ROOT = resolve(process.cwd());
const CSS_PATH = resolve(ROOT, 'src/app.css');
const cssSource = readFileSync(CSS_PATH, 'utf-8');

// ─── ブロック抽出 ─────────────────────────────────────────────────────────────
// @theme { ... } ブロックと .dark { ... } ブロックをそれぞれ正確に取り出す。

function extractBlock(source: string, startPattern: RegExp): string {
	const startIdx = source.search(startPattern);
	if (startIdx === -1) return '';
	const openIdx = source.indexOf('{', startIdx);
	if (openIdx === -1) return '';
	let depth = 0;
	let i = openIdx;
	while (i < source.length) {
		if (source[i] === '{') depth++;
		else if (source[i] === '}') {
			depth--;
			if (depth === 0) return source.slice(openIdx + 1, i);
		}
		i++;
	}
	return '';
}

const themeBlock = extractBlock(cssSource, /@theme\s*\{/);
const darkBlock  = extractBlock(cssSource, /^\.dark\s*\{/m);

// ─── ヘルパー: ブロック内からトークン値を抽出 ─────────────────────────────────

function extractTokenFrom(block: string, tokenName: string): string | null {
	const re = new RegExp(`${tokenName}\\s*:\\s*([^;]+);`);
	const match = block.match(re);
	return match ? match[1].trim() : null;
}

function extractToken(tokenName: string): string | null {
	return extractTokenFrom(cssSource, tokenName);
}

function extractOklchFrom(block: string, tokenName: string): { l: number; c: number; h: number } | null {
	const raw = extractTokenFrom(block, tokenName);
	if (!raw) return null;
	const m = raw.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
	if (!m) return null;
	return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) };
}

function lum(tok: { l: number; c: number; h: number }): number {
	return oklchLuminance(tok.l, tok.c, tok.h);
}

// ─── 1. CSS構文ルール (docs/css-design.md §1) ────────────────────────────────

describe('CSSデザインルール (docs/css-design.md §1)', () => {
	it('lint-css.sh が PASSED を返す（hex・rgb/hsl禁止・in oklab必須）', () => {
		let output = '';
		let exitCode = 0;
		try {
			output = execSync('bash scripts/lint-css.sh', {
				cwd: ROOT,
				encoding: 'utf-8'
			});
		} catch (e: any) {
			output = e.stdout ?? '';
			exitCode = e.status ?? 1;
		}
		expect(exitCode, `lint-css.sh が失敗しました:\n${output}`).toBe(0);
		expect(output).toContain('PASSED');
	});

	it('app.css に hex カラー (#xxx) が含まれない', () => {
		const hexMatches = cssSource
			.split('\n')
			.filter((line: string) => !line.trimStart().startsWith('*') && !line.trimStart().startsWith('/*'))
			.filter((line: string) => /#[0-9a-fA-F]{3,8}\b/.test(line));
		expect(hexMatches, `hex カラーが検出されました:\n${hexMatches.join('\n')}`).toHaveLength(0);
	});

	it('app.css に rgb()/rgba()/hsl()/hsla() が含まれない', () => {
		const rgbMatches = cssSource
			.split('\n')
			.filter((line: string) => !line.trimStart().startsWith('*') && !line.trimStart().startsWith('/*'))
			.filter((line: string) => /\b(rgb|rgba|hsl|hsla)\s*\(/i.test(line));
		expect(rgbMatches, `rgb/hsl カラーが検出されました:\n${rgbMatches.join('\n')}`).toHaveLength(0);
	});

	it('app.css のグラデーションはすべて "in oklab" を使用している', () => {
		const lines = cssSource.split('\n');
		const violations: string[] = [];
		lines.forEach((line: string, i: number) => {
			if (/gradient\(/.test(line) && !/^\s*[/*]/.test(line)) {
				const block = lines.slice(i, i + 4).join('\n');
				if (!/in oklab/.test(block)) {
					violations.push(`行 ${i + 1}: ${line.trim()}`);
				}
			}
		});
		expect(violations, `"in oklab" なしのグラデーション:\n${violations.join('\n')}`).toHaveLength(0);
	});
});

// ─── 2. カラートークン値 (docs/css-design.md §2) ─────────────────────────────
//
// docs に明示された値のみ検証する。
// 値を変更するときは docs/css-design.md と本テストを同時に更新すること。

describe('ライトテーマ トークン値 (docs §2.2)', () => {
	const LIGHT_TOKENS: Record<string, string> = {
		'--color-background':  'oklch(0.985 0.006 290)',
		'--color-foreground':  'oklch(0.22 0.01 280)',
		'--color-primary':     'oklch(0.55 0.14 290)',
		'--color-secondary':   'oklch(0.94 0.025 350)',
		'--color-accent':      'oklch(0.94 0.03 170)',
		'--color-destructive': 'oklch(0.62 0.20 25)'
	};

	for (const [token, expected] of Object.entries(LIGHT_TOKENS)) {
		it(`${token} が docs 定義値 "${expected}" と一致する`, () => {
			const actual = extractTokenFrom(themeBlock, token);
			expect(actual, `${token} が @theme ブロックに見つからない`).not.toBeNull();
			expect(actual).toBe(expected);
		});
	}
});

describe('ダークテーマ トークン値 (docs §2.3)', () => {
	const DARK_TOKENS: Record<string, string> = {
		'--color-background':  'oklch(0.13 0.02 280)',
		'--color-foreground':  'oklch(0.92 0.01 260)',
		'--color-accent':      'oklch(0.78 0.15 195)',
		'--color-destructive': 'oklch(0.58 0.24 20)'
	};

	for (const [token, expected] of Object.entries(DARK_TOKENS)) {
		it(`${token} が docs 定義値 "${expected}" と一致する`, () => {
			const actual = extractTokenFrom(darkBlock, token);
			expect(actual, `${token} が .dark ブロックに見つからない`).not.toBeNull();
			expect(actual).toBe(expected);
		});
	}
});

// ─── 3. タイポグラフィ clamp() トークン (docs/css-design.md §3) ──────────────

describe('タイポグラフィ clamp() トークン (docs §3)', () => {
	const TYPO_TOKENS: Record<string, string> = {
		'--text-xs':   'clamp(0.6875rem, 0.65rem + 0.1vw, 0.75rem)',
		'--text-sm':   'clamp(0.8125rem, 0.775rem + 0.15vw, 0.875rem)',
		'--text-base': 'clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)',
		'--text-lg':   'clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)',
		'--text-xl':   'clamp(1.1875rem, 1.1rem + 0.4vw, 1.25rem)',
		'--text-2xl':  'clamp(1.375rem, 1.25rem + 0.5vw, 1.5rem)',
		'--text-3xl':  'clamp(1.75rem, 1.6rem + 0.65vw, 1.875rem)'
	};

	for (const [token, expected] of Object.entries(TYPO_TOKENS)) {
		it(`${token} が docs 定義値と一致する`, () => {
			const actual = extractToken(token);
			expect(actual, `${token} が app.css に見つからない`).not.toBeNull();
			expect(actual).toBe(expected);
		});
	}
});

// ─── 4. WCAGコントラスト基準 (docs/css-design.md §2) ────────────────────────

describe('ライトモード: プライマリボタン (WCAG)', () => {
	it('primaryForeground on primary が WCAG AA (4.5:1) を満たす', () => {
		const bg = extractOklchFrom(themeBlock, '--color-primary');
		const fg = extractOklchFrom(themeBlock, '--color-primary-foreground');
		expect(bg, '--color-primary が @theme に見つからない').not.toBeNull();
		expect(fg, '--color-primary-foreground が @theme に見つからない').not.toBeNull();
		const ratio = contrastRatio(lum(bg!), lum(fg!));
		expect(ratio, `コントラスト比 ${ratio.toFixed(2)}:1 — AA基準 4.5:1 未達`).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
	});
});

describe('ダークモード: プライマリボタン (WCAG)', () => {
	it('primaryForeground on primary が WCAG AA (4.5:1) を満たす', () => {
		const bg = extractOklchFrom(darkBlock, '--color-primary');
		const fg = extractOklchFrom(darkBlock, '--color-primary-foreground');
		expect(bg, '.dark の --color-primary が見つからない').not.toBeNull();
		expect(fg, '.dark の --color-primary-foreground が見つからない').not.toBeNull();
		const ratio = contrastRatio(lum(bg!), lum(fg!));
		expect(ratio, `コントラスト比 ${ratio.toFixed(2)}:1 — AA基準 4.5:1 未達`).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
	});

	it('primaryForeground on primary が WCAG AAA (7.0:1) を満たす', () => {
		const bg = extractOklchFrom(darkBlock, '--color-primary');
		const fg = extractOklchFrom(darkBlock, '--color-primary-foreground');
		const ratio = contrastRatio(lum(bg!), lum(fg!));
		expect(ratio, `コントラスト比 ${ratio.toFixed(2)}:1 — AAA基準 7.0:1 未達`).toBeGreaterThanOrEqual(WCAG.AAA_NORMAL);
	});
});

describe('ライトモード: ページ本文 (WCAG)', () => {
	it('foreground on background が WCAG AA (4.5:1) を満たす', () => {
		const bg = extractOklchFrom(themeBlock, '--color-background');
		const fg = extractOklchFrom(themeBlock, '--color-foreground');
		expect(bg).not.toBeNull();
		expect(fg).not.toBeNull();
		const ratio = contrastRatio(lum(bg!), lum(fg!));
		expect(ratio, `コントラスト比 ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
	});
});

describe('ダークモード: ページ本文 (WCAG)', () => {
	it('foreground on background が WCAG AA (4.5:1) を満たす', () => {
		const bg = extractOklchFrom(darkBlock, '--color-background');
		const fg = extractOklchFrom(darkBlock, '--color-foreground');
		const ratio = contrastRatio(lum(bg!), lum(fg!));
		expect(ratio, `コントラスト比 ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
	});
});

// ─── ユーティリティ単体テスト ────────────────────────────────────────────────

describe('コントラスト計算ユーティリティ', () => {
	it('黒と白のコントラスト比は 21:1', () => {
		const black = oklchLuminance(0, 0, 0);
		const white = oklchLuminance(1, 0, 0);
		expect(contrastRatio(black, white)).toBeCloseTo(21, 0);
	});

	it('同色のコントラスト比は 1:1', () => {
		const gray = oklchLuminance(0.5, 0, 0);
		expect(contrastRatio(gray, gray)).toBeCloseTo(1, 5);
	});
});
