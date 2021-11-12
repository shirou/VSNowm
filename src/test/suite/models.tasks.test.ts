import * as assert from "assert";
import * as dayjs from "dayjs";

import { TaskTreeItem } from "../../models/tasks";

const date = dayjs("2018-04-04T16:00:00.000Z");
const dtFormat = "YYYY-MM-DDTHH:mm:ss";
const path = "{year}/{month}/{day}/{dt}.{ext}";
const root = "~/notes";

suite("model task tests", () => {
  test("HowmTest", () => {
    const t = new TaskTreeItem("- [2021-10-21]! foo", "path", 1);
    console.log(t);
  });
});
