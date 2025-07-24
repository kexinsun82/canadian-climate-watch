"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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

function useReverseGeocode() {
  const cacheRef = useRef({});
  const timerRef = useRef({});

  const getAddress = useCallback((lat, lng, cb) => {
    const key = `${lat},${lng}`;
    if (cacheRef.current[key]) {
      cb(cacheRef.current[key]);
      return;
    }
    if (timerRef.current[key]) clearTimeout(timerRef.current[key]);
    timerRef.current[key] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/nominatim?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const address = data.address || {};
        const street = address.road || address.pedestrian || address.cycleway || '';
        const city = address.city || address.town || address.village || address.hamlet || '';
        const province = address.state || address.region || '';
        const result = { street, city, province };
        cacheRef.current[key] = result;
        cb(result);
      } catch {
        cb({ street: '', city: '', province: '' });
      }
    }, 500);
  }, []);
  return getAddress;
}

export default function MapSection() {
  const [selected, setSelected] = useState('eccc');
  const [observationMarkers, setObservationMarkers] = useState([]);
  const [nasaMarkers, setNasaMarkers] = useState([]);
  const [discussionMarkers, setDiscussionMarkers] = useState([]);
  const getAddress = useReverseGeocode();

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
                      <div className='text-lg text-[var(--color-accent)]'><b>{marker.category}</b></div>
                      <div className='text-sm mt-2'>Title: {marker.title}</div>
                      {marker.description && <div className="text-sm mt-2">{marker.description}</div>}
                      {marker.source && <div className='text-xs'><a href={marker.source} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">Source</a></div>}
                      {marker.link && <div className='text-xs'><a href={marker.link} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">API Details</a></div>}
                      {marker.date && <div className='text-xs mt-2'>Date: {new Date(marker.date).toLocaleString()}</div>}
                      {marker.magnitude && <div className='text-xs'>Magnitude: {marker.magnitude} {marker.magnitudeUnit || ''}</div>}
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
                    <DiscussionPopup marker={marker} getAddress={getAddress} />
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

function DiscussionPopup({ marker, getAddress }) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    let mounted = true;
    getAddress(marker.lat, marker.lng, addr => { if (mounted) setAddress(addr); });
    return () => { mounted = false; };
  }, [marker.lat, marker.lng, getAddress]);
  return (
    <div>
      <div><b className='text-lg text-[var(--color-accent)]'>{marker.label}</b></div>
      <div className='text-sm mt-2'>{marker.notes}</div>
      <div className='text-xs mt-2'>{new Date(marker.createdAt).toLocaleString()}</div>
      {address && (
        <div>
          <div className='text-xs'>{address.street}</div>
          <div className='text-xs'>{address.city}, {address.province}</div>
        </div>
      )}
      <div className='text-xs'>By: {marker.userName}</div>
    </div>
  );
} 