<div align="center">
  <img src="https://assets.nonefivem.com/logo/dark-bg.png" alt="NoneM Logo" width="200" />
  
  # @nocloud/cfx-nui
  
  **NoCloud SDK for CFX NUI (FiveM/RedM) - browser environment only**
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
  [![CFX](https://img.shields.io/badge/FiveM-F40552?style=for-the-badge&logo=fivem&logoColor=white)](https://fivem.net/)
  [![RedM](https://img.shields.io/badge/RedM-8B0000?style=for-the-badge&logo=rockstargames&logoColor=white)](https://redm.net/)
</div>

---

## Overview

NoCloud CFX NUI SDK provides a TypeScript client library for interacting with NoCloud services from CFX NUI (browser) contexts. This package enables NUI applications to check service availability, obtain presigned upload URLs, and upload files directly to NoCloud's serverless storage.

### Features

- ☁️ **Cloud Storage** - Upload files directly from NUI to NoCloud's serverless storage
- 🔒 **Signed URLs** - Secure uploads with pre-signed URLs
- ⚡ **Zero Dependencies** - Lightweight, self-contained library
- 🛠️ **TypeScript First** - Full type safety for NUI applications
- 🎯 **Simple API** - Clean, promise-based interface

## Installation

This package is designed to be used in CFX NUI projects.

```bash
bun add @nocloud/cfx-nui
```

## Usage

### Importing

```typescript
import { NoCloud } from "@nocloud/cfx-nui";
```

### Check Service Availability

```typescript
const isAvailable = await NoCloud.isAvailable();
if (isAvailable) {
  console.log("NoCloud service is available");
}
```

### Upload a File

```typescript
async function uploadFile(file: File) {
  try {
    // Check if NoCloud is available
    if (await NoCloud.isAvailable()) {
      // Upload with optional metadata
      const mediaUrl = await NoCloud.storage.upload(file, {
        customMeta: "value",
        userId: "12345"
      });

      console.log("File uploaded to:", mediaUrl);
    } else {
      console.error("NoCloud service is not available");
    }
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
```

### Get Presigned URL

```typescript
const { url, mediaUrl } = await NoCloud.storage.getPresignedUrl(
  "image/png", // Content type
  1024000, // File size in bytes
  {
    // Optional metadata
    category: "screenshots",
    userId: "12345"
  }
);

// url: The presigned URL for uploading
// mediaUrl: The final URL where the file will be accessible
```

### Advanced Upload with Blob

```typescript
// Upload any Blob (e.g., canvas data)
const blob = await fetch(canvasDataUrl).then((r) => r.blob());
const mediaUrl = await NoCloud.storage.upload(blob, {
  type: "canvas-export",
  timestamp: Date.now()
});
```

## API Reference

### `NoCloud.isAvailable()`

Checks if the NoCloud service is available by pinging the service endpoint.

**Returns:** `Promise<boolean>`

**Example:**

```typescript
const available = await NoCloud.isAvailable();
```

### `NoCloud.storage.getPresignedUrl(contentType, size, metadata?)`

Obtains a presigned URL for uploading a file.

**Parameters:**

- `contentType` (string): The MIME type of the file (e.g., `'image/png'`)
- `size` (number): The file size in bytes
- `metadata` (Record<string, any>, optional): Additional metadata for the file

**Returns:** `Promise<{ mediaUrl: string; url: string }>`

- `url`: The presigned URL to upload the file
- `mediaUrl`: The final URL where the uploaded file will be accessible

**Example:**

```typescript
const { url, mediaUrl } = await NoCloud.storage.getPresignedUrl(
  "image/jpeg",
  50000
);
```

### `NoCloud.storage.upload(file, metadata?)`

Uploads a file to NoCloud storage.

**Parameters:**

- `file` (Blob | File): The file or blob to upload
- `metadata` (Record<string, any>, optional): Additional metadata for the file

**Returns:** `Promise<string>` - The media URL of the uploaded file

**Example:**

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const url = await NoCloud.storage.upload(file, { category: "user-uploads" });
```

## Error Handling

All methods throw errors when operations fail. Always wrap calls in try-catch blocks:

```typescript
try {
  const mediaUrl = await NoCloud.storage.upload(file);
  console.log("Success:", mediaUrl);
} catch (error) {
  console.error("Upload failed:", error);
}
```

## License

MIT © [NoCloud](https://dash.nonefivem.com)
