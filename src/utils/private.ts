import type { EventConsumer } from "../consumer.js";
import type { SubEvent } from "../event.js";

/**
 * Implements proper private properties.
 *
 * @hidden
 */
export class Private<K extends EventConsumer<unknown>, V extends SubEvent> {
  private propMap = new WeakMap<K, V>();

  get(obj: K): V {
    const property = this.propMap.get(obj);
    if (!property) {
      throw new Error("Private property not found");
    }
    return property;
  }

  set(obj: K, val: V) {
    this.propMap.set(obj, val);
  }
}
