import * as vscode from "vscode";
import { newNote } from "./newNote";
import { listNotes } from "./listNotes";

export const activate = (context: vscode.ExtensionContext) => {
  console.log("Congratulations, your extension \"vsnowm\" is now active!");

  context.subscriptions.push(
    vscode.commands.registerCommand("vsnowm.newNote", newNote),
    vscode.commands.registerCommand("vsnowm.listNotes", listNotes),
    vscode.commands.registerCommand("vsnowm.listTags", empty),
    vscode.commands.registerCommand("vsnowm.setupNotes", empty),
    vscode.commands.registerCommand("vsnowm.openNoteFolder", empty),
    vscode.commands.registerCommand("vsnowm.sync", empty),
    vscode.commands.registerCommand("vsnowm.search", empty)
  );
};

export const deactivate = () => {};

const empty = () => {};
