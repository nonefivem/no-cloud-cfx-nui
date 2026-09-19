import { NOCLOUD_BASE_URL } from "../lib";
import { Flags } from "./flags";
import { Storage } from "./storage";

/**
 * NoCloud SDK for CFX NUI.
 * Provides methods to interact with NoCloud services such as checking availability,
 * obtaining presigned URLs, and uploading files.
 * @example
 * ```ts
 * import { NoCloud } from '@nocloud/cfx-nui';
 *
 * async function uploadFile(file: File) {
 *   if (await NoCloud.isAvailable()) {
 *     const mediaUrl = await NoCloud.storage.upload(file, { customMeta: 'value' });
 *     console.log('File uploaded to:', mediaUrl);
 *   } else {
 *     console.error('NoCloud service is not available.');
 *   }
 * }
 *
 * async function hasNewHud() {
 *   return NoCloud.flags.isFlagEnabled('new-hud');
 * }
 * ```
 */
export class NoCloud {
  private static _storage?: Storage;
  private static _flags?: Flags;
  /**
   * Storage module for handling file storage operations.
   */
  static get storage(): Storage {
    return (this._storage ??= new Storage());
  }

  /**
   * Feature flags module for reading the flags this client holds.
   */
  static get flags(): Flags {
    return (this._flags ??= new Flags());
  }

  /**
   * Checks if nocloud is installed on the server.
   * @returns {Promise<boolean>} true if available
   */
  static async isAvailable(): Promise<boolean> {
    const response = await fetch(`${NOCLOUD_BASE_URL}/ping`, {
      method: "POST"
    });

    return response.ok;
  }
}
