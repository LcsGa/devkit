import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { fromChildEvent, rxAfterNextRender } from '@lcsga/ng-operators';
import { RxIf } from '@rx-angular/template/if';
import { RxPush } from '@rx-angular/template/push';
import { scan, startWith, tap } from 'rxjs';

@Component({
  standalone: true,
  imports: [RxPush, RxIf, AsyncPipe, NgIf],
  selector: 'app-root',
  template: `
    <button #btnToggle>Toggle clickable btn</button>

    <!-- <button #btnClick *rxIf="toggleCount$">Click me!</button> -->
    <button #btnClick *ngIf="toggleCount$ | async">Click me!</button>

    <!-- <p>{{ clickCount$ | push }}</p> -->
    <p>{{ clickCount$ | async }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @ViewChild('btnToggle')
  btnToggle?: ElementRef;

  @ViewChild('btnClick')
  btnClick?: ElementRef;

  toggleCount$ = fromChildEvent(() => this.btnToggle, 'click').pipe(
    scan((state) => !state, false),
    startWith(false),
    tap(console.log)
  );

  clickCount$ = fromChildEvent(() => this.btnClick, 'click').pipe(
    scan((count) => count + 1, 0),
    startWith(0)
  );

  constructor() {
    const nextRender$ = rxAfterNextRender();

    nextRender$.subscribe(() => console.log('render 1'));

    setTimeout(() => nextRender$.subscribe(() => console.log('render 2')), 3000);

    fromChildEvent(() => this.btnToggle, 'click').subscribe(() => console.log('btnToggle clicked'));
    fromChildEvent(() => this.btnClick, 'click').subscribe(() => console.log('btnClick clicked'));
  }
}
