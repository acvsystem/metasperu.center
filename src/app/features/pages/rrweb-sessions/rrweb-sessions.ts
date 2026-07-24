import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import rrwebPlayer from 'rrweb-player';
import { RrwebPlayerService, RrwebSession } from '@metasperu/services/rrweb-player.service';
import { StoreService } from '@metasperu/services/store.service';
import { RrwebRecorderService } from '@metasperu/services/rrweb-recorder.service';

@Component({
  selector: 'app-rrweb-sessions',
  standalone: false,
  templateUrl: './rrweb-sessions.html',
  styleUrl: './rrweb-sessions.scss'
})
export class RrwebSessions implements AfterViewInit, OnDestroy {
  @ViewChild('playerContainer') playerContainer?: ElementRef<HTMLDivElement>;

  private rrwebPlayerService = inject(RrwebPlayerService);
  private storeService = inject(StoreService);
  private rrwebRecorder = inject(RrwebRecorderService);
  private player?: any;

  sessions: RrwebSession[] = [];
  selectedSession?: RrwebSession;
  displayedColumns = ['user_name', 'user_store', 'page_url', 'event_count', 'status', 'started_at', 'actions'];
  isLoadingSessions = false;
  isLoadingEvents = false;
  playerReady = false;
  viewReady = false;

  ngAfterViewInit(): void {
    this.rrwebRecorder.stop();
    this.viewReady = true;
    this.loadSessions();
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
    this.rrwebRecorder.start();
  }

  loadSessions(): void {
    this.isLoadingSessions = true;
    this.rrwebPlayerService.listSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.isLoadingSessions = false;
      },
      error: (err) => {
        this.isLoadingSessions = false;
        this.notifyError(err?.message || 'No se pudieron cargar las grabaciones');
      }
    });
  }

  playSession(session: RrwebSession): void {
    if (!this.viewReady || this.isLoadingEvents) return;

    this.selectedSession = session;
    this.playerReady = false;
    this.isLoadingEvents = true;
    this.destroyPlayer();

    this.rrwebPlayerService.getSessionEvents(session.session_id).subscribe({
      next: ({ events }) => {
        this.isLoadingEvents = false;

        if (!events.length) {
          this.notifyError('La sesion no tiene eventos para reproducir');
          return;
        }

        setTimeout(() => this.renderPlayer(events));
      },
      error: (err) => {
        this.isLoadingEvents = false;
        this.notifyError(err?.message || 'No se pudo cargar la grabacion');
      }
    });
  }

  private renderPlayer(events: any[]): void {
    const target = this.playerContainer?.nativeElement;
    if (!target) return;

    target.innerHTML = '';
    const width = Math.max(target.clientWidth || 900, 320);
    const height = Math.max(Math.min(window.innerHeight - 260, 720), 420);

    this.player = new rrwebPlayer({
      target,
      props: {
        events,
        width,
        height,
        autoPlay: false,
        showController: true,
        skipInactive: true
      }
    });

    this.playerReady = true;
  }

  private destroyPlayer(): void {
    this.player?.$destroy?.();
    this.player = undefined;

    if (this.playerContainer?.nativeElement) {
      this.playerContainer.nativeElement.innerHTML = '';
    }
  }

  private notifyError(message: string): void {
    this.storeService.onNotification.emit([{
      isSuccess: false,
      isError: true,
      bodyNotification: message
    }]);
  }
}
