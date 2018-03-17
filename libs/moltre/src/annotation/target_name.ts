import * as METADATA_KEY from "../constants/metadata_keys";
import { Metadata } from "../planning/metadata";
import { tagParameter } from "./decorator_utils";

export function TargetName(name: string) {
  return function(target: any, targetKey: string, index: number) {
    const metadata = new Metadata(METADATA_KEY.NAME_TAG, name);
    tagParameter(target, targetKey, index, metadata);
  };
}