import { MetadataKeys } from '../constants/metadata-keys';
import { ConstructorMetadata, MetadataMap } from '../interfaces/interfaces';

export class MetadataReader {

  public getConstructorMetadata(constructorFunc: Function): ConstructorMetadata {

    // TypeScript compiler generated annotations
    const compilerGeneratedMetadata = Reflect.getMetadata(MetadataKeys.PARAM_TYPES, constructorFunc);

    // User generated constructor annotations
    const userGeneratedMetadata = Reflect.getMetadata(MetadataKeys.TAGGED, constructorFunc);

    return {
      compilerGeneratedMetadata,
      userGeneratedMetadata: userGeneratedMetadata || {}
    };

  }

  public getPropertiesMetadata(constructorFunc: Function): MetadataMap {
    // User generated properties annotations
    const userGeneratedMetadata = Reflect.getMetadata(MetadataKeys.TAGGED_PROP, constructorFunc) || [];
    return userGeneratedMetadata;
  }

}
