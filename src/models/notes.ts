import * as vscode from "vscode";
import * as path from "path";
import { FileItem } from "../utils";

export class NoteTreeItem extends vscode.TreeItem {
  public filePath: string;
  public ctime: number;
  public mtime: number;
  public permissions?: vscode.FilePermission;
  public size: number;
  public iconPath = new vscode.ThemeIcon("file-text");

  constructor(public readonly label: string, file: FileItem) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.label = label;

    this.filePath = file.path;
    this.ctime = file.ctime;
    this.mtime = file.mtime;
    this.size = file.size;
    this.permissions = file.permissions;

    this.command = {
      title: label,
      command: "vsnowm.openNote",
      arguments: [vscode.Uri.file(this.filePath)],
    };
    this.contextValue = "note";
  }
}
