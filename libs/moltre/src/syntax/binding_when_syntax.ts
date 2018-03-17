import { Binding } from '../bindings/binding';
import { interfaces } from '../interfaces/interfaces';
import { Request } from '../planning/request';
import { BindingOnSyntax } from './binding_on_syntax';
import { namedConstraint, taggedConstraint, traverseAncerstors, typeConstraint } from './constraint_helpers';

export class BindingWhenSyntax<T> {

    private _binding: Binding<T>;

    public constructor(binding: Binding<T>) {
        this._binding = binding;
    }

    public when(constraint: (request: Request) => boolean): BindingOnSyntax<T> {
        this._binding.constraint = constraint;
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetNamed(name: string | number | symbol): BindingOnSyntax<T> {
        this._binding.constraint = namedConstraint(name);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetIsDefault(): BindingOnSyntax<T> {

        this._binding.constraint = (request: Request) => {

            const targetIsDefault = (request.target !== null) &&
                (!request.target.isNamed()) &&
                (!request.target.isTagged());

            return targetIsDefault;
        };

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenTargetTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T> {
        this._binding.constraint = taggedConstraint(tag)(value);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenInjectedInto(parent: (Function | string)): BindingOnSyntax<T> {
        this._binding.constraint = (request: Request) =>
            typeConstraint(parent)(request.parentRequest);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentNamed(name: string | number | symbol): BindingOnSyntax<T> {
        this._binding.constraint = (request: Request) =>
            namedConstraint(name)(request.parentRequest);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenParentTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T> {
        this._binding.constraint = (request: Request) =>
            taggedConstraint(tag)(value)(request.parentRequest);
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T> {
        this._binding.constraint = (request: Request) =>
            traverseAncerstors(request, typeConstraint(ancestor));
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T> {
        this._binding.constraint = (request: Request) =>
            !traverseAncerstors(request, typeConstraint(ancestor));
        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorNamed(name: string | number | symbol): BindingOnSyntax<T> {

        this._binding.constraint = (request: Request) =>
            traverseAncerstors(request, namedConstraint(name));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorNamed(name: string | number | symbol): BindingOnSyntax<T> {

        this._binding.constraint = (request: Request) =>
            !traverseAncerstors(request, namedConstraint(name));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T> {

        this._binding.constraint = (request: Request) =>
            traverseAncerstors(request, taggedConstraint(tag)(value));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorTagged(tag: string | number | symbol, value: any): BindingOnSyntax<T> {

        this._binding.constraint = (request: Request) =>
            !traverseAncerstors(request, taggedConstraint(tag)(value));

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenAnyAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T> {

        this._binding.constraint = (request: Request) =>
            traverseAncerstors(request, constraint);

        return new BindingOnSyntax<T>(this._binding);
    }

    public whenNoAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T> {

        this._binding.constraint = (request: Request) =>
            !traverseAncerstors(request, constraint);

        return new BindingOnSyntax<T>(this._binding);
    }

}
