export type SendResult = 'ok' | 'retry' | 'drop';

export type QueueOptions<E, S> = {
	send: (batch: { sessionSnapshot: S | null; events: E[] }, exit: boolean) => Promise<SendResult>;
	snapshot: (force: boolean) => S | null;
	maxBatch?: number;
	maxQueue?: number;
	maxAttempts?: number;
	flushIntervalMs?: number;
	immediateAt?: number;
	snapshotIntervalMs?: number;
	baseBackoffMs?: number;
	maxBackoffMs?: number;
	now?: () => number;
};

type Item<E> = { event: E; attempts: number };

export class BatchQueue<E, S> {
	private items: Item<E>[] = [];
	private timer: ReturnType<typeof setTimeout> | undefined;
	private timerDue = 0;
	private sending = false;
	private again = false;
	private failures = 0;
	private lastSnapshotAt = 0;
	private destroyed = false;
	private readonly o: Required<Omit<QueueOptions<E, S>, 'send' | 'snapshot'>> &
		Pick<QueueOptions<E, S>, 'send' | 'snapshot'>;

	constructor(options: QueueOptions<E, S>) {
		this.o = {
			maxBatch: 25,
			maxQueue: 200,
			maxAttempts: 5,
			flushIntervalMs: 5000,
			immediateAt: 10,
			snapshotIntervalMs: 25000,
			baseBackoffMs: 2000,
			maxBackoffMs: 60000,
			now: () => Date.now(),
			...options
		};
	}

	get size(): number {
		return this.items.length;
	}

	push(event: E, immediate = false): void {
		if (this.destroyed) return;
		this.items.push({ event, attempts: 0 });
		if (this.items.length > this.o.maxQueue)
			this.items.splice(0, this.items.length - this.o.maxQueue);
		if (immediate || this.items.length >= this.o.immediateAt) this.schedule(0);
		else this.schedule(this.o.flushIntervalMs);
	}

	touch(): void {
		if (this.destroyed || this.timer) return;
		this.schedule(this.o.snapshotIntervalMs);
	}

	private schedule(delay: number): void {
		if (this.destroyed) return;
		const backoff = this.failures > 0 ? this.backoff() : 0;
		const due = this.o.now() + Math.max(delay, backoff);
		if (this.timer && this.timerDue <= due) return;
		if (this.timer) clearTimeout(this.timer);
		this.timerDue = due;
		this.timer = setTimeout(
			() => {
				this.timer = undefined;
				void this.flush();
			},
			Math.max(0, due - this.o.now())
		);
	}

	private backoff(): number {
		return Math.min(this.o.maxBackoffMs, this.o.baseBackoffMs * 2 ** (this.failures - 1));
	}

	async flush(): Promise<void> {
		if (this.destroyed) return;
		if (this.sending) {
			this.again = true;
			return;
		}
		const snapshotDue = this.o.now() - this.lastSnapshotAt >= this.o.snapshotIntervalMs;
		const snapshot = snapshotDue ? this.o.snapshot(false) : null;
		if (!this.items.length && !snapshot) return;
		this.sending = true;
		const batch = this.items.splice(0, this.o.maxBatch);
		let result: SendResult;
		try {
			result = await this.o.send(
				{ sessionSnapshot: snapshot, events: batch.map((i) => i.event) },
				false
			);
		} catch {
			result = 'retry';
		}
		this.sending = false;
		if (result === 'ok') {
			this.failures = 0;
			if (snapshot) this.lastSnapshotAt = this.o.now();
		} else if (result === 'retry') {
			this.failures += 1;
			const keep = batch
				.map((i) => ({ ...i, attempts: i.attempts + 1 }))
				.filter((i) => i.attempts < this.o.maxAttempts);
			this.items = [...keep, ...this.items].slice(-this.o.maxQueue);
			if (this.failures >= this.o.maxAttempts * 2) this.failures = this.o.maxAttempts * 2;
		} else {
			this.failures = 0;
		}
		if (this.items.length && !this.destroyed) {
			const more = this.again || this.items.length >= this.o.maxBatch;
			this.schedule(result === 'retry' ? this.backoff() : more ? 0 : this.o.flushIntervalMs);
		}
		this.again = false;
	}

	exit(): void {
		if (this.destroyed) return;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}
		let first = true;
		do {
			const batch = this.items.splice(0, this.o.maxBatch);
			const snapshot = first ? this.o.snapshot(true) : null;
			first = false;
			if (!batch.length && !snapshot) break;
			void this.o
				.send({ sessionSnapshot: snapshot, events: batch.map((i) => i.event) }, true)
				.catch(() => undefined);
		} while (this.items.length);
		this.lastSnapshotAt = this.o.now();
	}

	destroy(): void {
		this.destroyed = true;
		if (this.timer) clearTimeout(this.timer);
		this.timer = undefined;
		this.items = [];
	}
}
