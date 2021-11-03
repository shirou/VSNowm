import * as vscode from "vscode";

import { newSearcher, Searcher } from "../search/index";
import { resolveRoot, FrontMatterType } from "../utils";
import { LinkTreeItem } from "../models/links";

export class LinksTreeView implements vscode.TreeDataProvider<LinkTreeItem> {
  noteRoot: string;
  // ignorePattern: RegExp;
  defaultExt: string;
  searcher: Searcher;

  constructor() {
    const config = vscode.workspace.getConfiguration("vsnowm");
    this.noteRoot = resolveRoot(config.get("defaultNotePath"));
    this.defaultExt = config.get("defaultExt") as string;

    this.searcher = newSearcher("ripgrep", this.defaultExt);

    /*
        this.ignorePattern = new RegExp(
      config.get("ignorePatterns")
        .map(function (pattern) {
          return "(" + pattern + ")";
        })
        .join("|")
    );*/
  }

  async getChildren(node?: LinkTreeItem) {
    const todos = await this.searcher.listLinks(this.noteRoot);
    return Promise.resolve(todos);
  }

  getTreeItem(node: LinkTreeItem): vscode.TreeItem {
    return node;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    LinkTreeItem | undefined | null | void
  > = new vscode.EventEmitter<LinkTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    LinkTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
