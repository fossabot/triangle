import { Container } from '../container/container';
import { ServiceIdentifier } from '../interfaces/interfaces';

export const multiBindToService = (container: Container) =>
    (service: ServiceIdentifier<any>) =>
        (...types: ServiceIdentifier<any>[]) =>
            types.forEach((t) => container.bind(t).toService(service));
