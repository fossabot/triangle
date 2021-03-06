import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CollapseComponent } from './collapse.component';

@Component({
  selector     : 'tri-collapseset',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div class="ant-collapse" [class.ant-collapse-borderless]="!bordered">
      <ng-content></ng-content>
    </div>
  `
})
export class CollapsesetComponent {
  /**
   * all child collapse
   */
  panels: Array<CollapseComponent> = [];

  /**
   * Whether the type is accordion
   * 是否是手风琴类型
   * @default false
   */
  @Input() accordion = false;

  /**
   * Whether has border
   * 是否有边框
   * @default true
   */
  @Input() bordered = true;

  click(collapse) {
    if (this.accordion) {
      this.panels.map((item, index) => {
        const curIndex = this.panels.indexOf(collapse);
        if (index !== curIndex) {
          item.active = false;
        }
      });
    }
  }

  addTab(collapse: CollapseComponent) {
    this.panels.push(collapse);
  }

  constructor() {}
}
