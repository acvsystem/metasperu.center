import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mt-input',
  standalone: false,
  templateUrl: './mt-input.html',
  styleUrl: './mt-input.scss',
})
export class MtInput {
  @Input() id: string = 'mt-input-' + Math.floor(Math.random() * 9999 + 1111);
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() autoText: string = "";
  @Input() type: string = "text";
  @Output() afterChange: EventEmitter<any> = new EventEmitter();

  onChange(ev: any) {
    const self = this;
    let value = (ev.target.value || '').trim();
    this.afterChange.emit({ id: self.id, value: value });
  }

  onlyNumbers(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    // Si la tecla presionada no coincide con el patrón de números, cancelamos el evento
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  onChangeNumber(ev: any) {
    this.autoText = this.autoText.replace(/[^0-9]/g, '');
    const self = this;
    let value = (ev.target.value || '').trim();
    this.afterChange.emit({ id: self.id, value: value });
  }
}
