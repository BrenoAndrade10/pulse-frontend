import { ApiError } from '#lib/api/http.js';
import { listInstagramMedia } from '#lib/services/instagramMedia.js';
import type { InstagramPost } from '#lib/types.js';
import { appendNewMedia, mergeFreshMedia } from './mergeMedia.js';

const STALE_AFTER_MS = 60_000;
const MAX_SCAN_REQUESTS = 5;

export class InstagramMediaFeed {
	items = $state<InstagramPost[]>([]);
	nextCursor = $state<string>();
	status = $state<'loading' | 'ready' | 'error'>('loading');
	error = $state<string | null>(null);
	loadingMore = $state(false);
	scanning = $state(false);
	scanStopped = $state(false);
	paginationError = $state<string | null>(null);
	working = $state(false);

	private fetchedAt = 0;
	private busy: Promise<void> | null = null;

	constructor(readonly expertId: string) {}

	get hasMore(): boolean {
		return Boolean(this.nextCursor);
	}

	start(): void {
		if (this.busy) return;
		if (this.status === 'error') return this.retry();
		if (this.status === 'ready' && Date.now() - this.fetchedAt < STALE_AFTER_MS) return;
		void this.exclusive(() => (this.status === 'ready' ? this.refresh() : this.loadFirst()));
	}

	retry(): void {
		this.status = 'loading';
		this.error = null;
		void this.exclusive(() => this.loadFirst());
	}

	loadMore(): void {
		if (!this.nextCursor || this.busy) return;

		void this.exclusive(async () => {
			this.loadingMore = true;
			this.paginationError = null;
			try {
				const page = await listInstagramMedia(this.expertId, { after: this.nextCursor });
				this.append(page.data);
				this.nextCursor = page.paging?.after;
			} catch {
				this.paginationError = 'Não foi possível carregar mais publicações.';
			} finally {
				this.loadingMore = false;
			}
		});
	}

	scanAll(): void {
		if (!this.nextCursor || this.busy || this.scanStopped) return;

		void this.exclusive(async () => {
			this.scanning = true;
			this.paginationError = null;
			try {
				for (let request = 0; request < MAX_SCAN_REQUESTS && this.nextCursor; request++) {
					const page = await listInstagramMedia(this.expertId, {
						after: this.nextCursor,
						limit: 100
					});
					this.append(page.data);
					this.nextCursor = page.paging?.after;
				}
				this.scanStopped = Boolean(this.nextCursor);
			} catch {
				this.paginationError =
					'Não foi possível buscar em todas as publicações. Os resultados mostram só as já carregadas.';
				this.scanStopped = true;
			} finally {
				this.scanning = false;
			}
		});
	}

	continueScan(): void {
		this.scanStopped = false;
		this.scanAll();
	}

	private async loadFirst(): Promise<void> {
		try {
			const page = await listInstagramMedia(this.expertId);
			this.items = page.data;
			this.nextCursor = page.paging?.after;
			this.fetchedAt = Date.now();
			this.status = 'ready';
		} catch (error) {
			this.error = error instanceof ApiError ? error.reason : 'UNEXPECTED_ERROR';
			this.status = 'error';
		}
	}

	private async refresh(): Promise<void> {
		try {
			const page = await listInstagramMedia(this.expertId);
			this.items = mergeFreshMedia(this.items, page.data);
			this.fetchedAt = Date.now();
		} catch {
			//
		}
	}

	private append(items: InstagramPost[]): void {
		this.items.push(...appendNewMedia(this.items, items));
	}

	private async exclusive(task: () => Promise<void>): Promise<void> {
		if (this.busy) await this.busy;

		this.working = true;
		const run = task().finally(() => {
			if (this.busy === run) {
				this.busy = null;
				this.working = false;
			}
		});
		this.busy = run;
		await run;
	}
}
