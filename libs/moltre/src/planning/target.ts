import { ServiceIdentifier, TargetType } from '../interfaces/interfaces';
import { MetadataKeys } from '../constants/metadata-keys';
import { guid } from '../utils/guid';
import { Metadata } from './metadata';
import { QueryableString } from './queryable_string';

class Target {

    public guid: string;
    public type: TargetType;
    public serviceIdentifier: ServiceIdentifier<any>;
    public name: QueryableString;
    public metadata: Metadata[];

    public constructor(
        type: TargetType,
        name: string,
        serviceIdentifier: ServiceIdentifier<any>,
        namedOrTagged?: (string | Metadata)
    ) {

        this.guid = guid();
        this.type = type;
        this.serviceIdentifier = serviceIdentifier;
        this.name = new QueryableString(name || "");
        this.metadata = new Array<Metadata>();

        let metadataItem: Metadata | null = null;

        // is named target
        if (typeof namedOrTagged === "string") {
            metadataItem = new Metadata(MetadataKeys.NAMED_TAG, namedOrTagged);
        } else if (namedOrTagged instanceof Metadata) {
            // is target with metadata
            metadataItem = namedOrTagged;
        }

        // target has metadata
        if (metadataItem !== null) {
            this.metadata.push(metadataItem);
        }

    }

    public hasTag(key: string): boolean {
        for (const m of this.metadata) {
            if (m.key === key) {
                return true;
            }
        }
        return false;
    }

    public isArray(): boolean {
        return this.hasTag(MetadataKeys.MULTI_INJECT_TAG);
    }

    public matchesArray(name: ServiceIdentifier<any>): boolean {
        return this.matchesTag(MetadataKeys.MULTI_INJECT_TAG)(name);
    }

    public isNamed(): boolean {
        return this.hasTag(MetadataKeys.NAMED_TAG);
    }

    public isTagged(): boolean {
        return this.metadata.some((m) =>
            (m.key !== MetadataKeys.INJECT_TAG) &&
                   (m.key !== MetadataKeys.MULTI_INJECT_TAG) &&
                   (m.key !== MetadataKeys.NAME_TAG) &&
                   (m.key !== MetadataKeys.UNMANAGED_TAG) &&
                   (m.key !== MetadataKeys.NAMED_TAG));
    }

    public isOptional(): boolean {
        return this.matchesTag(MetadataKeys.OPTIONAL_TAG)(true);
    }

    public getNamedTag(): Metadata | null {
        if (this.isNamed()) {
            return this.metadata.filter((m) => m.key === MetadataKeys.NAMED_TAG)[0];
        }
        return null;
    }

    public getCustomTags(): Metadata[] | null {
        if (this.isTagged()) {
            return this.metadata.filter((m) =>
                (m.key !== MetadataKeys.INJECT_TAG) &&
                    (m.key !== MetadataKeys.MULTI_INJECT_TAG) &&
                    (m.key !== MetadataKeys.NAME_TAG) &&
                    (m.key !== MetadataKeys.UNMANAGED_TAG) &&
                    (m.key !== MetadataKeys.NAMED_TAG));
        }
        return null;
    }

    public matchesNamedTag(name: string): boolean {
        return this.matchesTag(MetadataKeys.NAMED_TAG)(name);
    }

    public matchesTag(key: string) {
        return (value: any) => {
            for (const m of this.metadata) {
                if (m.key === key && m.value === value) {
                    return true;
                }
            }
            return false;
        };
    }

}

export { Target };
