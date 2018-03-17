import { IContainer, IContext, Plan } from '../interfaces/interfaces';
import { guid } from "../utils/guid";

export class Context implements IContext {

    public guid: string;
    public container: IContainer;
    public plan: Plan;
    public currentRequest: Request;

    public constructor(
        container: IContainer) {
        this.guid = guid();
        this.container = container;
    }

    public addPlan(plan: Plan) {
        this.plan = plan;
    }

    public setCurrentRequest(currentRequest: Request) {
        this.currentRequest = currentRequest;
    }

}
