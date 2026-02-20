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

  constructor(private socketService: SocketService, private storeService: StoreService) { }

  ngOnInit(): void {
    this.onListarTiendas();

    this.socketService.tiendas$.subscribe(data => {

      data.map((d) => {
        const index = this.dataSource.data.findIndex((t) => t.serie == d?.serie);
        if (index != -1) {
          this.dataSource.data[index].online = data[0].online;
        }
      });

    });

    this.socketService.onDocumentosRecibidos((docs) => {
      console.log(docs);
      const index = this.dataSource.data.findIndex((t) => t.serie == docs?.serie);
      if (index != -1) {
        this.dataSource.data[index].comprobantes = docs['length'];
        this.dataSource.data[index].comprobantesLoading = false;
      }
    });

    this.socketService.onTransactionsFrontRetail((transaction) => {
      console.log(transaction);
      const index = this.dataSource.data.findIndex((t) => t.serie == transaction?.serie);
      if (index != -1) {
        this.dataSource.data[index].transacciones = transaction['transactions'];
        this.dataSource.data[index].transaccionesLoading = false;
      }
    });

    this.socketService.onClientBlank((client) => {
      console.log(client);
      const index = this.dataSource.data.findIndex((t) => t.serie == client?.serie);
      if (index != -1) {
        this.dataSource.data[index].clientes = client['clients'];
        this.dataSource.data[index].clientesLoading = false;
      }
    });

    this.socketService.onTrafficCounter((traffic) => {
      console.log(traffic);
      if (!traffic?.serie || !traffic?.devices) return;

      const tienda = this.dataSource.data.find(t => t.serie === traffic.serie);

      if (tienda) {
        traffic.devices.forEach((device: any) => {
          const targetTraffic = tienda.traffic.find((t: any) => t.ip === device.ip);
          if (targetTraffic) {
            targetTraffic.active = device.online;
          }
        });

        this.dataSource._updateChangeSubscription();
      }
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
        this.dataSource = new MatTableDataSource(result);
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

}

