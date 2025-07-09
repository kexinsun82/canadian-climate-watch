"use client";

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

const mapTabs = [
  { key: 'eccc', label: 'ECCC' },
  { key: 'nasa', label: 'NASA' },
  { key: 'discussion', label: 'Discussion' },
];

export default function MapSection() {
  const [selected, setSelected] = useState('eccc');
  const [observationMarkers, setObservationMarkers] = useState([]);
  const [nasaMarkers, setNasaMarkers] = useState([]);

  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    // ECCC
    if (selected === 'eccc') {
      fetch('/api/getObservations')
        .then(res => res.text())
        .then(xmlStr => {
          const parser = new window.DOMParser();
          const xml = parser.parseFromString(xmlStr, 'application/xml');
          const members = Array.from(xml.getElementsByTagName('om:member'));

          const markers = members.map(member => {
            const metaElements = member.getElementsByTagName('element');
            let station = '', lat = null, lng = null, time = '';

            Array.from(metaElements).forEach(el => {
              const name = el.getAttribute('name');
              const value = el.getAttribute('value');
              if (name === 'station_name') station = value;
              if (name === 'latitude') lat = parseFloat(value);
              if (name === 'longitude') lng = parseFloat(value);
              if (name === 'observation_date_utc') time = value;
            });

            const resultElements = member.getElementsByTagName('om:result')[0];
            let highTemp = '', lowTemp = '', windDir = '';
            if (resultElements) {
              const resEls = resultElements.getElementsByTagName('element');
              Array.from(resEls).forEach(el => {
                const name = el.getAttribute('name');
                const value = el.getAttribute('value');
                if (name === 'air_temperature_today_high') highTemp = value;
                if (name === 'air_temperature_today_low') lowTemp = value;
                if (name === 'wind_direction') windDir = value;
              });
            }

            return station && lat && lng ? { station, lat, lng, time, highTemp, lowTemp, windDir } : null;
          }).filter(Boolean);

          setObservationMarkers(markers);
        })
        .catch(() => setObservationMarkers([]));
    } else {
      setObservationMarkers([]);
    }

    // NASA
    if (selected === 'nasa') {
      fetch('https://eonet.gsfc.nasa.gov/api/v3/events')
        .then(res => res.json())
        .then(data => {
          console.log("EONET events raw:", data.events);
          const markers = [];

          if (Array.isArray(data.events)) {
            data.events.forEach(event => {
              const title = event.title;
              const category = event.categories?.[0]?.title || '';

              if (Array.isArray(event.geometries)) {
                event.geometries.forEach(geo => {
                  // Point
                  if (Array.isArray(geo.coordinates) && geo.coordinates.length === 2 && typeof geo.coordinates[0] === 'number') {
                    const [lng, lat] = geo.coordinates;
                    if (!isNaN(lat) && !isNaN(lng)) {
                      markers.push({ lat, lng, title, category, date: geo.date });
                    }
                  }
                  // Polygon 或 MultiPoint
                  else if (Array.isArray(geo.coordinates[0])) {
                    // Polygon: coordinates[0] 是一组点
                    if (Array.isArray(geo.coordinates[0][0])) {
                      // Polygon 或 MultiPolygon
                      // Polygon: coordinates[0] 是一组点，MultiPolygon: coordinates[0][0] 是一组点
                      const points = geo.coordinates.flat(2).filter(pt => Array.isArray(pt) && pt.length === 2);
                      if (points.length > 0) {
                        // 取所有点的中心
                        const avg = points.reduce((acc, [lng, lat]) => [acc[0]+lng, acc[1]+lat], [0,0]);
                        const centerLng = avg[0] / points.length;
                        const centerLat = avg[1] / points.length;
                        if (!isNaN(centerLat) && !isNaN(centerLng)) {
                          markers.push({ lat: centerLat, lng: centerLng, title, category, date: geo.date });
                        }
                      }
                    } else {
                      // MultiPoint: coordinates 是一组点
                      geo.coordinates.forEach(pt => {
                        if (Array.isArray(pt) && pt.length === 2) {
                          const [lng, lat] = pt;
                          if (!isNaN(lat) && !isNaN(lng)) {
                            markers.push({ lat, lng, title, category, date: geo.date });
                          }
                        }
                      });
                    }
                  }
                });
              }
            });
          }

          console.log("NASA markers:", markers);
          setNasaMarkers(markers);
        })
        .catch(error => {
          console.error("NASA EONET data failed:", error);
          setNasaMarkers([]);
        });
    } else {
      setNasaMarkers([]);
    }
  }, [selected]);

  function FitMapBounds({ markers }) {
    const map = useMap();

    useEffect(() => {
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [markers, map]);

    return null;
  }

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between bg-[var(--color-primary-light)] rounded-full px-6 py-3">
        <span className="text-lg font-medium font-title">Interactive Map</span>
        <button className="bg-[var(--color-primary-light)] rounded-full px-4 py-1 font-medium border border-[var(--color-primary)] hover:bg-[var(--color-primary)] transition font-body">
          Filters
        </button>
      </div>

      <div className="flex gap-4 justify-center mt-2">
        {mapTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-6 py-2 rounded-full border font-medium transition text-base font-body ${selected === tab.key ? 'bg-[var(--color-primary)] text-black' : 'bg-transparent text-black hover:bg-[var(--color-primary-light)]'}`}
            onClick={() => setSelected(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center mt-4" style={{ minHeight: 400 }}>
        {selected === 'eccc' ? (
          <MapContainer
            center={[49.25, -85.32]}
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: 400, width: '100%', borderRadius: '1rem' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {observationMarkers.length > 50 ? (
              <MarkerClusterGroup>
                {observationMarkers.map((marker, idx) => (
                  <Marker key={idx} position={[marker.lat, marker.lng]} icon={customIcon}>
                    <Popup>
                      <div>
                        <div><b>{marker.station}</b></div>
                        <div>Observed: {marker.time}</div>
                        {marker.highTemp && <div>High: {marker.highTemp} °C</div>}
                        {marker.lowTemp && <div>Low: {marker.lowTemp} °C</div>}
                        {marker.windDir && <div>Wind: {marker.windDir}</div>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            ) : (
              observationMarkers.map((marker, idx) => (
                <Marker key={idx} position={[marker.lat, marker.lng]} icon={customIcon}>
                  <Popup>
                    <div>
                      <div><b>{marker.station}</b></div>
                      <div>Observed: {marker.time}</div>
                      {marker.highTemp && <div>High: {marker.highTemp} °C</div>}
                      {marker.lowTemp && <div>Low: {marker.lowTemp} °C</div>}
                      {marker.windDir && <div>Wind: {marker.windDir}</div>}
                    </div>
                  </Popup>
                </Marker>
              ))
            )}
          </MapContainer>
        ) : selected === 'nasa' ? (
          <MapContainer
            center={[0, 0]}
            zoom={2}
            scrollWheelZoom={true}
            style={{ height: 400, width: '100%', borderRadius: '1rem' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <FitMapBounds markers={nasaMarkers} />
            <MarkerClusterGroup>
              {nasaMarkers.map((marker, idx) => (
                <Marker key={idx} position={[marker.lat, marker.lng]} icon={customIcon}>
                  <Popup>
                    <div>
                      <div><b>{marker.title}</b></div>
                      <div>{marker.category}</div>
                      <div>{new Date(marker.date).toLocaleString()}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        ) : (
        <span className="text-gray-500">{selected.toUpperCase()} Leaflet Map</span>
        )}
      </div>
    </section>
  );
} 