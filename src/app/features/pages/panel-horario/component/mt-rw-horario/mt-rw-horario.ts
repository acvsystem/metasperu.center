import { Component } from '@angular/core';

@Component({
  selector: 'mt-rw-horario',
  standalone: false,
  templateUrl: './mt-rw-horario.html',
  styleUrl: './mt-rw-horario.scss',
})
export class MtRwHorario {

  dataHorario: Array<any> = [
    {
      "id": 7742,
      "cargo": "Cajeros",
      "codigo_tienda": "7D",
      "rg_hora": [
        {
          "id": 17704,
          "position": 1,
          "rg": "09:30 a 18:30",
          "codigo_tienda": "7D"
        },
        {
          "id": 17705,
          "position": 2,
          "rg": "13:30 a 22:30",
          "codigo_tienda": "7D"
        }
      ],
      "dias": [
        {
          "dia": "Lunes",
          "fecha": "13 - abr",
          "fecha_number": "13-4-2026",
          "id": 53076,
          "position": 1
        },
        {
          "dia": "Martes",
          "fecha": "14 - abr",
          "fecha_number": "14-4-2026",
          "id": 53077,
          "position": 2
        },
        {
          "dia": "Miercoles",
          "fecha": "15 - abr",
          "fecha_number": "15-4-2026",
          "id": 53078,
          "position": 3
        },
        {
          "dia": "Jueves",
          "fecha": "16 - abr",
          "fecha_number": "16-4-2026",
          "id": 53079,
          "position": 4
        },
        {
          "dia": "Viernes",
          "fecha": "17 - abr",
          "fecha_number": "17-4-2026",
          "id": 53080,
          "position": 5
        },
        {
          "dia": "Sabado",
          "fecha": "18 - abr",
          "fecha_number": "18-4-2026",
          "id": 53081,
          "position": 6
        },
        {
          "dia": "Domingo",
          "fecha": "19 - abr",
          "fecha_number": "19-4-2026",
          "id": 53082,
          "position": 7
        }
      ],
      "dias_trabajo": [
        {
          "id": 183523,
          "id_cargo": 7742,
          "id_dia": 53078,
          "nombre_completo": "GARAMENDI PALOMINO ANDREA MILAGROS",
          "numero_documento": "73437781",
          "rg": 17704,
          "codigo_tienda": "7D"
        },
        {
          "id": 183524,
          "id_cargo": 7742,
          "id_dia": 53076,
          "nombre_completo": "GARAMENDI PALOMINO ANDREA MILAGROS",
          "numero_documento": "73437781",
          "rg": 17704,
          "codigo_tienda": "7D"
        },
        {
          "id": 183525,
          "id_cargo": 7742,
          "id_dia": 53079,
          "nombre_completo": "GARAMENDI PALOMINO ANDREA MILAGROS",
          "numero_documento": "73437781",
          "rg": 17704,
          "codigo_tienda": "7D"
        },
        {
          "id": 183526,
          "id_cargo": 7742,
          "id_dia": 53080,
          "nombre_completo": "GARAMENDI PALOMINO ANDREA MILAGROS",
          "numero_documento": "73437781",
          "rg": 17704,
          "codigo_tienda": "7D"
        },
        {
          "id": 183527,
          "id_cargo": 7742,
          "id_dia": 53081,
          "nombre_completo": "GARAMENDI PALOMINO ANDREA MILAGROS",
          "numero_documento": "73437781",
          "rg": 17704,
          "codigo_tienda": "7D"
        },
        {
          "id": 183528,
          "id_cargo": 7742,
          "id_dia": 53082,
          "nombre_completo": "GARAMENDI PALOMINO ANDREA MILAGROS",
          "numero_documento": "73437781",
          "rg": 17704,
          "codigo_tienda": "7D"
        }
      ],
      "dias_libres": [
        {
          "id": 34130,
          "id_cargo": 7742,
          "id_dia": 53077,
          "nombre_completo": "GARAMENDI PALOMINO ANDREA MILAGROS",
          "numero_documento": "73437781",
          "rg": 17704,
          "codigo_tienda": "7D"
        }
      ],
      "arListTrabajador": [],
      "observacion": [],
      "papeleta": []
    },
    {
      "id": 7743,
      "cargo": "Gerentes",
      "codigo_tienda": "7D",
      "rg_hora": [
        {
          "id": 17706,
          "position": 1,
          "rg": "09:30 a 18:30",
          "codigo_tienda": "7D"
        },
        {
          "id": 17707,
          "position": 2,
          "rg": "13:30 a 22:30",
          "codigo_tienda": "7D"
        }
      ],
      "dias": [
        {
          "dia": "Lunes",
          "fecha": "13 - abr",
          "fecha_number": "13-4-2026",
          "id": 53083,
          "position": 1
        },
        {
          "dia": "Martes",
          "fecha": "14 - abr",
          "fecha_number": "14-4-2026",
          "id": 53084,
          "position": 2
        },
        {
          "dia": "Miercoles",
          "fecha": "15 - abr",
          "fecha_number": "15-4-2026",
          "id": 53085,
          "position": 3
        },
        {
          "dia": "Jueves",
          "fecha": "16 - abr",
          "fecha_number": "16-4-2026",
          "id": 53086,
          "position": 4
        },
        {
          "dia": "Viernes",
          "fecha": "17 - abr",
          "fecha_number": "17-4-2026",
          "id": 53087,
          "position": 5
        },
        {
          "dia": "Sabado",
          "fecha": "18 - abr",
          "fecha_number": "18-4-2026",
          "id": 53088,
          "position": 6
        },
        {
          "dia": "Domingo",
          "fecha": "19 - abr",
          "fecha_number": "19-4-2026",
          "id": 53089,
          "position": 7
        }
      ],
      "dias_trabajo": [
        {
          "id": 183529,
          "id_cargo": 7743,
          "id_dia": 53083,
          "nombre_completo": "CHIROQUE PINEDA JULIO NICOLAS",
          "numero_documento": "46548649",
          "rg": 17707,
          "codigo_tienda": "7D"
        },
        {
          "id": 183530,
          "id_cargo": 7743,
          "id_dia": 53084,
          "nombre_completo": "CHIROQUE PINEDA JULIO NICOLAS",
          "numero_documento": "46548649",
          "rg": 17706,
          "codigo_tienda": "7D"
        },
        {
          "id": 183531,
          "id_cargo": 7743,
          "id_dia": 53085,
          "nombre_completo": "CHIROQUE PINEDA JULIO NICOLAS",
          "numero_documento": "46548649",
          "rg": 17707,
          "codigo_tienda": "7D"
        },
        {
          "id": 183532,
          "id_cargo": 7743,
          "id_dia": 53086,
          "nombre_completo": "CHIROQUE PINEDA JULIO NICOLAS",
          "numero_documento": "46548649",
          "rg": 17707,
          "codigo_tienda": "7D"
        },
        {
          "id": 183533,
          "id_cargo": 7743,
          "id_dia": 53087,
          "nombre_completo": "CHIROQUE PINEDA JULIO NICOLAS",
          "numero_documento": "46548649",
          "rg": 17707,
          "codigo_tienda": "7D"
        },
        {
          "id": 183534,
          "id_cargo": 7743,
          "id_dia": 53088,
          "nombre_completo": "CHIROQUE PINEDA JULIO NICOLAS",
          "numero_documento": "46548649",
          "rg": 17707,
          "codigo_tienda": "7D"
        },
        {
          "id": 183535,
          "id_cargo": 7743,
          "id_dia": 53089,
          "nombre_completo": "CHIROQUE PINEDA JULIO NICOLAS",
          "numero_documento": "46548649",
          "rg": 17707,
          "codigo_tienda": "7D"
        }
      ],
      "dias_libres": [],
      "arListTrabajador": [],
      "observacion": [],
      "papeleta": []
    },
    {
      "id": 7744,
      "cargo": "Almaceneros",
      "codigo_tienda": "7D",
      "rg_hora": [],
      "dias": [
        {
          "dia": "Lunes",
          "fecha": "13 - abr",
          "fecha_number": "13-4-2026",
          "id": 53104,
          "position": 1
        },
        {
          "dia": "Martes",
          "fecha": "14 - abr",
          "fecha_number": "14-4-2026",
          "id": 53105,
          "position": 2
        },
        {
          "dia": "Miercoles",
          "fecha": "15 - abr",
          "fecha_number": "15-4-2026",
          "id": 53106,
          "position": 3
        },
        {
          "dia": "Jueves",
          "fecha": "16 - abr",
          "fecha_number": "16-4-2026",
          "id": 53107,
          "position": 4
        },
        {
          "dia": "Viernes",
          "fecha": "17 - abr",
          "fecha_number": "17-4-2026",
          "id": 53108,
          "position": 5
        },
        {
          "dia": "Sabado",
          "fecha": "18 - abr",
          "fecha_number": "18-4-2026",
          "id": 53109,
          "position": 6
        },
        {
          "dia": "Domingo",
          "fecha": "19 - abr",
          "fecha_number": "19-4-2026",
          "id": 53110,
          "position": 7
        }
      ],
      "dias_trabajo": [],
      "dias_libres": [],
      "arListTrabajador": [],
      "observacion": [],
      "papeleta": []
    },
    {
      "id": 7745,
      "cargo": "Asesores",
      "codigo_tienda": "7D",
      "rg_hora": [
        {
          "id": 17708,
          "position": 1,
          "rg": "10:00 a 19:00",
          "codigo_tienda": "7D"
        },
        {
          "id": 17709,
          "position": 2,
          "rg": "11:00 a 20:00",
          "codigo_tienda": "7D"
        },
        {
          "id": 17710,
          "position": 3,
          "rg": "12:00 a 21:00",
          "codigo_tienda": "7D"
        },
        {
          "id": 17711,
          "position": 4,
          "rg": "12:30 a 21:30",
          "codigo_tienda": "7D"
        },
        {
          "id": 17712,
          "position": 5,
          "rg": "13:30 a 22:30",
          "codigo_tienda": "7D"
        }
      ],
      "dias": [
        {
          "dia": "Lunes",
          "fecha": "13 - abr",
          "fecha_number": "13-4-2026",
          "id": 53097,
          "position": 1
        },
        {
          "dia": "Martes",
          "fecha": "14 - abr",
          "fecha_number": "14-4-2026",
          "id": 53098,
          "position": 2
        },
        {
          "dia": "Miercoles",
          "fecha": "15 - abr",
          "fecha_number": "15-4-2026",
          "id": 53099,
          "position": 3
        },
        {
          "dia": "Jueves",
          "fecha": "16 - abr",
          "fecha_number": "16-4-2026",
          "id": 53100,
          "position": 4
        },
        {
          "dia": "Viernes",
          "fecha": "17 - abr",
          "fecha_number": "17-4-2026",
          "id": 53101,
          "position": 5
        },
        {
          "dia": "Sabado",
          "fecha": "18 - abr",
          "fecha_number": "18-4-2026",
          "id": 53102,
          "position": 6
        },
        {
          "dia": "Domingo",
          "fecha": "19 - abr",
          "fecha_number": "19-4-2026",
          "id": 53103,
          "position": 7
        }
      ],
      "dias_trabajo": [
        {
          "id": 183538,
          "id_cargo": 7745,
          "id_dia": 53101,
          "nombre_completo": "BENITEZ ARAGON MARIA FERNANDA",
          "numero_documento": "72185832",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 183539,
          "id_cargo": 7745,
          "id_dia": 53102,
          "nombre_completo": "BENITEZ ARAGON MARIA FERNANDA",
          "numero_documento": "72185832",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 183542,
          "id_cargo": 7745,
          "id_dia": 53100,
          "nombre_completo": "FERNANDEZ ADRIANZEN CECILIA GLADYS AMELIA",
          "numero_documento": "71948191",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183544,
          "id_cargo": 7745,
          "id_dia": 53101,
          "nombre_completo": "FERNANDEZ ADRIANZEN CECILIA GLADYS AMELIA",
          "numero_documento": "71948191",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 183545,
          "id_cargo": 7745,
          "id_dia": 53102,
          "nombre_completo": "FERNANDEZ ADRIANZEN CECILIA GLADYS AMELIA",
          "numero_documento": "71948191",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183547,
          "id_cargo": 7745,
          "id_dia": 53097,
          "nombre_completo": "VARGAS CISNEROS MERYGEAN MIA",
          "numero_documento": "70595915",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183553,
          "id_cargo": 7745,
          "id_dia": 53099,
          "nombre_completo": "SOLARI RIVAS FRANCESCA GRISELE",
          "numero_documento": "72492663",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 183556,
          "id_cargo": 7745,
          "id_dia": 53099,
          "nombre_completo": "VARGAS CISNEROS MERYGEAN MIA",
          "numero_documento": "70595915",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183559,
          "id_cargo": 7745,
          "id_dia": 53100,
          "nombre_completo": "VARGAS CISNEROS MERYGEAN MIA",
          "numero_documento": "70595915",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 183562,
          "id_cargo": 7745,
          "id_dia": 53100,
          "nombre_completo": "SOLARI RIVAS FRANCESCA GRISELE",
          "numero_documento": "72492663",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183563,
          "id_cargo": 7745,
          "id_dia": 53101,
          "nombre_completo": "VARGAS CISNEROS MERYGEAN MIA",
          "numero_documento": "70595915",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183571,
          "id_cargo": 7745,
          "id_dia": 53103,
          "nombre_completo": "GALLARDO ROMERO ALONSO MATTIAS",
          "numero_documento": "74921615",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183572,
          "id_cargo": 7745,
          "id_dia": 53102,
          "nombre_completo": "GALLARDO ROMERO ALONSO MATTIAS",
          "numero_documento": "74921615",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 183573,
          "id_cargo": 7745,
          "id_dia": 53102,
          "nombre_completo": "VARGAS CISNEROS MERYGEAN MIA",
          "numero_documento": "70595915",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 184530,
          "id_cargo": 7745,
          "id_dia": 53097,
          "nombre_completo": "BENITEZ ARAGON MARIA FERNANDA",
          "numero_documento": "72185832",
          "rg": 17709,
          "codigo_tienda": "7D"
        },
        {
          "id": 184531,
          "id_cargo": 7745,
          "id_dia": 53097,
          "nombre_completo": "FERNANDEZ ADRIANZEN CECILIA GLADYS AMELIA",
          "numero_documento": "71948191",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 184532,
          "id_cargo": 7745,
          "id_dia": 53097,
          "nombre_completo": "GALLARDO ROMERO ALONSO MATTIAS",
          "numero_documento": "74921615",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 184533,
          "id_cargo": 7745,
          "id_dia": 53098,
          "nombre_completo": "SOLARI RIVAS FRANCESCA GRISELE",
          "numero_documento": "72492663",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 184534,
          "id_cargo": 7745,
          "id_dia": 53098,
          "nombre_completo": "GALLARDO ROMERO ALONSO MATTIAS",
          "numero_documento": "74921615",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 184535,
          "id_cargo": 7745,
          "id_dia": 53098,
          "nombre_completo": "FERNANDEZ ADRIANZEN CECILIA GLADYS AMELIA",
          "numero_documento": "71948191",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 184537,
          "id_cargo": 7745,
          "id_dia": 53099,
          "nombre_completo": "GALLARDO ROMERO ALONSO MATTIAS",
          "numero_documento": "74921615",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 184538,
          "id_cargo": 7745,
          "id_dia": 53099,
          "nombre_completo": "BENITEZ ARAGON MARIA FERNANDA",
          "numero_documento": "72185832",
          "rg": 17709,
          "codigo_tienda": "7D"
        },
        {
          "id": 184539,
          "id_cargo": 7745,
          "id_dia": 53100,
          "nombre_completo": "BENITEZ ARAGON MARIA FERNANDA",
          "numero_documento": "72185832",
          "rg": 17709,
          "codigo_tienda": "7D"
        },
        {
          "id": 184540,
          "id_cargo": 7745,
          "id_dia": 53101,
          "nombre_completo": "SOLARI RIVAS FRANCESCA GRISELE",
          "numero_documento": "72492663",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 184541,
          "id_cargo": 7745,
          "id_dia": 53101,
          "nombre_completo": "GALLARDO ROMERO ALONSO MATTIAS",
          "numero_documento": "74921615",
          "rg": 17711,
          "codigo_tienda": "7D"
        },
        {
          "id": 184542,
          "id_cargo": 7745,
          "id_dia": 53102,
          "nombre_completo": "SOLARI RIVAS FRANCESCA GRISELE",
          "numero_documento": "72492663",
          "rg": 17711,
          "codigo_tienda": "7D"
        },
        {
          "id": 184543,
          "id_cargo": 7745,
          "id_dia": 53103,
          "nombre_completo": "FERNANDEZ ADRIANZEN CECILIA GLADYS AMELIA",
          "numero_documento": "71948191",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 184544,
          "id_cargo": 7745,
          "id_dia": 53103,
          "nombre_completo": "BENITEZ ARAGON MARIA FERNANDA",
          "numero_documento": "72185832",
          "rg": 17709,
          "codigo_tienda": "7D"
        },
        {
          "id": 184545,
          "id_cargo": 7745,
          "id_dia": 53103,
          "nombre_completo": "VARGAS CISNEROS MERYGEAN MIA",
          "numero_documento": "70595915",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 184546,
          "id_cargo": 7745,
          "id_dia": 53103,
          "nombre_completo": "SOLARI RIVAS FRANCESCA GRISELE",
          "numero_documento": "72492663",
          "rg": 17710,
          "codigo_tienda": "7D"
        }
      ],
      "dias_libres": [
        {
          "id": 34131,
          "id_cargo": 7745,
          "id_dia": 53099,
          "nombre_completo": "FERNANDEZ ADRIANZEN CECILIA GLADYS AMELIA",
          "numero_documento": "71948191",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 34132,
          "id_cargo": 7745,
          "id_dia": 53097,
          "nombre_completo": "DEL AGUILA NUÑEZ ALBERTO ARMANDO",
          "numero_documento": "72316622",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 34133,
          "id_cargo": 7745,
          "id_dia": 53097,
          "nombre_completo": "SOLARI RIVAS FRANCESCA GRISELE",
          "numero_documento": "72492663",
          "rg": 17708,
          "codigo_tienda": "7D"
        },
        {
          "id": 34134,
          "id_cargo": 7745,
          "id_dia": 53100,
          "nombre_completo": "GALLARDO ROMERO ALONSO MATTIAS",
          "numero_documento": "74921615",
          "rg": 17712,
          "codigo_tienda": "7D"
        },
        {
          "id": 34136,
          "id_cargo": 7745,
          "id_dia": 53098,
          "nombre_completo": "VARGAS CISNEROS MERYGEAN MIA",
          "numero_documento": "70595915",
          "rg": 17709,
          "codigo_tienda": "7D"
        },
        {
          "id": 34283,
          "id_cargo": 7745,
          "id_dia": 53098,
          "nombre_completo": "BENITEZ ARAGON MARIA FERNANDA",
          "numero_documento": "72185832",
          "rg": 17709,
          "codigo_tienda": "7D"
        }
      ],
      "arListTrabajador": [],
      "observacion": [],
      "papeleta": []
    },
    {
      "id": 7746,
      "cargo": "Asesores part time",
      "codigo_tienda": "7D",
      "rg_hora": [],
      "dias": [
        {
          "dia": "Lunes",
          "fecha": "13 - abr",
          "fecha_number": "13-4-2026",
          "id": 53111,
          "position": 1
        },
        {
          "dia": "Martes",
          "fecha": "14 - abr",
          "fecha_number": "14-4-2026",
          "id": 53112,
          "position": 2
        },
        {
          "dia": "Miercoles",
          "fecha": "15 - abr",
          "fecha_number": "15-4-2026",
          "id": 53113,
          "position": 3
        },
        {
          "dia": "Jueves",
          "fecha": "16 - abr",
          "fecha_number": "16-4-2026",
          "id": 53114,
          "position": 4
        },
        {
          "dia": "Viernes",
          "fecha": "17 - abr",
          "fecha_number": "17-4-2026",
          "id": 53115,
          "position": 5
        },
        {
          "dia": "Sabado",
          "fecha": "18 - abr",
          "fecha_number": "18-4-2026",
          "id": 53116,
          "position": 6
        },
        {
          "dia": "Domingo",
          "fecha": "19 - abr",
          "fecha_number": "19-4-2026",
          "id": 53117,
          "position": 7
        }
      ],
      "dias_trabajo": [],
      "dias_libres": [],
      "arListTrabajador": [],
      "observacion": [],
      "papeleta": []
    },
    {
      "id": 7747,
      "cargo": "Vacaciones",
      "codigo_tienda": "7D",
      "rg_hora": [
        {
          "id": 17724,
          "position": 1,
          "rg": "00:00 a 00:00",
          "codigo_tienda": "7D"
        }
      ],
      "dias": [
        {
          "dia": "Lunes",
          "fecha": "13 - abr",
          "fecha_number": "13-4-2026",
          "id": 53090,
          "position": 1
        },
        {
          "dia": "Martes",
          "fecha": "14 - abr",
          "fecha_number": "14-4-2026",
          "id": 53091,
          "position": 2
        },
        {
          "dia": "Miercoles",
          "fecha": "15 - abr",
          "fecha_number": "15-4-2026",
          "id": 53092,
          "position": 3
        },
        {
          "dia": "Jueves",
          "fecha": "16 - abr",
          "fecha_number": "16-4-2026",
          "id": 53093,
          "position": 4
        },
        {
          "dia": "Viernes",
          "fecha": "17 - abr",
          "fecha_number": "17-4-2026",
          "id": 53094,
          "position": 5
        },
        {
          "dia": "Sabado",
          "fecha": "18 - abr",
          "fecha_number": "18-4-2026",
          "id": 53095,
          "position": 6
        },
        {
          "dia": "Domingo",
          "fecha": "19 - abr",
          "fecha_number": "19-4-2026",
          "id": 53096,
          "position": 7
        }
      ],
      "dias_trabajo": [
        {
          "id": 183639,
          "id_cargo": 7747,
          "id_dia": 53090,
          "nombre_completo": "VELASQUEZ LAREZ ANDREINA DEL VALLE",
          "numero_documento": "003630092",
          "rg": 17724,
          "codigo_tienda": "7D"
        },
        {
          "id": 183640,
          "id_cargo": 7747,
          "id_dia": 53091,
          "nombre_completo": "VELASQUEZ LAREZ ANDREINA DEL VALLE",
          "numero_documento": "003630092",
          "rg": 17724,
          "codigo_tienda": "7D"
        },
        {
          "id": 183641,
          "id_cargo": 7747,
          "id_dia": 53092,
          "nombre_completo": "VELASQUEZ LAREZ ANDREINA DEL VALLE",
          "numero_documento": "003630092",
          "rg": 17724,
          "codigo_tienda": "7D"
        },
        {
          "id": 183642,
          "id_cargo": 7747,
          "id_dia": 53093,
          "nombre_completo": "VELASQUEZ LAREZ ANDREINA DEL VALLE",
          "numero_documento": "003630092",
          "rg": 17724,
          "codigo_tienda": "7D"
        },
        {
          "id": 183643,
          "id_cargo": 7747,
          "id_dia": 53094,
          "nombre_completo": "VELASQUEZ LAREZ ANDREINA DEL VALLE",
          "numero_documento": "003630092",
          "rg": 17724,
          "codigo_tienda": "7D"
        },
        {
          "id": 183644,
          "id_cargo": 7747,
          "id_dia": 53095,
          "nombre_completo": "VELASQUEZ LAREZ ANDREINA DEL VALLE",
          "numero_documento": "003630092",
          "rg": 17724,
          "codigo_tienda": "7D"
        },
        {
          "id": 183645,
          "id_cargo": 7747,
          "id_dia": 53096,
          "nombre_completo": "VELASQUEZ LAREZ ANDREINA DEL VALLE",
          "numero_documento": "003630092",
          "rg": 17724,
          "codigo_tienda": "7D"
        }
      ],
      "dias_libres": [],
      "arListTrabajador": [],
      "observacion": [],
      "papeleta": []
    }
  ];

