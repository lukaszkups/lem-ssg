import fs from 'fs';
import path from 'path';
import watch from 'node-watch';
import showdown, { Converter } from 'showdown';
import UglifyJS from 'uglify-js';
import uglifycss from 'uglifycss';
import LemCore from './core';
import LemStore from './store';
import type { BuildArgs, EngineArgs, Keyable, LemRoute, RouteContents, SearchEntryItem, WatchArgs } from './types';
import { RouteType } from './enums';


export default class Engine {
  path: string
  contentPath: string;
  contentStaticAssetsPath: string;
  assetsPath: string;
  outputPath: string;
  outputStaticPath: string;
  outputAssetsPath: string;
  store: LemStore;
  core: LemCore;
  markdown: Converter;

  constructor(args: EngineArgs) {
    const store = new LemStore();
    const currentPath = process.cwd();
    this.path = currentPath;
    this.contentPath = path.join(currentPath, args.contentPath || 'content').toString();
    this.contentStaticAssetsPath = path.join(this.contentPath, 'static').toString();
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
        meta,
        content: htmlContent // this is parsed "content" of markdown file as HTML
      }
      const routeContent = { ...contentObj, ...route.content };
      // compile content object with template
      let content = '';
      if (route.template.static && typeof route.template.static === 'function') {
        content = route.template.static(routeContent as RouteContents);
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
      const meta = this.markdown.getMetadata() as Keyable;
      // Remove extra quotation characters from title
      if (meta?.title) {
        meta.title = this.core.stripFromQuotes(meta.title as string);
      }
      // create reusable object that we send to render functions
      const contentObj = {
        meta,
        slug: meta?.slug || this.core.slugify(meta.title as string || String(Date.now())),
        content: htmlContent, // this is parsed "content" of markdown file as HTML
        routeContent: {},
      }
      // exclude drafts from search/pagination indexing
      if (!meta.draft) {
        entriesArr.push({
          ...meta,
          url: path.join(route.destinationPath, contentObj.slug as string)
        });
      }
      // Add route-based content to the object
      if (route.content) {
        contentObj.routeContent = route.content;
      }
      // create destination file url
      const outputFilePath = path.join(this.path, route.destinationPath, contentObj.slug as string);
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
    this.compileBlogNotesListing(route, entriesArr);
  }

  // Commands

  build(buildArgs: BuildArgs) {
    this.core.addRoutes(buildArgs.routes || []);
    this.compileRoutes();
    if (buildArgs.afterCompileCallback && typeof buildArgs.afterCompileCallback === 'function') {
      buildArgs.afterCompileCallback(buildArgs);
    }

    this.minifyAssets(buildArgs.assetsToMinify || []);
  }

  watch(watchArgs: WatchArgs) {
    watch(watchArgs.foldersToWatch || [], {
      recursive: true,
    }, () => {
      this.build(watchArgs);
    });
  }

  // Helper methods

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

  compileBlogNotesListing(route: LemRoute, entriesArr: SearchEntryItem[]) {
    if (route.pagination && route.pageSize && route.pageSize > 0) {
      const pages = Math.ceil(entriesArr.length / route.pageSize);
      const paginationLinks: string[] = [];
      for (let i = 0; i < pages; i++) {
        // let first page doesn't have to contain page number
        paginationLinks.push(i === 0 ? route.destinationPath : `${route.destinationPath}/page/${i + 1}/`);
        // we need to create page number folder with index.html inside it
        this.core.ensureDirExists(path.join(this.outputPath, paginationLinks[i]));
      }
      // Create every pagination page (compile template etc.)
      paginationLinks.forEach((pageLink: string, pageIndex: number) => {
        // @ts-ignore-next-line - we've checked if pageSize exists already
        const currentPageOfEntries = entriesArr.slice(pageIndex * route.pageSize, (pageIndex + 1) * route.pageSize) || [];
        const currentPage = pageIndex + 1;
        // Compile template
        let content = '';
        const contentObj = {
          list: currentPageOfEntries,
          currentPage,
          paginationLinks,
        }
        if (route.template.list && typeof route.template.list === 'function') {
          content = route.template.list(contentObj);
        }
        // Save current page list file
        fs.writeFileSync(path.join(pageLink, 'index.html'), content);
      })
    } else {
      // Handle unpaginated list of entries
      let content = '';
      const contentObj = {
        list: entriesArr,
      }
      if (route.template.list && typeof route.template.list === 'function') {
        content = route.template.list(contentObj);
      }
      // Save current page list file
      fs.writeFileSync(path.join(route.destinationPath, 'index.html'), content);
    }
  }

  // Will uglify/minify basic js/css files and move it into output static path folder
  minifyAssets(urlArr: string[]) {
    urlArr.forEach((url) => {
      const outputStaticPath = path.join(this.outputStaticPath, url);
      if (fs.existsSync(outputStaticPath)) {
        const txtContent = fs.readFileSync(outputStaticPath, 'utf8') || '';
        if (txtContent) {
          // handle js/css minification
          if (url.includes('.js')) {
            const result = UglifyJS.minify(txtContent);
            fs.writeFileSync(outputStaticPath, result?.code || txtContent);
          } else if (url.includes('.css')) {
            const result = uglifycss.processString(txtContent);
            fs.writeFileSync(outputStaticPath, result || txtContent);
          }
        }
      }
    });
  }
}