import { Binding } from '../bindings/binding';
import { Context } from '../planning/context';
import { BindingOnSyntax } from './binding_on_syntax';
import { BindingWhenSyntax } from './binding_when_syntax';

export class BindingWhenOnSyntax<T> implements BindingOnSyntax<T> {

    private _bindingWhenSyntax: BindingWhenSyntax<T>;
    private _bindingOnSyntax: BindingOnSyntax<T>;
    private _binding: Binding<T>;

    public constructor(binding: Binding<T>) {
        this._binding = binding;
        this._bindingWhenSyntax = new BindingWhenSyntax<T>(this._binding);
        this._bindingOnSyntax = new BindingOnSyntax<T>(this._binding);
    }

    public when(constraint: (request: Request) => boolean): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.when(constraint);
    }

    public whenTargetNamed(name: string): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenTargetNamed(name);
    }

    public whenTargetIsDefault(): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenTargetIsDefault();
    }

    public whenTargetTagged(tag: string, value: any): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenTargetTagged(tag, value);
    }

    public whenInjectedInto(parent: (Function | string)): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenInjectedInto(parent);
    }

    public whenParentNamed(name: string): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenParentNamed(name);
    }

    public whenParentTagged(tag: string, value: any): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenParentTagged(tag, value);
    }

    public whenAnyAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorIs(ancestor);
    }

    public whenNoAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorIs(ancestor);
    }

    public whenAnyAncestorNamed(name: string): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorNamed(name);
    }

    public whenAnyAncestorTagged(tag: string, value: any): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorTagged(tag, value);
    }

    public whenNoAncestorNamed(name: string): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorNamed(name);
    }

    public whenNoAncestorTagged(tag: string, value: any): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorTagged(tag, value);
    }

    public whenAnyAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenAnyAncestorMatches(constraint);
    }

    public whenNoAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T> {
        return this._bindingWhenSyntax.whenNoAncestorMatches(constraint);
    }

    public onActivation(handler: (context: Context, injectable: T) => T): BindingWhenSyntax<T> {
        return this._bindingOnSyntax.onActivation(handler);
    }
}
