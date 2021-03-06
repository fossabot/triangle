import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ContentChild, HostBinding, Input, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';

@Component({
  selector     : 'tri-badge',
  encapsulation: ViewEncapsulation.None,
  animations   : [
    trigger('enterLeave', [
      transition('void => *', [style({opacity: 0}), animate('0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46)')]),
      transition('* => void', [style({opacity: 1}), animate('0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46)')])
    ])
  ],
  template     : `
    <ng-template *ngIf="content" [ngTemplateOutlet]="content"></ng-template>
    <span class="ant-badge-status-dot ant-badge-status-{{status}}" *ngIf="status"></span>
    <span class="ant-badge-status-text" *ngIf="badgeText">{{badgeText}}</span>
    <sup [@enterLeave]
         [ngStyle]="badgeStyle"
         *ngIf="(isDot)||(count>0)||((count==0)&&showZero)"
         data-show="true"
         class="ant-scroll-number"
         [class.ant-badge-count]="!isDot"
         [class.ant-badge-dot]="isDot">
      <ng-template ngFor
                   [ngForOf]="maxNumberArray"
                   let-number
                   let-i="index">
        <span *ngIf="count <= overflowCount"
              class="ant-scroll-number-only"
              [style.transform]="'translateY('+((-countArray[i]*100))+'%)'">
        <ng-template [ngIf]="(!isDot)&&(countArray[i]!=null)">
          <p *ngFor="let p of countSingleArray" [class.current]="p==countArray[i]">{{p}}</p>
        </ng-template>
        </span>
      </ng-template>
      <ng-template [ngIf]="count > overflowCount">{{overflowCount}}+</ng-template>
    </sup>
  `
})
export class BadgeComponent implements OnInit {
  _showZero = false;
  _count: number;
  maxNumberArray;
  countArray = [];
  countSingleArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  @ContentChild('content') content: TemplateRef<any>;
  @HostBinding('class.ant-badge') _badge = true;

  @HostBinding('class.ant-badge-not-a-wrapper')
  get setNoWrapper() {
    return !this.content;
  }

  /**
   * Show the over flow count
   * 展示封顶的数字值
   * @default 99
   */
  @Input() overflowCount = 99;

  /**
   * whether show badge, When value is zero, show badge
   * 当添加该属性时，当数值为 0 时，展示 Badge
   * @param  value
   */
  @Input()
  set showZero(value: boolean) {
    this._showZero = value as boolean;
  }

  get showZero() {
    return this._showZero;
  }

  /**
   * Don't show number, only there are red dot
   * 不展示数字，只有一个小红点
   */
  @Input() isDot = false;

  /**
   * 在设置了  `nzStatus` 的前提下有效，设置状态点的文本
   */
  @Input() badgeText: string;

  /**
   * Custom style
   * 自定义样式
   */
  @Input() badgeStyle;

  /**
   * Set badge status
   * 设置 Badge 为状态点
   */
  @Input()
  @HostBinding('class.ant-badge-status')
  status: string;

  /**
   * Set show count, over overflowCount then display as `overflowCount+`, if zero then hidden
   * 设置展示的数字，大于 overflowCount 时显示为  `overflowCount+` 为 0 时隐藏
   * @param  value
   */
  @Input()
  set count(value: number) {
    if (value < 0) {
      this._count = 0;
    } else {
      this._count = value;
    }
    this.countArray = this._count.toString().split('');
  }

  /**
   * Get the count
   * 获取展示的数字
   */
  get count() {
    return this._count;
  }

  constructor() {}

  ngOnInit() {
    this.maxNumberArray = this.overflowCount.toString().split('');
  }
}
