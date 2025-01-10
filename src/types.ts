export interface Config {
  additional_label: string;
  area: string;
  optional: boolean;
  solo_label: string;
  status_path: string;
}

export interface Entity {
  area_id: string;
  device_id: string;
  labels: string[];
}

export interface Device {
  id: string;
  area_id: string;
}

export interface HomeAssistant {
  entities: Entity[];
  devices: Device[];
}
