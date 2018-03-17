import { Binding } from '../bindings/binding';
import { Context } from '../planning/context';
import { BindingWhenSyntax } from './binding_when_syntax';

export class BindingOnSyntax<T> {

    private _binding: Binding<T>;

    public constructor(binding: Binding<T>) {
        this._binding = binding;
    }

    public onActivation(handler: (context: Context, injectable: T) => T): BindingWhenSyntax<T> {
        this._binding.onActivation = handler;
        return new BindingWhenSyntax<T>(this._binding);
    }

}
