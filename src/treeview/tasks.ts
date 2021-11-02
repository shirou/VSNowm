import * as vscode from "vscode";
import * as path from "path";

import * as matter from "gray-matter";
import { newSearcher, Searcher } from "../search/index";
import { resolveRoot, FrontMatterType } from "../utils";
import { TaskTreeItem } from "../models/tasks";

export class TasksTreeView implements vscode.TreeDataProvider<TaskTreeItem> {
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
