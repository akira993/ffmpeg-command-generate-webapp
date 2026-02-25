/**
 * Cookie 同意状態管理
 *
 * GA4 Consent Mode v2 と連携して、ユーザーの同意状態に応じた
 * アナリティクス計測モードを制御する。
 *
 * - undecided: 初回訪問（バナー表示）
 * - accepted: 同意済み（Cookie ベースの完全計測）
 * - rejected: 拒否済み（匿名モードで限定計測）
 */

type ConsentStatus = 'undecided' | 'accepted' | 'rejected';

const STORAGE_KEY = 'cookie-consent';

class ConsentStore {
	status = $state<ConsentStatus>('undecided');

	isAccepted = $derived(this.status === 'accepted');
	showBanner = $derived(this.status === 'undecided');

	/** localStorage から同意状態を復元（onMount から呼び出す） */
	init(): void {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === 'accepted' || saved === 'rejected') {
			this.status = saved;
		}

		// 既に同意済みなら GA を完全計測モードに切替
		if (this.status === 'accepted') {
			this.grantAnalytics();
		}
	}

	/** Cookie 同意を承認 */
	accept(): void {
		this.status = 'accepted';
		localStorage.setItem(STORAGE_KEY, 'accepted');
		this.grantAnalytics();
	}

	/** Cookie 同意を拒否（匿名モード継続） */
	reject(): void {
		this.status = 'rejected';
		localStorage.setItem(STORAGE_KEY, 'rejected');
	}

	/** GA4 の analytics_storage を granted に更新 */
	private grantAnalytics(): void {
		if (typeof window.gtag === 'function') {
			window.gtag('consent', 'update', {
				analytics_storage: 'granted'
			});
		}
	}
}

export const consentStore = new ConsentStore();
