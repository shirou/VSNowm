import { RipGrep } from "./ripgrep";
import { TaskTreeItem } from "../models/tasks";
import { LinkTreeItem, LinkQuickPickItem } from "../models/links";

type PlatformType = "ripgrep";

export const newSearcher = (platform: PlatformType, ext: string): Searcher => {
  return new RipGrep(ext);
};

export interface Searcher {
  searchTodo(root: string): Promise<TaskTreeItem[]>;
  searchLinks(root: string, link: string): Promise<LinkQuickPickItem[]>;
  listLinks(root: string): Promise<LinkTreeItem[]>;
}
