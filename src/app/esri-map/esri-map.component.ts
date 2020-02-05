import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { loadModules } from 'esri-loader';
import { from, throwError } from 'rxjs';
import { map, concatMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss']
})
export class EsriMapComponent implements OnInit, OnDestroy {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  // The <div> where we will place the map
  @ViewChild('mapViewNode', { static: true }) private mapViewEl: ElementRef;
  esriModules = [
    'esri/Map',
    'esri/views/MapView',
    'esri/layers/FeatureLayer',
    'esri/layers/GeoJSONLayer',
    'esri/widgets/Search',
    'esri/widgets/Legend',
    'esri/widgets/Expand',
    'esri/widgets/Home'
  ];

  /**
   * _zoom sets map zoom
   * _center sets map center
   * _basemap sets type of map
   * _loaded provides map loaded status
   */
  private _zoom = 10;
  private _center: Array<number> = [121.5470599, 25.0461158];
  private _basemap = 'streets';
  private _loaded = false;
  private _view = null;

  get mapLoaded(): boolean {
    return this._loaded;
  }

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set center(center: Array<number>) {
    this._center = center;
  }

  get center(): Array<number> {
    return this._center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;
  }

  get basemap(): string {
    return this._basemap;
  }

  constructor() { }

  initializeMap = () =>
    from(loadModules(this.esriModules)).pipe(
      map(([
        EsriMap,
        EsriMapView,
        FeatureLayer,
        GeoJSONLayer,
        Search,
        Legend,
        Expand,
        Home,
      ]) => {




        const clusterConfig = {
          type: 'cluster',
          clusterRadius: '10px',
          popupTemplate: {
            content: '這裡有{cluster_count}家健保特約藥局'
          }
        };

        const layer = new GeoJSONLayer({
          title: '健保特約藥局地圖',
          config: {
            show_label: 'true'
          },
          url:
            './assets/med-stores_geojson.json',
          featureReduction: clusterConfig,
          popupTemplate: {
            title: '{name}',
            content: [
              {
                type: 'text',
                text: '<a target="_blank" href="https://www.google.com/maps/search/{y},+{x}">{name}在Google地圖上的位置</a>'
              },
              {
                type: 'fields',
                fieldInfos: [
                  {
                    fieldName: 'count',
                    label: '預估剩餘口罩數量'
                  },
                  {
                    fieldName: 'tel',
                    label: '電話'
                  },
                  {
                    fieldName: 'address',
                    label: '地址'
                  },
                  {
                    fieldName: 'time',
                    label: '營業時間'
                  },
                  {
                    fieldName: 'notice',
                    label: '備註'
                  },
                ]
              }
            ]
            // [
            // {
            //   // It is also possible to set the fieldInfos outside of the content
            //   // directly in the popupTemplate. If no fieldInfos is specifically set
            //   // in the content, it defaults to whatever may be set within the popupTemplate.
            //   type: 'fields',
            //   fieldInfos: [
            //     {
            //       fieldName: 'count',
            //       label: '預估剩餘口罩數量'
            //     },
            //     {
            //       fieldName: 'tel',
            //       label: '電話'
            //     },
            //     {
            //       fieldName: 'address',
            //       label: '地址'
            //     },
            //     {
            //       fieldName: 'time',
            //       label: '營業時間'
            //     },
            //     {
            //       fieldName: 'notice',
            //       label: '備註'
            //     },
            //   ]
            // }]
          },
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-marker',
              size: 10,
              color: '#C30018',
              outline: {
                color: [0, 0, 0, 0]
              },
              visualVariables: [
                {
                  type: 'color',
                  field: 'count',
                  stops: [
                    { value: 50, color: '#1ABC91' },
                    { value: 200, color: '#3598DC' }
                  ]
                }
              ]
            }
          }
        });









        // Configure the Map
        const mapProperties = {
          basemap: this._basemap,
          layers: [layer]
        };
        const esriMap = new EsriMap(mapProperties);

        // Initialize the MapView
        const mapViewProperties = {
          container: this.mapViewEl.nativeElement,
          center: this._center,
          zoom: this._zoom,
          map: esriMap
        };
        this._view = new EsriMapView(mapViewProperties);


        // Add the search widget to the top right corner of the view
        this._view.ui.add(
          new Search({
            view: this._view
          }), 'top-right'
        );
        this._view.ui.add(
          new Home({
            view: this._view
          }),
          'top-left'
        );

        return this._view;
      }),
      concatMap((view) => from(view.when())),
      map(() => this._view),
      catchError((e) => {
        console.log('EsriLoader: ', e);
        return throwError('EsriLoader: ', e);
      })
    )



  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().subscribe(mapView => {
      // The map has been initialized
      console.log('mapView ready: ', this._view.ready);
      this._loaded = this._view.ready;
      this.mapLoadedEvent.emit(true);
    });
    navigator.geolocation.getCurrentPosition((pos) => {
      console.log(pos.coords);
      const p = pos.coords;
      this._center = [p.longitude, p.latitude];
    });
  }

  ngOnDestroy() {
    if (this._view) {
      // destroy the map view
      this._view.container = null;
    }
  }




}
