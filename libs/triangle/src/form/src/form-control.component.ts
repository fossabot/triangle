import { Component, ContentChild, HostBinding, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Component({
  selector: '[tri-form-control], [triFormControl]',
  template: `
    <div class="ant-form-item-control"
         [class.has-warning]="isWarning"
         [class.has-error]="isError"
         [class.has-success]="isSuccess"
         [class.has-feedback]="hasFeedBack"
         [class.is-validating]="isValidate">
      <ng-content></ng-content>
    </div>
  `,
  styles  : []
})
export class FormControlComponent {
  _hasFeedback = false;
  @HostBinding(`class.ant-form-item-control-wrapper`)
  _validateStatus;
  @ContentChild(NgControl) ngControl: NgControl;

  /**
   * When add the attribue, work with validateStatus property, show the validation icon, suggest for use `tri-input` component together.
   * 当添加该属性时，配合 validateStatus 属性使用，展示校验状态图标，建议只配合 tri-input 组件使用
   * @param  value
   */
  @Input()
  set hasFeedback(value: boolean) {
    this._hasFeedback = value;
  }

  get hasFeedback() {
    return this._hasFeedback;
  }

  /**
   * Validate status
   * 校验状态，属性定义为当前 `formControl` 名称可以根据异步返回数据自动显示，也可手动定义 可选：'success' 'warning' 'error' 'validating'
   */
  @Input()
  set validateStatus(value: string | NgControl) {
    this._validateStatus = value;
  }

  get validateStatus(): string | NgControl {
    return this._validateStatus || this.ngControl;
  }

  get isWarning(): boolean {
    return this._isDirtyAndError('warning');
  }

  get isValidate(): boolean {
    return (
      this._isDirtyAndError('validating') ||
      this.validateStatus === 'pending' ||
      (this.validateStatus && (this.validateStatus as NgControl).dirty && (this.validateStatus as NgControl).pending)
    );
  }

  get isError(): boolean {
    return (
      this.validateStatus === 'error' ||
      (this.validateStatus &&
        (this.validateStatus as NgControl).dirty &&
        (this.validateStatus as NgControl).errors &&
        (this.validateStatus as NgControl).hasError &&
        !(this.validateStatus as NgControl).hasError('warning'))
    );
  }

  get isSuccess(): boolean {
    return (
      this.validateStatus === 'success' ||
      (this.validateStatus && (this.validateStatus as NgControl).dirty && (this.validateStatus as NgControl).valid)
    );
  }

  get hasFeedBack(): boolean {
    return this.hasFeedback as boolean;
  }

  _isDirtyAndError(name: string) {
    return (
      this.validateStatus === name ||
      (this.validateStatus &&
        (this.validateStatus as NgControl).dirty &&
        (this.validateStatus as NgControl).hasError &&
        (this.validateStatus as NgControl).hasError(name))
    );
  }

  constructor() {}
}
