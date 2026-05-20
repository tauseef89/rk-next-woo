"use client";

import { useState, useMemo } from "react";
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  ChevronDown, 
  LocateFixed, 
  Navigation,
  MessageCircle,
  PlayCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- STORE DATA ---
const STORES = [
  {
    id: "narela-main",
    name: "Rakesh Retails Narela",
    city: "Delhi",
    state: "Delhi",
    position: { lat: 28.8413, lng: 77.0945 },
    address: "H, 10A, Safiabad Rd, Gautam Colony, Narela, Delhi, 110040",
    phone: "+91 81300 47218",
    timing: "10:00 AM - 8:30 PM",
    videoUrl: "https://www.youtube.com/watch?v=j27K4LCYX7I", // Main store video
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27957.204028378626!2d77.069644672452!3d28.84926352844552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390da90012a1de07%3A0xf2647639b799df28!2sRAKESH%20RETAILS%20NARELA!5e0!3m2!1sen!2sin!4v1775815935091!5m2!1sen!2sin",
    directionUrl: "https://maps.app.goo.gl/RtEh8iDyT8qVzf5a8"
  },
  {
    id: "rohini-sec8",
    name: "Rakesh Retails Rohini",
    city: "Delhi",
    state: "Delhi",
    position: { lat: 28.7032, lng: 77.1246 },
    address: "m2k f, 19/2, Rohini Sector 8 Rd, Pocket 16, Sector 8, Rohini, Delhi, 110085",
    phone: "+91 11 4907 2512",
    timing: "10:30 AM - 9:00 PM",
    videoUrl: null,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.6692236349804!2d77.11601471028284!3d28.69953977552659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03a381fa0d77%3A0x65a7a81865a45ca5!2sRAKESH%20RETAILS%20SECTOR-8%20M2K%20ROHINI!5e0!3m2!1sen!2sin!4v1775815824798!5m2!1sen!2sin",
    directionUrl: "https://maps.app.goo.gl/KnuZf4Yi5gaP3WVc7"
  },
  {
    id: "rk-puram",
    name: "Rakesh Retails R.K. Puram",
    city: "New Delhi",
    state: "Delhi",
    position: { lat: 28.5647, lng: 77.1751 },
    address: "MOHAN SINGH MARKET, D-5, RKPURAM, Ranji Nagar, Sector 6, Rama Krishna Puram, New Delhi, Delhi 110022",
    phone: "+91 93540 02128",
    timing: "10:30 AM - 9:00 PM",
    videoUrl: null,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.103301277569!2d77.17319991027692!3d28.566660575599467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1d1bbb2de351%3A0xdd1a0e315c3b4d9e!2sRAKESH%20RETAILS%20R%20K%20PURAM!5e0!3m2!1sen!2sin!4v1775816063393!5m2!1sen!2sin",
    directionUrl: "https://maps.app.goo.gl/FJxxM5CR3b9b4FsD8"
  },
  {
    id: "ashok-vihar",
    name: "Rakesh Retails Ashok Vihar",
    city: "New Delhi",
    state: "Delhi",
    position: { lat: 28.6946, lng: 77.1788 },
    address: "B/3/2, Ashok Vihar II, Pocket B 3, Phase 2, Ashok Vihar, New Delhi, Delhi, 110052",
    phone: "+91 93117 72363",
    timing: "10:30 AM - 9:00 PM",
    videoUrl: null,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.895394746748!2d77.17175111028249!3d28.692775575530195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d035fbf892aed%3A0x4e42c584a4b25af3!2sRAKESH%20RETAILS%20ASHOK%20VIHAR!5e0!3m2!1sen!2sin!4v1775816176209!5m2!1sen!2sin",
    directionUrl: "https://maps.app.goo.gl/HyQHh8nxh3e41kGU7"
  },
  {
    id: "budh-vihar",
    name: "Rakesh Retails Budh Vihar",
    city: "Delhi",
    state: "Delhi",
    position: { lat: 28.7118, lng: 77.0864 },
    address: "D-1/4 AND D-1/S, MAIN, Kanjhawala Rd, Block A, Krishan Vihar, Delhi, 110086",
    phone: "+91 81300 47218",
    timing: "10:00 AM - 8:30 PM",
    videoUrl: null,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.525869523049!2d77.085072410283!3d28.703826375524265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d07351fc8421b%3A0x45c7d9b99bccbe54!2sRAKESH%20RETAILS%20BUDH%20VIHAR!5e0!3m2!1sen!2sin!4v1775816257917!5m2!1sen!2sin",
    directionUrl: "https://maps.app.goo.gl/nksNnTViQxjqnyvx5"
  }
];

