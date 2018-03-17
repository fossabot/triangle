declare function __decorate(decorators: ClassDecorator[], target: any, key?: any, desc?: any): void;

declare function __param(paramIndex: number, decorator: ParameterDecorator): ClassDecorator;

import { decorate, forwardRef, Metadata, MetadataKeys } from '@gradii/moltre';
import { resolveForwardRef } from '../../src/annotation/forward-ref';
// import { expect } from 'chai';
import { Inject, LazyServiceIdentifier } from '../../src/annotation/inject';
import * as ERROR_MSGS from '../../src/constants/error-msgs';

// interface Katana {}
//
// interface Shuriken {}
//
// interface Sword {}

class Katana {}

class Shuriken {}

class Sword {}

const lazySwordId = new LazyServiceIdentifier(() => 'Sword');

class DecoratedWarrior {

  private _primaryWeapon: Katana;
  private _secondaryWeapon: Shuriken;
  private _tertiaryWeapon: Sword;

  public constructor(@Inject('Katana') primary: Katana,
                     @Inject('Shuriken') secondary: Shuriken,
                     @Inject(forwardRef(() => 'Sword')) tertiary: Shuriken) {
    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
    this._tertiaryWeapon = tertiary;
  }

  public debug() {
    return {
      primaryWeapon  : this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon,
      tertiaryWeapon : this._tertiaryWeapon
    };
  }

}

class InvalidDecoratorUsageWarrior {

  private _primaryWeapon: Katana;
  private _secondaryWeapon: Shuriken;

  public constructor(primary: Katana,
                     secondary: Shuriken) {

    this._primaryWeapon = primary;
    this._secondaryWeapon = secondary;
  }

  public test(a: string) { /*...*/ }

  public debug() {
    return {
      primaryWeapon  : this._primaryWeapon,
      secondaryWeapon: this._secondaryWeapon
    };
  }

}

describe('@inject', () => {

  it('Should generate metadata for named parameters', () => {

    const metadataKey = MetadataKeys.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, DecoratedWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql(MetadataKeys.INJECT_TAG);
    expect(m1.value).to.be.eql('Katana');
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);
    const m2: Metadata = paramsMetadata['1'][0];
    expect(m2.key).to.be.eql(MetadataKeys.INJECT_TAG);
    expect(m2.value).to.be.eql('Shuriken');
    expect(paramsMetadata['1'][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['2']).to.be.instanceof(Array);
    const m3: Metadata = paramsMetadata['2'][0];
    expect(m3.key).to.be.eql(MetadataKeys.INJECT_TAG);
    expect(resolveForwardRef(m3.value)).to.be.eql('Sword');
    expect(paramsMetadata['2'][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['3']).to.eq(undefined);

  });

  it('Should throw when applied multiple times', () => {

    const useDecoratorMoreThanOnce = function () {
      __decorate([__param(0, Inject('Katana')), __param(0, Inject('Shurien'))], InvalidDecoratorUsageWarrior);
    };

    const msg = `${ERROR_MSGS.DUPLICATED_METADATA} ${MetadataKeys.INJECT_TAG}`;
    expect(useDecoratorMoreThanOnce).to.throw(msg);

  });

  it('Should throw when not applayed to a constructor', () => {

    const useDecoratorOnMethodThatIsNotAConstructor = function () {
      __decorate([__param(0, Inject('Katana'))],
        InvalidDecoratorUsageWarrior.prototype,
        'test', Object.getOwnPropertyDescriptor(InvalidDecoratorUsageWarrior.prototype, 'test'));
    };

    const msg = `${ERROR_MSGS.INVALID_DECORATOR_OPERATION}`;
    expect(useDecoratorOnMethodThatIsNotAConstructor).to.throw(msg);

  });

  it('Should throw when applied with undefined', () => {

    // this can happen when there is circular dependency between symbols
    const useDecoratorWithUndefined = function () {
      __decorate([__param(0, Inject(undefined as any))], InvalidDecoratorUsageWarrior);
    };

    const msg = `${ERROR_MSGS.UNDEFINED_INJECT_ANNOTATION('InvalidDecoratorUsageWarrior')}`;
    expect(useDecoratorWithUndefined).to.throw(msg);

  });

  it('Should be usable in VanillaJS applications', () => {

    interface Shurien {}

    const VanillaJSWarrior = (function () {
      function Warrior(primary: Katana, secondary: Shurien) {
        // ...
      }

      return Warrior;
    })();

    decorate(Inject('Katana'), VanillaJSWarrior, 0);
    decorate(Inject('Shurien'), VanillaJSWarrior, 1);

    const metadataKey = MetadataKeys.TAGGED;
    const paramsMetadata = Reflect.getMetadata(metadataKey, VanillaJSWarrior);
    expect(paramsMetadata).to.be.an('object');

    // assert metadata for first argument
    expect(paramsMetadata['0']).to.be.instanceof(Array);
    const m1: Metadata = paramsMetadata['0'][0];
    expect(m1.key).to.be.eql(MetadataKeys.INJECT_TAG);
    expect(m1.value).to.be.eql('Katana');
    expect(paramsMetadata['0'][1]).to.eq(undefined);

    // assert metadata for second argument
    expect(paramsMetadata['1']).to.be.instanceof(Array);
    const m2: Metadata = paramsMetadata['1'][0];
    expect(m2.key).to.be.eql(MetadataKeys.INJECT_TAG);
    expect(m2.value).to.be.eql('Shurien');
    expect(paramsMetadata['1'][1]).to.eq(undefined);

    // no more metadata should be available
    expect(paramsMetadata['2']).to.eq(undefined);

  });

});
