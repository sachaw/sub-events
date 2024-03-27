import type { EmitOptions, EventOptions, Subscriber } from "./event.js";
import { SubEvent } from "./event.js";

/**
 * Represents a change in the number of subscriptions, as used with [[onCount]] event.
 */
export interface SubCountChange {
  /**
   * New number of subscriptions.
   */
  newCount: number;

  /**
   * Previous number of subscriptions.
   */
  prevCount: number;
}

/**
 * Constructor options for [[SubEventCount]] class.
 */
export interface CountOptions<T> extends EventOptions<T> {
  /**
   * Emit options for event [[onCount]].
   */
  emitOptions?: EmitOptions;
}

/**
 * ### class SubEventCount\<T = unknown\> extends SubEvent\<T\>
 *
 * Extends [[SubEvent]] with event [[onCount]], to observe the number of subscriptions.
 */
export class SubEventCount<T = unknown> extends SubEvent<T> {
  /**
   * @hidden
   */
  protected _notify: (data: SubCountChange) => SubEvent<SubCountChange>;

  /**
   * Triggered on any change in the number of subscriptions.
   * @event onCount
   */
  readonly onCount: SubEvent<SubCountChange> = new SubEvent();

  /**
   * @constructor
   * Event constructor.
   *
   * @param options
   * Configuration Options.
   */
  constructor(options?: CountOptions<T>) {
    super(options);
    const eo = options?.emitOptions;
    this._notify = (data: SubCountChange) => this.onCount.emit(data, eo);
  }

  /**
   * Cancels all existing subscriptions for the event.
   *
   * It overrides the base implementation, to trigger event [[onCount]]
   * when there was at least one subscription.
   *
   * @returns
   * Number of subscriptions cancelled.
   *
   * @see [[cancel]]
   */
  public cancelAll(): number {
    const prevCount = this.count;
    if (prevCount) {
      super.cancelAll();
      this._notify({ newCount: 0, prevCount });
    }
    return prevCount;
  }

  /**
   * Overrides base implementation, to trigger event [[onCount]] during
   * `subscribe` and `cancel` calls.
   * @hidden
   */
  protected _createCancel(sub: Subscriber<T>): () => void {
    const s = this._subs;
    this._notify({ newCount: s.length, prevCount: s.length - 1 });
    return () => {
      this._cancelSub(sub);
      this._notify({ newCount: s.length, prevCount: s.length + 1 });
    };
  }
}
