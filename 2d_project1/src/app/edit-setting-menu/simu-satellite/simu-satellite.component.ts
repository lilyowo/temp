import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { DataGroup, Settings } from '../../models/settings.model';
import { SimuItem } from '../../models/simu-item.model';

@Component({
  selector: 'app-simu-satellite',
  templateUrl: './simu-satellite.component.html',
  styleUrls: ['./simu-satellite.component.css']
  
})
export class SimuSatelliteComponent implements OnInit {
  dataTitle: string='衛星間連線';
  dataGroup: DataGroup<SimuItem> |undefined;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.dataGroup = settings['模擬項目'].find(group => group.dataTitle === this.dataTitle);
    });
  }
  onCheckboxChange(item: SimuItem): void {
    item.display = !item.display;
    this.updateSettings();
  }

  updateSettings(): void {
    // Function to update settingsItem.json
    // (Implementation will be added later)
  }
}