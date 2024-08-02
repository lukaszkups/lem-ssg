import { RouteType } from "./enums";

export type EngineArgs = {
  contentPath?: string
  themePath?: string;
  assetsPath?: string;
}

export type LemRoute = {
  type: RouteType,
  name: string,
  sourcePath: string,
  destinationPath: string,
  themeUrl: string,
}
