import { RouteType } from "./enums";
import LemStore from "./store";

export type EngineArgs = {
  contentPath?: string
  themePath?: string;
  assetsPath?: string;
  outputPath?: string;
}

export type LemRoute = {
  type: RouteType,
  name: string,
  sourcePath: string,
  destinationPath: string,
  themeUrl: string,
}

export type CoreArgs = {
  store: LemStore;
}
