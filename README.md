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

NoCloud CFX NUI SDK provides a TypeScript client library for interacting with NoCloud services from CFX NUI (browser) contexts. This package enables NUI applications to check service availability, obtain presigned upload URLs, upload files directly to NoCloud's serverless storage, and read the server's feature flags.

### Features

- ☁️ **Cloud Storage** - Upload files directly from NUI to NoCloud's serverless storage
- 🔒 **Signed URLs** - Secure uploads with pre-signed URLs
- 🚩 **Feature Flags** - Read the flags your server holds, without a request leaving the machine
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

### Feature Flags

A feature flag is a named, typed value you flip in the
[dashboard](https://dash.nonefivem.com). The server fetches them and publishes
the shared ones to its clients, so reading one from the NUI reaches the client
script's copy and never the API.

```typescript
if (await NoCloud.flags.isFlagEnabled("new-hud")) {
  renderNewHud();
}

const motd = await NoCloud.flags.getFlagValue("motd", "Welcome");
const all = await NoCloud.flags.getFlags();
```

A read is a local round trip rather than a request to anything - cheap, but not
free. Read what you need once rather than per frame, and read again when you
need it current. There is no change event: a UI that wants current values reads
again.

Reads never throw. A missing flag, a server without `nocloud` installed, or a
callback that could not be reached all answer with the fallback, so a flag
archived in the dashboard can never break a UI. When you would rather show
nothing than show a fallback, wait on `areFlagsReady()` first:

```typescript
if (await NoCloud.flags.areFlagsReady()) {
  // the server has published its flags
}
```

> **Note:** Only `shared` flags reach a client. A `server` flag is never
> published, and reads here behave exactly like a flag that does not exist.

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

### `NoCloud.flags.getFlags()`

Reads every flag this client holds.

**Returns:** `Promise<FlagValues>` - every readable flag keyed by flag key, or `{}` when there are none to read

**Example:**

```typescript
const flags = await NoCloud.flags.getFlags();
```

### `NoCloud.flags.getFlagValue(key, fallback?)`

Reads one flag's value, whatever its type.

**Parameters:**

- `key` (string): The flag's key
- `fallback` (FlagValue, optional): Returned when the flag is missing or unreadable. Defaults to `null`

**Returns:** `Promise<FlagValue>` - the flag's value, or the fallback

**Example:**

```typescript
const maxPlayers = await NoCloud.flags.getFlagValue("max-players", 32);
```

### `NoCloud.flags.isFlagEnabled(key, fallback?)`

Checks whether a boolean flag is on. A missing flag, or one holding another type, reads as the fallback.

**Parameters:**

- `key` (string): The flag's key
- `fallback` (boolean, optional): Returned when the flag is not a readable boolean flag. Defaults to `false`

**Returns:** `Promise<boolean>`

**Example:**

```typescript
const enabled = await NoCloud.flags.isFlagEnabled("new-hud");
```

### `NoCloud.flags.areFlagsReady()`

Checks whether the server has published any flags yet. Reads before this is true fall back.

**Returns:** `Promise<boolean>`

**Example:**

```typescript
const ready = await NoCloud.flags.areFlagsReady();
```

## Error Handling

Storage methods throw errors when operations fail. Always wrap calls in try-catch blocks:

```typescript
try {
  const mediaUrl = await NoCloud.storage.upload(file);
  console.log("Success:", mediaUrl);
} catch (error) {
  console.error("Upload failed:", error);
}
```

Flag reads are the exception - they never throw, and answer with the fallback
when they cannot be served. See [Feature Flags](#feature-flags).

## License

MIT © [NoCloud](https://dash.nonefivem.com)
