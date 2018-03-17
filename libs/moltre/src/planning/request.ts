import { Binding } from '../bindings/binding';
import { RequestScope, ServiceIdentifier } from '../interfaces/interfaces';
import { Context } from '../planning/context';
import { Target } from '../planning/target';
import { guid } from '../utils/guid';

class Request {

  public guid: string;
  public serviceIdentifier: ServiceIdentifier<any>;
  public parentContext: Context;
  public parentRequest: Request | null;
  public bindings: Binding<any>[];
  public childRequests: Request[];
  public target: Target;
  public requestScope: RequestScope;

  public constructor(serviceIdentifier: ServiceIdentifier<any>,
                     parentContext: Context,
                     parentRequest: Request | null,
                     bindings: (Binding<any> | Binding<any>[]),
                     target: Target) {
    this.guid = guid();
    this.serviceIdentifier = serviceIdentifier;
    this.parentContext = parentContext;
    this.parentRequest = parentRequest;
    this.target = target;
    this.childRequests = [];
    this.bindings = (Array.isArray(bindings) ? bindings : [bindings]);

    // Set requestScope if Request is the root request
    this.requestScope = parentRequest === null
      ? new Map<any, any>()
      : null;
  }

  public addChildRequest(serviceIdentifier: ServiceIdentifier<any>,
                         bindings: (Binding<any> | Binding<any>[]),
                         target: Target): Request {

    const child = new Request(
      serviceIdentifier,
      this.parentContext,
      this,
      bindings,
      target
    );
    this.childRequests.push(child);
    return child;
  }
}

export { Request };
