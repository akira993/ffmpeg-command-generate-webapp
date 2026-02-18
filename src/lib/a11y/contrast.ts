/**
 * a11y/contrast.ts — WCAG 2.1 コントラスト比計算ユーティリティ
 *
 * oklch() カラー値を相対輝度に変換し、WCAG 2.1 基準のコントラスト比を算出する。
 * テストおよびランタイムのデザイントークン検証に使用。
 *
 * WCAG 2.1 基準:
 *   - AA 通常テキスト: 4.5:1 以上
 *   - AA 大きなテキスト / UI コンポーネント: 3:1 以上
 *   - AAA 通常テキスト: 7:1 以上
 */

/** oklch → linear sRGB → 相対輝度 */
export function oklchLuminance(l: number, c: number, h: number): number {
	const hRad = (h * Math.PI) / 180;
	const a = c * Math.cos(hRad);
	const b = c * Math.sin(hRad);

	// OKLab → LMS (cube root space)
	const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = l - 0.0894841775 * a - 1.291485548 * b;

	// LMS³ → linear sRGB
	const lc = l_ ** 3;
	const mc = m_ ** 3;
	const sc = s_ ** 3;

	const r = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
	const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
	const bv = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;

	// linear sRGB → 相対輝度（WCAG 式）
	const toLinear = (v: number) => {
		const clamped = Math.max(0, v);
		return clamped <= 0.04045 ? clamped / 12.92 : ((clamped + 0.055) / 1.055) ** 2.4;
	};

	return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(bv);
}

/**
 * WCAG 2.1 コントラスト比を返す
 * @returns 1.0 〜 21.0 の範囲
 */
export function contrastRatio(lum1: number, lum2: number): number {
	const [lighter, darker] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
	return (lighter + 0.05) / (darker + 0.05);
}

export const WCAG = {
	/** UI コンポーネント・大きなテキスト (AA) */
	AA_LARGE: 3.0,
	/** 通常テキスト (AA) */
	AA_NORMAL: 4.5,
	/** 通常テキスト (AAA) */
	AAA_NORMAL: 7.0
} as const;
