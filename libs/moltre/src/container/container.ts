import { Binding } from "../bindings/binding";
import * as ERROR_MSGS from "../constants/error_msgs";
import { BindingScopeEnum, TargetTypeEnum } from "../constants/literal_types";
import * as METADATA_KEY from "../constants/metadata_keys";
import { AsyncContainerModule, ContainerModule } from '../container/container_module';
import {
  ContainerOptions,
  IContext,
  IBinding,
  IContainer,
  Middleware,
  Newable,
  Next,
  NextArgs,
  ServiceIdentifier,
  TargetType
} from '../interfaces/interfaces';
import { MetadataReader } from "../planning/metadata_reader";
import { createMockRequest, getBindingDictionary, plan } from "../planning/planner";
import { resolve } from "../resolution/resolver";
import { BindingToSyntax } from "../syntax/binding_to_syntax";
import { guid } from "../utils/guid";
import { getServiceIdentifierAsString } from "../utils/serialization";
import { ContainerSnapshot } from "./container_snapshot";
import { Lookup } from "./lookup";

export class Container {

    public guid: string;
    public parent: IContainer | null;
    public readonly options: ContainerOptions;
    private _middleware: Next | null;
    private _bindingDictionary: Lookup<Binding<any>>;
    private _snapshots: ContainerSnapshot[];
    private _metadataReader: MetadataReader;

    public static merge(container1: IContainer, container2: IContainer): IContainer {

        const container = new Container();
        const bindingDictionary: Lookup<IBinding<any>> = getBindingDictionary(container);
        const bindingDictionary1: Lookup<IBinding<any>> = getBindingDictionary(container1);
        const bindingDictionary2: Lookup<IBinding<any>> = getBindingDictionary(container2);

        function copyDictionary(
            origin: Lookup<IBinding<any>>,
            destination: Lookup<IBinding<any>>
        ) {

            origin.traverse((key, value) => {
                value.forEach((binding) => {
                    destination.add(binding.serviceIdentifier, binding.clone());
                });
            });

        }

        copyDictionary(bindingDictionary1, bindingDictionary);
        copyDictionary(bindingDictionary2, bindingDictionary);

        return container;

    }

    public constructor(containerOptions?: ContainerOptions) {

        if (containerOptions !== undefined) {

            if (typeof containerOptions !== "object") {
                throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_MUST_BE_AN_OBJECT}`);
            } else {
                if (containerOptions.defaultScope !== undefined &&
                    containerOptions.defaultScope !== BindingScopeEnum.Singleton &&
                    containerOptions.defaultScope !== BindingScopeEnum.Transient &&
                    containerOptions.defaultScope !== BindingScopeEnum.Request
                ) {
                    throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE}`);
                }

