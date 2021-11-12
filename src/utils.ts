import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";
import * as matter from "gray-matter";
import * as dayjs from "dayjs";

import { NoteTreeItem } from "./models/notes";

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
  fileFormat: string,
  ext: string,
  date: dayjs.Dayjs | null = null
) => {
  const orig = path.join(root, notePath);
  if (!date) {
    date = dayjs();
  }

  const resolved = templateString(orig, getReplacer(fileFormat, ext, date));

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
    ["YYYY", date.format("YYYY").toString()],
    ["MM", date.format("MM").toString()],
    ["DD", date.format("DD").toString()],
    ["HH", date.format("HH").toString()],
    ["mm", date.format("mm").toString()],
    ["ss", date.format("ss").toString()],
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
  ctime: number;
  mtime: number;
  permissions?: vscode.FilePermission;
  size: number;
};

export type FrontMatterType = {
  title?: string;
  created?: string;
  updated?: string;
};

const walkRecursive = async (
  dir: vscode.Uri,
  maxResults: number,
  ext: string,
  parent: string[]
): Promise<FileItem[]> => {
  const f = await vscode.workspace.fs.readDirectory(dir);

  const files = [] as FileItem[];
  for (const [filePath, fileType] of f) {
    if (filePath.startsWith(".") || filePath === "templates") {
      continue;
    }
    switch (fileType) {
      case vscode.FileType.File:
        if (filePath.endsWith(ext)) {
          const absFilePath = path.join(...parent, filePath);
          const uri = vscode.Uri.file(absFilePath);
          const st = await vscode.workspace.fs.stat(uri); // TODO: is it slow?
          files.push({
            path: path.join(...parent, filePath),
            fileType: fileType,
            ctime: st.ctime,
            mtime: st.mtime,
            permissions: st.permissions,
            size: st.size,
          });
        }
        break;
      case vscode.FileType.Directory:
        const p = path.join(...parent, filePath);
        const nextDir = vscode.Uri.file(p);
        const f = await walkRecursive(
          nextDir,
          maxResults,
          ext,
          parent.concat(filePath)
        );
        files.push(...f);
        break;
    }
  }
  return files;
};

export const walk = async (
  dir: vscode.Uri,
  maxResults: number,
  ext: string
): Promise<NoteTreeItem[]> => {
  const files = await walkRecursive(dir, maxResults, ext, [dir.fsPath]);

  const ret = [] as NoteTreeItem[];
  // retrieve text data only maxResults to better performance
  const sortedFiles = files
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, maxResults);
  for (const file of sortedFiles) {
    const label = await getTitle(file.path);
    ret.push(new NoteTreeItem(label, file));
  }

  return ret;
};

// walkFiles returns all files by using `findFiles`
// This function requires workspace, so it is now deprecated.
export const walkFiles = async (
  root: vscode.Uri,
  maxResults: number,
  ext: string
): Promise<NoteTreeItem[]> => {
  const globPattern = new vscode.RelativePattern(root, `**/*.${ext}`);
  const exclude = new vscode.RelativePattern(root, `templates`);
  const files = [] as FileItem[];

  // use for-of because of performance
  for (const uri of await vscode.workspace.findFiles(globPattern, exclude)) {
    const filePath = uri.fsPath;
    const st = await vscode.workspace.fs.stat(root.with({ path: filePath }));
    files.push({
      path: filePath,
      fileType: vscode.FileType.File,
      ctime: st.ctime,
      mtime: st.mtime,
      permissions: st.permissions,
      size: st.size,
    });
  }

  const ret = [] as NoteTreeItem[];
  // retrieve text data only maxResults to better performance
  const sortedFiles = files
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, maxResults);
  for (const file of sortedFiles) {
    const label = await getTitle(file.path);
    ret.push(new NoteTreeItem(label, file));
  }

  return ret;
};

export const getTitle = async (filePath: string) => {
  const uri = vscode.Uri.file(filePath);
  const content = await vscode.workspace.fs.readFile(uri);
  const parsedFrontMatter = matter(content.toString());
  if (!(parsedFrontMatter.data instanceof Object)) {
    console.error("YAML front-matter is not an object: ", filePath);
    return filePath;
  }
  const data = parsedFrontMatter.data as FrontMatterType;
  return data.title
    ? data.title
    : parsedFrontMatter.content.substring(
        0,
        parsedFrontMatter.content.indexOf("\n")
      );
};
