import { Binding } from '../bindings/binding';
import * as ERROR_MSGS from '../constants/error-msgs';
import { BindingTypeEnum } from '../constants/literal-types';
import { Abstract, Newable, ProviderCreator, ServiceIdentifier } from '../interfaces/interfaces';
import { Context } from '../planning/context';
import { BindingInWhenOnSyntax } from './binding_in_when_on_syntax';
import { BindingWhenOnSyntax } from './binding_when_on_syntax';

export class BindingToSyntax<T> implements BindingToSyntax<T> {

    private _binding: Binding<T>;

    public constructor(binding: Binding<T>) {
        this._binding = binding;
    }

    public to(constructor: { new(...args: any[]): T }): BindingInWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Instance;
        this._binding.implementationType = constructor;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public toSelf(): BindingInWhenOnSyntax<T> {
        if (typeof this._binding.serviceIdentifier !== "function") {
            throw new Error(`${ERROR_MSGS.INVALID_TO_SELF_VALUE}`);
        }
        const self: any = this._binding.serviceIdentifier;
        return this.to(self);
    }

    public toConstantValue(value: T): BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.ConstantValue;
        this._binding.cache = value;
        this._binding.dynamicValue = null;
        this._binding.implementationType = null;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.DynamicValue;
        this._binding.cache = null;
        this._binding.dynamicValue = func;
        this._binding.implementationType = null;
        return new BindingInWhenOnSyntax<T>(this._binding);
    }

    public toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Constructor;
        this._binding.implementationType = constructor as any;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Factory;
        this._binding.factory = factory;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toFunction(func: T): BindingWhenOnSyntax<T> {
        // toFunction is an alias of toConstantValue
        if (typeof func !== "function") { throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING); }
        const bindingWhenOnSyntax = this.toConstantValue(func);
        this._binding.type = BindingTypeEnum.Function;
        return bindingWhenOnSyntax;
    }

    public toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Factory;
        this._binding.factory = (context) => {
            const autofactory = () => context.container.get<T2>(serviceIdentifier);
            return autofactory;
        };
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T> {
        this._binding.type = BindingTypeEnum.Provider;
        this._binding.provider = provider;
        return new BindingWhenOnSyntax<T>(this._binding);
    }

    public toService(service: string | symbol | Newable<T> | Abstract<T>): void {
        this.toDynamicValue(
            (context) => context.container.get<T>(service)
        );
    }

}
