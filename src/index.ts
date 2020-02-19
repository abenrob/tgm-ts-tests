import {  TargomoClient } from '@targomo/core'
import { TgmLeafletPolygonOverlay } from '@targomo/leaflet'
import * as L from 'leaflet';
import { PolygonSvgOptions } from '@targomo/core/typings/api/payload/polygonRequestPayload';
import { environment } from './environments/environment'

// create targomo client
const client = new TargomoClient('britishisles', environment.tgmKey);
// define the basemap
const tilesUrl = `https://api.maptiler.com/maps/positron/{z}/{x}/{y}@2x.png?key=${environment.maptilerKey}`;
const tileLayer = L.tileLayer(tilesUrl, {
    tileSize: 512, zoomOffset: -1,
    minZoom: 1, crossOrigin: true
});
// Coordinates to center the map
const center: L.LatLngExpression = [55.949905, -3.199814];

// define the map
const map: L.Map = L.map('map', {
    layers: [tileLayer],
    scrollWheelZoom: false
}).setView(center, 11);

// set the attribution
const attributionText = `<a href='https://targomo.com/developers/resources/attribution/' target='_blank'>&copy; Targomo</a>`
map.attributionControl.addAttribution(attributionText);

// polygons time rings
const travelTimes = [300, 600, 900, 1200, 1500, 1800];

// polygon service options
const options: PolygonSvgOptions = {
    travelType: 'bike',
    travelEdgeWeights: travelTimes,
    useClientCache: false,
    maxEdgeWeight: 1800,
    edgeWeight: 'time',
    serializer: 'json'
};

// define the starting point
const sources = [{ id: 0, lat: center[0], lng: center[1] }];

// Add markers for the sources on the map.
sources.forEach(source => {
    L.marker([source.lat, source.lng]).addTo(map)
});

// define the polygon overlay
const polygonOverlayLayer = new TgmLeafletPolygonOverlay({ strokeWidth: 20 });
polygonOverlayLayer.addTo(map as any);

client.polygons.fetch(sources, options).then((polygons) => {
    // calculate bounding box for polygons
    const bounds = polygons.getMaxBounds();
    // add polygons to overlay
    polygonOverlayLayer.setData(polygons);
    // zoom to the polygon bounds
    map.fitBounds(L.latLngBounds(bounds.northEast, bounds.southWest));
}, (error) => {
    console.log(error);
});