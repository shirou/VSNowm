import * as vscode from "vscode";

type ActionLock = {
  regex: string; // will be compiled after combined
  ranges: vscode.Range[];
  decoration: vscode.DecorationOptions | undefined;
  decorationType: vscode.TextEditorDecorationType;
};
type ActionLockType = "date" | "task" | "link";

export class ActionLockDecorator {
  private activeEditor = vscode.window.activeTextEditor;
  private timeout: NodeJS.Timer | undefined = undefined;
  private actionLocks: Map<ActionLockType, ActionLock>;
  private decoRegex: RegExp;

  constructor(lineCoror: string) {
    this.actionLocks = this.setActionLocks(lineCoror);

    // construct concatinated regex
    const regexStrList = [];
    for (const [key, value] of this.actionLocks) {
      regexStrList.push(value.regex);
    }
    this.decoRegex = new RegExp(regexStrList.join("|"), "g");

    if (this.activeEditor) {
      this.triggerUpdateDecorations();
    }
  }

  public changeActiveTextEditor(editor: vscode.TextEditor | undefined): void {
    this.activeEditor = editor;
    if (editor) {
      this.triggerUpdateDecorations();
    }
  }

  public changeTextDocument(event: vscode.TextDocumentChangeEvent): void {
    if (this.activeEditor && event.document === this.activeEditor.document) {
      this.triggerUpdateDecorations();
    }
  }

  private triggerUpdateDecorations(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.timeout = setTimeout(() => {
      this.updateDecorations();
    }, 500);
  }

  private updateDecorations(): void {
    if (!this.activeEditor) {
      return;
    }
    const text = this.activeEditor.document.getText();

    let match;
    const ranges = [] as vscode.Range[];
    while ((match = this.decoRegex.exec(text)) !== null) {
      if (!match || !match.groups) {
        continue;
      }
      console.log(match.groups);
      console.log(this.actionLocks.get("task")?.ranges);
      if (match.groups.date) {
        const startPos = this.activeEditor.document.positionAt(match.index);
        const endPos = this.activeEditor.document.positionAt(
          match.index + match.groups.date.length + 1
        );
        const r = new vscode.Range(startPos, endPos);
        ranges.push(r);
        this.actionLocks.get("date")?.ranges.push(r);
      } else if (match.groups.task) {
        const startPos = this.activeEditor.document.positionAt(match.index);
        const endPos = this.activeEditor.document.positionAt(
          match.index + match.groups.task.length + 1
        );
        const r = new vscode.Range(startPos, endPos);
        ranges.push(r);
        this.actionLocks.get("task")?.ranges.push(r);
      } else if (match.groups.link) {
        const startPos = this.activeEditor.document.positionAt(match.index + 1);
        const endPos = this.activeEditor.document.positionAt(
          match.index + match.groups.link.length + 2
        );
        const r = new vscode.Range(startPos, endPos);
        ranges.push(r);
        this.actionLocks.get("link")?.ranges.push(r);
      }
    }

    console.log(ranges);
    console.log(this.actionLocks.get("date")?.decorationType);
    // TODO: currently use same decorationtype for all actionlock type
    this.activeEditor.setDecorations(
      this.actionLocks.get("date")?.decorationType!,
      ranges
    );
  }

  private setActionLocks(lineCoror: string) {
    // currently use same
    const decorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: "underline " + lineCoror,
    });

    const ret = new Map<ActionLockType, ActionLock>();
    ret.set("date", {
      regex: String.raw`\[(?<date>[12][90]\d{2}\-[01][0-9]\-[0-3][0-9])\]`,
      ranges: [],
      decoration: undefined,
      decorationType: decorationType,
    });
    ret.set("task", {
      regex: String.raw`\[(?<task>[x ])\]`,
      ranges: [],
      decoration: undefined,
      decorationType: decorationType,
    });
    ret.set("link", {
      regex: String.raw`\[\[(?<link>.*)\]\]`,
      ranges: [],
      decoration: undefined,
      decorationType: decorationType,
    });

    return ret;
  }
}
