import * as vscode from "vscode";
import * as dayjs from "dayjs";
import { parse } from "path/posix";

type TaskType =
  | "vanilla" // not howm format task
  | "todo"
  | "reminder"
  | "deadline"
  | "pending"
  | "schedule"
  | "done";

const howmTaskRe = /\[(\d{4}-\d{2}-\d{2})\]([-+!~@])(\d*) (.*)/;

export class TaskTreeItem extends vscode.TreeItem {
  public filePath: string;
  public iconPath = new vscode.ThemeIcon("debug-stackframe-dot");
  public importance: number;
  public taskType: TaskType;
  public weight: number;
  public dueTime?: dayjs.Dayjs;

  constructor(
    public readonly label: string,
    filePath: string,
    lineNumber: number
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.filePath = filePath;

    const { parsedLabel, taskType, dueTime, weight } = parseHowmLine(label);
    if (taskType === "vanilla") {
      this.label = label;
    } else {
      this.label = parsedLabel;
    }
    this.weight = weight;
    this.taskType = taskType;
    this.dueTime = dueTime;

    this.importance = calcImportance(taskType, dueTime, weight);

    const line = lineNumber ? lineNumber : 0;

    this.command = {
      title: filePath,
      command: "vsnowm.openNote",
      arguments: [
        vscode.Uri.file(filePath),
        new vscode.Position(line, taskType === "vanilla" ? 5 : 0),
      ], // 5 means '- [ ]'
    };
    this.contextValue = "task";
  }
}

const calcImportance = (
  taskType: TaskType,
  dueTime: dayjs.Dayjs | undefined,
  weight: number,
  now: dayjs.Dayjs | undefined = undefined // used to test
): number => {
  if (!now) {
    now = dayjs();
  }
  if (!dueTime) {
    return now.unix();
  }

  const base = dueTime.diff(now);

  return base + 10 * weight;
};

const parseHowmLine = (line: string) => {
  const match = line.match(howmTaskRe);

  if (!match || match.length !== 5) {
    return {
      parsedLabel: line,
      taskType: "vanilla" as TaskType,
      weight: 1,
      dueTime: undefined,
    };
  }

  const dueTime = dayjs(match[1]);
  const taskType = parseTaskType(match[2]);
  const weight = parseInt(match[3], 10);
  const label = match[4];

  return {
    parsedLabel: label,
    taskType: taskType,
    weight: weight ? weight : 1,
    dueTime: dueTime,
  };
};

const parseTaskType = (c: string): TaskType => {
  switch (c) {
    case "-":
      return "reminder";
    case "+":
      return "todo";
    case "!":
      return "deadline";
    case "~":
      return "pending";
    case "@":
      return "schedule";
    default:
      return "vanilla";
  }
};
