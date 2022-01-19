import * as vscode from "vscode";

import { resolveRoot } from "../utils";
import { newSearcher, Searcher } from "../search";
import { openUrl } from "../notes/open";
import { ConcatinatedView } from "../view/concatinatedView";

const getTarget = async (
  noteRoot: string,
  searcher: Searcher,
  link?: string
) => {
  if (link) {
    return link;
  }
  const listed = await searcher.listLinks(noteRoot);
  return await vscode.window.showQuickPick(listed.map((l) => l.label));
};

export const searchLinks = async (link?: string) => {
  const config = vscode.workspace.getConfiguration("vsnowm");
  const noteRoot = resolveRoot(config.get("defaultNotePath"));
  const defaultExt = config.get("defaultExt") as string;

  const searcher = newSearcher("ripgrep", defaultExt);

  const target = await getTarget(noteRoot, searcher, link);
  if (!target) {
    vscode.window.showInformationMessage(
      `"getTarget returnes undefined: ${target}`
    );
    return;
  }
  const linkItems = await searcher.searchLinks(noteRoot, target);

  /*
  const uri = vscode.Uri.file("/home/shirou/");
  ConcatinatedView.createOrShow(uri);
  console.log(ConcatinatedView.currentPanel);
  if (ConcatinatedView.currentPanel) {
    ConcatinatedView.currentPanel.doRefactor();
  }
  */

  const selected = await vscode.window.showQuickPick(linkItems, {
    placeHolder: "select result",
    title: "results",
  });
  if (!selected) {
    /*
    vscode.window.showInformationMessage(
      `"quickPick returnes undefined: ${target}`
    );
    */
    return;
  }
  openUrl(
    selected.filePath,
    new vscode.Position(selected.lineNumber, selected.columns)
  );
};
