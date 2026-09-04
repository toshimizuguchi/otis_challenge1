import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  calculateDistanceKm, 
  getRealtimeTrafficCondition, 
  checkPreventiveMismatch,
  getAddressFixationSuggestion
} from '../../utils/geoUtils';
import { 
  MapPin, 
  Navigation, 
  Users, 
  ShieldAlert, 
  PhoneCall, 
  CheckCircle, 
  Info, 
  Layers, 
  Compass, 
  Search, 
  Filter, 
  Maximize2, 
  Radio, 
  Wrench, 
  AlertTriangle,
  Building,
  Car,
  Clock,
  ArrowRight,
  ExternalLink,
  Activity,
  UserCheck,
  Pin,
  Flame,
  Check
} from 'lucide-react';
import L from 'leaflet';

// City centers & default zooms
const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  'TODAS': { lat: -23.2, lng: -45.5, zoom: 8 },
  'Campinas': { lat: -22.9056, lng: -47.0608, zoom: 12 },
  'São Paulo': { lat: -23.5850, lng: -46.6600, zoom: 12 },
  'São Bernardo do Campo': { lat: -23.6912, lng: -46.5490, zoom: 13 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, zoom: 12 },
};

// Available Tile Layers with OpenStreetMap (OSM) as primary base
const TILE_LAYERS = {
  dark: {
    name: 'Dark Ops (Midnight)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a>'
  },
  osm: {
    name: 'OpenStreetMap (Padrão)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
  },
  light: {
    name: 'Modo Claro (Positron)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a>'
  }
};