// --- HELPER: DISTANCE CALC ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function StoreLocator() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const cities = useMemo(() => ["All Cities", ...Array.from(new Set(STORES.map((s) => s.city)))], []);

  const filteredStores = useMemo(() => {
    let list = selectedCity === "All Cities" ? STORES : STORES.filter((s) => s.city === selectedCity);
    if (userLocation) {
      return list.map((s) => ({
          ...s,
          distance: calculateDistance(userLocation.lat, userLocation.lng, s.position.lat, s.position.lng),
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return list;
  }, [selectedCity, userLocation]);

  const findNearMe = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setSelectedCity("All Cities");
    });
  };

  return (
    <Section className="">      

      <Container className="max-w-7xl md:p-0">
        <div className="grid lg:grid-cols-3 gap-0 border rounded-[2.5rem] overflow-hidden bg-white">
          
          {/* SIDEBAR */}
          <div className="lg:col-span-1 border-r flex flex-col max-h-150 bg-gray-300">
            
            <div className="p-6 border-b space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">Our Stores</h1>
                <Button variant="ghost" size="sm" onClick={findNearMe} className="text-blue-600 gap-2 font-bold hover:bg-blue-50">
                  <LocateFixed size={16} /> Near Me
                </Button>
              </div>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full appearance-none bg-zinc-100 border-none rounded-xl px-4 py-3 pr-10 text-sm font-bold outline-none cursor-pointer"
                >
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/30 custom-scrollbar">
              {filteredStores.map((store: any) => (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={cn(
                    "p-5 rounded-2xl cursor-pointer transition-all border-2",
                    selectedStore.id === store.id ? "bg-white border-blue-600 shadow-md scale-[1.01]" : "bg-transparent border-transparent hover:bg-white"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-zinc-900 leading-tight">{store.name}</h3>
                    {store.distance && (
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                        {store.distance.toFixed(1)} KM
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[12px] text-zinc-800 leading-snug flex gap-2">
                    <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" /> {store.address}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN VIEW */}
          <div className="lg:col-span-2 relative h-full flex flex-col bg-zinc-100">
            <div className="flex-1 relative">
              <iframe
                key={selectedStore.id}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={selectedStore.mapEmbedUrl}
              ></iframe>
            </div>

            {/* INFO BAR WITH 360 TOUR BUTTON */}
            <div className="p-6 bg-white border-t flex flex-col gap-4 z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">{selectedStore.name}</h2>
                  <p className="text-[13px] text-zinc-500 truncate max-w-70 md:max-w-112.5">
                    {selectedStore.address}
                  </p>
                </div>
                
                {/* 360 Tour Button (Conditional) */}
                {selectedStore.videoUrl && (
                  <Button asChild variant="outline" className="rounded-xl border-blue-950 text-white font-bold gap-2 hover:bg-red-800 hover:text-white hover:border-red-800 shrink-0 h-10 px-4 bg-blue-950">
                    <a href={selectedStore.videoUrl} target="_blank" rel="noopener noreferrer">
                      <PlayCircle size={18} /> View 360° Tour
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap justify-between gap-2 shrink-0 border-t pt-4 mb-3">              
                
                <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold h-11 px-6 shadow-sm">
                  <a href={selectedStore.directionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Navigation size={18} /> Directions
                  </a>
                </Button>
                
                <Button variant="outline" asChild className="bg-green-600 rounded-xl border-green-600 font-bold h-11 px-6 text-white">
                  <a href={`tel:${selectedStore.phone}`} className="flex items-center gap-2">
                    <Phone size={18} /> Call
                  </a>
                </Button>
              </div>
            </div>
          </div>
 
        </div>
      </Container>
    </Section>
  );
}
