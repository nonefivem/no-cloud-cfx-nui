import { nuiCallback } from "../lib";
import type { FlagValue, FlagValues } from "../types";

/**
 * Feature flags module.
 *
 * Reads reach the nocloud client script's copy of replicated state, so a read
 * is a local round trip rather than a request to anything - cheap, but not
 * free. Read what you need once rather than per frame, and read again when you
 * need it current.
 *
 * A read never throws: a missing flag, a server that does not have nocloud
 * installed, or a callback that could not be reached all answer with the
 * fallback - so a flag archived in the dashboard can never break a UI. Use
 * {@link Flags.areFlagsReady} when you need to tell those cases apart.
 *
 * Only `shared` flags reach a client. A `server` flag is never published, and
 * reads here behave exactly like a flag that does not exist.
 */
export class Flags {
  /**
   * Reads every flag this client holds.
   * @returns {Promise<FlagValues>} Every readable flag, keyed by flag key, or
   * an empty object when there are none to read.
   */
  async getFlags(): Promise<FlagValues> {
    const response = await nuiCallback<FlagValues>("flags.getFlags");

    return response.ok ? response.payload : {};
  }

  /**
   * Reads one flag's value, whatever its type.
   * @param key - The flag's key.
   * @param fallback - Returned when the flag is missing or unreadable.
   * @returns {Promise<FlagValue>} The flag's value, or the fallback.
   */
  async getFlagValue(
    key: string,
    fallback: FlagValue = null
  ): Promise<FlagValue> {
    const response = await nuiCallback<FlagValue>("flags.getFlagValue", {
      key,
      fallback
    });

    // The client answers a missing flag with the fallback we sent it, so the
    // only fallback left to apply here is for a reply that never came.
    return response.ok ? response.payload : fallback;
  }

  /**
   * Checks whether a boolean flag is on.
   *
   * A missing flag, or one holding another type, reads as the fallback.
   *
   * @param key - The flag's key.
   * @param fallback - Returned when the flag is not a readable boolean flag.
   * @returns {Promise<boolean>} Whether the flag is on.
   */
  async isFlagEnabled(key: string, fallback = false): Promise<boolean> {
    const response = await nuiCallback<boolean>("flags.isFlagEnabled", {
      key,
      fallback
    });

    return response.ok ? response.payload : fallback;
  }

  /**
   * Checks whether the server has published any flags yet.
   *
   * Reads before this is true fall back, so this is what to wait on when a UI
   * would rather show nothing than show a fallback.
   *
   * @returns {Promise<boolean>} Whether there are flags to read.
   */
  async areFlagsReady(): Promise<boolean> {
    const response = await nuiCallback<boolean>("flags.areFlagsReady");

    return response.ok && response.payload;
  }
}
