import * as vscode from "vscode";
import * as path from "path";
import { resolveRoot } from "../utils";
import { GitManualRequiredError, GitUninitlizedError } from "../errors";

import { GitSyncer } from "./sync_git";

type PlatformType = "git";

export const newSyncer = (platform: PlatformType): Syncer => {
  return new GitSyncer();
};

export interface Syncer {
  sync(root: string): Promise<null>;
}

export const sync = async () => {
  const config = vscode.workspace.getConfiguration("vsnowm");
  const noteRoot = resolveRoot(config.get("defaultNoteRoot"));

  const syncer = newSyncer("git");
  try {
    syncer.sync(noteRoot);
  } catch (e) {
    if (e instanceof GitUninitlizedError) {
      vscode.window.showErrorMessage(
        `Note folder ${noteRoot} is not git initialized. Please create remote repo and git init before sync`
      );
      return;
    } else if (e instanceof GitManualRequiredError) {
      vscode.window.showErrorMessage(
        `Note folder ${noteRoot}, there are changed files you should probably handle manually.`
      );
    }
  }
};
