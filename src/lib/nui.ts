import { NOCLOUD_BASE_URL } from "./constants";
import type { NuiResponse } from "../types";

/**
 * Calls one of the nocloud resource's NUI callbacks.
 *
 * The request never leaves the machine - it reaches the client script, which
 * answers from what it already holds.
 *
 * @param event - The callback's name, e.g. `flags.getFlags`.
 * @param body - The callback's body, sent as JSON.
 * @returns The reply, or an `ok: false` reply when nocloud is not installed or
 * the callback could not be reached.
 */
export async function nuiCallback<T>(
  event: string,
  body: unknown = {}
): Promise<NuiResponse<T>> {
  try {
    const response = await fetch(`${NOCLOUD_BASE_URL}/${event}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return { ok: false, message: "nocloud is not available on the server" };
    }

    return (await response.json()) as NuiResponse<T>;
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
