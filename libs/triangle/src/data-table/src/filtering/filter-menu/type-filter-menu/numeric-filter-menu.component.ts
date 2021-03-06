import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { LocaleService } from '@gradii/triangle/locale';
import { isNullOrEmptyString, isPresent } from '@gradii/triangle/util';
import { Component, HostBinding, Input } from '@angular/core';
import { ColumnComponent } from '../../../columns/column.component';
import { extractFormat } from '../../../utils';
import { BaseFilterCellComponent } from '../../base-filter-cell.component';
import { FilterService } from '../../filter.service';

@Component({
  selector           : 'tri-data-table-numeric-filter-menu',
  preserveWhitespaces: false,
  template           : `
    <tri-data-table-numeric-filter-menu-input
      [currentFilter]="firstFilter"
      [operators]="operators"
      [filterService]="filterService"
      [column]="column"
      [filter]="filter"
      [format]="format"
      [decimals]="decimals"
      [spinners]="spinners"
      [min]="min"
      [max]="max"
      [step]="step"
    >
    </tri-data-table-numeric-filter-menu-input>
    <tri-select
      *ngIf="extra"
      class="ant-filter-and"
      [options]="logicOperators"
      [ngModel]="filter?.logic"
      (ngModelChange)="logicChange($event)"
    >
    </tri-select>
    <tri-data-table-numeric-filter-menu-input
      *ngIf="extra"
      [operators]="operators"
      [currentFilter]="secondFilter"
      [filterService]="filterService"
      [column]="column"
      [filter]="filter"
      [format]="format"
      [decimals]="decimals"
      [spinners]="spinners"
      [min]="min"
      [max]="max"
      [step]="step"
    >
    </tri-data-table-numeric-filter-menu-input>
  `
}) /*extends NumericFilterComponent */
export class NumericFilterMenuComponent extends BaseFilterCellComponent {
  logicOperators: Array<{
    label: string;
    value: 'and' | 'or';
  }> = [{label: 'And', value: 'and'}, {label: 'Or', value: 'or'}];

  @HostBinding('class.ant-filtercell')
  get hostClasses(): boolean {
    return false;
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get columnFormat() {
    return this.column && !isNullOrEmptyString(this.column.format) ? extractFormat(this.column.format) : 'd';
  }

  get currentOperator() {
    return this.currentFilter ? this.currentFilter.operator : this.operator;
  }

  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor = {filters: [], logic: 'and'};
  @Input() operator: string;
  @Input() min: number;
  @Input() max: number;
  @Input() spinners: boolean;
  @Input() format: string;
  @Input() decimals: string;
  @Input() step: number;
  @Input() extra: boolean = true;
  @Input() filterService: FilterService;

  constructor(localization: LocaleService) {
    super(null);
  }

  get firstFilter(): FilterDescriptor {
    if (isPresent(this.filter) && isPresent(this.filter.filters) && this.filter.filters.length) {
      return this.filter.filters[0] as FilterDescriptor;
    } else {
      return this.insertDefaultFilter(0, {
        field   : this.column!.field,
        operator: this.currentOperator
      });
    }
  }

  get secondFilter(): FilterDescriptor {
    if (isPresent(this.filter) && isPresent(this.filter.filters) && this.filter.filters.length > 1) {
      return this.filter.filters[1] as FilterDescriptor;
    } else {
      return this.insertDefaultFilter(1, {
        field   : this.column.field,
        operator: this.currentOperator
      });
    }
  }

  logicChange(value: 'and' | 'or'): void {
    this.filter.logic = value;
  }

  private insertDefaultFilter(index, filter) {
    this.filter = this.filter || {filters: [], logic: 'and'};
    this.filter.filters[index] = filter;
    return filter;
  }
}
