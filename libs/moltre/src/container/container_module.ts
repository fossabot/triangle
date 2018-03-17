import { AsyncContainerModuleCallBack, ContainerModuleCallBack } from '../interfaces/interfaces';
import { guid } from "../utils/guid";

export class ContainerModule {

  public guid: string;
  public registry: ContainerModuleCallBack;

  public constructor(registry: ContainerModuleCallBack) {
    this.guid = guid();
    this.registry = registry;
  }

}

export class AsyncContainerModule {

  public guid: string;
  public registry: AsyncContainerModuleCallBack;

  public constructor(registry: AsyncContainerModuleCallBack) {
    this.guid = guid();
    this.registry = registry;
  }
}
