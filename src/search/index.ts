import { RipGrep } from "./ripgrep";
import { TaskTreeItem } from "../models/tasks";

type PlatformType = "ripgrep";

export const newSearcher = (platform: PlatformType, ext: string): Searcher => {
  console.log("new searcher");
  return new RipGrep(ext);
};

export interface Searcher {
  searchTodo(root: string): Promise<TaskTreeItem[]>;
}
