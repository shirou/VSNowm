import * as vscode from "vscode";
import { basename, dirname, join, resolve } from "path";

export interface Reference {
  word: string;
  range: vscode.Range | undefined;
}

const linkRegex = /\[\[(.*)\]\]/g;

export class LinkDefinitionProdier implements vscode.DefinitionProvider {
  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ) {
    const reference = this.getReference(document, position);
    if (!reference) {
      return [];
    }
  }

  getReference(document: vscode.TextDocument, position: vscode.Position) {
    const range = document.getWordRangeAtPosition(position, linkRegex);
    if (!range) {
      return undefined;
    }
    const ref = document.getText(range);

    return {
      word: ref,
      range: range,
    };
  }
}
