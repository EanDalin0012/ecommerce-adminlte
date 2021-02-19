import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDatePipe } from './pipe/custom-date.pipe';
import { ModalComponent } from './component/modal/modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadModule, UploadsModule } from '@progress/kendo-angular-upload';
@NgModule({
  declarations: [
    CustomDatePipe,
    ModalComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    UploadModule,
    UploadsModule,
    CustomDatePipe,

  ],
})
export class MShareModule {
  static forRoot(): ModuleWithProviders<MShareModule> {
    return {
      ngModule: MShareModule,
      providers: []
    };
  }
}
