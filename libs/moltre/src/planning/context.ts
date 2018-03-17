import { Container } from '../container/container';
import { Plan } from '../interfaces/interfaces';
import { guid } from '../utils/guid';

export class Context{

    public guid: string;
    public container: Container;
    public plan: Plan;
    public currentRequest: Request;

    public constructor(
        container: Container) {
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
