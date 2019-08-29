import { NgModule } from '@angular/core';
import { NaviHeaderComponent } from './navi-header/navi-header.component';
import { NaviSidebarComponent } from './navi-sidebar/navi-sidebar.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [NaviHeaderComponent, NaviSidebarComponent],
  imports: [SharedModule],
  exports: [NaviHeaderComponent, NaviSidebarComponent]
})
export class NaviModule { }
