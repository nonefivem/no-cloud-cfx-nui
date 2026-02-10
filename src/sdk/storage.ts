import {
  decodeBase64,
  detectBase64MimeType,
  extractBase64Data,
  NOCLOUD_BASE_URL,
  NoCloudAPIError,
  NoCloudResourceIsNotFound,
  normalizeMimeType,
  populateMetadataAttachments
} from "../lib";
import type {
  FileBody,
  FileMetadata,
  SignedUrlResponse,
  UploadResponse
} from "../types";

/**
 * Storage module for handling file storage operations.
 */
export class Storage {
  /**
   * Generates a signed URL for uploading a file.
   * @param contentType - The MIME type of the file.
   * @param size - The size of the file in bytes.
   * @param metadata - Optional metadata associated with the file.
   * @returns {Promise<SignedUrlResponse>} An object containing the signed URL and its expiration time.
   * @throws {NoCloudAPIError} If the API request fails.
   * @throws {NoCloudIsNotFound} If nocloud is not available in the server.
   */
  async generateSignedUrl(
    contentType: string,
    size: number,
    metadata?: FileMetadata
  ): Promise<SignedUrlResponse> {
    const response = await fetch(
      `${NOCLOUD_BASE_URL}/storage.requestSignedUrl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contentType,
          size,
          metadata: populateMetadataAttachments(metadata)
        })
      }
    );

    if (!response.ok) {
      throw new NoCloudResourceIsNotFound();
    }

    const data = await response.json();

    if (!data.ok) {
      throw new NoCloudAPIError("Failed to generate signed url", 500);
    }

    const payload = data.payload as SignedUrlResponse;

    return payload;
  }

  /**
   * Extracts content type, size, and normalized body from the input.
   * For base64 strings, this decodes them to binary.
   */
  private getBodyInfo(body: FileBody): {
    contentType: string;
    size: number;
    normalizedBody: Blob | ArrayBuffer;
  } {
    if (typeof Blob !== "undefined" && body instanceof Blob) {
      return {
        contentType: normalizeMimeType(body.type) || "application/octet-stream",
        size: body.size,
        normalizedBody: body
      };
    }
    if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
      return {
        contentType: "application/octet-stream",
        size: body.byteLength,
        normalizedBody: body
      };
    }
    if (typeof body === "string") {
      const detectedType = detectBase64MimeType(body);
      if (detectedType) {
        // It's base64 - decode to binary
        const rawBase64 = extractBase64Data(body);
        const decoded = decodeBase64(rawBase64);
        return {
          contentType: detectedType,
          size: decoded.byteLength,
          normalizedBody: new Blob([decoded.buffer as ArrayBuffer])
        };
      }
      const encoded = new TextEncoder().encode(body);
      return {
        contentType: "text/plain",
        size: encoded.length,
        normalizedBody: new Blob([encoded.buffer as ArrayBuffer])
      };
    }
    throw new NoCloudAPIError("Unsupported body type", 400);
  }

  /**
   * Uploads a file to R2 storage using S3-compatible API.
   * @param body The file body to upload. Supports File, Blob, ArrayBuffer, or string.
   * @param metadata Optional metadata associated with the file.
   * @returns {Promise<UploadResponse>} An object containing the upload ID and URL.
   * @throws {NoCloudAPIError} If the upload fails.
   */
  async upload(
    body: FileBody,
    metadata?: FileMetadata
  ): Promise<UploadResponse> {
    const { contentType, size, normalizedBody } = this.getBodyInfo(body);
    const { url, mediaUrl, mediaId } = await this.generateSignedUrl(
      contentType,
      size,
      metadata
    );

    const uploadResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Length": size.toString()
      },
      body: normalizedBody
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse
        .text()
        .catch(() => uploadResponse.statusText);
      throw new NoCloudAPIError(
        `Failed to upload file to R2: ${errorText}`,
        uploadResponse.status
      );
    }

    return { id: mediaId, url: mediaUrl };
  }
}
