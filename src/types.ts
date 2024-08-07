import fs from 'fs';
import path from 'path';
import watch from 'node-watch';
import showdown from 'showdown';
import UglifyJS from 'uglify-js';
import uglifycss from 'uglifycss';

import { RouteType } from "./enums";
import LemStore from "./store";

export type EngineArgs = {
  contentPath?: string;
  assetsPath?: string;
  outputPath?: string;
}

export type Keyable = {
  [key: string | number | symbol]: string | string[] | number | number[];
}

export type RouteContents = {
  meta: Keyable;
  content: string;
}

export type RouteListContents = {
  list: SearchEntryItem[];
  currentPage?: number;
  paginationLinks?: string[];
}

export type LemRoute = {
  type: RouteType;
  name: string;
  sourcePath: string;
  destinationPath: string;
  template: {
    static?: (routeContents: RouteContents) => string;
    entry?: (routeContents: RouteContents) => string;
    list?: (routeContents: RouteListContents) => string;
  },
  content?: Keyable;
  pagination?: boolean;
  pageSize?: number;
}

export type CoreArgs = {
  store: LemStore;
}

export type SearchEntryItem = {
  title?: string;
  url?: string;
}

export type BuildArgs = {
  routes: LemRoute[];
  assetsToMinify: string[];
  afterCompileCallback?: (args: BuildArgs) => void;
}

export type WatchArgs = {
  foldersToWatch: string[];
  routes: LemRoute[];
  assetsToMinify: string[];
  afterCompileCallback?: (args: BuildArgs) => void;
}

export type Deps = {
  fs: typeof fs;
  path: typeof path;
  watch: typeof watch;
  showdown: typeof showdown;
  UglifyJS: typeof UglifyJS;
  uglifycss: typeof uglifycss;
}
