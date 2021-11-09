import * as vscode from "vscode";
import * as dayjs from "dayjs";

type TaskType = "todo" | "reminder" | "deadline";

const calcImportance = (
  taskType: TaskType,
  date: Date,
  now: dayjs.Dayjs | undefined = undefined
): number => {
  return 0;
};

export class TaskTreeItem extends vscode.TreeItem {
  public filePath: string;
  public iconPath = new vscode.ThemeIcon("debug-stackframe-dot");
  public importance?: number;
  public dueDate?: dayjs.Dayjs;
  public taskType?: TaskType;

  constructor(
    public readonly label: string,
    filePath: string,
    lineNumber: number
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.label = label;
    this.filePath = filePath;

    const line = lineNumber ? lineNumber : 0;

    this.command = {
      title: filePath,
      command: "vsnowm.openNote",
      arguments: [vscode.Uri.file(filePath), new vscode.Position(line, 3)], // 3 means - [ ]
    };
    this.contextValue = "task";
  }
}
