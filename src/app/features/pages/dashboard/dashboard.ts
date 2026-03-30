import { Component } from '@angular/core';
import { SocketService } from '@metasperu/services/socket.service';
import { StoreService } from '@metasperu/services/store.service';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  dataSource = new MatTableDataSource<any>([]);
  columnsToDisplay = [
    { matColumnDef: 'serie', titleColumn: 'Serie', propertyValue: 'serie' },
    { matColumnDef: 'nombre', titleColumn: 'Tienda', propertyValue: 'nombre' },
    { matColumnDef: 'traffic', titleColumn: 'Traffic', propertyValue: 'traffic' },
    { matColumnDef: 'comprobantes', titleColumn: 'Comprobantes', propertyValue: 'comprobantes' },
    { matColumnDef: 'transacciones', titleColumn: 'Transacciones', propertyValue: 'transacciones' },
    { matColumnDef: 'clientes', titleColumn: 'Clientes', propertyValue: 'clientes' },
    { matColumnDef: 'online', titleColumn: 'Online', propertyValue: 'online' }
  ];


  displayedColumns = [
    'serie', 'nombre', 'traffic', 'comprobantes',
    'transacciones', 'clientes', 'online'
  ];

  columnsServer: tableColumns[] = [
    { isSticky: false, matColumnDef: 'documento', titleColumn: 'Documento', propertyValue: 'cDocumento', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'fecha', titleColumn: 'Fecha', propertyValue: 'cFecha', filterActive: false, isCboFilter: false, cboFilter: [] }];
  displayedColumnsServer = ['documento', 'fecha'];
  dataSourceServer = new MatTableDataSource<any>([]);


  columnsServer_2: tableColumns[] = [
    { isSticky: false, matColumnDef: 'nro', titleColumn: 'No.', propertyValue: 'cNro', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'fecha_emision', titleColumn: 'Fecha Emision', propertyValue: 'cFechaEmision', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'fecha_expiracion', titleColumn: 'Fecha Expiracion', propertyValue: 'cFechaExpiracion', filterActive: false, isCboFilter: false, cboFilter: [] },
    { isSticky: false, matColumnDef: 'propietario', titleColumn: 'Propietario', propertyValue: 'cPropietario', filterActive: false, isCboFilter: false, cboFilter: [] }];
  displayedColumnsServer_2 = ['nro', 'fecha_emision', 'fecha_expiracion', 'propietario'];
  dataSourceServer_2 = new MatTableDataSource<any>([]);

  vDataTransferencia: Array<any> = [
    {
      dataOne: [],
      dataTwo: []
    }
  ];

  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: any | null = null;
  tiendas: any[] = [];
  docsEnCola: any = null;
  statusServer: any = {
    "hostname": "",
    "os": "",
    "cpuname": "",
    "cpu_usage": 0,
    "ram": {
      "used": "0GB",
      "total": "0GB",
      "percent": 0,
      "raw_used": 0
    },
    "network": {
      "ip": "",
      "mask": "",
      "interface": ""
    },
    "usb": "false",
    "dispositivos": [],
    "online": false
  };

  constructor(private socketService: SocketService, private storeService: StoreService) {

  }

  async ngOnInit(): Promise<void> {
    await this.onListarTiendas();


    this.socketService.tiendas$.subscribe(data => {
      console.log(data);

      // 1. Extraemos solo las series que vienen en el nuevo paquete 'data'
      const seriesNuevas = data.map(d => d?.serie);

      // 2. Mapeamos el dataSource completo
      const dataActualizada = this.dataSource.data.map(item => {
        // Buscamos si el item actual existe en lo que acaba de llegar
        const coincidencia = data.find(d => d.serie === item.serie);

        if (coincidencia) {
          // Si existe, le ponemos el estado 'online' que trae el servidor
          return { ...item, online: coincidencia.online };
        } else {
          // Si NO existe en 'data', lo forzamos a false
          return { ...item, online: false };
        }
      });

      // 3. Actualizamos el origen de datos para que la UI se refresque
      this.dataSource.data = dataActualizada;
    });

    this.socketService.onTrafficCounterStatus((response) => {
      // console.log(response);
      if (!response?.serie || !response?.devices) return;

      const tienda = this.dataSource.data.find(t => t.serie === response.serie);

      if (tienda) {
        response.devices.forEach((device: any) => {
          const targetTraffic = tienda.traffic.find((t: any) => t.ip === device.ip);
          if (targetTraffic) {
            targetTraffic.active = device.online;
          }
        });


        const index = this.dataSource.data.findIndex((t) => t.serie == response?.serie);

        if (index != -1) {
          this.dataSource.data[index].trafficLoading = false;
        }

        this.dataSource._updateChangeSubscription();
      }

    });

    this.socketService.onStatusServerBackup((response) => {
      this.statusServer = response;
    });

    this.socketService.onResponseDeleteColaPnm((response) => {
      console.log(response);
    });

    this.socketService.onResponseDeleteClient((response) => {
      console.log(response);

    });

    this.socketService.onDocumentosRecibidos((response) => {
      const index = this.dataSource.data.findIndex((t) => t.serie == response?.serie);
      if (index != -1) {
        this.dataSource.data[index].comprobantes = response['length'];
        this.dataSource.data[index].comprobantesLoading = false;
      }
    });

    this.socketService.onTransactionsFrontRetail((response) => {
      const index = this.dataSource.data.findIndex((t) => t.serie == response?.serie);
      if (index != -1) {
        this.dataSource.data[index].transacciones = response['transactions'];
        this.dataSource.data[index].transaccionesLoading = false;

        this.dataSource.data[index].terminales.filter((tr: any, idxTerminal: any) => {
          this.dataSource.data[index].terminales[idxTerminal]['cantidad'] = 0;
        });

        response.terminales?.filter((t: any) => {
          const idxTerminal = this.dataSource.data[index].terminales?.findIndex((tr: any) => tr.nombre == t.terminal);
          this.dataSource.data[index].terminales[idxTerminal]['cantidad'] = t.cantidad || 0;
        });
      }
    });

    this.socketService.onClientBlank((response) => {
      const index = this.dataSource.data.findIndex((t) => t.serie == response?.serie);
      if (index != -1) {
        this.dataSource.data[index].clientes = response['clients'];
        this.dataSource.data[index].clientesLoading = false;
      }
    });

    this.socketService.onResponseTransfer((response) => {
      console.log(response);
      this.onTransactions();
      this.onNotification({ message: response?.status });
    });
  }

  isExpanded(element: any) {
    return this.expandedElement === element;
  }

  /** Toggles the expanded state of an element. */
  toggle(element: any) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  consultar(codeStore: string) {
    this.socketService.solicitarDocumentos(codeStore);
  }

  onListarTiendas() {
    this.storeService.getStores().subscribe({
      next: (result) => {
        this.dataSource.data = result;
        this.storeService.callRefreshDashboard().subscribe((response) => { });
      },
      error: (err) => {
        this.onNotification({ error: 'error', message: err?.message });
      }
    });
  }

  onNotification(result: any) {
    let notificationList = [{
      isSuccess: !result?.error?.length ? true : false,
      isError: result?.error?.length ? true : false,
      bodyNotification: result?.message
    }];

    this.storeService.onNotification.emit(notificationList);
  }

  onMissingDocuments() {
    this.dataSource.data.map((t, i) => {
      if (t.online) {
        this.dataSource.data[i].comprobantesLoading = true;
      }
    });

    this.storeService.callDocumentsMissing().subscribe({
      next: (result) => {
        console.log(result);
        this.onNotification({ message: result?.message });
      },
      error: (err) => {
        this.onNotification({ error: 'error', message: err?.message });
      }
    });
  }

  onTransactions() {
    this.dataSource.data.map((t, i) => {
      if (t.online) {
        this.dataSource.data[i].transaccionesLoading = true;
      }
    });

    this.storeService.callTransactions().subscribe({
      next: (result) => {
        console.log(result);
        this.onNotification({ message: result?.message });
      },
      error: (err) => {
        this.onNotification({ error: 'error', message: err?.message });
      }
    });
  }

  onClientBlank() {

    this.dataSource.data.map((t, i) => {
      if (t.online) {
        this.dataSource.data[i].clientesLoading = true;
      }
    });

    this.storeService.callClientBlank().subscribe({
      next: (result) => {
        console.log(result);
        this.onNotification({ message: result?.message });
      },
      error: (err) => {
        this.onNotification({ error: 'error', message: err?.message });
      }
    });
  }

  onClientDelete() {
    this.dataSource.data.map((t, i) => {
      if (t.online) {
        this.dataSource.data[i].clientesLoading = true;
      }
    });
    this.storeService.callClientDelete().subscribe({
      next: (result) => {
        console.log(result);
        this.onNotification({ message: result?.message });
      },
      error: (err) => {
        this.onNotification({ error: 'error', message: err?.message });
      }
    });
  }

  onDeleteColaPanama() {
    this.storeService.callDeleteColaPanama().subscribe({
      next: (result) => {
        console.log(result);
        this.onNotification({ message: result?.message });
      },
      error: (err) => {
        this.onNotification({ error: 'error', message: err?.message });
      }
    });
  }

  onSelectedTranferencia(ev: any, dataOne: any, dataTwo?: any) {
    this.vDataTransferencia[0]['dataOne'] = dataOne || this.vDataTransferencia[0]['dataOne'];
    this.vDataTransferencia[0]['dataTwo'] = dataTwo || this.vDataTransferencia[0]['dataTwo'];

    if (Object.keys(dataOne).length) {
      let element = document.getElementsByClassName("origen");
      for (var i = 0; i < element.length; i++) {
        element[i].classList.remove("active");
      }

      document.getElementById(ev.target.id)?.classList.add('active');
    }

    if (Object.keys(dataTwo).length) {
      let element = document.getElementsByClassName("destino");
      for (var i = 0; i < element.length; i++) {
        element[i].classList.remove("active");
      }

      document.getElementById(ev.target.id)?.classList.add('active');
    }

  }

  onTransferTreminal() {

    const serie = this.vDataTransferencia[0]['dataOne']?.serie;
    const tIn = this.vDataTransferencia[0]['dataOne']?.nombre;
    const tOut = this.vDataTransferencia[0]['dataTwo']?.nombre;

    const transfer = {
      serie: serie,
      terminalIn: tIn,
      terminalOut: tOut
    };

    //this.onTransactions();
    this.storeService.callTransferTerminal(transfer).subscribe({
      next: (result) => {
        console.log(result);

        const index = this.dataSource.data.findIndex((t) => t.serie == serie);
        if (index != -1) {
          const idxTerminal = this.dataSource.data[index].terminales?.findIndex((tr: any) => tr.nombre == tIn);
          this.dataSource.data[index].terminales[idxTerminal]['cantidad'] = 0;
        }

        this.onNotification({ message: result?.message });
      },
      error: (err) => {
        this.onNotification({ error: 'error', message: err?.message });
      }
    });
  }

  onTrafficCounterStatus() {
    this.dataSource.data.map((t, i) => {
      if (t.traffic) {
        this.dataSource.data[i].trafficLoading = true;
      }
    });

    this.storeService.callTrafficCounterStatus().subscribe((a) => { });
  }

}

export interface tableColumns {
  isSticky: boolean;
  matColumnDef: string;
  titleColumn: string;
  propertyValue: string;
  filterActive: boolean;
  isCboFilter: boolean;
  cboFilter: Array<any>;
}