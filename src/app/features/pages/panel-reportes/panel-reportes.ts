import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '@metasperu/services/socket.service';

@Component({
  selector: 'panel-reportes',
  standalone: false,
  templateUrl: './panel-reportes.html',
  styleUrl: './panel-reportes.scss',
})
export class PanelReportes {
  // Lista de reportes disponibles
  reportes = [
    {
      id: 'informe-rendimiento',
      nombre: 'Informe de Rendimiento',
      descripcion: 'Venta por departamento',
      icono: '📊'
    }
    // Aquí puedes agregar más reportes en el futuro
  ];

  listaTiendas = [
    {
      "id": 3,
      "serie": "7J",
      "nombre": "BBW AREQUIPA",
      "codigo_almacen": "CT1",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwmallaventuraAQP@metasperu.com",
      "codigo_ejb": "0024",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.0.5",
          "active": true
        },
        {
          "ip": "192.168.0.6",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 52,
          "serie": "7J",
          "nombre": "BBW01",
          "cantidad": 0
        },
        {
          "id": 53,
          "serie": "7J",
          "nombre": "CAJA02",
          "cantidad": 0
        },
        {
          "id": 54,
          "serie": "7J",
          "nombre": "BBW03",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 14,
      "serie": "7F",
      "nombre": "BBW ECOMMERCE",
      "codigo_almacen": "PB3",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwecommperu@metasperu.com",
      "codigo_ejb": "0016",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [],
      "terminales": [
        {
          "id": 55,
          "serie": "7F",
          "nombre": "BBW-ECOM",
          "cantidad": 0
        },
        {
          "id": 56,
          "serie": "7F",
          "nombre": "BBWRIPLEY",
          "cantidad": 0
        },
        {
          "id": 57,
          "serie": "7F",
          "nombre": "BBWRAPPID",
          "cantidad": 0
        },
        {
          "id": 58,
          "serie": "7F",
          "nombre": "BBWECOM04",
          "cantidad": 0
        },
        {
          "id": 59,
          "serie": "7F",
          "nombre": "BBW-03",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 1,
      "serie": "7A",
      "nombre": "BBW JOCKEY",
      "codigo_almacen": "BO1",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwjockeyplaza@metasperu.com",
      "codigo_ejb": "0003",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.20.125",
          "active": true
        },
        {
          "ip": "192.168.20.126",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 1,
          "serie": "7A",
          "nombre": "BBWJP01",
          "cantidad": 0
        },
        {
          "id": 2,
          "serie": "7A",
          "nombre": "BBWJP02",
          "cantidad": 0
        },
        {
          "id": 3,
          "serie": "7A",
          "nombre": "BBWJP03",
          "cantidad": 0
        },
        {
          "id": 4,
          "serie": "7A",
          "nombre": "BBWJP04",
          "cantidad": 0
        },
        {
          "id": 5,
          "serie": "7A",
          "nombre": "BBWJP05",
          "cantidad": 0
        },
        {
          "id": 6,
          "serie": "7A",
          "nombre": "BBWJP06",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 4,
      "serie": "7E",
      "nombre": "BBW LA RAMBLA",
      "codigo_almacen": "BW1",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwlarambla@metasperu.com",
      "codigo_ejb": "0010",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.112",
          "active": true
        },
        {
          "ip": "192.168.10.113",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 9,
          "serie": "7E",
          "nombre": "BBWLRPR01",
          "cantidad": 0
        },
        {
          "id": 10,
          "serie": "7E",
          "nombre": "BBWLRPR02",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 20,
      "serie": "7I",
      "nombre": "BBW MALL PLAZA TRU",
      "codigo_almacen": "DD1",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwmallplazatrujillo@metasperu.com",
      "codigo_ejb": "0026",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.20.64",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 29,
          "serie": "7I",
          "nombre": "CAJA01",
          "cantidad": 0
        },
        {
          "id": 30,
          "serie": "7I",
          "nombre": "CAJA02",
          "cantidad": 0
        },
        {
          "id": 31,
          "serie": "7I",
          "nombre": "CAJA03",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 9,
      "serie": "7D",
      "nombre": "BBW SALAVERRY",
      "codigo_almacen": "BY1",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwsalaverry@metasperu.com",
      "codigo_ejb": "0007",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.127",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 18,
          "serie": "7D",
          "nombre": "BBWPRPS01",
          "cantidad": 0
        },
        {
          "id": 19,
          "serie": "7D",
          "nombre": "BBWPRPS02",
          "cantidad": 0
        },
        {
          "id": 20,
          "serie": "7D",
          "nombre": "BBWPRPS03",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 7,
      "serie": "7C",
      "nombre": "BBW SAN MIGUEL",
      "codigo_almacen": "BS1",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwsanmiguel@metasperu.com",
      "codigo_ejb": "0006",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.101",
          "active": true
        },
        {
          "ip": "192.168.10.113",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 13,
          "serie": "7C",
          "nombre": "BBWSMPR",
          "cantidad": 0
        },
        {
          "id": 14,
          "serie": "7C",
          "nombre": "BBWSMPR02",
          "cantidad": 0
        },
        {
          "id": 15,
          "serie": "7C",
          "nombre": "BBWSMPR03",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 29,
      "serie": "7R",
      "nombre": "BBW SANTA ANITA",
      "codigo_almacen": "DP1",
      "unidad_servicio": "BBW",
      "marca": "BBW",
      "email": "bbwmallaventurasa@metasperu.com",
      "codigo_ejb": "0028",
      "estado": "ACTIVO",
      "tipo_tienda": "BBW",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.20.128",
          "active": true
        },
        {
          "ip": "192.168.20.132",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 35,
          "serie": "7R",
          "nombre": "BBWSA01",
          "cantidad": 0
        },
        {
          "id": 36,
          "serie": "7R",
          "nombre": "BBWSA02",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 28,
      "serie": "8A",
      "nombre": "TUMI JOCKEY PLAZA",
      "codigo_almacen": "TF1",
      "unidad_servicio": "MT",
      "marca": "MT",
      "email": "tumijockeyplaza@metasperu.com",
      "codigo_ejb": "0029",
      "estado": "ACTIVO",
      "tipo_tienda": "TM",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.177",
          "active": true
        }
      ],
      "terminales": [
        {
          "id": 34,
          "serie": "8A",
          "nombre": "TUMI01",
          "cantidad": 0
        }
      ],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 30,
      "serie": "HO",
      "nombre": "VSBA ANGAMOS",
      "codigo_almacen": "HOV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsangamos@metasperu.com",
      "codigo_ejb": "0030",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 2,
      "serie": "HL",
      "nombre": "VSBA AREQUIPA",
      "codigo_almacen": "HLV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsmallaventuraAQP@metasperu.com",
      "codigo_ejb": "0023",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.0.80",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 13,
      "serie": "HK",
      "nombre": "VSBA ECOMMERCE",
      "codigo_almacen": "HKV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsecommpe@metasperu.com",
      "codigo_ejb": "0019",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 5,
      "serie": "HE",
      "nombre": "VSBA LA RAMBLA",
      "codigo_almacen": "HEV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vslarambla@metasperu.com",
      "codigo_ejb": "0009",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.125",
          "active": true
        },
        {
          "ip": "192.168.10.165",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 11,
      "serie": "HF",
      "nombre": "VSBA MALL DEL SUR",
      "codigo_almacen": "HFV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsmalldelsur@metasperu.com",
      "codigo_ejb": "0011",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.134",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 19,
      "serie": "HM",
      "nombre": "VSBA MALL PLAZA TRU",
      "codigo_almacen": "HMV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsmallplazatrujillo@metasperu.com",
      "codigo_ejb": "0025",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.20.65",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 15,
      "serie": "HJ",
      "nombre": "VSBA MEGA PLAZA",
      "codigo_almacen": "HJV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsmegaplaza@metasperu.com",
      "codigo_ejb": "0014",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.132",
          "active": true
        },
        {
          "ip": "192.168.10.148",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 16,
      "serie": "HB",
      "nombre": "VSBA MINKA",
      "codigo_almacen": "HBV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsoutletminka@metasperu.com",
      "codigo_ejb": "0015",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.106",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 6,
      "serie": "HC",
      "nombre": "VSBA PLAZA NORTE",
      "codigo_almacen": "HCV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsplazanorte@metasperu.com",
      "codigo_ejb": "0004",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.112",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 12,
      "serie": "HI",
      "nombre": "VSBA PURUCHUCO",
      "codigo_almacen": "HIV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vspuruchuco@metasperu.com",
      "codigo_ejb": "0013",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.157",
          "active": true
        },
        {
          "ip": "192.168.10.122",
          "active": true
        },
        {
          "ip": "192.168.10.107",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 10,
      "serie": "HH",
      "nombre": "VSBA SALAVERRY",
      "codigo_almacen": "HHV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vssalaverry@metasperu.com",
      "codigo_ejb": "0012",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.137",
          "active": true
        },
        {
          "ip": "192.168.10.125",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 8,
      "serie": "HD",
      "nombre": "VSBA SAN MIGUEL",
      "codigo_almacen": "HDV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vssanmiguel@metasperu.com",
      "codigo_ejb": "0005",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.126",
          "active": true
        },
        {
          "ip": "192.168.10.132",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 27,
      "serie": "HN",
      "nombre": "VSBA SANTA ANITA",
      "codigo_almacen": "HNV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsmallaventurasa@metasperu.com",
      "codigo_ejb": "0027",
      "estado": "ACTIVO",
      "tipo_tienda": "VSBA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.10.137",
          "active": true
        },
        {
          "ip": "192.168.10.132",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    },
    {
      "id": 17,
      "serie": "HA",
      "nombre": "VSFA JOCKEY FULL",
      "codigo_almacen": "HAV",
      "unidad_servicio": "VS",
      "marca": "VS",
      "email": "vsjockeyplaza@metasperu.com",
      "codigo_ejb": "0008",
      "estado": "ACTIVO",
      "tipo_tienda": "VSFA",
      "online": false,
      "traffic": [
        {
          "ip": "192.168.20.230",
          "active": true
        },
        {
          "ip": "192.168.20.231",
          "active": true
        }
      ],
      "terminales": [],
      "comprobantes": 0,
      "transacciones": 0,
      "clientes": 0,
      "clientesLoading": false,
      "transaccionesLoading": false,
      "comprobantesLoading": false
    }
  ];

  reporteSeleccionado: string | null = null;

  seleccionarReporte(id: string): void {
    this.reporteSeleccionado = id;
  }

  volver(): void {
    this.reporteSeleccionado = null;
  }
}
