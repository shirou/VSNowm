import * as vscode from "vscode";

import { ActionLock } from "./actionLock";

let timeout: NodeJS.Timeout | null = null;

export const selectionUpdate = (
  ac: ActionLock,
  event: vscode.TextEditorSelectionChangeEvent
) => {
  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    vscode.commands.executeCommand("setContext", "actionlock.isTrue", false);
    const range = ac.getRangeAtCursor(event.textEditor);
    if (range) {
      vscode.commands.executeCommand("setContext", "actionlock.isTrue", true);
    }
  }, 100);
};
