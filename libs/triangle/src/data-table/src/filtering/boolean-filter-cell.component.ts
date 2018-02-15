// tslint:disable:no-access-missing-member
import { Component, Input, HostBinding } from '@angular/core';
import { FilterService } from './filter.service';
import { BaseFilterCellComponent } from './base-filter-cell.component';
import { ColumnComponent } from '../column.component';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';

@Component({
  selector : 'tri-data-table-boolean-filter-cell',
  template: `
              <tri-data-table-filter-wrapper-cell
                [column]="column"
                [filter]="filter"
                [showOperators]="false"
                [defaultOperator]="operator">
                <!--<tri-dropdownlist-->
                <!--nzFilterInput-->
                <!--[defaultItem]="defaultItem"-->
                <!--[data]="items"-->
                <!--textField="text"-->
                <!--valueField="value"-->
                <!--[popupSettings]="{ width: 'auto' }"-->
                <!--[valuePrimitive]="true"-->
                <!--[value]="currentFilter?.value">-->
                <!--</tri-dropdownlist>-->
                <tri-input></tri-input>
              </tri-data-table-filter-wrapper-cell>
            `
})
export class BooleanFilterCellComponent extends BaseFilterCellComponent {
  @Input() column: ColumnComponent;

  @Input() filter: CompositeFilterDescriptor;
  operator: string;
  items: any[];
  defaultItem: any;
  constructor(filterService: FilterService) {
    super(filterService);
    this.operator = 'eq';
    this.items = [{ text: '是否为真', value: true }, { text: '是否不为真', value: false }];
    this.defaultItem = { text: '全为真', value: null };
  }
  @HostBinding('class.ant-filtercell-boolean')
  get hostClasses() {
    return true;
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get currentOperator(): string | Function {
    return this.currentFilter ? this.currentFilter.operator : this.operator;
  }
}
