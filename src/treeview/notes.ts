import * as vscode from "vscode";
import * as path from "path";

import { resolveRoot } from "../utils";
import { NoteTreeItem } from "../models/notes";
import { newSearcher, Searcher } from "../search";

export class NotesTreeView implements vscode.TreeDataProvider<NoteTreeItem> {
  noteRoot: string;
  listRecentLimit: number;
  defaultExt: string;
  searcher: Searcher;

  constructor() {
    const config = vscode.workspace.getConfiguration("vsnowm");
    this.noteRoot = resolveRoot(config.get("defaultNotePath"));
    this.defaultExt = config.get("defaultExt") as string;
    this.searcher = newSearcher("ripgrep", this.defaultExt);
    this.listRecentLimit = config.get("listRecentLimit") as number;
  }

  async getChildren(node?: NoteTreeItem) {
    const notes = await this.searcher.listNotes(
      this.noteRoot,
      this.listRecentLimit
    );
    return Promise.resolve(notes);
  }

  getTreeItem(node: NoteTreeItem): vscode.TreeItem {
    return node;
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