                if (containerOptions.autoBindInjectable !== undefined &&
                    typeof containerOptions.autoBindInjectable !== "boolean"
                ) {
                    throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_AUTO_BIND_INJECTABLE}`);
                }
            }

            this.options = {
                autoBindInjectable: containerOptions.autoBindInjectable,
                defaultScope: containerOptions.defaultScope
            };

        } else {
            this.options = {
                autoBindInjectable: false,
                defaultScope: BindingScopeEnum.Transient
            };
        }

        this.guid = guid();
        this._bindingDictionary = new Lookup<Binding<any>>();
        this._snapshots = [];
        this._middleware = null;
        this.parent = null;
        this._metadataReader = new MetadataReader();
    }

    public load(...modules: ContainerModule[]) {

        const getHelpers = this._getContainerModuleHelpersFactory();

        for (const currentModule of modules) {

            const containerModuleHelpers = getHelpers(currentModule.guid);

            currentModule.registry(
                containerModuleHelpers.bindFunction,
                containerModuleHelpers.unbindFunction,
                containerModuleHelpers.isboundFunction,
                containerModuleHelpers.rebindFunction
            );

        }

    }

    public async loadAsync(...modules: AsyncContainerModule[]) {

        const getHelpers = this._getContainerModuleHelpersFactory();

        for (const currentModule of modules) {

            const containerModuleHelpers = getHelpers(currentModule.guid);

            await currentModule.registry(
                containerModuleHelpers.bindFunction,
                containerModuleHelpers.unbindFunction,
                containerModuleHelpers.isboundFunction,
                containerModuleHelpers.rebindFunction
            );

        }

    }

    public unload(...modules: ContainerModule[]): void {

        const conditionFactory = (expected: any) => (item: IBinding<any>): boolean =>
            item.moduleId === expected;

        modules.forEach((module) => {
            const condition = conditionFactory(module.guid);
            this._bindingDictionary.removeByCondition(condition);
        });

    }

    // Registers a type binding
    public bind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T> {
        const scope = this.options.defaultScope || BindingScopeEnum.Transient;
        const binding = new Binding<T>(serviceIdentifier, scope);
        this._bindingDictionary.add(serviceIdentifier, binding);
        return new BindingToSyntax<T>(binding);
    }

    public rebind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T> {
        this.unbind(serviceIdentifier);
        return this.bind(serviceIdentifier);
    }

    // Removes a type binding from the registry by its key
    public unbind(serviceIdentifier: ServiceIdentifier<any>): void {
        try {
            this._bindingDictionary.remove(serviceIdentifier);
        } catch (e) {
            throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${getServiceIdentifierAsString(serviceIdentifier)}`);
        }
    }

    // Removes all the type bindings from the registry
    public unbindAll(): void {
        this._bindingDictionary = new Lookup<Binding<any>>();
    }

    // Allows to check if there are bindings available for serviceIdentifier
    public isBound(serviceIdentifier: ServiceIdentifier<any>): boolean {
        let bound = this._bindingDictionary.hasKey(serviceIdentifier);
        if (!bound && this.parent) {
            bound = this.parent.isBound(serviceIdentifier);
        }
        return bound;
    }

    public isBoundNamed(serviceIdentifier: ServiceIdentifier<any>, named: string | number | symbol): boolean {
        return this.isBoundTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Check if a binding with a complex constraint is available without throwing a error. Ancestors are also verified.
    public isBoundTagged(serviceIdentifier: ServiceIdentifier<any>, key: string | number | symbol, value: any): boolean {
        let bound = false;

        // verify if there are bindings available for serviceIdentifier on current binding dictionary
        if (this._bindingDictionary.hasKey(serviceIdentifier)) {
            const bindings = this._bindingDictionary.get(serviceIdentifier);
            const request = createMockRequest(this, serviceIdentifier, key, value);
            bound = bindings.some((b) => b.constraint(request));
        }

        // verify if there is a parent container that could solve the request
        if (!bound && this.parent) {
            bound = this.parent.isBoundTagged(serviceIdentifier, key, value);
        }

        return bound;
    }

    public snapshot(): void {
        this._snapshots.push(ContainerSnapshot.of(this._bindingDictionary.clone(), this._middleware));
    }

    public restore(): void {
        const snapshot = this._snapshots.pop();
        if (snapshot === undefined) {
            throw new Error(ERROR_MSGS.NO_MORE_SNAPSHOTS_AVAILABLE);
        }
        this._bindingDictionary = snapshot.bindings;
        this._middleware = snapshot.middleware;
    }

    public createChild(): Container {
        const child = new Container();
        child.parent = this;
        return child;
    }

    public applyMiddleware(...middlewares: Middleware[]): void {
        const initial: Next = (this._middleware) ? this._middleware : this._planAndResolve();
        this._middleware = middlewares.reduce(
            (prev, curr) => curr(prev),
            initial);
    }

    public applyCustomMetadataReader(metadataReader: MetadataReader) {
        this._metadataReader = metadataReader;
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier must be associated with only one binding
    // use getAll when the runtime identifier is associated with multiple bindings
    public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier) as T;
    }

    public getTagged<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): T {
        return this._get<T>(false, false, TargetTypeEnum.Variable, serviceIdentifier, key, value) as T;
    }

    public getNamed<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): T {
        return this.getTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    // Resolves a dependency by its runtime identifier
    // The runtime identifier can be associated with one or multiple bindings
    public getAll<T>(serviceIdentifier: ServiceIdentifier<T>): T[] {
        return this._get<T>(true, true, TargetTypeEnum.Variable, serviceIdentifier) as T[];
    }

    public getAllTagged<T>(serviceIdentifier: ServiceIdentifier<T>, key: string | number | symbol, value: any): T[] {
        return this._get<T>(false, true, TargetTypeEnum.Variable, serviceIdentifier, key, value) as T[];
    }

    public getAllNamed<T>(serviceIdentifier: ServiceIdentifier<T>, named: string | number | symbol): T[] {
        return this.getAllTagged<T>(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }

    public resolve<T>(constructorFunction: Newable<T>) {
        const tempContainer = new Container();
        tempContainer.bind<T>(constructorFunction).toSelf();
        tempContainer.parent = this;
        return tempContainer.get<T>(constructorFunction);
    }

    private _getContainerModuleHelpersFactory() {

        const setModuleId = (bindingToSyntax: any, moduleId: string) => {
            bindingToSyntax._binding.moduleId = moduleId;
        };

        const getBindFunction = (moduleId: string) =>
            (serviceIdentifier: ServiceIdentifier<any>) => {
                const _bind = this.bind.bind(this);
                const bindingToSyntax = _bind(serviceIdentifier);
                setModuleId(bindingToSyntax, moduleId);
                return bindingToSyntax;
            };

        const getUnbindFunction = (moduleId: string) =>
            (serviceIdentifier: ServiceIdentifier<any>) => {
                const _unbind = this.unbind.bind(this);
                _unbind(serviceIdentifier);
            };

        const getIsboundFunction = (moduleId: string) =>
            (serviceIdentifier: ServiceIdentifier<any>) => {
                const _isBound = this.isBound.bind(this);
                return _isBound(serviceIdentifier);
            };

        const getRebindFunction = (moduleId: string) =>
            (serviceIdentifier: ServiceIdentifier<any>) => {
                const _rebind = this.rebind.bind(this);
                const bindingToSyntax = _rebind(serviceIdentifier);
                setModuleId(bindingToSyntax, moduleId);
                return bindingToSyntax;
            };

        return (mId: string) => ({
            bindFunction: getBindFunction(mId),
            isboundFunction: getIsboundFunction(mId),
            rebindFunction: getRebindFunction(mId),
            unbindFunction: getUnbindFunction(mId)
        });

    }

    // Prepares arguments required for resolution and
    // delegates resolution to _middleware if available
    // otherwise it delegates resolution to _planAndResolve
    private _get<T>(
        avoidConstraints: boolean,
        isMultiInject: boolean,
        targetType: TargetType,
        serviceIdentifier: ServiceIdentifier<any>,
        key?: string | number | symbol,
        value?: any
    ): (T | T[]) {

        let result: (T | T[]) | null = null;

        const defaultArgs: NextArgs = {
            avoidConstraints,
            contextInterceptor: (context: IContext) => context,
            isMultiInject,
            key,
            serviceIdentifier,
            targetType,
            value
        };

        if (this._middleware) {
            result = this._middleware(defaultArgs);
            if (result === undefined || result === null) {
                throw new Error(ERROR_MSGS.INVALID_MIDDLEWARE_RETURN);
            }
        } else {
            result = this._planAndResolve<T>()(defaultArgs);
        }

        return result;
    }

    // Planner creates a plan and Resolver resolves a plan
    // one of the jobs of the Container is to links the Planner
    // with the Resolver and that is what this function is about
    private _planAndResolve<T>(): (args: NextArgs) => (T | T[]) {
        return (args: NextArgs) => {

            // create a plan
            let context = plan(
                this._metadataReader,
                this,
                args.isMultiInject,
                args.targetType,
                args.serviceIdentifier,
                args.key,
                args.value,
                args.avoidConstraints
            );

            // apply context interceptor
            context = args.contextInterceptor(context);

            // resolve plan
            const result = resolve<T>(context);
            return result;

        };
    }

}
