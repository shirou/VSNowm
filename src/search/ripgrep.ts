import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";
import { RipGrepError, Match, Options } from "./ripgrep_types";

import { rgPath } from "vscode-ripgrep";

import { Searcher } from "./index";
import { TaskTreeItem } from "../models/tasks";
import { LinkTreeItem, LinkQuickPickItem } from "../models/links";

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

export class RipGrep implements Searcher {
  readonly ext: string;

  constructor(ext: string) {
    this.ext = ext;
  }

  async searchTodo(root: string) {
    const execBuf = [`${rgPath}`, "--json"];
    execBuf.push("-g", `*\.${this.ext}`);
    execBuf.push("-e", String.raw`'^- \[ \]'`);

    const matches = await this.exec(execBuf, root);

    return matches.map((match) => {
      const label = match.lines.text.replace("- [ ]", "");

      return new TaskTreeItem(
        label,
        match.path.text,
        match.line_number - 1 // ripgrep start from 1
      );
    });
  }

  async searchLinks(root: string, link: string) {
    const execBuf = [`${rgPath}`, "--json"];
    execBuf.push("-g", `*\.${this.ext}`);
    execBuf.push("-e", String.raw`'\[\[${link}\]\]'`);

    const matches = await this.exec(execBuf, root);

    return matches
      .map((match) => {
        // submatches might be multiple
        return match.submatches.map((m) => {
          return {
            label: match.lines.text,
            filePath: match.path.text, // rg returns abs path
            lineNumber: match.line_number - 1,
            columns: m.start,
          } as LinkQuickPickItem;
        });
      })
      .flat(); // should be flatten.
  }

  async listLinks(root: string) {
    const execBuf = [`${rgPath}`, "--json"];
    execBuf.push("-g", `*\.${this.ext}`);
    execBuf.push("-e", String.raw`'\[\[(.*)\]\]'`);

    const matches = await this.exec(execBuf, root);

    const labels = matches
      .map((match) => {
        // submatches might be multiple
        return match.submatches.map((m) => {
          return m.match.text.replace("[[", "").replace("]]", "");
        });
      })
      .flat(); // should be flatten.

    const uniqued = Array.from(new Set(labels));

    return uniqued.map((label) => new LinkTreeItem(label));
  }

  async exec(execBuf: string[], cwd: string): Promise<Match[]> {
    execBuf.push(cwd); // need to specify path

    return new Promise(function (resolve, reject) {
      const execString = execBuf.join(" ");
      exec(
        execString,
        { cwd: cwd, timeout: 30000 },
        (error, stdout, stderr) => {
          if (!error || (error && stderr === "")) {
            resolve(formatResults(stdout));
          } else {
            reject(new RipGrepError(error, stderr));
          }
        }
      );
    });
  }
}
