import { MetadataKeys } from '../constants/metadata-keys';

export class Metadata {

  public key: string | number | symbol;
  public value: any;

  public constructor(key: string | number | symbol, value: any) {
    this.key = key;
    this.value = value;
  }

  public toString() {
    if (this.key === MetadataKeys.NAMED_TAG) {
      return `named: ${this.value.toString()} `;
    } else {
      return `tagged: { key:${this.key.toString()}, value: ${this.value} }`;
    }
  }
}
