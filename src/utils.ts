import * as path from "path";
import * as os from "os";

import * as dayjs from "dayjs";

export const resolveRoot = (filepath?: string) => {
  if (!filepath) {
    return path.join(os.homedir(), "notes");
  }
  return filepath.replace("~", os.homedir());
};

export const resolveFilePath = (
  root: string,
  notePath: string,
  dtformat: string,
  ext: string,
  date: dayjs.Dayjs | null = null
) => {
  const orig = path.join(root, notePath);
  if (!date) {
    date = dayjs();
  }

  const resolved = templateString(orig, getReplacer(dtformat, ext, date));

  return resolved;
};

export const getReplacer = (
  dtformat: string,
  ext: string,
  date?: dayjs.Dayjs
) => {
  if (!date) {
    date = dayjs();
  }

  return new Map<string, string>([
    ["year", date.format("YYYY").toString()],
    ["month", date.format("MM").toString()],
    ["day", date.format("DD").toString()],
    ["hour", date.format("HH").toString()],
    ["mintue", date.format("mm").toString()],
    ["second", date.format("ss").toString()],
    ["dt", date.format(dtformat)],
    ["ext", ext],
  ]);
};

export const templateString = (
  content: string,
  replacer: Map<string, string>
) => {
  for (const [key, value] of replacer.entries()) {
    content = content.replace(`{${key}}`, value);
  }
  return content;
};
