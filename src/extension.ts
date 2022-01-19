import * as vscode from "vscode";

import { openUrl } from "./notes/open";
import { newNote } from "./notes/new";
import { openSearch } from "./openSearch";
import { searchLinks } from "./notes/searchLinks";
import { sync } from "./notes/sync";
import { NotesTreeView } from "./treeview/notes";
import { TasksTreeView } from "./treeview/tasks";
import { LinksTreeView } from "./treeview/links";
import { ActionLock } from "./actionLock/actionLock";
import { selectionUpdate } from "./actionLock/trigger";
import { ConcatinatedView, getWebviewOptions } from "./view/ConcatinatedView";

export const activate = (context: vscode.ExtensionContext) => {
  let activeEditor = vscode.window.activeTextEditor;
  const acLock = new ActionLock("#ffff00");

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
    vscode.commands.registerCommand("vsnowm.openNote", openUrl),
    vscode.window.onDidChangeTextEditorSelection((event) => {
      selectionUpdate(acLock, event);
    }),
    vscode.commands.registerTextEditorCommand("vsnowm.doAction", (editor) => {
      acLock.doAction(editor);
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(ConcatinatedView.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        console.log(`Got state: ${state}`);
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        ConcatinatedView.revive(webviewPanel, context.extensionUri);
      },
    });
  }

  /* ActionLock */
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        acLock.changeActiveTextEditor(editor);
      }
    },
    null,
    context.subscriptions
  );
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        acLock.changeTextDocument(event);
      }
    },
    null,
    context.subscriptions
  );
};

export const deactivate = () => {};

const empty = () => {};
