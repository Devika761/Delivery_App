import React, { useEffect, useRef } from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// This component lives inside MapContainer so it can call useMap()
// It moves the map view whenever the delivery boy location changes
function MapUpdater({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], map.getZoom(), { animate: true });
    }
  }, [lat, lon]);
  return null;
}

// Marker that updates its position reactively
function MovingMarker({ position, icon, label }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current && position[0] && position[1]) {
      markerRef.current.setLatLng(position);
    }
  }, [position[0], position[1]]);

  return (
    <Marker position={position} icon={icon} ref={markerRef}>
      <Popup>{label}</Popup>
    </Marker>
  );
}

function DeliveryBoyTracking({ data }) {
  const deliveryBoyLat = data.deliveryBoyLocation.lat;
  const deliveryBoylon = data.deliveryBoyLocation.lon;
  const customerLat = data.customerLocation.lat;
  const customerlon = data.customerLocation.lon;

  const deliveryPos = [deliveryBoyLat, deliveryBoylon];
  const customerPos = [customerLat, customerlon];
  const path = [deliveryPos, customerPos];
  const center = [deliveryBoyLat, deliveryBoylon];

  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer
        className="w-full h-full"
        center={center}
        zoom={16}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Moves the map view when delivery boy moves */}
        <MapUpdater lat={deliveryBoyLat} lon={deliveryBoylon} />

        {/* Delivery boy marker — moves in real time */}
        <MovingMarker
          position={deliveryPos}
          icon={deliveryBoyIcon}
          label="Delivery Boy"
        />

        {/* Customer marker — stays fixed */}
        <MovingMarker
          position={customerPos}
          icon={customerIcon}
          label="Delivery Address"
        />

        {/* Line between them */}
        <Polyline positions={path} color="blue" weight={4} />
      </MapContainer>
    </div>
  );
}

export default DeliveryBoyTracking;
