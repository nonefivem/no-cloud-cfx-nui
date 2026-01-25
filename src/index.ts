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
  constructor() {
    throw new Error(
      "NoCloud is a static class and cannot be instantiated. Use its static methods directly."
    );
  }

  /**
   * Checks if NoCloud service is available.
   * @returns {Promise<boolean>} Promise that resolves to true if available, false otherwise.
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("https://nocloud/ping");

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Obtains a presigned URL for uploading a file.
   * @param contentType - The MIME type of the file to be uploaded.
   * @param size - The size of the file in bytes.
   * @param metadata - Optional metadata associated with the file.
   * @returns {Promise<{ mediaUrl: string; url: string }>} An object containing the media URL and the presigned URL.
   */
  static async getPresignedUrl(
    contentType: string,
    size: number,
    metadata?: Record<string, any>
  ): Promise<{ mediaUrl: string; url: string }> {
    const response = await fetch("https://nocloud/request.signedUrl", {
      method: "POST",
      body: JSON.stringify({ contentType, size, metadata }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    const data = await response.json();

    return data;
  }

  /**
   * Uploads a file to NoCloud using a presigned URL.
   * @param file - The file to be uploaded.
   * @param metadata - Optional metadata associated with the file.
   * @returns {Promise<string>} A promise that resolves to the media URL of the uploaded file.
   */
  static async upload(
    file: Blob | File,
    metadata?: Record<string, any>
  ): Promise<string> {
    const { url, mediaUrl } = await this.getPresignedUrl(
      file.type,
      file.size,
      metadata
    );
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type
      },
      body: file
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return mediaUrl;
  }
}
