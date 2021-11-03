import * as vscode from "vscode";
import * as path from "path";

import * as matter from "gray-matter";
import { resolveRoot, FrontMatterType } from "../utils";
import { NoteTreeItem } from "../models/notes";

export class NotesTreeView implements vscode.TreeDataProvider<NoteTreeItem> {
  noteRoot: string;
  // ignorePattern: RegExp;
  hideTags: boolean | undefined;
  hideFiles: boolean | undefined;
  defaultExt: string;

  constructor() {
    const config = vscode.workspace.getConfiguration("vsnowm");
    this.noteRoot = resolveRoot(config.get("defaultNotePath"));
    this.defaultExt = config.get("defaultExt") as string;
    /*
        this.ignorePattern = new RegExp(
      config.get("ignorePatterns")
        .map(function (pattern) {
          return "(" + pattern + ")";
        })
        .join("|")
    );*/
  }

  async getChildren(node?: NoteTreeItem) {
    if (!node) {
      node = {
        label: "/",
        filePath: this.noteRoot,
        fileType: vscode.FileType.Directory,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      } as NoteTreeItem;
    }
    const dir = node.filePath;
    const f = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dir));

    const files = [];
    for (const [filePath, fileType] of f) {
      const isDir = fileType === vscode.FileType.Directory;

      // ignore templates dir
      if (isDir && filePath === "templates") {
        continue;
      }
      // ignore other than specified extention in filePath
      if (!isDir && !filePath.endsWith(this.defaultExt)) {
        continue;
      }

      // get label from title. Use filePath is not defined.
      const label = isDir ? filePath : await this.getTitle(dir, filePath);

      files.push({
        label: label,
        filePath: path.join(dir, filePath),
        fileType: fileType,
        command: isDir
          ? undefined
          : {
              title: filePath,
              command: "vsnowm.openNote",
              arguments: [vscode.Uri.file(path.join(dir, filePath))],
            },
        contextValue: isDir ? "dir" : "file",
        collapsibleState: isDir
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
      } as NoteTreeItem);
    }

    return Promise.resolve(files);
  }

  getTreeItem(node: NoteTreeItem): vscode.TreeItem {
    return node;
  }

  async getTitle(dir: string, filePath: string) {
    const uri = vscode.Uri.file(path.join(dir, filePath));
    const content = await vscode.workspace.fs.readFile(uri);
    const parsedFrontMatter = matter(content.toString());
    if (!(parsedFrontMatter.data instanceof Object)) {
      console.error("YAML front-matter is not an object: ", filePath);
      return null;
    }
    const data = parsedFrontMatter.data as FrontMatterType;
    return data.title ? data.title : filePath;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    NoteTreeItem | undefined | null | void
  > = new vscode.EventEmitter<NoteTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    NoteTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
