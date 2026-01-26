import { NOCLOUD_BASE_URL } from "../lib";
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
 *     const mediaUrl = await NoCloud.upload(file, { customMeta: 'value' });
 *     console.log('File uploaded to:', mediaUrl);
 *   } else {
 *     console.error('NoCloud service is not available.');
 *   }
 * }
 * ```
 */
export class NoCloud {
  private static _storage?: Storage;
  /**
   * Storage module for handling file storage operations.
   */
  static get storage(): Storage {
    return (this._storage ??= new Storage());
  }

  /**
   * Checks if nocloud is installed on the server.
   * @returns {Promise<boolean>} true if available
   */
  static async isAvailable(): Promise<boolean> {
    const response = await fetch(`${NOCLOUD_BASE_URL}/ping`);

    return response.ok;
  }
}
