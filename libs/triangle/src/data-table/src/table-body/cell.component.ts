import { isNullOrEmptyString, isPresent } from '@gradii/triangle/util';
import { Component, Inject, Input, Optional } from '@angular/core';
import { CELL_CONTEXT, CellContext } from '../cell-context';
import { ColumnBase } from '../columns/column-base';
import { ColumnComponent, isColumnComponent } from '../columns/column.component';
import { CommandColumnComponent } from '../columns/command-column.component';
import { EditService } from '../service/edit.service';
import { extractFormat } from '../utils';

@Component({
  selector: '[triGridCell], [tri-grid-cell]',
  template: `
    <ng-container [ngSwitch]="isEdited">
      <ng-content *ngSwitchCase="false"></ng-content>
      <ng-container *ngSwitchCase="true">
        <ng-template
          *ngIf="column.editTemplateRef"
          [ngTemplateOutlet]="column.editTemplateRef"
          [ngTemplateOutletContext]="templateContext">
        </ng-template>
        <ng-container [ngSwitch]="column.editor" *ngIf="!column.editTemplate">
          <div tri-form-control
               [hasFeedback]="true">

            <tri-input-number
              *ngSwitchCase="'numeric'"
              [formControl]="formGroup.get(column.field)"
            ></tri-input-number>
            <!--[format]="format"-->
            <tri-datepicker
              *ngSwitchCase="'date'"
              [formControl]="formGroup.get(column.field)"
            ></tri-datepicker>
            <!--[format]="format"-->
            <!-- <input
               *ngSwitchCase="'boolean'"
               type="checkbox"
               [formControl]="formGroup.get(column.field)"
             />-->
            <tri-switch
              *ngSwitchCase="'boolean'"
              [formControl]="formGroup.get(column.field)"
            >
            </tri-switch>
            <tri-input
              *ngSwitchDefault
              [formControl]="formGroup.get(column.field)"
            ></tri-input>

          </div>
        </ng-container>
      </ng-container>
    </ng-container>
  `
})
export class CellComponent {
  private editService: EditService;
  private cellContext: CellContext;
  @Input() public column: ColumnBase;
  @Input() public isNew: boolean;
  @Input() public dataItem: any;
  private _rowIndex;
  private _templateContext;

  constructor(editService: EditService,
              @Optional()
              @Inject(CELL_CONTEXT)
                cellContext: CellContext) {
    this.editService = editService;
    this.cellContext = cellContext;
    this.isNew = false;
    this._templateContext = {};
  }

  @Input()
  get rowIndex() {
    return this._rowIndex;
  }

  set rowIndex(index) {
    this._rowIndex = index;
    if (this.cellContext) {
      this.cellContext.rowIndex = index;
    }
  }

  get isEdited() {
    if (!this.isColumnEditable) {
      return false;
    }
    const editContext = this.editService.context(this.rowIndex);
    return this.isFieldEditable(editContext, this.column);
  }

  get formGroup() {
    return this.editService.context(this.rowIndex).group;
  }

  get templateContext() {
    this._templateContext.$implicit = this.formGroup;
    this._templateContext.isNew = this.isNew;
    this._templateContext.column = this.column;
    this._templateContext.dataItem = this.dataItem;
    this._templateContext.formGroup = this.formGroup;
    this._templateContext.rowIndex = this.rowIndex;
    return this._templateContext;
  }

  get format() {
    if (isColumnComponent(this.column) && !isNullOrEmptyString((<ColumnComponent>this.column).format)) {
      return extractFormat((<ColumnComponent>this.column).format);
    }
    return undefined;
  }

  get isColumnEditable() {
    if (!this.column || this.isCommand(this.column)) {
      return false;
    }
    return (<ColumnComponent>this.column).editable !== false;
  }

  isCommand(column) {
    return column instanceof CommandColumnComponent;
  }

  /**
   * 可编辑条件
   * - 如果有自定义模板刚直接可编辑
   * - 编辑数据上下文必须存在.
   * - formGroup 上下文中group存在
   *
   * @param editContext
   * @param column
   */
  isFieldEditable(editContext, column): boolean {
    if (!isPresent(editContext)) {
      return false;
    }
    if (isPresent(column.editTemplate)) {
      return true;
    }
    return isPresent(editContext.group) && isPresent(editContext.group.get(column.field));
  }
}
