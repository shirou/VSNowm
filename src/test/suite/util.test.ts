import * as assert from "assert";
import * as dayjs from "dayjs";

import { resolveRoot, getReplacer, resolveFilePath } from "../../utils";

const date = dayjs("2018-04-04T16:00:00.000Z");
const dtFormat = "YYYY-MM-DDTHH:mm:ss";
const path = "{year}/{month}/{day}/{dt}.{ext}";
const root = "~/notes";

suite("Util Test Suite", () => {
  test("getReplacer", () => {
    assert.equal(getReplacer(dtFormat, "md", date).get("year"), "2018");
  });
  test("resolveRoot", () => {
    assert.equal(resolveRoot(root), "hoge");
  });
  test("resolveFilePath", () => {
    assert.equal(
      resolveFilePath(root, path, dtFormat, "md", date),
      "~/notes/2018/04/04/2018-04-04T16:00:00.md"
    );
  });
});
