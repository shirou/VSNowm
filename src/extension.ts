import * as vscode from "vscode";
import { newNote } from "./notes/new";
import { listNotes } from "./notes/list";
import { openSearch } from "./openSearch";
import { NotesTreeView } from "./treeview/notes";
import { TasksTreeView } from "./treeview/tasks";

const openUrl = (url: string) => {
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
};

export const activate = (context: vscode.ExtensionContext) => {
  const nodeTv = new NotesTreeView();
  vscode.window.createTreeView("vsnowm.notes", {
    treeDataProvider: nodeTv,
  });
  const todoTv = new TasksTreeView();
  vscode.window.createTreeView("vsnowm.tasks", {
    treeDataProvider: todoTv,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("vsnowm.newNote", newNote),
    vscode.commands.registerCommand("vsnowm.listNotes", listNotes),
    vscode.commands.registerCommand("vsnowm.listTodo", empty),
    vscode.commands.registerCommand("vsnowm.setupNotes", empty),
    vscode.commands.registerCommand("vsnowm.openNoteFolder", empty),
    vscode.commands.registerCommand("vsnowm.sync", empty),
    vscode.commands.registerCommand("vsnowm.search", openSearch),
    vscode.commands.registerCommand("vsnowm.refreshNoteView", () =>
      nodeTv.refresh()
    ),
    vscode.commands.registerCommand("vsnowm.refreshTasksView", () =>
      todoTv.refresh()
    ),
    vscode.commands.registerCommand("vsnowm.openNote", openUrl)
  );
};

export const deactivate = () => {};

const empty = () => {};
