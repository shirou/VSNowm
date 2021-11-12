import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";
import * as dayjs from "dayjs";
import { rgPath } from "vscode-ripgrep";

import { RipGrepError, Match, Options } from "./ripgrep_types";

import { Searcher } from "./index";
import { NoteTreeItem } from "../models/notes";
import { TaskTreeItem } from "../models/tasks";
import { LinkTreeItem, LinkQuickPickItem } from "../models/links";
import { getTitle, FileItem } from "../utils";

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

  async listNotes(root: string, maxResults: number): Promise<NoteTreeItem[]> {
    const execBuf = [`${rgPath}`, "--json"];
    execBuf.push("-g", `*\.${this.ext}`);
    execBuf.push("-g", `'\!templates'`); // ignore templates dir
    execBuf.push("-m", "1"); // only first "date"
    execBuf.push("-e", String.raw`'^date: '`);

    const matches = await this.exec(execBuf, root);
    const files = matches.map((match) => {
      const dayStr = match.lines.text.replace("date: ", "");
      const dj = dayjs(dayStr);
      return {
        path: match.path.text,
        fileType: vscode.FileType.File,
        ctime: dj.unix(),
        mtime: dj.unix(),
        size: 0,
      } as FileItem;
    });

    const ret = [] as NoteTreeItem[];
    // retrieve text data only maxResults to better performance
    const sortedFiles = files
      .sort((a, b) => b.ctime - a.ctime)
      .slice(0, maxResults);
    for (const file of sortedFiles) {
      const label = await getTitle(file.path);
      ret.push(new NoteTreeItem(label, file));
    }
    return ret;
  }

  async searchHowmTasks(root: string) {
    const execBuf = [`${rgPath}`, "--json"];
    execBuf.push("-g", `*\.${this.ext}`);
    execBuf.push("-g", `'\!templates'`); // ignore templates dir
    execBuf.push("-e", String.raw`'\[\d{4}-\d{2}-\d{2}\][-!@+]'`);

    const matches = await this.exec(execBuf, root);
    return matches.map((match) => {
      return new TaskTreeItem(
        match.lines.text,
        match.path.text,
        match.line_number - 1 // ripgrep starts from 1
      );
    });
  }

  async searchTodo(root: string) {
    const execBuf = [`${rgPath}`, "--json"];
    execBuf.push("-g", `*\.${this.ext}`);
    execBuf.push("-g", `'\!templates'`); // ignore templates dir
    execBuf.push("-e", String.raw`'^- \[ \]'`);

    const matches = await this.exec(execBuf, root);

    const howmTaks = await this.searchHowmTasks(root);

    const vanillas = matches.map((match) => {
      const label = match.lines.text.replace("- [ ]", "");

      return new TaskTreeItem(
        label,
        match.path.text,
        match.line_number - 1 // ripgrep start from 1
      );
    });
    return howmTaks.concat(vanillas);
  }

  async searchLinks(root: string, link: string) {
    const execBuf = [`${rgPath}`, "--json"];
    execBuf.push("-g", `*\.${this.ext}`);
    execBuf.push("-g", `'\!templates'`); // ignore templates dir
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
    execBuf.push("-g", `'\!templates'`); // ignore templates dir
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
