import { Binding } from '../bindings/binding';
import { Lookup, Next } from '../interfaces/interfaces';

export class ContainerSnapshot {

  public bindings: Lookup<Binding<any>>;
  public middleware: Next | null;

  public static of(bindings: Lookup<Binding<any>>, middleware: Next | null) {
    const snapshot = new ContainerSnapshot();
    snapshot.bindings = bindings;
    snapshot.middleware = middleware;
    return snapshot;
  }
}
