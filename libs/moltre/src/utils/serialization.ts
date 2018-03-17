import { Binding } from '../bindings/binding';
import * as ERROR_MSGS from '../constants/error-msgs';
import { Container } from '../container/container';
import { ServiceIdentifier } from '../interfaces/interfaces';
import { Request } from '../planning/request';
import { Target } from '../planning/target';

function getServiceIdentifierAsString(serviceIdentifier: ServiceIdentifier<any>): string {
    if (typeof serviceIdentifier === "function") {
        const _serviceIdentifier: any = serviceIdentifier;
        return _serviceIdentifier.name;
    } else if (typeof serviceIdentifier === "symbol") {
        return serviceIdentifier.toString();
    } else { // string
        const _serviceIdentifier: any = serviceIdentifier;
        return _serviceIdentifier;
    }
}

function listRegisteredBindingsForServiceIdentifier(
    container: Container,
    serviceIdentifier: string,
    getBindings: <T>(
        container: Container,
        serviceIdentifier: ServiceIdentifier<T>
    ) => Binding<T>[]
): string {

    let registeredBindingsList = "";
    const registeredBindings = getBindings(container, serviceIdentifier);

    if (registeredBindings.length !== 0) {

        registeredBindingsList = "\nRegistered bindings:";

        registeredBindings.forEach((binding: Binding<any>) => {

            // Use "Object as name of constant value injections"
            let name = "Object";

            // Use function name if available
            if (binding.implementationType !== null) {
                name = getFunctionName(binding.implementationType);
            }

            registeredBindingsList = `${registeredBindingsList}\n ${name}`;

            if (binding.constraint.metaData) {
                registeredBindingsList = `${registeredBindingsList} - ${binding.constraint.metaData}`;
            }

        });

    }

    return registeredBindingsList;
}

function alreadyDependencyChain(
    request: Request,
    serviceIdentifier: ServiceIdentifier<any>
): boolean {
    if (request.parentRequest === null) {
        return false;
    } else if (request.parentRequest.serviceIdentifier === serviceIdentifier) {
        return true;
    } else {
        return alreadyDependencyChain(request.parentRequest, serviceIdentifier);
    }
}

function dependencyChainToString(
    request: Request
) {

    function _createStringArr(
        req: Request,
        result: string[] = []
    ): string[] {
        const serviceIdentifier = getServiceIdentifierAsString(req.serviceIdentifier);
        result.push(serviceIdentifier);
        if (req.parentRequest !== null) {
            return _createStringArr(req.parentRequest, result);
        }
        return result;
    }

    const stringArr = _createStringArr(request);
    return stringArr.reverse().join(" --> ");

}

function circularDependencyToException(
    request: Request
) {
    request.childRequests.forEach((childRequest) => {
        if (alreadyDependencyChain(childRequest, childRequest.serviceIdentifier)) {
            const services = dependencyChainToString(childRequest);
            throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${services}`);
        } else {
            circularDependencyToException(childRequest);
        }
    });
}

function listMetadataForTarget(serviceIdentifierString: string, target: Target): string {
    if (target.isTagged() || target.isNamed()) {

        let m = "";

        const namedTag = target.getNamedTag();
        const otherTags = target.getCustomTags();

        if (namedTag !== null) {
            m += namedTag.toString() + "\n";
        }

        if (otherTags !== null) {
            otherTags.forEach((tag) => {
                m += tag.toString() + "\n";
            });
        }

        return ` ${serviceIdentifierString}\n ${serviceIdentifierString} - ${m}`;

    } else {
        return ` ${serviceIdentifierString}`;
    }
}

function getFunctionName(v: any): string {
    if (v.name) {
        return v.name;
    } else {
        const name = v.toString();
        const match = name.match(/^function\s*([^\s(]+)/);
        return match ? match[1] : `Anonymous function: ${name}`;
    }
}

export {
    getFunctionName,
    getServiceIdentifierAsString,
    listRegisteredBindingsForServiceIdentifier,
    listMetadataForTarget,
    circularDependencyToException
};
