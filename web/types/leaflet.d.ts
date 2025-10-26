// Type declarations for Leaflet CSS imports
declare module "leaflet/dist/leaflet.css";
declare module "leaflet-draw/dist/leaflet.draw.css";

// Type declarations for leaflet.heat
declare module "leaflet.heat" {
  import * as L from "leaflet";

  export interface HeatLayerOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: { [key: number]: string };
  }

  export interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: Array<[number, number, number?]>): this;
    addLatLng(latlng: [number, number, number?]): this;
    setOptions(options: HeatLayerOptions): this;
  }

  export function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions
  ): HeatLayer;

  namespace L {
    function heatLayer(
      latlngs: Array<[number, number, number?]>,
      options?: HeatLayerOptions
    ): HeatLayer;
  }
}
