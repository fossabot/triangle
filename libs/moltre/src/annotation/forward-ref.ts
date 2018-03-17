export type ForwardRefFn = () => any;

export function forwardRef(forwardRefFn: ForwardRefFn): any {
  (<any>forwardRefFn).__forward_ref__ = forwardRef;
  return forwardRefFn;
}

export function resolveForwardRef(type: any): any {
  if (typeof type === 'function' && type.hasOwnProperty('__forward_ref__') &&
    type.__forward_ref__ === forwardRef) {
    return (<ForwardRefFn>type)();
  } else {
    return type;
  }
}
