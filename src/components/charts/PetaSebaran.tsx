"use client";
/**
 * Peta Sebaran Pendampingan — react-leaflet.
 * Komponen ini HANYA boleh dirender di client. Pemanggil WAJIB pakai:
 *   const PetaSebaran = dynamic(() => import("@/components/charts/PetaSebaran"), { ssr: false });
 */
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix ikon marker default Leaflet (aset dari CDN unpkg — CSP artifact tidak berlaku di app biasa)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type DesaPeta = {
  nama: string;
  lat: number;
  lng: number;
  balita: number;
};

export default function PetaSebaran({ desa }: { desa: DesaPeta[] }) {
  const center: [number, number] = [-8.13, 111.77]; // Pagerwojo, Tulungagung

  return (
    <div className="h-[380px] w-full overflow-hidden rounded-lg">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {desa
          .filter((d) => typeof d.lat === "number" && typeof d.lng === "number")
          .map((d, i) => (
            <Marker key={i} position={[d.lat, d.lng]} icon={icon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">Desa {d.nama}</div>
                  <div>{d.balita} balita dampingan</div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
