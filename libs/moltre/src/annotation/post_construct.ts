import * as ERRORS_MSGS from '../constants/error-msgs';
import { MetadataKeys } from '../constants/metadata-keys';
import { Metadata } from '../planning/metadata';

export function PostConstruct() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = new Metadata(MetadataKeys.POST_CONSTRUCT, propertyKey);

    if (Reflect.hasOwnMetadata(MetadataKeys.POST_CONSTRUCT, target.constructor)) {
      throw new Error(ERRORS_MSGS.MULTIPLE_POST_CONSTRUCT_METHODS);
    }
    Reflect.defineMetadata(MetadataKeys.POST_CONSTRUCT, metadata, target.constructor);
  };
}
