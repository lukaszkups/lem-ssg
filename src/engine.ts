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
  path: string
  contentPath: string;
  contentStaticAssetsPath: string;
  themePath: string;
  assetsPath: string;
  outputPath: string;
  outputStaticPath: string;
  outputAssetsPath: string;
  store: LemStore;
  core: LemCore;
  markdown: showdown;

  constructor(args: EngineArgs) {
    const store = new LemStore();
    const currentPath = process.cwd();
    this.path = currentPath;
    this.contentPath = path.join(currentPath, args.contentPath || 'content').toString();
    this.contentStaticAssetsPath = path.join(this.contentPath, 'static').toString();
    this.themePath = path.join(currentPath, args.themePath || 'theme').toString();
    this.assetsPath = path.join(currentPath, args.assetsPath || 'assets').toString();
    this.outputPath = path.join(currentPath, args.outputPath || 'output').toString();
    const outputPath = this.outputPath.toString();
    this.outputStaticPath = path.join(outputPath, 'static').toString();
    this.outputAssetsPath = path.join(outputPath, 'assets').toString();
    this.store = store;
    this.core = new LemCore({
      store
    });
    this.markdown = new showdown.Converter({ metadata: true });
    this.markdown.setFlavor('github');
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
    // create destination file url
    const outputFilePath = path.join(this.path, route.destinationPath).toString();
    // create destination directory (will contain index.html inside)
    this.core.ensureDirExists(outputFilePath);
    // if source prop is passed (to direct .md file) then fetch its contents
    if (route.sourcePath) {
      const txtContent = fs.readFileSync(path.join(this.path, route.sourcePath), 'utf8');
      // extract metadata from the current file
      const htmlContent = this.markdown.makeHtml(txtContent);
      // extract metadata from the current file
      const meta = this.markdown.getMetadata();
      // create reusable object that we send to render functions
      const contentObj = {
        meta: meta,
        content: htmlContent
      }
      const routeContent = { ...contentObj, ...route.content };
      // compile content object with template
      const content = route.template(routeContent || { title: Date.now() });
      // save file in the final path as index.html (for seamless routing)
      fs.writeFileSync(path.join(outputFilePath, 'index.html'), content);
    } else {
      throw new Error('Route does not have source path!');
    }
  }

  compileBlogEntryRoute(route: LemRoute) {

  }

  compileBlogNotesListRoute(route: LemRoute) {

  }

  copyStaticFilesDir() {
    this.core.ensureDirExists(this.outputStaticPath);
    fs.cpSync(this.assetsPath, this.outputStaticPath, { recursive: true });
  }

  copyContentAssetsDir() {
    this.core.ensureDirExists(this.outputAssetsPath);
    fs.cpSync(this.contentStaticAssetsPath, this.outputAssetsPath, { recursive: true });
  }

  copyRootFiles() {
    const pathToRootFolderContents = path.join(this.contentPath, 'root');
    this.core.ensureDirExists(pathToRootFolderContents);
    fs.cpSync(pathToRootFolderContents, this.outputPath, { recursive: true });
  }
}