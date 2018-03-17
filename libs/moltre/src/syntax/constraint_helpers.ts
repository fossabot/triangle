import { MetadataKeys } from '../constants/metadata-keys';
import { ConstraintFunction } from '../interfaces/interfaces';
import { Metadata } from '../planning/metadata';
import { Request } from '../planning/request';
import { Binding } from '../bindings/binding';

export const traverseAncerstors = (
    request: Request,
    constraint: ConstraintFunction
): boolean => {

    const parent = request.parentRequest;
    if (parent !== null) {
        return constraint(parent) ? true : traverseAncerstors(parent, constraint);
    } else {
        return false;
    }
};

// This helpers use currying to help you to generate constraints

export const taggedConstraint = (key: string | number | symbol) => (value: any) => {

    const constraint: ConstraintFunction =  (request: Request | null) =>
        request !== null && request.target !== null && request.target.matchesTag(key as string)(value);

    constraint.metaData = new Metadata(key, value);

    return constraint;
};

export const namedConstraint = taggedConstraint(MetadataKeys.NAMED_TAG);

export const typeConstraint = (type: (Function | string)) => (request: Request | null) => {

    // Using index 0 because constraints are applied
    // to one binding at a time (see Planner class)
    let binding: Binding<any> | null = null;

    if (request !== null) {
        binding = request.bindings[0];
        if (typeof type === "string") {
            const serviceIdentifier = binding.serviceIdentifier;
            return serviceIdentifier === type;
        } else {
            const constructor = request.bindings[0].implementationType;
            return type === constructor;
        }
    }

    return false;
};
