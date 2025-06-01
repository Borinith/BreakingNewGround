import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  standalone: false,
  styleUrls: ['./tabs.component.css']
})

export class TabsComponent {
  navLinks = [
    { path: 'weatherforecast', label: 'WeatherForecast' },
    { path: 'medicines', label: 'Medicines' }
  ];
}
