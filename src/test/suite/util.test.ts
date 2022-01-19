import * as assert from "assert";
import * as dayjs from "dayjs";

import { resolveFilePath } from "../../utils";

const date = dayjs("2018-04-04T16:00:00.000Z");
const path =
  "{year}/{month}/{day}/{year}-{month}-{day}_{hour}{mintue}{seconds}.{ext}";
const root = "~/notes";

suite("Util Test Suite", () => {
  test("resolveFilePath", () => {
    assert.equal(
      resolveFilePath(root, path, "md", date),
      "~/notes/2018/04/04/2018-04-04_160000.md"
    );
  });
});
