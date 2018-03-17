import * as ERRORS_MSGS from '../constants/error-msgs';
import { MetadataKeys } from '../constants/metadata-keys';

export function Injectable() {
  return function (target: any) {

    if (Reflect.hasOwnMetadata(MetadataKeys.PARAM_TYPES, target)) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    }

    const types = Reflect.getMetadata(MetadataKeys.DESIGN_PARAM_TYPES, target) || [];
    Reflect.defineMetadata(MetadataKeys.PARAM_TYPES, types, target);

    return target;
  };
}
