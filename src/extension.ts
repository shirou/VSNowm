import * as vscode from "vscode";

import { openUrl } from "./notes/open";
import { newNote } from "./notes/new";
import { openSearch } from "./openSearch";
import { searchLinks } from "./notes/searchLinks";
import { sync } from "./notes/sync";
import { NotesTreeView } from "./treeview/notes";
import { TasksTreeView } from "./treeview/tasks";
import { LinksTreeView } from "./treeview/links";
import { ActionLockDecorator } from "./deco/actionLock";

export const activate = (context: vscode.ExtensionContext) => {
  let activeEditor = vscode.window.activeTextEditor;

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
    // vscode.commands.registerCommand("vsnowm.listNotes", listNotes),
    vscode.commands.registerCommand("vsnowm.listTodo", empty),
    vscode.commands.registerCommand("vsnowm.setupNotes", empty),
    vscode.commands.registerCommand("vsnowm.openNoteFolder", empty),
    vscode.commands.registerCommand("vsnowm.search", openSearch),
    vscode.commands.registerCommand("vsnowm.searchLinks", searchLinks),
    vscode.commands.registerCommand("vsnowm.sync", sync),
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

  /* Decorations */
  const acDeco = new ActionLockDecorator("#ffff00");

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        acDeco.changeActiveTextEditor(editor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        acDeco.changeTextDocument(event);
      }
    },
    null,
    context.subscriptions
  );
};

export const deactivate = () => {};

const empty = () => {};
