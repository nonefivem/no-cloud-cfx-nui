export class NoCloudAPIError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "NoCloudAPIError";
  }
}

export class NoCloudResourceIsNotFound extends Error {
  constructor() {
    super("nocloud is not available on the server");
    this.name = "NoCloudResourceIsNotFound";
  }
}
