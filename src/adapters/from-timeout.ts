import { SubEvent } from "../index.js";
import type {
  EmitOptions,
  SubContext,
  SubOptions,
  SubFunction,
  Subscription,
} from "../index.js";

/**
 * Returns a new TimeoutEvent that triggers a fresh setTimeout on each subscribe,
 * and cancels the subscription after the timer event.
 *
 * And if the client cancels the subscription first, the event won't happen.
 */
export function fromTimeout(timeout = 0, options?: EmitOptions): TimeoutEvent {
  return new TimeoutEvent(timeout, options);
}

/**
 * Implements a timeout event, with automatically cancelled subscriptions.
 *
 * A new timeout is started for every fresh subscriber.
 */
export class TimeoutEvent extends SubEvent<void> {
  constructor(timeout = 0, options?: EmitOptions) {
    const onSubscribe = (ctx: SubContext<void>) => {
      ctx.data = setTimeout(() => {
        ctx.event.emit(undefined, options);
      }, timeout);
    };
    const onCancel = (ctx: SubContext<void>) => {
      clearTimeout(ctx.data as number);
    };
    super({ onSubscribe, onCancel });
  }

  subscribe(cb: SubFunction<void>, options?: SubOptions): Subscription {
    const sub = super.subscribe(() => {
      sub.cancel();
      return cb.call(options?.thisArg);
    }, options);
    return sub;
  }
}
