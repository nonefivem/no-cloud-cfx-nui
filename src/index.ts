import { NoCloud } from "./sdk";

declare global {
  interface Window {
    NoCloud: NoCloud;
  }
}

export * from "./lib/errors";
export * from "./sdk";
export * from "./types";

window.NoCloud = NoCloud;

export default NoCloud;
