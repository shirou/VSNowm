import * as vscode from "vscode";
import * as path from "path";

export class TaskTreeItem extends vscode.TreeItem {
  public filePath: string;
  public lineNumber?: string;
  public iconPath = {
    light: path.join(__filename, ".", "media", "icon", "light", "file.svg"),
    dark: path.join(__filename, ".", "media", "icon", "dark", "file.svg"),
  };

  constructor(
    public readonly label: string,
    filePath: string,
    lineNumber?: number
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.label = label;
    this.filePath = filePath;
  }
}