  constructor() { }

  ngOnInit() {
    this.prepararDataHorario(this.dataHorario);
  }



  // mt-rw-horario.component.ts
  horariosProcesados: any[] = [];

  // Llama a esta función cuando recibas tus datos del servicio
  // mt-rw-horario.component.ts

  prepararDataHorario(data: any[]) {
    this.horariosProcesados = data.map(cargo => ({
      ...cargo,
      // 1. Filas para los rangos horarios (07:00, 09:00, etc.)
      filasTrabajo: cargo.rg_hora.map((rango: any) => ({
        rango: rango.rg,
        celdas: cargo.dias.map((dia: any) => ({
          // Solo buscamos trabajadores que tengan asignado este RANGO y este DÍA
          trabajadores: cargo.dias_trabajo.filter((dt: any) =>
            dt.id_dia === dia.id && dt.rg === rango.id
          )
        }))
      })),
      // 2. Fila única para Días Libres (La que va al final de cada cargo)
      filaLibres: cargo.dias.map((dia: any) => ({
        // Solo buscamos trabajadores en la lista de 'dias_libres' para este día
        trabajadores: cargo.dias_libres.filter((dl: any) => dl.id_dia === dia.id)
      }))
    }));
  }
}

// En tu componente .ts
interface CeldaHorario {
  id_dia: number;
  trabajadores: any[];
  esDiaLibre: boolean;
}