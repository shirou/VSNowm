import * as vscode from "vscode";
import * as path from "path";
import { TextEncoder } from "util";
import {
  resolveRoot,
  resolveFilePath,
  getReplacer,
  templateString,
} from "../utils";

const defaultTemplate = `---
date: {dt}
title: 
categories:
  - note
---
`;

export const newNote = () => {
  const config = vscode.workspace.getConfiguration("vsnowm");
  const noteRoot = resolveRoot(config.get("defaultNoteRoot"));

  if (!noteRoot) {
    vscode.window.showErrorMessage(
      "Default note folder not found. Please setup your config."
    );
    return;
  }

  createNote(noteRoot);
};

const createNote = async (noteRoot: string) => {
  const config = vscode.workspace.getConfiguration("vsnowm");
  const defaultNoteFilePath = config.get("defaultNoteFilePath") as string;
  const defaultDateFormat = config.get("defaultDateFormat") as string;
  const defaultExt = config.get("defaultExt") as string;

  if (!defaultNoteFilePath) {
    vscode.window.showErrorMessage(
      "Default note path not found. Please setup your config."
    );
    return;
  }

  const absFilePath = resolveFilePath(
    noteRoot,
    defaultNoteFilePath,
    defaultDateFormat,
    defaultExt
  );

  // Create the file
  const wsedit = new vscode.WorkspaceEdit();
  const uri = vscode.Uri.file(absFilePath);
  await wsedit.createFile(uri);
  await vscode.workspace.applyEdit(wsedit);

  // Open the file
  const editor = await vscode.window.showTextDocument(uri, {
    preserveFocus: false,
    preview: false,
  });
  console.log("Note created successfully: ", absFilePath);
  const template = await readTemplate(noteRoot);
  const replacer = getReplacer(defaultDateFormat, defaultExt);
  const compiled = templateString(template!, replacer);
  editor.edit((edit) => {
    edit.insert(new vscode.Position(0, 0), compiled);
  });
};

const readTemplate = async (noteRoot: string) => {
  const templateFile = path.join(noteRoot, "templates", "default.md");
  const uri = vscode.Uri.file(templateFile);

  try {
    const f = await vscode.workspace.fs.readFile(uri);
    return f.toString();
  } catch (err: any) {
    // TODO: Check error
    // err instanceof vscode.FileSystemError.FileNotFound occured error
    if (err) {
      await vscode.workspace.fs.writeFile(
        uri,
        new TextEncoder().encode(defaultTemplate)
      );
      return defaultTemplate;
    }
  }
};
