import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

// -- SharedModule for Standalone components imports
import { SharedModule } from '../../shared.module';

@Component({
    selector: 'anms-big-input-action',
    imports: [SharedModule],
    templateUrl: './big-input-action.component.html',
    styleUrls: ['./big-input-action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    
})
export class BigInputActionComponent {
  @Input()
  disabled = false;
  @Input()
  fontSet = '';
  @Input()
  fontIcon = '';
  @Input()
  faIcon = '';
  @Input()
  label = '';
  @Input()
  color = '';

  @Output()
  action = new EventEmitter<void>();

  hasFocus = false;

  onClick() {
    this.action.emit();
  }
}
