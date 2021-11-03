import * as vscode from "vscode";

import { openUrl } from "./notes/open";
import { newNote } from "./notes/new";
import { listNotes } from "./notes/list";
import { openSearch } from "./openSearch";
import { searchLinks } from "./notes/searchLinks";
import { NotesTreeView } from "./treeview/notes";
import { TasksTreeView } from "./treeview/tasks";
import { LinksTreeView } from "./treeview/links";

export const activate = (context: vscode.ExtensionContext) => {
  const nodeTv = new NotesTreeView();
  vscode.window.createTreeView("vsnowm.notes", {
    treeDataProvider: nodeTv,
  });
  const todoTv = new TasksTreeView();
  vscode.window.createTreeView("vsnowm.tasks", {
    treeDataProvider: todoTv,
  });
  const linksTv = new LinksTreeView();
  vscode.window.createTreeView("vsnowm.links", {
    treeDataProvider: linksTv,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("vsnowm.newNote", newNote),
    vscode.commands.registerCommand("vsnowm.listNotes", listNotes),
    vscode.commands.registerCommand("vsnowm.listTodo", empty),
    vscode.commands.registerCommand("vsnowm.setupNotes", empty),
    vscode.commands.registerCommand("vsnowm.openNoteFolder", empty),
    vscode.commands.registerCommand("vsnowm.sync", empty),
    vscode.commands.registerCommand("vsnowm.search", openSearch),
    vscode.commands.registerCommand("vsnowm.searchLinks", searchLinks),
    vscode.commands.registerCommand("vsnowm.refreshNotesView", () =>
      nodeTv.refresh()
    ),
    vscode.commands.registerCommand("vsnowm.refreshTasksView", () =>
      todoTv.refresh()
    ),
    vscode.commands.registerCommand("vsnowm.refreshLinksView", () =>
      linksTv.refresh()
    ),
    vscode.commands.registerCommand("vsnowm.openNote", openUrl)
  );
};

export const deactivate = () => {};

const empty = () => {};
