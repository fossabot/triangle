import { Directive, HostBinding, HostListener, Inject } from '@angular/core';
import { CELL_CONTEXT } from '../cell-context';
import { EditService } from '../service/edit.service';

@Directive({
  selector: '[triGridEditCommand], [tri-grid-edit-command]'
})
export class EditCommandDirective {
  private editService;
  rowIndex: number;

  constructor(editService: EditService, @Inject(CELL_CONTEXT) cellContext) {
    this.editService = editService;
    this.rowIndex = cellContext.rowIndex;
  }

  @HostListener('click')
  click() {
    this.editService.beginEdit(this.rowIndex);
  }

  @HostBinding('style.display')
  get visible() {
    return this.editService.isEdited(this.rowIndex) ? 'none' : '';
  }

  @HostBinding('class.ant-grid-edit-command')
  get commandClass() {
    return true;
  }
}
