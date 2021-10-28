import * as vscode from "vscode";
import * as fs from "fs-extra";
import * as path from "path";
import {
  resolveRoot,
  resolveFilePath,
  getReplacer,
  templateString,
} from "./utils";

const defaultTemplate = `---
date: {dt}
title:
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
  const filePath = await createFile(absFilePath);

  if (typeof filePath !== "string") {
    console.error("Invalid file path");
    return false;
  }

  const editor = await vscode.window.showTextDocument(
    vscode.Uri.file(filePath),
    {
      preserveFocus: false,
      preview: false,
    }
  );
  console.log("Note created successfully: ", filePath);
  const template = await readTemplate(noteRoot);
  const replacer = getReplacer(defaultDateFormat, defaultExt);
  const compiled = templateString(template, replacer);
  editor.edit((edit) => {
    edit.insert(new vscode.Position(0, 0), compiled);
  });
};

const createFile = (filePath: string) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject();
    }
    // fs-extra
    fs.ensureFile(filePath)
      .then(() => {
        resolve(filePath);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

const readTemplate = (noteRoot: string) => {
  const templateFile = path.join(noteRoot, "templates", "default.md");
  return fs.pathExists(templateFile).then((exists: boolean) => {
    if (exists) {
      return fs.readFile(templateFile, "utf8");
    } else {
      const dir = path.dirname(templateFile);
      fs.ensureDir(dir);
      fs.writeFile(templateFile, defaultTemplate);
      return defaultTemplate;
    }
  });
};
