import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-navi-sidebar',
    templateUrl: './navi-sidebar.component.html',
    styleUrls: ['./navi-sidebar.component.scss'],
})
export class NaviSidebarComponent {
    @Output() closed = new EventEmitter<void>();

    onClose() {
        this.closed.emit();
    }
}
