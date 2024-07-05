export enum RouteType {
  dynamic,
  static,
  list,
}

export interface RouteContent {
  title: string;
  tags: string;
  description: string;
}

export interface RouteContentMeta {
  slug: string;
  content: string;
  attributes?: RouteContent;
}

export interface FrontMatterContentAttributes {
  title?: string;
  slug?: string;
  url?: string;
  draft?: boolean;
  content?: string;
}

export interface JsonMeta {
  meta: FrontMatterContentAttributes
}

export type JsonArr = {
  data: JsonMeta[]
}

export interface JsonContent {
  items: JsonMeta[]
}

export interface ContentObjListRoute {
  items: FrontMatterContentAttributes[];
  routeContent?: RouteContent
}

export interface CompiledRouteContent extends RouteContentMeta {
  meta: RouteContentMeta;
  routeContent?: RouteContent;
}

export interface Route {
  id: string;
  type: RouteType;
  source: string;
  destination: string;
  template: (contentData: any) => string;
  content: RouteContent;
  routeContent?: CompiledRouteContent;
}

export interface NestedRoute extends Route {
  listItemUrl: string;
  createSearchIndex: boolean;
}

export interface EngineArgs {
  routes?: (Route | NestedRoute)[]
}
