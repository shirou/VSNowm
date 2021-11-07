# VSNowm README

VSNowm is a note taking extension for the VS Code. This is inspired many things by [VSNote](https://marketplace.visualstudio.com/items?itemName=patricklee.vsnotes), but this is not a Note taking tool, but 

- [Howm](https://howm.osdn.jp/index.html) format task

# Features

- Note taking tool. but not just a note.
- Titles are not required (but can be included). Start writing as soon as you think of it!
- None of us can "categorize" a Note. Find the notes you want with full text search and links.
  - VSNowm uses `ripgrep` to quick full text search.
- Works on Remote connection
- Synchronization with Git

# Quick Start

- Install the extension from the VS Code Extension menu or click install on [this page]().
- Open the command palette Ctrl/Cmd + Shift + p and type `VSNowm: Create note`
- enjoy!
  - Your first note stores in the `~/notes`. If you want to change, please setup the configurations.


# Commands

- `vsnowm.newNote`
- `vsnowm.sync`

# Settings

- vsnowm.defaultNoteRoot:
  - default: "~/notes/"
  - You can add `vsnowm.defaultNoteRoot` to `settingsSync.ignoredSettings` to run on multiple place.
- vsnowm.defaultNoteFilePath":
  - default: "{year}/{month}/{day}/{dt}.{ext}",
- vsnowm.defaultDateFormat
  - default: "YYYY-MM-DDTHH:mm:ss"
- vsnowm.defaultExt
  - default: "md"
- vsnowm.listRecentLimit
  - default: 15
- vsnowm.autoSyncIntervalSec
  - default: 300

# Documents

- templates is `${your note folder}/templates/default.md`.
  - This will be changed or selectable, but not implmeneted yet.


## Task Format

There are 2 kind of Task format.

- Normal todo format. 
  - `- [ ] This is TODO`
- [howm](https://howm.osdn.jp/index.html) format
  - `[2021-11-20]@ This is TODO`

### Normal TODO format

- Each column has tasks that start with a checkbox sign `- [ ]`
  - Note: This only works if you start at the beginning of the line.
- Completed task must contain `[x]`.

### Howm format

Increase in the number of items → Only "important" items are looked at → Even small items are registered as "important" → Inflation → Bankruptcy

Howm format abolishes "importance". Instead, use the "float" method to change the display order

- reminder: slowly sinking (I can't do everything anyway :p)
- todo: Gradually float
- Deadlines: float when the specified date approaches 

When you use Howm format, tasks are sorted by calculated point.

```
[YYYY-MM-DD]@ Text
````

Here is format descibred by RegEx.

```
\[\d{4}-\d{2}-\d{2}\][-+!@.]
```

Date should be `YYYY-mm-dd`.

- Reminder = `-` :  
  - Rises to the upper on the specified date and gradually sinks thereafter.
  - Hides at the bottom until the specified date.
- Todo = `+` :
  - From the specified date, gradually rises to the upper.
  - Hides at the bottom until the specified date.
- Deadline = `!` :
  - When the appointed day approaches, it rises to the top.
  - After the designated date, it will remain at the top.
- Pending = `~`
  - From the specified date, ups and downs are repeated.
  - Hides at the bottom until the specified date.
  - The number of days to float is default 30 days.
- Schedule = `@` : 
  - Show in the calendar instead of the todo list (Not implemented yet)
- Done = `.`:
  - Finished task. Does not appear.


## Limitation

- No subtasks for normal task format.
- Can not run on VSCode Web Extention.
  - Because this code uses RipGrep. But because there is interface on search, we can run on web extension.

## TODO

- Can not specify number for Howm format.
- Calculation on Howm format is not correct.

## Known Issues

## Release Notes

### 0.0.1

Initial release

## License

MIT (same as VSNote)
