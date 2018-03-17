import { Context } from '../planning/context';

export class Plan {

  public parentContext: Context;
  public rootRequest: Request;

  public constructor(parentContext: Context, rootRequest: Request) {
    this.parentContext = parentContext;
    this.rootRequest = rootRequest;
  }
}
