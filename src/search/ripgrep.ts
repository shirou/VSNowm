// This files is modified version of
// https://github.com/alexlafroscia/ripgrep-js

import { exec } from "child_process";
import { RipGrepError, Match, Options } from "./ripgrep_types";

import { rgPath } from "vscode-ripgrep";

export * from "./ripgrep_types";

const formatResults = (stdout: string): Match[] => {
  stdout = stdout.trim();

  if (!stdout) {
    return [];
  }

  return stdout
    .split("\n")
    .map((line) => JSON.parse(line))
    .filter((jsonLine) => jsonLine.type === "match")
    .map((jsonLine) => jsonLine.data);
};

export const ripGrep = async (
  cwd: string,
  optionsOrSearchTerm: Options | string
): Promise<Array<Match>> => {
  let options: Options;
  const execBuf = [`${rgPath}`, "--json"];

  if (typeof optionsOrSearchTerm === "string") {
    options = {
      query: optionsOrSearchTerm,
    };
  } else {
    options = optionsOrSearchTerm;
  }

  if (!cwd) {
    return Promise.reject(new Error("No `cwd` provided"));
  }

  if ("regex" in options) {
    execBuf.push("-e", options.regex);
  } else if ("query" in options) {
    execBuf.push("-F", options.query);
  }
  console.log(options);
  console.log(execBuf);

  if (options.fileType) {
    if (!Array.isArray(options.fileType)) {
      options.fileType = [options.fileType];
    }
    for (const fileType of options.fileType) {
      execBuf.push("-t", fileType);
    }
  }

  if (options.globs) {
    options.globs.map((glob) => {
      execBuf.push("-g", glob);
    });
  }

  if (options.multiline) {
    execBuf.push("--multiline");
  }

  execBuf.push(cwd); // need to specify path

  return new Promise(function (resolve, reject) {
    const execString = execBuf.join(" ");
    console.log(execString);
    exec(execString, { cwd: cwd, timeout: 30000 }, (error, stdout, stderr) => {
      console.log(error, stdout);
      if (!error || (error && stderr === "")) {
        resolve(formatResults(stdout));
      } else {
        reject(new RipGrepError(error, stderr));
      }
    });
  });
};
