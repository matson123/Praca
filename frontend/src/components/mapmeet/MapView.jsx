import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { CATEGORY_META } from "@/lib/api";

// Fix default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function buildCategoryIcon(category) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Inne;
  const html = `
    <div class="mm-pin" style="--pin:${meta.hex};">
      <div class="mm-pin-dot"></div>
      <div class="mm-pin-ring"></div>
    </div>`;
  return L.divIcon({
    className: "mm-pin-wrapper",
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
}

function ClusterLayer({ events, onSelect }) {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      chunkedLoading: true,
      maxClusterRadius: 55,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        return L.divIcon({
          className: "mm-cluster",
          html: `<div class="mm-cluster-inner"><span>${count}</span></div>`,
          iconSize: [44, 44],
        });
      },
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    events.forEach((ev) => {
      const marker = L.marker([ev.lat, ev.lon], {
        icon: buildCategoryIcon(ev.category),
      });
      marker.on("click", () => onSelect(ev));
      marker.bindTooltip(ev.title, { direction: "top", offset: [0, -28] });
      cluster.addLayer(marker);
    });
  }, [events, onSelect]);

  return null;
}

function ClickHandler({ pickMode, onPick }) {
  useMapEvents({
    click(e) {
      if (pickMode) onPick(e.latlng);
    },
  });
  return null;
}

function ViewController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lon], target.zoom || 13, { duration: 0.9 });
  }, [target, map]);
  return null;
}

export default function MapView({
  events,
  onSelectEvent,
  pickMode,
  onPickLocation,
  pickedLocation,
  focus,
}) {
  const center = useMemo(() => [52.069167, 19.480556], []);

  return (
    <MapContainer
      data-testid="map-container"
      center={center}
      zoom={6.5}
      minZoom={5}
      maxZoom={18}
      className="mm-map"
      zoomControl={false}
      preferCanvas
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClusterLayer events={events} onSelect={onSelectEvent} />
      <ClickHandler pickMode={pickMode} onPick={onPickLocation} />
      {pickedLocation && (
        <Marker
          position={[pickedLocation.lat, pickedLocation.lng]}
          icon={buildCategoryIcon("Inne")}
        />
      )}
      <ViewController target={focus} />
    </MapContainer>
  );
}
