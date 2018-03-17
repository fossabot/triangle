import * as METADATA_KEY from "../constants/metadata_keys";
import { ServiceIdentifier } from '../interfaces/interfaces';
import { Metadata } from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";

export function MultiInject(serviceIdentifier: ServiceIdentifier<any>) {
  return function(target: any, targetKey: string, index?: number) {

    const metadata = new Metadata(METADATA_KEY.MULTI_INJECT_TAG, serviceIdentifier);

    if (typeof index === "number") {
      tagParameter(target, targetKey, index, metadata);
    } else {
      tagProperty(target, targetKey, metadata);
    }

  };
}