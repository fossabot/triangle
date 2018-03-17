import { IBindingScopeEnum, IBindingTypeEnum, ITargetTypeEnum } from "../interfaces/interfaces";

export const BindingScopeEnum: IBindingScopeEnum = {
  Request  : "Request",
  Singleton: "Singleton",
  Transient: "Transient"
};

export const BindingTypeEnum: IBindingTypeEnum = {
  ConstantValue: "ConstantValue",
  Constructor  : "Constructor",
  DynamicValue : "DynamicValue",
  Factory      : "Factory",
  Function     : "Function",
  Instance     : "Instance",
  Invalid      : "Invalid",
  Provider     : "Provider"
};

export const TargetTypeEnum: ITargetTypeEnum = {
  ClassProperty      : "ClassProperty",
  ConstructorArgument: "ConstructorArgument",
  Variable           : "Variable"
};