export const MapsModule: React.FC = () => {
  const { 
    technicians, 
    equipments, 
    calls, 
    selectedCityFilter, 
    setSelectedCityFilter, 
    setActiveView, 
    addToast,
    fixedAddressTechnicians,
    fixTechnicianToAddress,
    unfixTechnicianFromAddress
  } = useApp();
  
  const [selectedPin, setSelectedPin] = useState<{
    type: 'TECH' | 'EQUIPMENT' | 'CALL';
    data: any;
  } | null>(null);

  const [mapStyle, setMapStyle] = useState<'dark' | 'osm' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTechs, setShowTechs] = useState(true);
  const [showEquipments, setShowEquipments] = useState(true);
  const [showCalls, setShowCalls] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showCoverageRadius, setShowCoverageRadius] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'techs' | 'equipments' | 'emergencies'>('all');

  // Leaflet map instance and layer group refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const coverageLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter items by city & search
  const filteredTechs = technicians.filter(t => {
    const matchesCity = selectedCityFilter === 'TODAS' || t.city.toLowerCase() === selectedCityFilter.toLowerCase();
    const matchesQuery = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedVehicle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  const filteredEquipments = equipments.filter(e => {
    const matchesCity = selectedCityFilter === 'TODAS' || e.city.toLowerCase() === selectedCityFilter.toLowerCase();
    const matchesQuery = !searchQuery || 
      e.tag.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  const filteredCalls = calls.filter(c => {
    const matchesCity = selectedCityFilter === 'TODAS' || c.city.toLowerCase() === selectedCityFilter.toLowerCase();
    const matchesQuery = !searchQuery ||
      c.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.problemDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery && (c.status === 'A_CAMINHO' || c.status === 'EM_ATENDIMENTO' || c.priority === 'CRITICO');
  });

  // Calculate live operational metrics
  const activeFieldTechs = filteredTechs.filter(t => t.status !== 'OFFLINE').length;
  const availableTechs = filteredTechs.filter(t => t.status === 'DISPONIVEL').length;
  const highRiskEquipments = filteredEquipments.filter(e => e.predictiveRiskScore >= 70 || e.status === 'PARADO' || e.status === 'EM_RISCO').length;
  const trappedPassengerCalls = filteredCalls.filter(c => c.hasTrappedPassenger).length;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const initialCoords = CITY_COORDINATES[selectedCityFilter] || CITY_COORDINATES['TODAS'];
      
      const map = L.map(mapContainerRef.current, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: initialCoords.zoom,
        zoomControl: false,
        attributionControl: true
      });

      // Add Zoom control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add Tile Layer
      const currentTile = TILE_LAYERS[mapStyle];
      const tileLayer = L.tileLayer(currentTile.url, {
        attribution: currentTile.attribution,
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layer groups
      coverageLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    
    tileLayerRef.current.remove();
    const currentTile = TILE_LAYERS[mapStyle];
    tileLayerRef.current = L.tileLayer(currentTile.url, {
      attribution: currentTile.attribution,
      maxZoom: 19
    }).addTo(mapRef.current);
  }, [mapStyle]);

  // Center/Fly to selected city
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedCityFilter !== 'TODAS' && CITY_COORDINATES[selectedCityFilter]) {
      const target = CITY_COORDINATES[selectedCityFilter];
      mapRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    } else {
      // Fit all markers
      const validPoints: L.LatLngExpression[] = [];
      filteredTechs.forEach(t => {
        if (t.currentLocation?.lat && t.currentLocation?.lng) {
          validPoints.push([t.currentLocation.lat, t.currentLocation.lng]);
        }
      });
      filteredEquipments.forEach(e => {
        if (e.lat && e.lng) {
          validPoints.push([e.lat, e.lng]);
        }
      });

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.2 });
      } else {
        const target = CITY_COORDINATES['TODAS'];
        mapRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
      }
    }
  }, [selectedCityFilter]);

  // Render Markers, Routes, and Coverage on the Map
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !routesLayerRef.current || !coverageLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();
    coverageLayerRef.current.clearLayers();

    // 1. RENDER COVERAGE RADIUS (if enabled)
    if (showCoverageRadius) {
      filteredTechs.forEach(tech => {
        if (!tech.currentLocation?.lat || !tech.currentLocation?.lng) return;
        const color = tech.status === 'DISPONIVEL' ? '#10b981' : tech.status === 'A_CAMINHO' ? '#3b82f6' : '#f59e0b';
        const circle = L.circle([tech.currentLocation.lat, tech.currentLocation.lng], {
          radius: 4000, // 4 km operational radius
          color: color,
          weight: 1,
          opacity: 0.4,
          fillColor: color,
          fillOpacity: 0.08
        });
        coverageLayerRef.current?.addLayer(circle);
      });
    }

    // 2. RENDER ROUTES (Técnico A Caminho -> Chamado/Equipamento)
    if (showRoutes) {
      filteredCalls.forEach(call => {
        if (!call.lat || !call.lng || !call.technicianId) return;
        const tech = technicians.find(t => t.id === call.technicianId);
        if (tech && tech.currentLocation?.lat && tech.currentLocation?.lng) {
          const latlngs: [number, number][] = [
            [tech.currentLocation.lat, tech.currentLocation.lng],
            [call.lat, call.lng]
          ];

          const isCritical = call.priority === 'CRITICO' || call.hasTrappedPassenger;
          const polyline = L.polyline(latlngs, {
            color: isCritical ? '#ef4444' : '#38bdf8',
            weight: 3,
            dashArray: '8, 8',
            opacity: 0.85
          });

          polyline.bindTooltip(`Rota Ativa: ${tech.name} ➔ ${call.buildingName}`, {
            sticky: true,
            className: 'bg-slate-900 text-slate-100 text-[11px] border border-slate-700 px-2 py-1 rounded'
          });

          routesLayerRef.current?.addLayer(polyline);
        }
      });
    }

    // 3. RENDER EQUIPMENT MARKERS
    if (showEquipments) {
      filteredEquipments.forEach(eq => {
        if (!eq.lat || !eq.lng) return;

        const isHighRisk = eq.predictiveRiskScore >= 70 || eq.status === 'PARADO';
        const isStopped = eq.status === 'PARADO';
        const color = isStopped ? '#ef4444' : isHighRisk ? '#f97316' : '#10b981';

        const eqIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isHighRisk ? '<span class="tech-ping bg-rose-500"></span>' : ''}
            <div style="background-color: ${color};" class="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xl ring-2 ring-slate-950 transition-all duration-200 hover:scale-125">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -top-7 px-2 py-0.5 rounded bg-slate-900/95 text-[10px] font-bold text-slate-100 border border-slate-700 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${eq.tag} (${eq.predictiveRiskScore}%)
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-eq-pin',
          html: eqIconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18]
        });

        const marker = L.marker([eq.lat, eq.lng], { icon });

        const normEqAddr = eq.address.toLowerCase().trim();
        const fixedResident = fixedAddressTechnicians[normEqAddr];

        const popupContent = `
          <div class="p-2 space-y-2 min-w-[240px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span class="font-bold text-slate-100 text-xs">${eq.tag}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isHighRisk ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }">${eq.status}</span>
            </div>
            <div class="text-[11px] text-slate-300">
              <p class="font-medium text-slate-200">${eq.buildingName}</p>
              <p class="text-slate-400 text-[10px]">${eq.customerName}</p>
              <p class="text-slate-400 text-[10px] mt-0.5">${eq.address}, ${eq.city}</p>
            </div>
            <div class="bg-slate-950/80 p-2 rounded border border-slate-800 space-y-1 text-[11px]">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-slate-400">Téc. Preventivo:</span>
                <span class="font-semibold text-cyan-300">${eq.preventiveTechnicianName || 'Não atribuído'}</span>
              </div>
              ${fixedResident ? `
                <div class="flex items-center justify-between text-[10px] text-amber-300 font-medium">
                  <span>📌 Téc. Residente:</span>
                  <span>${fixedResident.technicianName}</span>
                </div>
              ` : ''}
              <div class="flex justify-between text-[10px] pt-1 border-t border-slate-800/60">
                <span class="text-slate-400">Risco Preditivo:</span>
                <span class="font-bold ${eq.predictiveRiskScore >= 70 ? 'text-rose-400' : 'text-emerald-400'}">${eq.predictiveRiskScore}/100</span>
              </div>
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="h-full ${eq.predictiveRiskScore >= 70 ? 'bg-rose-500' : 'bg-emerald-500'}" style="width: ${eq.predictiveRiskScore}%"></div>
              </div>
            </div>
            <div class="text-[10px] text-cyan-400 font-mono text-center pt-0.5">
              Clique no marcador para abrir o dossiê completo
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPin({ type: 'EQUIPMENT', data: eq });
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 4. RENDER CALLS / EMERGENCY MARKERS
    if (showCalls) {
      filteredCalls.forEach(call => {
        if (!call.lat || !call.lng) return;

        const isTrapped = call.hasTrappedPassenger;
        const isCritical = call.priority === 'CRITICO' || isTrapped;

        const callIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <span class="tech-ping ${isTrapped ? 'bg-red-600' : 'bg-amber-500'}"></span>
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-2xl ring-2 ring-slate-950 ${
              isTrapped ? 'bg-red-600 animate-bounce' : 'bg-amber-500'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="absolute -top-7 px-2 py-0.5 rounded bg-red-950 text-[10px] font-bold text-red-200 border border-red-700 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${isTrapped ? 'PASSAGEIRO PRESO' : call.callNumber}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-call-pin',
          html: callIconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18]
        });

        const marker = L.marker([call.lat, call.lng], { icon });

        const isMismatch = call.technicianFamiliarity?.preventiveTechMismatch;

        const popupContent = `
          <div class="p-2 space-y-2 min-w-[240px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span class="font-bold text-rose-400 text-xs">${call.callNumber}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isTrapped ? 'bg-red-600 text-white' : 'bg-amber-500/20 text-amber-300'
              }">${isTrapped ? 'RESGATE' : call.priority}</span>
            </div>
            <div class="text-[11px] text-slate-300">
              <p class="font-medium text-slate-200">${call.buildingName}</p>
              <p class="text-slate-400 text-[10px]">${call.equipmentTag} (${call.equipmentModel})</p>
              <p class="text-slate-400 text-[10px] mt-0.5">${call.address}, ${call.city}</p>
            </div>
            <p class="text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-800">${call.problemDescription}</p>
            
            <div class="grid grid-cols-2 gap-1 bg-slate-950/80 p-1.5 rounded border border-slate-800 text-[10px]">
              <div>
                <span class="text-slate-400">Distância:</span> <strong class="text-cyan-300">${call.distanceKm ? call.distanceKm.toFixed(1) + ' km' : '1.2 km'}</strong>
              </div>
              <div>
                <span class="text-slate-400">Trânsito:</span> <strong class="text-amber-300">${call.trafficCondition || 'Fluido'}</strong>
              </div>
            </div>

            ${isMismatch ? `
              <div class="p-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300">
                ⚠️ <strong>Atenção:</strong> Técnico Preventiva (${call.technicianFamiliarity?.preventiveTechName}) ≠ Emergência (${call.technicianName})
              </div>
            ` : ''}

            <div class="text-[10px] text-cyan-400 font-mono text-center pt-0.5">
              Status: ${call.status} • Técnico: ${call.technicianName || 'Não atribuído'}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPin({ type: 'CALL', data: call });
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 5. RENDER TECHNICIANS MARKERS
    if (showTechs) {
      filteredTechs.forEach(tech => {
        if (!tech.currentLocation?.lat || !tech.currentLocation?.lng) return;

        const isAvailable = tech.status === 'DISPONIVEL';
        const isMoving = tech.status === 'A_CAMINHO';
        const isAttending = tech.status === 'EM_ATENDIMENTO';
        const isLate = tech.status === 'ATRASADO';

        const color = isAvailable ? '#10b981' : isMoving ? '#3b82f6' : isAttending ? '#f59e0b' : '#ef4444';

        const techIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isAvailable || isMoving ? `<span class="tech-ping" style="background-color: ${color};"></span>` : ''}
            <div style="background-color: ${color};" class="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xl ring-2 ring-slate-950 transition-all duration-200 hover:scale-125">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
            <div class="absolute -top-7 px-2 py-0.5 rounded bg-slate-900/95 text-[10px] font-bold text-slate-100 border border-slate-700 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${tech.name.split(' ')[0]} (${tech.status})
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-tech-pin',
          html: techIconHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20]
        });

        const marker = L.marker([tech.currentLocation.lat, tech.currentLocation.lng], { icon });

        const popupContent = `
          <div class="p-2 space-y-2 min-w-[220px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" style="background-color: ${color};"></span>
                <span class="font-bold text-slate-100 text-xs">${tech.name}</span>
              </div>
              <span class="text-[10px] font-mono text-cyan-400 font-bold">${tech.status}</span>
            </div>
            <div class="text-[11px] text-slate-300 space-y-0.5">
              <p class="text-slate-400 text-[10px]">${tech.currentLocation.address}</p>
              <p class="text-slate-300 text-[10px]"><strong>Veículo:</strong> ${tech.assignedVehicle}</p>
              <p class="text-slate-300 text-[10px]"><strong>Supervisor:</strong> ${tech.supervisorName}</p>
            </div>
            <div class="grid grid-cols-2 gap-1 bg-slate-950/80 p-1.5 rounded border border-slate-800 text-[10px]">
              <div>
                <span class="text-slate-400">SLA:</span> <strong class="text-emerald-400">${tech.slaComplianceRate}%</strong>
              </div>
              <div>
                <span class="text-slate-400">TA Médio:</span> <strong class="text-cyan-400">${tech.avgArrivalTimeMin}m</strong>
              </div>
            </div>
            <div class="text-[10px] text-cyan-400 font-mono text-center pt-0.5">
              Clique no técnico para abrir ações operacionais
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedPin({ type: 'TECH', data: tech });
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

  }, [filteredTechs, filteredEquipments, filteredCalls, showTechs, showEquipments, showCalls, showRoutes, showCoverageRadius]);

  // Center on pin when user clicks "Centralizar no Mapa"
  const handleCenterOn = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16, { duration: 1 });
    }
  };

  // Reset to full bounds
  const handleResetBounds = () => {
    if (!mapRef.current) return;
    const validPoints: L.LatLngExpression[] = [];
    filteredTechs.forEach(t => {
      if (t.currentLocation?.lat && t.currentLocation?.lng) validPoints.push([t.currentLocation.lat, t.currentLocation.lng]);
    });
    filteredEquipments.forEach(e => {
      if (e.lat && e.lng) validPoints.push([e.lat, e.lng]);
    });
    if (validPoints.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50], maxZoom: 14, duration: 1 });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              OpenStreetMap (OSM) + Leaflet GIS
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Rastreamento & Telemetria em Tempo Real
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Mapa Operacional de Campo
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Monitoramento espacial georreferenciado de viaturas técnicas, elevadores inteligentes e chamados críticos via malha OpenStreetMap.
          </p>
        </div>

        {/* City Filter & Map Style Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mapStyle === 'dark' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="CartoDB Dark Matter / Midnight"
            >
              Dark Ops
            </button>
            <button
              onClick={() => setMapStyle('osm')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mapStyle === 'osm' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OpenStreetMap Standard Tiles"
            >
              OSM Padrão
            </button>
            <button
              onClick={() => setMapStyle('light')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mapStyle === 'light' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Positron Light"
            >
              Claro
            </button>
          </div>

          <select
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-medium"
          >
            <option value="TODAS">Ver Todas as Regiões</option>
            <option value="Campinas">Campinas & RMC</option>
            <option value="São Paulo">São Paulo (Capital)</option>
            <option value="São Bernardo do Campo">São Bernardo do Campo (ABC)</option>
            <option value="Rio de Janeiro">Rio de Janeiro</option>
          </select>
        </div>
      </div>

      {/* Live Operational Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Técnicos em Campo</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              {activeFieldTechs} <span className="text-xs text-emerald-400 font-normal">({availableTechs} livres)</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Elevadores Mapeados</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              {filteredEquipments.length} <span className="text-xs text-rose-400 font-normal">({highRiskEquipments} em risco)</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Building className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Chamados em Rota</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
              {filteredCalls.length} <span className="text-xs text-amber-400 font-normal">ativas</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Emergência de Resgate</div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
              {trappedPassengerCalls} {trappedPassengerCalls > 0 ? 'CRÍTICO' : 'Zero'}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
            trappedPassengerCalls > 0 
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Map & Interactive Dossier Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left / Main Map Area */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/95 border border-slate-800">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar técnico, elevador, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-cyan-500"
              />
            </div>

            {/* Quick Layer Toggles */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setShowTechs(!showTechs)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  showTechs 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Técnicos
              </button>

              <button
                onClick={() => setShowEquipments(!showEquipments)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  showEquipments 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                Elevadores
              </button>

              <button
                onClick={() => setShowCalls(!showCalls)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  showCalls 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Chamados
              </button>

              <button
                onClick={() => setShowRoutes(!showRoutes)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  showRoutes 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                Rotas
              </button>

              <button
                onClick={() => setShowCoverageRadius(!showCoverageRadius)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  showCoverageRadius 
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
                }`}
                title="Círculo de 4km de raio de cobertura"
              >
                Raio (4km)
              </button>

              <button
                onClick={handleResetBounds}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1"
                title="Enquadrar todos os pontos no mapa"
              >
                <Maximize2 className="w-3 h-3" />
                Ajustar
              </button>
            </div>
          </div>

          {/* OpenStreetMap + Leaflet Canvas Container */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 min-h-[460px] sm:min-h-[540px]">
            
            {/* The actual Leaflet DOM mount node */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-[460px] sm:h-[540px] z-0"
              style={{ minHeight: '460px' }}
            />

            {/* Floating Quick Legend in Map Bottom Left */}
            <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[10px] text-slate-300 shadow-xl hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Livre
              </span>
              <span className="flex items-center gap-1 text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> A Caminho
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Atendimento
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Risco / Alerta
              </span>
            </div>

            {/* Attribution Badge on Bottom Right is handled by Leaflet L.control */}
          </div>

          {/* Quick List Strip below Map */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">
              Mostrando <strong>{filteredTechs.length}</strong> mecânicos e <strong>{filteredEquipments.length}</strong> elevadores na camada ativa
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Atalhos rápidos:</span>
              <button 
                onClick={() => setSelectedCityFilter('Campinas')}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
              >
                Campinas
              </button>
              <button 
                onClick={() => setSelectedCityFilter('São Paulo')}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
              >
                São Paulo
              </button>
              <button 
                onClick={() => setSelectedCityFilter('São Bernardo do Campo')}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
              >
                SBC
              </button>
              <button 
                onClick={() => setSelectedCityFilter('Rio de Janeiro')}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
              >
                Rio
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Dossier & Asset Inspector */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Selected Pin Dossier Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Dossiê Operacional do Ponto</h3>
              </div>
              {selectedPin && (
                <button
                  onClick={() => setSelectedPin(null)}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Limpar
                </button>
              )}
            </div>

            {selectedPin ? (
              <div className="space-y-4">
                {/* Pin Type: TECHNICIAN */}
                {selectedPin.type === 'TECH' && (
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 ring-2 ring-slate-700 shrink-0">
                        {selectedPin.data.avatar ? (
                          <img src={selectedPin.data.avatar} alt={selectedPin.data.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Users className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{selectedPin.data.name}</h4>
                        <p className="text-xs text-slate-400 truncate">{selectedPin.data.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedPin.data.status === 'DISPONIVEL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            selectedPin.data.status === 'A_CAMINHO' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            selectedPin.data.status === 'EM_ATENDIMENTO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {selectedPin.data.status}
                          </span>
                          <span className="text-[11px] text-slate-400">{selectedPin.data.city} - {selectedPin.data.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Localização Telemetrizada:</span>
                      </div>
                      <p className="text-slate-300 text-[11px] flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        {selectedPin.data.currentLocation?.address || 'Endereço não disponível'}
                      </p>
                      <p className="text-slate-400 text-[11px] flex items-center gap-1.5 pt-1">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {selectedPin.data.assignedVehicle}
                      </p>
                    </div>

                    {/* Operational KPIs */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Conformidade SLA</div>
                        <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{selectedPin.data.slaComplianceRate}%</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Tempo Chegada (TA)</div>
                        <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{selectedPin.data.avgArrivalTimeMin} min</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Chamados Concluídos</div>
                        <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">{selectedPin.data.completedCallsMonth} este mês</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Supervisor</div>
                        <div className="text-xs font-medium text-slate-300 truncate mt-0.5">{selectedPin.data.supervisorName}</div>
                      </div>
                    </div>

                    {/* Resident & Preventive Responsibility */}
                    {(() => {
                      const residentDuty = Object.values(fixedAddressTechnicians).find(
                        item => item.technicianId === selectedPin.data.id
                      );
                      const preventiveElevators = equipments.filter(
                        e => e.preventiveTechnicianId === selectedPin.data.id
                      );
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                          {residentDuty ? (
                            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                              <Pin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                              <span>Fixado como Residente: <strong>{residentDuty.address}</strong></span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400">
                              Alocação dinâmica volante (sem ponto fixo exclusivo)
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-1">
                            <span>Elevadores Preventivos:</span>
                            <span className="font-bold text-cyan-300">{preventiveElevators.length} ativos</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {selectedPin.data.currentLocation?.lat && (
                        <button
                          onClick={() => handleCenterOn(selectedPin.data.currentLocation.lat, selectedPin.data.currentLocation.lng)}
                          className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          Centralizar no Mapa
                        </button>
                      )}
                      <button
                        onClick={() => {
                          addToast({
                            type: 'info',
                            title: 'Contato com Técnico',
                            message: `Ligação iniciada para ${selectedPin.data.name}: ${selectedPin.data.phone}`
                          });
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1"
                        title="Ligar para o técnico"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Pin Type: EQUIPMENT */}
                {selectedPin.type === 'EQUIPMENT' && (() => {
                  const eq = selectedPin.data;
                  const normAddr = eq.address.toLowerCase().trim();
                  const fixedEntry = fixedAddressTechnicians[normAddr];
                  const suggestion = getAddressFixationSuggestion(
                    eq.address, 
                    eq.buildingName, 
                    equipments.filter(e => e.address.toLowerCase().trim() === normAddr), 
                    technicians, 
                    fixedAddressTechnicians
                  );
                  
                  // Find nearest technician
                  let nearestTech: any = null;
                  let minDistance = 999;
                  technicians.forEach(t => {
                    if (t.currentLocation?.lat && eq.lat) {
                      const d = calculateDistanceKm(t.currentLocation.lat, t.currentLocation.lng, eq.lat, eq.lng);
                      if (d < minDistance) {
                        minDistance = d;
                        nearestTech = t;
                      }
                    }
                  });
                  const traffic = nearestTech && eq.lat 
                    ? getRealtimeTrafficCondition(eq.city, minDistance)
                    : null;

                  return (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">{eq.type}</span>
                          <h4 className="text-sm font-bold text-slate-100">{eq.tag}</h4>
                          <p className="text-xs text-slate-400">{eq.model}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          eq.status === 'PARADO' ? 'bg-rose-600 text-white animate-pulse' :
                          eq.status === 'EM_RISCO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {eq.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                        <div className="text-slate-300 font-semibold">{eq.customerName}</div>
                        <div className="text-slate-400 text-[11px]">{eq.buildingName}</div>
                        <div className="text-slate-400 text-[11px]">{eq.address}, {eq.city}</div>
                        
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Técnico da Preventiva:</span>
                          <span className="font-semibold text-cyan-300">{eq.preventiveTechnicianName || 'Não atribuído'}</span>
                        </div>
                      </div>

                      {/* Address Fixation Management Box */}
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <Pin className="w-3.5 h-3.5 text-amber-400" />
                            Fixação de Técnico Residente
                          </span>
                          {fixedEntry && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              ATIVO
                            </span>
                          )}
                        </div>

                        {fixedEntry ? (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[11px] text-slate-300">
                              Técnico fixado: <strong className="text-amber-300">{fixedEntry.technicianName}</strong>
                            </p>
                            <p className="text-[10px] text-slate-400 italic">
                              Chamados de emergência e preventivas deste endereço priorizam este técnico.
                            </p>
                            <button
                              onClick={() => {
                                unfixTechnicianFromAddress(eq.address);
                                addToast({
                                  type: 'info',
                                  title: 'Fixação Removida',
                                  message: `Técnico desvinculado do endereço ${eq.address}`
                                });
                              }}
                              className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-all"
                            >
                              Desafixar Técnico deste Endereço
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 pt-1">
                            {suggestion.shouldSuggestFixation && suggestion.suggestedTech ? (
                              <>
                                <p className="text-[11px] text-amber-200">
                                  💡 <strong>Recomendação:</strong> {suggestion.reason}
                                </p>
                                <button
                                  onClick={() => {
                                    if (suggestion.suggestedTech) {
                                      fixTechnicianToAddress(
                                        eq.address,
                                        eq.buildingName,
                                        suggestion.suggestedTech.id,
                                        suggestion.suggestedTech.name
                                      );
                                      addToast({
                                        type: 'success',
                                        title: 'Técnico Fixado',
                                        message: `${suggestion.suggestedTech.name} foi fixado para ${eq.address}`
                                      });
                                    }
                                  }}
                                  className="w-full py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Pin className="w-3 h-3" />
                                  Fixar {suggestion.suggestedTech.name} como Residente
                                </button>
                              </>
                            ) : (
                              <p className="text-[11px] text-slate-400">
                                Endereço sem técnico exclusivo fixado. As ordens são despachadas dinamicamente.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Real-time Distance & Traffic to Nearest Technician */}
                      {nearestTech && traffic && (
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                          <div className="text-slate-400 font-medium text-[11px]">Técnico Mais Próximo no Radar:</div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-semibold text-xs">{nearestTech.name}</span>
                            <span className="font-mono text-cyan-300 font-bold">{minDistance.toFixed(1)} km</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                            <span>Trânsito Atual:</span>
                            <span className="text-amber-300 font-medium">{traffic.label} (+{traffic.delayMin} min)</span>
                          </div>
                        </div>
                      )}

                      {/* Predictive AI Risk Box */}
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Índice Preditivo de Falha</span>
                          <span className={`font-mono font-bold ${
                            eq.predictiveRiskScore >= 70 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {eq.predictiveRiskScore} / 100
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${eq.predictiveRiskScore >= 70 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${eq.predictiveRiskScore}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">
                          {eq.riskExplanation || eq.aiPredictiveDiagnosis || 'Operação dentro dos padrões normais de telemetria.'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        {eq.lat && (
                          <button
                            onClick={() => handleCenterOn(eq.lat, eq.lng)}
                            className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            Centralizar no Mapa
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveView('equipments');
                            addToast({
                              type: 'info',
                              title: 'Módulo de Equipamentos',
                              message: `Navegando para o detalhamento do ativo ${eq.tag}`
                            });
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1"
                          title="Ver ativo completo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Pin Type: CALL */}
                {selectedPin.type === 'CALL' && (() => {
                  const call = selectedPin.data;
                  const isMismatch = call.technicianFamiliarity?.preventiveTechMismatch;
                  const familiarity = call.technicianFamiliarity;

                  return (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">{call.callNumber}</span>
                          <h4 className="text-sm font-bold text-slate-100">{call.buildingName}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          call.hasTrappedPassenger ? 'bg-red-600 text-white animate-bounce' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {call.hasTrappedPassenger ? 'PASSAGEIRO PRESO' : call.priority}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                        <p className="text-slate-300 font-medium">Problema Detectado:</p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{call.problemDescription}</p>
                        <div className="text-slate-400 text-[11px] pt-1">
                          Ativo: <strong>{call.equipmentTag}</strong> ({call.equipmentModel})
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Técnico Despachado: <strong className="text-cyan-400">{call.technicianName || 'Em triagem'}</strong>
                        </div>
                      </div>

                      {/* Realtime Distance, Traffic, and Familiarity */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                          <div className="text-[10px] text-slate-400">Distância GPS</div>
                          <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                            {call.distanceKm ? call.distanceKm.toFixed(1) + ' km' : '2.1 km'}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                          <div className="text-[10px] text-slate-400">Trânsito em Tempo Real</div>
                          <div className="text-xs font-bold text-amber-300 mt-0.5 truncate">
                            {call.trafficCondition || 'Moderado'} (+{call.trafficDelayMinutes || 4}m)
                          </div>
                        </div>
                      </div>

                      {/* Familiarity with Equipment */}
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Conhecimento do Equipamento:</span>
                          <span className="font-bold text-emerald-400">
                            {familiarity?.knowsEquipment ? `Já atendeu (${familiarity.previousVisitsCount || 1}x)` : '1º Atendimento neste Ativo'}
                          </span>
                        </div>
                      </div>

                      {/* Warning if Preventive Tech != Emergency Tech */}
                      {isMismatch && (
                        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 animate-pulse">
                          <div className="flex items-center gap-1.5 font-bold text-amber-300">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Atenção: Mismatch Operacional</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-amber-200/90">
                            O técnico da preventiva periódica é <strong>{familiarity?.preventiveTechName}</strong>, mas este chamado de emergência foi atribuído a <strong>{call.technicianName}</strong> por critério de proximidade imediata.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {call.lat && (
                          <button
                            onClick={() => handleCenterOn(call.lat, call.lng)}
                            className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            Centralizar no Chamado
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveView('calls');
                            addToast({
                              type: 'info',
                              title: 'Central de Chamados',
                              message: `Abrindo chamado ${call.callNumber}`
                            });
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1"
                          title="Ver chamado"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
                <Compass className="w-8 h-8 text-slate-600 mx-auto animate-spin-slow" />
                <p className="font-medium text-slate-300">Nenhum marcador selecionado</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Toque em qualquer técnico, elevador ou ocorrência no mapa OpenStreetMap ou escolha um da lista abaixo.
                </p>
              </div>
            )}
          </div>

          {/* Quick List of Active Assets */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Pontos em Monitoramento</h4>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setActiveTab('techs')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'techs' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
                >
                  Técnicos
                </button>
                <button
                  onClick={() => setActiveTab('equipments')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'equipments' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  Elevadores
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(activeTab === 'all' || activeTab === 'techs') && filteredTechs.slice(0, 4).map(tech => (
                <div
                  key={tech.id}
                  onClick={() => {
                    setSelectedPin({ type: 'TECH', data: tech });
                    if (tech.currentLocation?.lat) handleCenterOn(tech.currentLocation.lat, tech.currentLocation.lng);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      tech.status === 'DISPONIVEL' ? 'bg-emerald-500' :
                      tech.status === 'A_CAMINHO' ? 'bg-blue-500' :
                      tech.status === 'EM_ATENDIMENTO' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{tech.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{tech.city} • {tech.assignedVehicle.split('(')[0]}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">{tech.status}</span>
                </div>
              ))}

              {(activeTab === 'all' || activeTab === 'equipments') && filteredEquipments.slice(0, 4).map(eq => (
                <div
                  key={eq.id}
                  onClick={() => {
                    setSelectedPin({ type: 'EQUIPMENT', data: eq });
                    if (eq.lat) handleCenterOn(eq.lat, eq.lng);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded shrink-0 ${
                      eq.predictiveRiskScore >= 70 ? 'bg-rose-500' : 'bg-cyan-500'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{eq.tag} — {eq.buildingName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{eq.city} • {eq.model}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold shrink-0 ${
                    eq.predictiveRiskScore >= 70 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {eq.predictiveRiskScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
