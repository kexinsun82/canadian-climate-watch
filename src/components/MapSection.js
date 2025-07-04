"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

  useEffect(() => {
    if (selected !== 'eccc') {
      setObservationMarkers([]);
      return;
    }

    fetch('/api/getObservations')
      .then(res => res.text())
      .then(xmlStr => {
        const parser = new window.DOMParser();
        const xml = parser.parseFromString(xmlStr, 'application/xml');
        const members = Array.from(xml.getElementsByTagName('om:member'));
        const markers = members.map(member => {
          const posTag = member.getElementsByTagName('gml:pos')[0];
          const elements = member.getElementsByTagName('element');
          let station = '', time = '';
          if (posTag) {
            const [lat, lng] = posTag.textContent.split(' ').map(Number);
            Array.from(elements).forEach(el => {
              const name = el.getAttribute('name');
              const value = el.getAttribute('value');
              if (name === 'station_name') station = value;
              if (name === 'observation_date_utc') time = value;
            });
            return station && lat && lng ? { station, lat, lng, time } : null;
          }
          return null;
        }).filter(Boolean);
        setObservationMarkers(markers);
      })
      .catch(() => setObservationMarkers([]));

  }, [selected]);

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between bg-[#FDE8BE] rounded-full px-6 py-3">
        <span className="text-lg font-medium" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>
          Interactive Map
        </span>
        <button
          className="bg-[#FDE8BE] rounded-full px-4 py-1 font-medium border border-[#F7B52C] hover:bg-[#F7B52C] transition"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Filters
        </button>
      </div>

      <div className="flex gap-4 justify-center mt-2">
        {mapTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-6 py-2 rounded-full border font-medium transition text-base ${
              selected === tab.key ? 'bg-[#F7B52C] text-black' : 'bg-transparent text-black hover:bg-[#FDE8BE]'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
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
            <TileLayer
              url="https://geo.weather.gc.ca/geomet?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=RADAR_1KM_RRAI&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX=-141,41.7,-52,83.1&WIDTH=768&HEIGHT=768"
              opacity={0.5}
              attribution="&copy; Government of Canada"
            />
            {observationMarkers.length > 50 ? (
              <MarkerClusterGroup>
                {observationMarkers.map((marker, idx) => (
                  <Marker key={idx} position={[marker.lat, marker.lng]} icon={L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })}>
                    <Popup>
                      <div>
                        <div><b>{marker.station}</b></div>
                        <div>{marker.time}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            ) : (
              observationMarkers.map((marker, idx) => (
                <Marker key={idx} position={[marker.lat, marker.lng]} icon={L.icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}>
                  <Popup>
                    <div>
                      <div><b>{marker.station}</b></div>
                      <div>{marker.time}</div>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}
          </MapContainer>
        ) : (
          <span className="text-gray-500">{selected.toUpperCase()} Leaflet Map</span>
        )}
      </div>
    </section>
  );
}