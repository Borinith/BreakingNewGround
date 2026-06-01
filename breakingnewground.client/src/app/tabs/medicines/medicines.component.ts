import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-medicines',
  templateUrl: './medicines.component.html',
  standalone: false,
  styleUrls: ['./medicines.component.css']
})

export class MedicinesComponent {
  readonly isMobile$: Observable<boolean>;

  constructor(breakpointObserver: BreakpointObserver) {
    this.isMobile$ = breakpointObserver.observe('(max-width: 600px)')
      .pipe(map(result => result.matches));
  }

  onNavClick(drawer: MatDrawer): void {
    if (drawer.mode === 'over') {
      drawer.close();
    }
  }
}
