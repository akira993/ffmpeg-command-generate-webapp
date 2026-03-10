/**
 * CompactStore — PWA コンパクトモード管理
 *
 * PWA スタンドアロン時のみ有効。
 * ウィンドウを 1:3 縦長にリサイズし、UI を圧縮する。
 */

class CompactStore {
	isCompact = $state(false);
	isPWA = $state(false);

	private previousSize: { width: number; height: number } | null = null;

	/** onMount 内で呼び出す（window が必要なため SSR 不可） */
	init(): void {
		this.isPWA =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true;
	}

	/** コンパクトモードをトグル */
	toggle(): void {
		if (!this.isPWA) return;

		if (this.isCompact) {
			if (this.previousSize) {
				window.resizeTo(this.previousSize.width, this.previousSize.height);
			}
			this.isCompact = false;
		} else {
			this.previousSize = {
				width: window.outerWidth,
				height: window.outerHeight
			};
			const { width, height } = this.calculateCompactSize();
			window.resizeTo(width, height);
			this.isCompact = true;
		}
	}

	private calculateCompactSize(): { width: number; height: number } {
		const screenH = window.screen.availHeight;
		const screenW = window.screen.availWidth;
		const ratio = 3;

		let h = screenH;
		let w = Math.round(h / ratio);

		if (w > screenW) {
			w = screenW;
			h = Math.round(w * ratio);
		}

		return { width: w, height: h };
	}
}

export const compactStore = new CompactStore();
