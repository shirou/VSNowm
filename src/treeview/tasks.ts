import * as vscode from "vscode";

import { newSearcher, Searcher } from "../search/index";
import { resolveRoot } from "../utils";
import { TaskTreeItem } from "../models/tasks";

export class TasksTreeView implements vscode.TreeDataProvider<TaskTreeItem> {
  noteRoot: string;
  defaultExt: string;
  searcher: Searcher;

  constructor() {
    const config = vscode.workspace.getConfiguration("vsnowm");
    this.noteRoot = resolveRoot(config.get("defaultNotePath"));
    this.defaultExt = config.get("defaultExt") as string;

    this.searcher = newSearcher("ripgrep", this.defaultExt);
  }

  async getChildren(node?: TaskTreeItem) {
    const todos = await this.searcher.searchTodo(this.noteRoot);
    return Promise.resolve(todos);
  }

  getTreeItem(node: TaskTreeItem): vscode.TreeItem {
    return node;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    TaskTreeItem | undefined | null | void
  > = new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TaskTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
