import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";

import * as dayjs from "dayjs";

export const resolveRoot = (filepath?: string) => {
  if (!filepath) {
    return path.join(os.homedir(), "notes");
  }
  return filepath.replace("~", os.homedir());
};

export const resolveFilePath = (
  root: string,
  notePath: string,
  dtformat: string,
  ext: string,
  date: dayjs.Dayjs | null = null
) => {
  const orig = path.join(root, notePath);
  if (!date) {
    date = dayjs();
  }

  const resolved = templateString(orig, getReplacer(dtformat, ext, date));

  return resolved;
};

export const getReplacer = (
  dtformat: string,
  ext: string,
  date?: dayjs.Dayjs
) => {
  if (!date) {
    date = dayjs();
  }

  return new Map<string, string>([
    ["year", date.format("YYYY").toString()],
    ["month", date.format("MM").toString()],
    ["day", date.format("DD").toString()],
    ["hour", date.format("HH").toString()],
    ["mintue", date.format("mm").toString()],
    ["second", date.format("ss").toString()],
    ["dt", date.format(dtformat)],
    ["ext", ext],
  ]);
};

export const templateString = (
  content: string,
  replacer: Map<string, string>
) => {
  for (const [key, value] of replacer.entries()) {
    content = content.replace(`{${key}}`, value);
  }
  return content;
};

export type FileItem = {
  path: string;
  fileType: vscode.FileType;
};

export type FrontMatterType = {
  title?: string;
  created?: string;
  updated?: string;
};

export const walk = async (
  parent: string[],
  dir: vscode.Uri,
  ext: string
): Promise<FileItem[]> => {
  const f = await vscode.workspace.fs.readDirectory(dir);

  const files = [] as FileItem[];
  for (const [filePath, fileType] of f) {
    switch (fileType) {
      case vscode.FileType.File:
        if (filePath.endsWith(ext)) {
          files.push({
            path: path.join(...parent, filePath),
            fileType: fileType,
          });
        }
        break;
      case vscode.FileType.Directory:
        const p = path.join(...parent, filePath);
        const nextDir = vscode.Uri.file(p);
        files.push({
          path: p,
          fileType: fileType,
        });
        const f = await walk(parent.concat(filePath), nextDir, ext);
        files.push(...f);
        break;
    }
  }
  return files;
};

/*
const walk = async (folder: vscode.Uri): Promise<string[]> => {
  let total = 0;
  let count = 0;

  for (const [name, type] of await vscode.workspace.fs.findFiles(folder)) {
      if (type === vscode.FileType.File) {
          const filePath = path.join(folder.path, name);
          const stat = await vscode.workspace.fs.stat(folder.with({ path: filePath }));
          total += stat.size;
          count += 1;
      }
  }
  return { total, count };
}
*/
