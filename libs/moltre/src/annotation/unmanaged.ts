import * as METADATA_KEY from "../constants/metadata_keys";
import { Metadata } from "../planning/metadata";
import { tagParameter } from "./decorator_utils";

export function Unmanaged() {
    return function(target: any, targetKey: string, index: number) {
        const metadata = new Metadata(METADATA_KEY.UNMANAGED_TAG, true);
        tagParameter(target, targetKey, index, metadata);
    };
}
