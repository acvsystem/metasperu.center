import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, inject, signal, model, SimpleChanges } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import {
  MatMomentDateModule,
  MAT_MOMENT_DATE_FORMATS,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'mt-calendar',
  standalone: false,
  templateUrl: './mt-calendar.html',
  styleUrl: './mt-calendar.scss',
  providers: [
    provideMomentDateAdapter(MY_FORMATS),
    { provide: MAT_DATE_LOCALE, useValue: 'es-Es' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MtCalendar implements OnInit {
  public CLOSE_ON_SELECTED = false;
  @Input() isPeriodo: boolean = false;
  @Input() isMultiSelect: boolean = false;
  @Input() isDefault: boolean = false;
  @Input() isRange: boolean = false;
  @Input() maxSelect: boolean = false;
  @Input() isTime: boolean = false;
  @Input() isPresentRange: boolean = false;
  @Input() isReset: boolean = false;
  @Input() placeholder: string = "";
  @Input() id: string = "";
  @Input() selected: string = "";
  // Inicializa con la fecha de hoy
  init: Date = new Date();

  @Output() afterChange: EventEmitter<any> = new EventEmitter();

  vTimer: string = "";
  date = new FormControl(moment());
  public model = [];
  @ViewChild('picker', { static: true }) _picker!: MatDatepicker<Date>;
  @ViewChild('pickerSemana', { static: true }) _picker2!: MatDatepicker<Date>;
  @ViewChild('dp') datePickerElement = MatDatepicker;
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  public resetModel = new Date();
  public dateClass = (date: Date) => {
    if (this._findDate(date) !== -1) {
      return ['selected'];
    }
    return [];
  }

  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';



  ngOnInit() {
    if (this.isDefault) {
      this.afterChange.emit({ id: this.id, isDefault: true, value: `${moment(this.date.value).format('YYYY/MM/DD')}` });
    }

    if (this.isPeriodo) {
      var futureMonth = moment(this.date.value).add(1, 'months');
      this.afterChange.emit({ isPeriodo: true, value: [`${moment(this.date.value).format('YYYY')}`, `${moment(this.date.value).format('MM')}`] });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.hasOwnProperty('isReset')) {
      if (this.isReset && this.isTime) {
        this.vTimer = "";
        this.afterChange.emit({ isTime: true, value: ``, id: this.id });
      }
    }
  }

  onChangeInput(ev: any) {
    let arrDate = ev;
    let date = new Date(ev);

    if (this.isPeriodo) {
      var futureMonth = moment(this.date.value).add(1, 'months');
      this.afterChange.emit({ isPeriodo: true, type: 'isPeriodo', value: [`${moment(this.date.value).format('YYYY')}`, `${moment(this.date.value).format('MM')}`] });
    }

    if (this.isMultiSelect && this.model.length >= 1 && this.model.length <= 3) {
      this.afterChange.emit({ isMultiSelect: true, type: 'isMultiSelect', value: this.model });
    }

    if (this.isDefault) {
      this.afterChange.emit({ id: this.id, isDefault: true, type: 'isDefault', value: `${moment(this.date.value).format('YYYY-MM-DD')}` });
    }

    if (this.isTime) {
      this.afterChange.emit({ isTime: true, type: 'isTime', value: `${this.vTimer}`, id: this.id });
    }

    if (this.isRange) {
      let ar = [];
      let dateStart = `${moment(this.range.value.start).format('YYYY-MM-DD')}`;
      let dateEnd = `${moment(this.range.value.end).format('YYYY-MM-DD')}`;
      ar = [`${moment(this.range.value.start).format('YYYY-MM-DD')}`, `${moment(this.range.value.end).format('YYYY-MM-DD')}`];
      if ((dateStart != 'Invalid date' && dateEnd != 'Invalid date') && (dateStart != null && dateEnd != null)) {
        this.afterChange.emit({ id: this.id, isDetallado: true, type: 'isDetallado', value: ar });
      }

    }

    if (this.isPresentRange) {
      let startDayLetter = new Date(moment(this.range.value.start).format('YYYY-MM-DD'));
      var startTotalDays = moment(this.range.value.start).add(6, 'days').format('DD');
      let dateEnd = moment(this.range.value.end).format('DD');
      let diasSemana = new Array("Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado");

      if (diasSemana[startDayLetter.getDay()] == "Lunes") {
        if (parseInt(dateEnd) > 0) {
          if (parseInt(startTotalDays) == parseInt(dateEnd)) {
            let ar = [`${moment(this.range.value.start).format('YYYY-MM-DD')}`, `${moment(this.range.value.end).format('YYYY-MM-DD')}`];
            this.afterChange.emit({ isPresentRange: true, type: 'isPresentRange', value: ar });
          } else {
            //this.service.toastError("Numero de dias no son los de una semana.", "Horario");
          }
        }
      } else {
        // this.service.toastError("No puede iniciar el horario con ese dia.", "Horario");
      }
    }
  }




  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value && this.model.length < 3) {
      const date = event.value;
      const index = this._findDate(date);
      if (index === -1) {
        (this.model as string[]).push(`${moment(date).format('YYYY-MM-DD')}`);
        this.onChangeInput(this.model);
      } else {
        this.model.splice(index, 1)
      }
      this.resetModel = new Date();
      if (!this.CLOSE_ON_SELECTED) {
        const closeFn = this._picker.close;
        this._picker.close = () => { };
        (this._picker as any)['_popupComponentRef'].instance._calendar.monthView._createWeekCells()
        setTimeout(() => {
          this._picker.close = closeFn;
        });
      }


    } else {
      // this.service.toastError("Solo puede seleccionar 3 fechas.", "Calendario");
    }
  }

  public remove(date: Date): void {
    const index = this._findDate(date);
    this.model.splice(index, 1)
  }


  private _findDate(date: Date): number {
    return this.model.map((m) => +m).indexOf(+date);
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());

    this.date.setValue(ctrlValue);
    datepicker.close();
  }


  chosenYearHandler(normalizedYear: Moment) {

    const ctrlValue = this.date.value;
    (ctrlValue as any).year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    (ctrlValue as any).month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
    var futureMonth = moment(this.date.value).add(1, 'months');
    this.afterChange.emit({ isPeriodo: true, value: [`${moment(this.date.value).format('YYYY')}`, `${moment(this.date.value).format('MM')}`] });

  }
}
