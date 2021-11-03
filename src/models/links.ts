import * as vscode from "vscode";
import * as path from "path";

export class LinkTreeItem extends vscode.TreeItem {
  public iconPath = {
    light: path.join(__filename, ".", "media", "icon", "light", "file.svg"),
    dark: path.join(__filename, ".", "media", "icon", "dark", "file.svg"),
  };

  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.label = label;

    this.command = {
      title: label,
      command: "vsnowm.searchLinks",
      arguments: [label],
    };
    this.contextValue = "link";
  }
}

export interface LinkQuickPickItem extends vscode.QuickPickItem {
  label: string;
  description: string;
  detail?: string;
  filePath: string; // abs path
  lineNumber: number;
  columns: number;
}
