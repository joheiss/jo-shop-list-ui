import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-navi-header',
    templateUrl: './navi-header.component.html',
    styleUrls: ['./navi-header.component.scss'],
})
export class NaviHeaderComponent {
    @Output() toggled = new EventEmitter<void>();

    onToggle() {
        this.toggled.emit();
    }
}
