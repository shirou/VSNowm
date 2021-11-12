import { exec } from "child_process";

import { Syncer } from "./sync";
import {
  GitSyncerError,
  GitUninitlizedError,
  GitManualRequiredError,
} from "../errors";

// Thanks: https://github.com/simonthum/git-sync/blob/master/git-sync

type RepoStatus =
  | "REBASE-i"
  | "REBASE-m"
  | "AM/REBASE"
  | "MERGING"
  | "CHERRY-PICKING"
  | "BISECTING"
  | "|BARE"
  | "|GIT_DIR"
  | "|DIRTY";

type SyncState = "noUpstream" | "equal" | "ahead" | "behind" | "diverged";

export class GitSyncer implements Syncer {
  public branch?: string;
  constructor() {}

  async sync(root: string): Promise<null> {
    this.branch = await this.getBranchName(root);
    await this.checkInitialFileState(root);
    await this.commitLocalChange(root);

    const syncState = await this.syncState(root);
    switch (syncState) {
      case "noUpstream":
        throw new GitUninitlizedError();
      case "equal":
        console.log("nothing to do");
        break;
      case "ahead":
        console.log("push ");
        await this.push(root);
        break;
      case "behind":
        console.log("fast-forwarding");
        await this.pull(root);
        break;
      case "diverged":
        console.log("delived ");
        break;
    }

    return null;
  }

  async repoStatus(root: string): Promise<RepoStatus> {
    return "REBASE-i";
  }

  async getBranchName(root: string): Promise<string> {
    const execString = `git name-rev --name-only HEAD`;
    try {
      const ret = await this.exec(execString, root);
      return ret.join("");
    } catch (e) {
      if (e instanceof GitSyncerError) {
        if (e.message.indexOf("not a git repository")) {
          throw new GitUninitlizedError();
        }
      }
      throw e;
    }
  }

  async syncState(root: string): Promise<SyncState> {
    const execString = `git rev-list --count --left-right origin/${this.branch}...HEAD`;
    const ret = await this.exec(execString, root);
    const r = ret.join("");

    if (r === "") {
      return "noUpstream";
    } else if (r === "0\t0") {
      return "equal";
    } else if (r.startsWith("0\t")) {
      return "ahead";
    } else if (r.endsWith("0\t")) {
      return "behind";
    } else {
      return "diverged";
    }
  }

  async push(root: string) {
    // TODO: if does not remote-added?
    const execString = `git push origin HEAD`;
    await this.exec(execString, root);
  }

  async pull(root: string) {
    const execString = `git merge --ff --ff-only origin:${this.branch}`;
    await this.exec(execString, root);
  }

  async commitLocalChange(root: string) {
    const message = `auto commit`;
    const execString = `git add -A ; git commit -m '${message}'`;
    const ret = await this.exec(execString, root);
    console.log("commit localChange", ret);
  }

  // check if we only have untouched, modified or (if configured) new files
  async checkInitialFileState(root: string) {
    const execString = `git status --porcelain | grep -E '^[^ \?][^M\?] *'`;
    const ret = await this.exec(execString, root);
    if (ret.length > 1 || ret[0] !== "") {
      throw new GitManualRequiredError();
    }
  }

  async exec(execString: string, cwd: string): Promise<string[]> {
    console.log(`exec: ${execString}`);
    return new Promise(function (resolve, reject) {
      exec(
        execString,
        { cwd: cwd, timeout: 30000 },
        (error, stdout, stderr) => {
          if (!error || (error && stderr === "")) {
            resolve(stdout.split("\n"));
          } else {
            reject(new GitSyncerError(stderr, error));
          }
        }
      );
    });
  }
}
