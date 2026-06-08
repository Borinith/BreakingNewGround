import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tabs.component.css']
})

export class TabsComponent {
  navLinks = [
    { path: 'weatherforecast', label: 'Прогноз погоды' },
    { path: 'medicines', label: 'Лекарства' },
    { path: 'images', label: 'Картинки' },
  ];
}
