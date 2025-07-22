"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet'; 
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
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
  const [discussionMarkers, setDiscussionMarkers] = useState([]);
  const [addressCache, setAddressCache] = useState({});

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
      fetch('/api/nasa')
        .then(res => res.json())
        .then(data => {
          const markers = [];
          if (Array.isArray(data.events)) {
            data.events.forEach(event => {
              const { title, categories, geometry = [], link, sources = [], description } = event;
              const category = categories?.[0]?.title || 'Unknown';
              geometry.forEach((geo, idx) => {
                if (!geo || !geo.coordinates) return;
                const coords = geo.coordinates;
                if (Array.isArray(coords) && typeof coords[0] === 'number') {
                  const [lng, lat] = coords;
                  if (!isNaN(lat) && !isNaN(lng)) {
                    markers.push({
                      lat,
                      lng,
                      title,
                      category,
                      date: geo.date,
                      magnitude: geo.magnitudeValue,
                      magnitudeUnit: geo.magnitudeUnit,
                      link,
                      source: sources[0]?.url,
                      description
                    });
                  }
                }
              });
            });
          }
          setNasaMarkers(markers);
        })
        .catch(error => {
          setNasaMarkers([]);
          console.error("NASA EONET data failed:", error);
        });
    } else {
      setNasaMarkers([]);
    }

    if (selected === 'discussion') {
      fetch('/api/reports')
        .then(res => res.json())
        .then(async data => {
          const markers = data.filter(r => r.location && Array.isArray(r.location.coordinates) && r.location.coordinates.length === 2)
            .map(r => ({
              ...r,
              lat: r.location.coordinates[1],
              lng: r.location.coordinates[0],
            }));
          setDiscussionMarkers(markers);
        })
        .catch(() => setDiscussionMarkers([]));
    } else {
      setDiscussionMarkers([]);
    }
  }, [selected]);

  async function fetchAddress(lat, lng) {
    const key = `${lat},${lng}`;
    if (addressCache[key]) return addressCache[key];
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data.address || {};
      const street = address.road || address.pedestrian || address.cycleway || '';
      const city = address.city || address.town || address.village || address.hamlet || '';
      const province = address.state || address.region || '';
      const result = { street, city, province };
      setAddressCache(prev => ({ ...prev, [key]: result }));
      return result;
    } catch {
      return { street: '', city: '', province: '' };
    }
  }

  function FitMapBounds({ markers }) {
    const map = useMap();

    useEffect(() => {
      if (markers.length > 0 && map && map.fitBounds) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [markers, map]);

    return null;
  }

  return (
    <section className="w-full flex flex-col gap-4 px-4">
      <div className="flex items-center justify-between bg-[var(--color-primary)] rounded-full px-6 py-3">
        <span className="text-lg font-medium font-title">Interactive Map</span>
        {/* <button className="bg-[var(--color-primary-light)] rounded-full px-4 py-1 font-medium border border-[var(--color-primary)] hover:bg-[var(--color-primary)] transition font-body">
          Filters
        </button> */}
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
                      <div className='text-sm text-[var(--color-accent)]'>{marker.category}</div>
                      {marker.date && <div>{new Date(marker.date).toLocaleString()}</div>}
                      {marker.magnitude && <div>Magnitude: {marker.magnitude} {marker.magnitudeUnit || ''}</div>}
                      {marker.description && <div className="mt-1 text-xs text-gray-600">{marker.description}</div>}
                      {marker.source && <div><a href={marker.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Source</a></div>}
                      {marker.link && <div><a href={marker.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">API Details</a></div>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        ) : selected === 'discussion' ? (
          <MapContainer
            center={[56.1304, -106.3468]}
            zoom={4}
            scrollWheelZoom={true}
            style={{ height: 400, width: '100%', borderRadius: '1rem' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MarkerClusterGroup>
              {discussionMarkers.map((marker, idx) => (
                <Marker key={marker._id || idx} position={[marker.lat, marker.lng]} icon={customIcon}>
                  <Popup>
                    <DiscussionPopup marker={marker} fetchAddress={fetchAddress} />
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

function DiscussionPopup({ marker, fetchAddress }) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    let mounted = true;
    fetchAddress(marker.lat, marker.lng).then(addr => { if (mounted) setAddress(addr); });
    return () => { mounted = false; };
  }, [marker.lat, marker.lng]);
  return (
    <div>
      <div><b>{marker.label}</b></div>
      <div>By: {marker.userName}</div>
      <div>{marker.notes}</div>
      <div>{new Date(marker.createdAt).toLocaleString()}</div>
      {address && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>
          <div>{address.street}</div>
          <div>{address.city}, {address.province}</div>
        </div>
      )}
    </div>
  );
} 