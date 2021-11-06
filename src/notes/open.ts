import * as vscode from "vscode";

const textHeadPos = new vscode.Position(0, 0);

export const openNote = (uri: any) => {
  console.log("openNote", uri);
  openUrl(uri);
};

export const openUrl = (url: string, pos: vscode.Position = textHeadPos) => {
  vscode.workspace.openTextDocument(url).then((doc) => {
    vscode.window.showTextDocument(doc).then((editor) => {
      editor.selections = [new vscode.Selection(pos, pos)];
      const range = new vscode.Range(pos, pos);
      editor.revealRange(range);
    });
  });
};
