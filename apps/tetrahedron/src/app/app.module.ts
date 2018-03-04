import { NgModule } from '@angular/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { NxModule } from '@nrwl/nx';

@NgModule({
  imports     : [
    BrowserModule,

    TriIconModule,

    NxModule.forRoot()],
  declarations: [AppComponent],
  bootstrap   : [AppComponent]
})
export class AppModule {}
