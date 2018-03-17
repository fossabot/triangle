import { MetadataKeys } from '../constants/metadata-keys';
import { Metadata } from "../planning/metadata";
import { tagParameter, tagProperty } from "./decorator_utils";

export function Optional() {
    return function(target: any, targetKey: string, index?: number) {

        const metadata = new Metadata(MetadataKeys.OPTIONAL_TAG, true);

        if (typeof index === "number") {
            tagParameter(target, targetKey, index, metadata);
        } else {
            tagProperty(target, targetKey, metadata);
        }

    };
}
