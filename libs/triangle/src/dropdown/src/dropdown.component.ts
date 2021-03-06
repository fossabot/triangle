import { DEFAULT_DROPDOWN_POSITIONS, DropDownAnimation, POSITION_MAP } from '@gradii/triangle/core';
import { MenuComponent } from '@gradii/triangle/menu';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { Observer } from 'rxjs/Observer';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { DropDownDirective } from './dropdown.directive';

export type Placement = 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight';

/**
 * The `[tri-dropdown]` is used for locating the element of dropdown.
 * The `[tri-dropdown-custom]` is used for define the content of dropdown, can't mix menu together.
 */
@Component({
  selector       : 'tri-dropdown',
  encapsulation  : ViewEncapsulation.None,
  animations     : [DropDownAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
              <div>
                <ng-content></ng-content>
              </div>
              <ng-template
                cdkConnectedOverlay
                [cdkConnectedOverlayHasBackdrop]="_hasBackdrop"
                [cdkConnectedOverlayPositions]="_positions"
                [cdkConnectedOverlayOrigin]="_origin"
                (backdropClick)="_hide()"
                [cdkConnectedOverlayMinWidth]="_triggerWidth"
                (positionChange)="_onPositionChange($event)"
                [cdkConnectedOverlayOpen]="visible">
                <div
                  class="ant-dropdown ant-dropdown-placement-{{placement}}"
                  [@dropDownAnimation]="_dropDownPosition"
                  (mouseenter)="_onMouseEnterEvent($event)"
                  (mouseleave)="_onMouseLeaveEvent($event)"
                  [style.minWidth.px]="_triggerWidth"
                  (click)="_clickDropDown($event)">
                  <div [class.ant-table-filter-dropdown]="hasFilterButton">
                    <ng-content select="[tri-menu]"></ng-content>
                    <ng-content select="[tri-table-filter]"></ng-content>
                  </div>
                  <ng-content select="[tri-dropdown-custom]"></ng-content>
                </div>
              </ng-template>`
})
export class DropDownComponent implements OnInit, OnDestroy, AfterViewInit {
  hasFilterButton = false;
  _triggerWidth = 0;
  _placement: Placement = 'bottomLeft';
  _dropDownPosition: 'top' | 'bottom' = 'bottom';
  _positions: ConnectionPositionPair[] = [...DEFAULT_DROPDOWN_POSITIONS];
  _subscription: Subscription;

  /**
   * Use for locating the element of dropdown menu.
   * 用于定位触发下拉菜单的元素
   */
  @ContentChild(DropDownDirective) _origin;
  @ContentChild(MenuComponent) _menu;

  /**
   * the behavior of trigger dropdown.
   * 触发下拉的行为
   */
  @Input() trigger: 'click' | 'hover' = 'hover';

  /**
   * Whether hidden menu after click
   * 点击后是否隐藏菜单
   */
  @Input() clickHide = true;

  /**
   * Whether show the menu
   * 菜单是否显示
   */
  @Input() visible = false;
  @Output() _visibleChange = new Subject();
  /**
   * The visible change event
   * 菜单显示状态改变时调用，参数为 visible
   */
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();

  /**
   * The placement of popover: `bottomLeft` `bottomCenter` `bottomRight` `topLeft` `topCenter` `topRight`
   * 菜单弹出位置： `bottomLeft` `bottomCenter` `bottomRight` `topLeft` `topCenter` `topRight`
   * @param  value
   */
  @Input()
  set placement(value: Placement) {
    this._placement = value;
    this._dropDownPosition = this.placement.indexOf('top') !== -1 ? 'top' : 'bottom';
    this._positions.unshift(POSITION_MAP[this._placement] as ConnectionPositionPair);
  }

  get placement(): Placement {
    return this._placement;
  }

  _onClickEvent() {
    if (this.trigger === 'click') {
      this._show();
    }
  }

  _onMouseEnterEvent(e) {
    if (this.trigger === 'hover') {
      this._show();
    }
  }

  _onMouseLeaveEvent(e) {
    if (this.trigger === 'hover') {
      this._hide();
    }
  }

  _hide() {
    this._visibleChange.next(false);
  }

  _show() {
    this._visibleChange.next(true);
  }

  _onPositionChange(position) {
    this._dropDownPosition = position.connectionPair.originY;
  }

  _clickDropDown($event) {
    $event.stopPropagation();
    if (this.clickHide) {
      this._hide();
    }
  }

  _setTriggerWidth(): void {
    this._triggerWidth = this._origin.elementRef.nativeElement.getBoundingClientRect().width;
  }

  _onVisibleChange = (visible: boolean) => {
    if (visible) {
      if (!this._triggerWidth) {
        this._setTriggerWidth();
      }
    }
    if (this.visible !== visible) {
      this.visible = visible;
      this.visibleChange.emit(this.visible);
    }
    this._changeDetector.markForCheck();
  };

  _startSubscribe(observable$: Observable<boolean | {}>) {
    this._subscription = debounceTime.call(observable$, 300).subscribe(this._onVisibleChange);
  }

  ngOnInit() {
    if (this._menu) {
      this._menu.setDropDown(true);
    }
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    let mouse$: Observable<boolean>;
    if (this.trigger === 'hover') {
      mouse$ = Observable.create((observer: Observer<boolean>) => {
        const disposeMouseEnter = this._renderer.listen(this._origin.elementRef.nativeElement, 'mouseenter', () => {
          observer.next(true);
        });
        const disposeMouseLeave = this._renderer.listen(this._origin.elementRef.nativeElement, 'mouseleave', () => {
          observer.next(false);
        });
        return () => {
          disposeMouseEnter();
          disposeMouseLeave();
        };
      });
    }
    if (this.trigger === 'click') {
      mouse$ = Observable.create((observer: Observer<boolean>) => {
        const dispose = this._renderer.listen(this._origin.elementRef.nativeElement, 'click', e => {
          e.preventDefault();
          observer.next(true);
        });
        return () => dispose();
      });
    }
    const observable$ = merge(mouse$, this._visibleChange);
    this._startSubscribe(observable$);
  }

  get _hasBackdrop() {
    return this.trigger === 'click';
  }

  constructor(private _renderer: Renderer2, protected _changeDetector: ChangeDetectorRef) {}
}
