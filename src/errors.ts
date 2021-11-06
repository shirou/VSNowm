import { ExecException } from "child_process";

// Base error class
export class BaseError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

export class GitUninitlizedError extends BaseError {}
export class GitManualRequiredError extends BaseError {}
export class GitSyncerError extends BaseError {
  constructor(public stderr: string, e?: ExecException) {
    super(e?.message);
  }
}
