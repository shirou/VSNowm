import { ripGrep } from "./ripgrep";

type PlatformType = "ripgrep";

export const newSearch = (platform: PlatformType) => {
  return ripGrep;
};
