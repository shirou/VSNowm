import { ExecException } from "child_process";

type StringSearchOptions = {
  query: string;
};

type RegexSearchOptions = {
  regex: string;
};

type LocatorOptions = StringSearchOptions | RegexSearchOptions;

export type Options = LocatorOptions & {
  globs?: Array<string>;
  fileType?: string | Array<string>;
  multiline?: boolean;
};

export type RipgrepJsonSubmatch = {
  match: { text: string };
  start: number;
  end: number;
};

export type RipGrepJsonMatch = {
  type: "match";
  data: {
    path: {
      text: string;
    };
    lines: {
      text: string;
    };
    // eslint-disable-next-line
    line_number: number;
    // eslint-disable-next-line
    absolute_offset: number;
    submatches: Array<RipgrepJsonSubmatch>;
  };
};

export type Match = RipGrepJsonMatch["data"];

export class RipGrepError {
  private error: ExecException;

  stderr: string;

  constructor(error: ExecException, stderr: string) {
    this.error = error;
    this.stderr = stderr;
  }

  get message(): string {
    return this.error.message;
  }
}
