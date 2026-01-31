import { NoCloudAPIError, NoCloudResourceIsNotFound } from "./lib";
import { NoCloud } from "./sdk";
import type { Ctor } from "./types";

declare global {
  interface Window {
    NoCloud: NoCloud;
    NoCloudAPIError: Ctor<NoCloudAPIError>;
    NoCloudResourceIsNotFound: Ctor<NoCloudResourceIsNotFound>;
  }
}

export * from "./lib/errors";
export * from "./sdk";
export * from "./types";

window.NoCloud = NoCloud;
window.NoCloudAPIError = NoCloudAPIError;
window.NoCloudResourceIsNotFound = NoCloudResourceIsNotFound;

export default NoCloud;
