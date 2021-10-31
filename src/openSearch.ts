import * as vscode from "vscode";

import { resolveRoot } from "./utils";

export const openSearch = () => {
  const config = vscode.workspace.getConfiguration("vsnowm");
  const defaultNoteRoot = vscode.Uri.file(
    resolveRoot(config.get("defaultNoteRoot"))
  );

  // We need to check if a workspace folder is open. VSCode doesn't allow
  // findInFile if a workspace folder isn't available.
  const openWorkspace = vscode.workspace.workspaceFolders;
  if (openWorkspace === null) {
    vscode.window
      .showWarningMessage(
        "Whoops, can't search without an open folder in the workspace. Open notes folder?",
        ...["Open"]
      )
      .then((val) => {
        if (val === "Open") {
          vscode.commands.executeCommand("vscode.openFolder", defaultNoteRoot);
        }
      });
  } else {
    vscode.commands.executeCommand(
      "filesExplorer.findInFolder",
      defaultNoteRoot
    );
  }
};
