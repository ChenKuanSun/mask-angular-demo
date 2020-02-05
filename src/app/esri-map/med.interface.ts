export interface TWMedicalData {
  type: string;
  features: Feature[];
}

export interface Feature {
  type: string;
  properties: Properties;
  geometry: Geometry;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface Properties {
  id: number;
  name: string;
  tel: string;
  address: string;
  type: string;
  x: number;
  y: number;
  time: string;
  notice: string;
}
