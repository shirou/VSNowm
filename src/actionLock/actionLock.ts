import * as vscode from "vscode";
import { searchLinks } from "../notes/searchLinks";

type ActionLockDef = {
  regex: string; // will be compiled after concatinated
  ranges: vscode.Range[];
  decoration: vscode.DecorationOptions | undefined;
  decorationType: vscode.TextEditorDecorationType;
};
export type ActionLockType = "date" | "task" | "link";
export type ActionLockSlection = {
  type: ActionLockType;
  range: vscode.Range;
};

export class ActionLock {
  private activeEditor = vscode.window.activeTextEditor;
  private timeout: NodeJS.Timer | undefined = undefined;
  private actionLocks: Map<ActionLockType, ActionLockDef>;
  private decoRegex: RegExp;

  constructor(underlineColor: string) {
    this.actionLocks = this.setActionLocks(underlineColor);

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
      if (match.groups.date) {
        const startPos = this.activeEditor.document.positionAt(match.index + 1);
        const endPos = this.activeEditor.document.positionAt(
          match.index + match.groups.date.length + 1
        );
        const r = new vscode.Range(startPos, endPos);
        ranges.push(r);
        this.actionLocks.get("date")?.ranges.push(r);
      } else if (match.groups.task) {
        const startPos = this.activeEditor.document.positionAt(match.index + 1);
        const endPos = this.activeEditor.document.positionAt(
          match.index + match.groups.task.length + 1
        );
        const r = new vscode.Range(startPos, endPos);
        ranges.push(r);
        this.actionLocks.get("task")?.ranges.push(r);
      } else if (match.groups.link) {
        // link have double [[ ]], so +2
        const startPos = this.activeEditor.document.positionAt(match.index + 2);
        const endPos = this.activeEditor.document.positionAt(
          match.index + match.groups.link.length + 2
        );
        const r = new vscode.Range(startPos, endPos);
        ranges.push(r);
        this.actionLocks.get("link")?.ranges.push(r);
      }
    }

    // TODO: currently use same decorationtype for all actionlock type
    this.activeEditor.setDecorations(
      this.actionLocks.get("date")?.decorationType!,
      ranges
    );
  }

  public getRangeAtCursor(
    editor: vscode.TextEditor | undefined
  ): ActionLockSlection | null {
    if (!editor) {
      return null;
    }
    const selection = editor.selection;
    for (const [type, value] of this.actionLocks) {
      const range = this.isWithInRange(selection, value.ranges);
      if (range) {
        return {
          type: type,
          range: range,
        } as ActionLockSlection;
      }
    }
    return null;
  }

  public doAction(editor: vscode.TextEditor) {
    const range = this.getRangeAtCursor(editor);
    if (!range) {
      return;
    }
    editor.selection = new vscode.Selection(range.range.start, range.range.end);
    const word = editor.document.getText(range.range);
    switch (range.type) {
      case "date":
        searchLinks(word);
        return;
      case "link":
        searchLinks(word);
        return;
      case "task":
        editor.edit((edit) => {
          const dst = word === " " ? "x" : " ";
          edit.replace(range.range, dst);
        });
        return;
    }
  }

  private isWithInRange(
    selection: vscode.Selection,
    ranges: vscode.Range[]
  ): vscode.Range | null {
    for (const range of ranges) {
      if (range.contains(selection)) {
        return range;
      }
    }
    return null;
  }

  private setActionLocks(underlineColor: string) {
    // currently use same
    const decorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: "underline " + underlineColor,
      color: { id: "textLink.foreground" },
    });

    const ret = new Map<ActionLockType, ActionLockDef>();
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
