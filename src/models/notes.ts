import * as vscode from "vscode";
import * as path from "path";

export class NoteTreeItem extends vscode.TreeItem {
  public filePath: string;
  public fileType: vscode.FileType;
  constructor(
    public readonly label: string,
    filePath: string,
    fileType: vscode.FileType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.label = label;
    this.filePath = filePath;
    this.fileType = fileType;
  }

  iconPath = {
    light: path.join(__filename, ".", "media", "icon", "light", "file.svg"),
    dark: path.join(__filename, ".", "media", "icon", "dark", "file.svg"),
  };
}
