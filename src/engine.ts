
import LemStore from './store';
import type { EngineArgs } from './types';


export default class Engine {
  contentPath: string;
  themePath: string;
  assetsPath: string;
  store: LemStore;

  constructor(args: EngineArgs) {
    this.contentPath = args.contentPath || 'content';
    this.themePath = args.themePath || 'theme';
    this.assetsPath = args.assetsPath || 'assets';
    this.store = new LemStore();
  }


}