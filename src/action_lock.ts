import * as vscode from "vscode";

export class ActionLock {
  regexDate: RegExp;
  regexWord: RegExp;
  underlineColor: string;
  ranges: [];

  constructor() {
    this.regexDate = /[12][90]\d{2}\-[01][0-9]\-[0-3][0-9]/g;
    const switchWords = [["[x]", "[ ]"]];

    const switchArray = [];
    for (const items of switchWords) {
      for (const item of items) {
        switchArray.push(item);
      }
    }

    this.regexWord = new RegExp(
      switchArray
        .map((d) => {
          return this.regexpEscape(d);
        })
        .join("|"),
      "g"
    );

    this.underlineColor = "underlineColor";
    this.ranges = [];
  }

  makeRanges(lines) {
    let match;
    this.ranges = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // 日付
        while ((match = this.regexDate.exec(line)) !== null) {
            let range = new vscode.Range(i, match.index, i, match.index + match[0].length);
            this.ranges.push(range);
        }

        // ユーザー定義
        while ((match = this.regexWord.exec(line)) != null) {
            let range = new vscode.Range(i, match.index, i, match.index + match[0].length);
            this.ranges.push(range);
        }
    }
}
  regexpEscape(regexpString: string) {
    return regexpString.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  getRanges(text) {
    this.makeRanges(text.split(/\r?\n/));
    return this.ranges;
  }

  updateDecorations(editor) {
    let ranges = this.getRanges(editor.document.getText());
    let decorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: "underline " + this.underlineColor,
    });
    editor.setDecorations(decorationType, ranges);
    return decorationType;
  }

  getRangeAtCursor(editor) {
    let ranges = this.getRanges(editor.document.getText());
    let selection = editor.selection;
    for (let i = 0; i < ranges.length; i++) {
      let range = ranges[i];
      if (this.isWithInRange(selection, range)) {
        return range;
      }
    }
    return null;
  }

  isWithInRange(selection, range) {
    if (range.start.line == 44) {
      console.log(selection, range);
    }
    var ret = true;
    if (
      range.start.line > selection.start.line ||
      range.end.line < selection.start.line
    ) {
      ret = false;
    }
    if (
      range.start.character >= selection.start.character ||
      range.end.character <= selection.start.character
    ) {
      ret = false;
    }
    return ret;
  }

  buildQuickPick() {
    var days = {};
    days[moment().format("YYYY-MM-DD")] = ["Today ."];
    days[moment().add(1, "day").format("YYYY-MM-DD")] = ["Tomorrow"];
    days[moment().add(7, "day").format("YYYY-MM-DD")] = ["NextWeek"];
    days[moment().add(14, "day").format("YYYY-MM-DD")] = ["+2week", "+14day"];
    days[moment().add(30, "day").format("YYYY-MM-DD")] = [
      "NextMonth",
      "+1month",
      "+30day",
    ];
    days[moment().add(60, "day").format("YYYY-MM-DD")] = ["+2month", "+60day"];
    days[moment().add(90, "day").format("YYYY-MM-DD")] = ["+3month", "+90day"];
    days[moment().add(180, "day").format("YYYY-MM-DD")] = [
      "+6month",
      "+180day",
    ];
    days[moment().add(360, "day").format("YYYY-MM-DD")] = [
      "NextYear",
      "+1year",
      "+12month",
      "+365day",
    ];

    for (var i = 1; i < 90; i++) {
      let _cd = moment().add(i, "day");
      let cd = _cd.format("YYYY-MM-DD");

      if (days[cd] == undefined) {
        days[cd] = [];
      }

      if (i < 8) {
        days[cd].push("Next" + _cd.format("dddd"));
      }

      days[cd].push("+" + i + "day");
    }

    var items = [];
    items = Object.keys(days)
      .map((key) => {
        return { label: key, description: days[key].join(", ") };
      })
      .sort((a, b) => {
        if (a.description.indexOf("Today") > -1) {
          return -1;
        }
        return a.label > b.label ? 1 : -1;
      });

    return items;
  }

  // for MDTasks
  indentLevel(line) {
    return /^(\s+)/.test(line) ? RegExp.$1.length : 0;
  }

  findParentTasks(lines, startRow) {
    let currentIndentLevel = this.indentLevel(lines[startRow]);
    for (let i = startRow; i >= 0; i--) {
      if (currentIndentLevel > this.indentLevel(lines[i])) {
        return i;
      }
    }
    return -1;
  }

  isChildTasksAllDone(edits, lines, parentRow) {
    let firstChildRow = parentRow + 1;
    let childIndentLevel = this.indentLevel(lines[firstChildRow]);
    for (let i = firstChildRow; i < lines.length; i++) {
      let line = lines[i];
      if (childIndentLevel > this.indentLevel(line)) {
        break;
      }
      if (childIndentLevel < this.indentLevel(line)) {
        continue;
      }

      let child = edits.filter((d) => {
        return d.range.start.line == i;
      });
      if (child.length > 0 && child[0].dist == "[x]") {
      } else if (child.length > 0 && child[0].dist == "[ ]") {
        return false;
      } else if (/^\s*\-?\s?\[\s\]\s/.test(line)) {
        return false;
      }
    }
    return true;
  }

  checkParentTasks(edits, lines) {
    let row = edits[edits.length - 1].range.start.line;

    let parentRow = this.findParentTasks(lines, row);
    if (parentRow == -1) {
      return edits;
    }

    let parentDone = this.isChildTasksAllDone(edits, lines, parentRow);

    this.makeRanges(lines);
    let range = this.ranges.filter((d) => {
      return d.start.line == parentRow;
    });
    let dist = "";
    if (range.length != 0) {
      dist = parentDone ? "[x]" : "[ ]";
      edits.push({ range: range[0], dist: dist });
    }

    if (
      parentRow != null &&
      dist != "" &&
      this.indentLevel(lines[parentRow]) != 0
    ) {
      return this.checkParentTasks(edits, lines);
    }

    return edits;
  }

  findCheckboxAtCursorLine(line) {
    let ranges = this.ranges.sort((a, b) => {
      if (a.start.line > b.start.line) {
        return 1;
      } else if (a.start.line < b.start.line) {
        return -1;
      } else {
        return a.start.character > b.start.character ? 1 : -1;
      }
    });

    let filteredRange = ranges.filter((d) => {
      return d.start.line == line;
    });
    if (filteredRange.length == 0) {
      return;
    }

    let position = new vscode.Position(
      filteredRange[0].start.line,
      filteredRange[0].start.character + 1
    );
    return position;
  }
}
