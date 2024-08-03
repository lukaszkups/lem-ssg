import fs from 'fs';
import path from 'path';
import watch from 'node-watch';
import showdown from 'showdown';
import fm from 'front-matter';
import UglifyJS from 'uglify-js';
import uglifycss from 'uglifycss';
import LemCore from './core';
import LemStore from './store';
import type { EngineArgs, LemRoute } from './types';
import { RouteType } from './enums';


export default class Engine {
  path: fs.PathLike
  contentPath: fs.PathLike;
  contentStaticAssetsPath: fs.PathLike;
  themePath: fs.PathLike;
  assetsPath: fs.PathLike;
  outputPath: fs.PathLike;
  outputStaticPath: fs.PathLike;
  outputAssetsPath: fs.PathLike;
  store: LemStore;
  core: LemCore;
  
  constructor(args: EngineArgs) {
    const store = new LemStore();
    const currentPath = process.cwd();
    this.path = currentPath;
    this.contentPath = path.join(currentPath, args.contentPath || 'content');
    this.contentStaticAssetsPath = path.join(this.contentPath, 'static');
    this.themePath = path.join(currentPath, args.themePath || 'theme');
    this.assetsPath = path.join(currentPath, args.assetsPath || 'assets');
    this.outputPath = path.join(currentPath, args.outputPath || 'output');
    const outputPath = this.outputPath.toString();
    this.outputStaticPath = path.join(outputPath, 'static')
    this.outputAssetsPath = path.join(outputPath, 'assets')
    this.store = store;
    this.core = new LemCore({
      store
    });
  }

  compile() {
    // clean output/target directory
    this.core.clearFolder(this.outputPath);
    // compile all route files/page contents
    this.compileRoutes();
    // copy static files, such as custom .js, .css, .html files etc.
    this.copyStaticFilesDir();
    // copy content asset files such as images placed inside articles etc.
    this.copyContentAssetsDir();
    // copy files that should be placed in root of the output folder, such as CNAME file etc.
    this.copyRootFiles();
  }

  compileRoutes() {
    this.store.routes.forEach((route: LemRoute) => {
      switch (route.type) {
        case RouteType.static:
          this.compileStaticRoute(route);
          break;
        case RouteType.blogEntry:
          this.compileBlogEntryRoute(route);
          break;
        case RouteType.blogNotesList:
          this.compileBlogNotesListRoute(route);
          break;
      }
    });
  }

  compileStaticRoute(route: LemRoute) {
    
  }

  compileBlogEntryRoute(route: LemRoute) {

  }

  compileBlogNotesListRoute(route: LemRoute) {

  }

  copyStaticFilesDir() {
    this.core.ensureDirExists(this.outputStaticPath);
    fs.cpSync(this.assetsPath.toString(), this.outputStaticPath.toString(), { recursive: true });
  }

  copyContentAssetsDir() {
    this.core.ensureDirExists(this.outputAssetsPath);
    fs.cpSync(this.contentStaticAssetsPath.toString(), this.outputAssetsPath.toString(), { recursive: true });
  }

  copyRootFiles() {
    const pathToRootFolderContents = path.join(this.contentPath.toString(), 'root');
    this.core.ensureDirExists(pathToRootFolderContents);
    fs.cpSync(pathToRootFolderContents, this.outputPath.toString(), { recursive: true });
  }
}