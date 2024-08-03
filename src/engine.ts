import fs from 'fs';
import path from 'path';
import watch from 'node-watch';
import showdown from 'showdown';
import fm from 'front-matter';
import UglifyJS from 'uglify-js';
import uglifycss from 'uglifycss';
import LemCore from './core';
import LemStore from './store';
import type { EngineArgs, LemRoute, SearchEntryItem } from './types';
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
        case RouteType.blog:
          this.compileBlogRoute(route);
          break;
      }
    });
  }

  compileStaticRoute(route: LemRoute) {
    // create destination file url
    const outputFilePath = path.join(this.outputPath, route.destinationPath).toString();
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
        content: htmlContent // this is parsed "content" of markdown file as HTML
      }
      const routeContent = { ...contentObj, ...route.content };
      // compile content object with template
      let content = '';
      if (route.template.static && typeof route.template.static === 'function') {
        content = route.template.static(routeContent || { title: Date.now() });
      }
      // save file in the final path as index.html (for seamless routing)
      fs.writeFileSync(path.join(outputFilePath, 'index.html'), content);
    } else {
      throw new Error('Route does not have source path!');
    }
  }

  compileBlogRoute(route: LemRoute) {
    const routePath = path.join(this.path, route.sourcePath)
    // collect markdown files within directory
    const sourceFilePaths = this.core.getAllFilesWithinDirectory(routePath);
    // create destination list (root) directory (will contain folders 1 per list item with index.html file inside)
    this.core.ensureDirExists(path.join(this.path, route.destinationPath));
    // this arr will contain all entries (for pagination purposes etc.)
    const entriesArr: SearchEntryItem[] = [];
    // loop over source files and save them in destination directory
    sourceFilePaths.forEach((sourceFilePath) => {
      // read single file
      const txtContent = fs.readFileSync(path.join(routePath, sourceFilePath), 'utf8');
      // extract markdown and parse it into HTML
      const htmlContent = this.markdown.makeHtml(txtContent);
      // extract metadata from the current file
      const meta = this.markdown.getMetadata();
      // Remove extra quotation characters from title
      if (meta?.title) {
        meta.title = this.core.stripFromQuotes(meta.title);
      }
      // create reusable object that we send to render functions
      const contentObj = {
        meta,
        slug: meta?.slug || this.core.slugify(meta.title || String(Date.now())),
        content: htmlContent, // this is parsed "content" of markdown file as HTML
        routeContent: {},
      }
      // exclude drafts from search/pagination indexing
      if (!meta.draft) {
        entriesArr.push({
          ...meta,
          url: path.join(route.destinationPath, contentObj.slug)
        });
      }
      // Add route-based content to the object
      if (route.content) {
        contentObj.routeContent = route.content;
      }
      // create destination file url
      const outputFilePath = path.join(this.path, route.destinationPath, contentObj.slug);
      // create destination route item folder
      this.core.ensureDirExists(outputFilePath);
      // compile content object with template
      let content = '';
      if (route.template.entry && typeof route.template.entry === 'function') {
        content = route.template.entry(contentObj);
      }
      // save file in the final path as index.html (for seamless routing)
      fs.writeFileSync(path.join(outputFilePath, 'index.html'), content);
    });

    // create searchable json file and blog note list pages with pagination
    this.createSearchJsonfile(route, entriesArr);

    // compile blog notes listing with pagination handling
    
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

  createSearchJsonfile(route: LemRoute, entriesArr: SearchEntryItem[]) {
    const destinationPath = path.join(this.outputPath, route.destinationPath);
    this.core.ensureDirExists(destinationPath);
    fs.writeFileSync(path.join(destinationPath, 'search.json'), JSON.stringify({
      data: entriesArr
    }));
  }
}