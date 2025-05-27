// Global variables
let mapSidebarVisible = true;
let infoPanelVisible = false;
let isPlaying = false;
let currentMarkerData = null;
let map = null; // Leaflet map instance
let markers = []; // Array to store map markers
let routingControl = null; // Leaflet routing control

// Locations dictionary for routing
const locations = {
    'Centro de Comando': [-23.5505, -46.6333],
    'Depósito Central': [-23.5605, -46.6433],
    'Hospital Regional': [-23.5605, -46.6233],
    'Abrigo Municipal': [-23.5705, -46.6533],
    'Base de Operações': [-23.5405, -46.6133],
    'Centro da Cidade': [-23.5505, -46.6333],
    'Bairro Esperança': [-23.5805, -46.6333],
    'Escola Municipal': [-23.5705, -46.6133],
    'Área Industrial': [-23.5405, -46.6533]
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeEventListeners();
    startLoadingAnimations();
    startDisasterTimer();
});

// Initialize map functionality
function initializeMap() {
    console.log('Initializing Leaflet map');
    
    // Initialize the map centered on São Paulo, Brazil
    map = L.map('realMap').setView([-23.5505, -46.6333], 13);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add a scale control to the map
    L.control.scale().addTo(map);
    
    // Add disaster area polygon (simulated flood area)
    const floodArea = L.polygon([
        [-23.5505, -46.6333],
        [-23.5605, -46.6233],
        [-23.5705, -46.6433],
        [-23.5605, -46.6533],
        [-23.5505, -46.6433]
    ], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(map);
    
    // Add risk zone polygon
    const riskZone = L.polygon([
        [-23.5405, -46.6233],
        [-23.5505, -46.6133],
        [-23.5605, -46.6333],
        [-23.5505, -46.6433]
    ], {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(map);
    
    // Initialize map markers
    initializeMapMarkers();
}

// Initialize map markers with data
function initializeMapMarkers() {
    // Clear any existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Get marker data from hidden elements
    const markerElements = document.querySelectorAll('.map-marker-data');
    
    markerElements.forEach(markerElement => {
        const lat = parseFloat(markerElement.getAttribute('data-lat'));
        const lng = parseFloat(markerElement.getAttribute('data-lng'));
        const type = markerElement.getAttribute('data-type');
        const info = markerElement.getAttribute('data-info');
        const icon = markerElement.querySelector('i').className;
        
        // Create custom icon based on marker type
        const markerIcon = L.divIcon({
            className: `map-marker ${type}`,
            html: `<i class="${icon}"></i>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Create marker and add to map
        const marker = L.marker([lat, lng], {
            icon: markerIcon
        }).addTo(map);
        
        // Add click event
        marker.on('click', function() {
            showInfoPanel(info);
        });
        
        // Store marker reference
        markers.push(marker);
    });
    
    console.log(`Added ${markers.length} markers to the map`);
}

// Initialize all event listeners
function initializeEventListeners() {
    // Sidebar toggle
    document.getElementById('toggleMapSidebar')?.addEventListener('click', toggleSidebar);
    document.getElementById('mobileSidebarToggle')?.addEventListener('click', toggleSidebar);

    // Info panel
    document.getElementById('closeInfoPanel')?.addEventListener('click', closeInfoPanel);

    // Time control
    document.getElementById('playTimeControl')?.addEventListener('click', toggleTimeControl);
    document.getElementById('timeSlider')?.addEventListener('input', handleTimeSliderChange);

    // Route planning
    document.getElementById('calculateRouteBtn')?.addEventListener('click', calculateRoute);
    document.getElementById('clearRouteBtn')?.addEventListener('click', clearRoute);

    // Map controls
    document.getElementById('zoomInBtn')?.addEventListener('click', () => handleMapControl('zoomIn'));
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => handleMapControl('zoomOut'));
    document.getElementById('centerBtn')?.addEventListener('click', () => handleMapControl('center'));
    document.getElementById('locationBtn')?.addEventListener('click', () => handleMapControl('location'));

    // Action buttons
    document.getElementById('shareMapBtn')?.addEventListener('click', shareMap);
    document.getElementById('exportMapBtn')?.addEventListener('click', exportMap);
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);

    // Info panel actions
    document.getElementById('implementActionsBtn')?.addEventListener('click', implementActions);
    document.getElementById('modifyPlanBtn')?.addEventListener('click', modifyPlan);

    // Layer toggles
    document.querySelectorAll('.form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', handleLayerToggle);
    });

    // Filter buttons
    document.querySelectorAll('input[name="resourceType"], input[name="teamType"]').forEach(radio => {
        radio.addEventListener('change', handleFilterChange);
    });

    // Disaster selector
    document.getElementById('disasterSelect')?.addEventListener('change', handleDisasterChange);
}

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('mapSidebar');
    if (!sidebar) return;
    
    sidebar.classList.toggle('show');
    mapSidebarVisible = !mapSidebarVisible;
    
    const toggleBtn = document.getElementById('toggleMapSidebar');
    const icon = toggleBtn?.querySelector('i');
    
    if (icon) {
        if (mapSidebarVisible) {
            icon.className = 'fas fa-chevron-left';
        } else {
            icon.className = 'fas fa-chevron-right';
        }
    }
}

// Info panel functions
function showInfoPanel(infoType) {
    const panel = document.getElementById('mapInfoPanel');
    const title = document.getElementById('infoPanelTitle');
    const body = document.getElementById('infoPanelBody');
    
    if (!panel || !title || !body) return;
    
    // Update panel content based on marker type
    const infoData = getInfoData(infoType);
    title.textContent = infoData.title;
    body.innerHTML = infoData.content;
    
    panel.classList.add('show');
    infoPanelVisible = true;
    currentMarkerData = infoData;
}

function closeInfoPanel() {
    const panel = document.getElementById('mapInfoPanel');
    if (panel) {
        panel.classList.remove('show');
        infoPanelVisible = false;
        currentMarkerData = null;
    }
}

function getInfoData(type) {
    const data = {
        'centro-cidade': {
            title: 'Centro da Cidade - Área Crítica',
            content: `
                <div class="info-panel-section">
                    <h6>Centro da Cidade</h6>
                    <div class="info-status critical">Situação Crítica</div>
                    <p><strong>Problema:</strong> Nível da água subindo rapidamente (1.5m acima do normal)</p>
                    <p><strong>Pessoas afetadas:</strong> ~3,500 habitantes</p>
                    <p><strong>Recursos no local:</strong> 2 equipes de resgate, suprimentos médicos limitados</p>
                </div>
                <div class="info-panel-section">
                    <h6>Previsão e Tendências</h6>
                    <p>Aumento previsto do nível da água em 30cm nas próximas 6 horas baseado em dados meteorológicos.</p>
                    <div class="alert alert-danger p-2 mb-2">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Evacuação necessária</strong> para 1,200 pessoas
                    </div>
                    <div class="progress mb-2">
                        <div class="progress-bar bg-danger" style="width: 85%"></div>
                    </div>
                    <small class="text-muted">Nível de urgência: 85%</small>
                </div>
                <div class="info-panel-section">
                    <h6>Ações Recomendadas pela IA</h6>
                    <ul class="action-list">
                        <li>
                            <i class="fas fa-check-circle"></i>
                            Evacuar população para Abrigo Municipal (2.3km)
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            Enviar mais 2 equipes de resgate especializadas
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            Reforçar barreira temporária no setor norte
                        </li>
                        <li>
                            <i class="fas fa-clock"></i>
                            Monitorar níveis de água a cada 30 minutos
                        </li>
                    </ul>
                </div>
            `
        },
        'hospital': {
            title: 'Hospital Regional',
            content: `
                <div class="info-panel-section">
                    <h6>Hospital Regional</h6>
                    <div class="info-status warning">Situação de Alerta</div>
                    <p><strong>Status:</strong> Funcionamento com geradores</p>
                    <p><strong>Pacientes:</strong> 850 internados</p>
                    <p><strong>Autonomia:</strong> 4 horas de combustível</p>
                </div>
                <div class="info-panel-section">
                    <h6>Recursos Necessários</h6>
                    <ul class="action-list">
                        <li><i class="fas fa-gas-pump"></i>Combustível para geradores</li>
                        <li><i class="fas fa-medkit"></i>Suprimentos médicos</li>
                        <li><i class="fas fa-ambulance"></i>Transporte de pacientes</li>
                    </ul>
                </div>
            `
        },
        'abrigo': {
            title: 'Abrigo Municipal',
            content: `
                <div class="info-panel-section">
                    <h6>Abrigo Municipal</h6>
                    <div class="info-status success">Operacional</div>
                    <p><strong>Capacidade:</strong> 800 pessoas (atual: 450)</p>
                    <p><strong>Recursos:</strong> Água, alimentação, cobertores</p>
                    <p><strong>Equipe:</strong> 12 voluntários</p>
                </div>
                <div class="info-panel-section">
                    <h6>Status dos Recursos</h6>
                    <ul class="action-list">
                        <li><i class="fas fa-check-circle"></i>Água: Suficiente para 3 dias</li>
                        <li><i class="fas fa-check-circle"></i>Alimentos: Estoque adequado</li>
                        <li><i class="fas fa-exclamation-circle"></i>Materiais de higiene: Baixo</li>
                    </ul>
                </div>
            `
        },
        'equipe-resgate': {
            title: 'Equipe de Resgate - Águia 02',
            content: `
                <div class="info-panel-section">
                    <h6>Águia 02 - Equipe de Resgate</h6>
                    <div class="info-status success">Em Operação</div>
                    <p><strong>Membros:</strong> 6 especialistas</p>
                    <p><strong>Equipamentos:</strong> Barcos, cordas, equipamentos de mergulho</p>
                    <p><strong>Missão atual:</strong> Resgate em área alagada</p>
                </div>
                <div class="info-panel-section">
                    <h6>Status da Missão</h6>
                    <ul class="action-list">
                        <li><i class="fas fa-user-check"></i>23 pessoas resgatadas</li>
                        <li><i class="fas fa-clock"></i>Tempo de operação: 3h 45min</li>
                        <li><i class="fas fa-battery-three-quarters"></i>Recursos: 75% disponíveis</li>
                    </ul>
                </div>
            `
        },
        'recursos': {
            title: 'Depósito de Recursos',
            content: `
                <div class="info-panel-section">
                    <h6>Depósito de Suprimentos</h6>
                    <div class="info-status warning">Estoque Limitado</div>
                    <p><strong>Localização:</strong> Área Industrial</p>
                    <p><strong>Responsável:</strong> Equipe Logística 01</p>
                    <p><strong>Última atualização:</strong> 15 minutos atrás</p>
                </div>
                <div class="info-panel-section">
                    <h6>Inventário</h6>
                    <ul class="action-list">
                        <li><i class="fas fa-tint"></i>Água: 2,500L disponíveis</li>
                        <li><i class="fas fa-bread-slice"></i>Alimentos: 800 rações</li>
                        <li><i class="fas fa-medkit"></i>Kits médicos: 45 unidades</li>
                        <li><i class="fas fa-home"></i>Cobertores: 200 unidades</li>
                    </ul>
                </div>
            `
        }
    };
    
    return data[type] || data['centro-cidade'];
}

// Time control functions
function toggleTimeControl() {
    const playBtn = document.getElementById('playTimeControl');
    const icon = playBtn?.querySelector('i');
    
    if (!playBtn || !icon) return;
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        icon.className = 'fas fa-pause';
        startTimeAnimation();
    } else {
        icon.className = 'fas fa-play';
        stopTimeAnimation();
    }
}

function handleTimeSliderChange() {
    const slider = document.getElementById('timeSlider');
    if (!slider) return;
    
    const value = slider.value;
    console.log('Time slider changed to:', value);
    
    // Update map based on time
    updateMapForTime(value);
}

function startTimeAnimation() {
    console.log('Starting time animation');
    // Simulate time progression
    const slider = document.getElementById('timeSlider');
    if (!slider) return;
    
    const interval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(interval);
            return;
        }
        
        let currentValue = parseInt(slider.value);
        if (currentValue >= 100) {
            currentValue = 0;
        } else {
            currentValue += 1;
        }
        
        slider.value = currentValue;
        updateMapForTime(currentValue);
    }, 200);
}

function stopTimeAnimation() {
    console.log('Stopping time animation');
}

function updateMapForTime(timeValue) {
    // Update markers based on time value
    const markers = document.querySelectorAll('.map-marker');
    markers.forEach(marker => {
        // Simulate marker position changes over time
        const intensity = Math.sin((timeValue / 100) * Math.PI * 2);
        const scale = 1 + (intensity * 0.2);
        marker.style.transform = `scale(${scale})`;
    });
}

// Route functions
function calculateRoute() {
    const startSelect = document.getElementById('routeStart');
    const endSelect = document.getElementById('routeEnd');
    const typeSelect = document.getElementById('routeType');
    
    if (!startSelect || !endSelect || !typeSelect) return;
    
    const start = startSelect.value;
    const end = endSelect.value;
    const routeType = typeSelect.value;
    
    if (!start || !end) {
        alert('Por favor, selecione origem e destino.');
        return;
    }
    
    // Get coordinates from locations dictionary
    const startCoords = locations[start];
    const endCoords = locations[end];
    
    if (!startCoords || !endCoords) {
        alert('Localização não encontrada.');
        return;
    }
    
    showRouteOnMap(startCoords, endCoords, routeType);
}

function clearRoute() {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
}

function showRouteOnMap(start, end, type) {
    // Clear existing route
    clearRoute();
    
    // Set route options based on type
    let routeOptions = {
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
            styles: [
                {color: '#3b82f6', opacity: 0.8, weight: 6}
            ]
        },
        altLineOptions: {
            styles: [
                {color: '#10b981', opacity: 0.6, weight: 4}
            ]
        },
        createMarker: function() { return null; } // Don't show default markers
    };
    
    // Adjust route options based on type
    switch(type) {
        case 'Mais Segura':
            routeOptions.lineOptions.styles[0].color = '#10b981';
            break;
        case 'Evitar Áreas de Risco':
            routeOptions.lineOptions.styles[0].color = '#10b981';
            routeOptions.showAlternatives = true;
            break;
        case 'Menor Distância':
            routeOptions.lineOptions.styles[0].color = '#f59e0b';
            break;
    }
    
    // Create routing control
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(start[0], start[1]),
            L.latLng(end[0], end[1])
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving'
        }),
        lineOptions: routeOptions.lineOptions,
        showAlternatives: routeOptions.showAlternatives,
        altLineOptions: routeOptions.altLineOptions,
        createMarker: routeOptions.createMarker,
        fitSelectedRoutes: routeOptions.fitSelectedRoutes
    }).addTo(map);
    
    // Add custom start and end markers
    const startMarker = L.marker(start, {
        icon: L.divIcon({
            className: 'route-marker start-marker',
            html: '<i class="fas fa-play-circle"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    const endMarker = L.marker(end, {
        icon: L.divIcon({
            className: 'route-marker end-marker',
            html: '<i class="fas fa-flag-checkered"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    // Store markers to remove them later
    markers.push(startMarker, endMarker);
}

// Map control functions
function handleMapControl(action) {
    if (!map) return;
    
    switch(action) {
        case 'zoomIn':
            map.zoomIn();
            break;
        case 'zoomOut':
            map.zoomOut();
            break;
        case 'center':
            map.setView([-23.5505, -46.6333], 13);
            break;
        case 'location':
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    map.setView([lat, lng], 15);
                    
                    // Add a marker for current location
                    L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'current-location-marker',
                            html: '<i class="fas fa-user"></i>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        })
                    }).addTo(map)
                    .bindPopup('Sua localização atual')
                    .openPopup();
                    
                }, error => {
                    console.error('Error getting location:', error);
                    alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
                });
            } else {
                alert('Geolocalização não é suportada pelo seu navegador.');
            }
            break;
    }
}

// Action functions
function shareMap() {
    console.log('Sharing map...');
    
    const btn = document.getElementById('shareMapBtn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    // Simulate copying link to clipboard
    const mapUrl = `${window.location.origin}/mapa.html?disaster=enchente&view=centro-cidade`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(mapUrl).then(() => {
            btn.innerHTML = '<i class="fas fa-check me-2"></i>Link Copiado!';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });
    } else {
        // Fallback for older browsers
        btn.innerHTML = '<i class="fas fa-check me-2"></i>Link Copiado!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }
}

function exportMap() {
    console.log('Exporting map data...');
    
    const btn = document.getElementById('exportMapBtn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Exportando...';
    
    setTimeout(() => {
        // Simulate data export
        const mapData = {
            timestamp: new Date().toISOString(),
            disaster: document.getElementById('disasterSelect')?.value || 'Enchente - Região Sul',
            markers: Array.from(document.querySelectorAll('.map-marker')).map(marker => ({
                type: marker.getAttribute('data-info'),
                position: {
                    top: marker.style.top,
                    left: marker.style.left
                },
                status: marker.className.split(' ').find(cls => ['critical', 'warning', 'success', 'info'].includes(cls))
            })),
            layers: Array.from(document.querySelectorAll('.form-check-input')).map(input => ({
                id: input.id,
                enabled: input.checked,
                label: input.nextElementSibling?.textContent.trim()
            }))
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mapa-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        btn.innerHTML = '<i class="fas fa-download me-2"></i>Download Pronto!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }, 1500);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Erro ao entrar em tela cheia:', err);
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.log('Erro ao sair de tela cheia:', err);
        });
    }
}

function implementActions() {
    const btn = document.getElementById('implementActionsBtn');
    if (!btn) return;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Implementando...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check me-2"></i>Ações Executadas!';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        
        // Update marker status
        if (currentMarkerData) {
            const marker = document.querySelector(`[data-info="${currentMarkerData.type}"]`);
            if (marker) {
                marker.classList.remove('critical', 'warning');
                marker.classList.add('success');
            }
        }
        
        // Auto-close panel after implementation
        setTimeout(() => {
            closeInfoPanel();
        }, 2000);
    }, 3000);
}

function modifyPlan() {
    console.log('Opening plan modification interface...');
    alert('Interface de modificação de plano seria aberta aqui.');
}

// Layer and filter handlers
function handleLayerToggle(event) {
    const layerId = event.target.id;
    const isChecked = event.target.checked;
    console.log(`Layer ${layerId} toggled: ${isChecked}`);
    
    // Simulate layer visibility toggle
    const markers = document.querySelectorAll('.map-marker');
    markers.forEach(marker => {
        if (isChecked) {
            marker.style.opacity = '1';
        } else {
            marker.style.opacity = '0.3';
        }
    });
    
    // Reset opacity after demonstration
    setTimeout(() => {
        markers.forEach(marker => {
            marker.style.opacity = '1';
        });
    }, 1000);
}

function handleFilterChange(event) {
    const filterName = event.target.name;
    const filterValue = event.target.id;
    console.log(`Filter ${filterName} changed to: ${filterValue}`);
    
    // Simulate filtering
    const markers = document.querySelectorAll('.map-marker');
    markers.forEach(marker => {
        if (filterValue.includes('all') || filterValue.includes('All')) {
            marker.style.display = 'flex';
        } else {
            // Simple filter simulation
            marker.style.display = Math.random() > 0.5 ? 'flex' : 'none';
        }
    });
}

function handleDisasterChange(event) {
    const disaster = event.target.value;
    console.log(`Disaster changed to: ${disaster}`);
    
    // Update disaster timer and status
    const statusElement = document.querySelector('.disaster-status span:last-child');
    if (statusElement) {
        statusElement.textContent = disaster;
    }
    
    // Simulate loading new disaster data
    const markers = document.querySelectorAll('.map-marker');
    markers.forEach(marker => {
        marker.style.animation = 'markerPulse 1s ease-in-out';
        setTimeout(() => {
            marker.style.animation = 'markerPulse 3s infinite';
        }, 1000);
    });
}

// Loading animations
function startLoadingAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.loading').forEach(el => {
        observer.observe(el);
    });

    // Initial load
    setTimeout(() => {
        document.querySelectorAll('.loading').forEach(el => {
            el.classList.add('loaded');
        });
    }, 500);
}

// Disaster timer
function startDisasterTimer() {
    function updateTimer() {
        const startTime = new Date('2024-01-15T10:00:00');
        const now = new Date();
        const diff = now - startTime;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timerElement = document.getElementById('disasterTime');
        if (timerElement) {
            timerElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    setInterval(updateTimer, 1000);
    updateTimer();
}

// Responsive handling
function handleResize() {
    if (window.innerWidth <= 1200 && mapSidebarVisible) {
        const sidebar = document.getElementById('mapSidebar');
        sidebar?.classList.remove('show');
    }
}

window.addEventListener('resize', handleResize);

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('mapSidebar');
    const toggleBtn = document.getElementById('mobileSidebarToggle');
    const sidebarToggle = document.getElementById('toggleMapSidebar');
    
    if (window.innerWidth <= 1200 && 
        sidebar?.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        !toggleBtn?.contains(e.target) &&
        !sidebarToggle?.contains(e.target)) {
        sidebar.classList.remove('show');
    }
});

// Simulate real-time updates
function simulateRealTimeUpdates() {
    // Update markers randomly
    const markers = document.querySelectorAll('.map-marker');
    markers.forEach(marker => {
        const currentTop = parseInt(marker.style.top) || 30;
        const currentLeft = parseInt(marker.style.left) || 40;
        
        // Small random movement to simulate real-time updates
        const newTop = Math.max(10, Math.min(90, currentTop + (Math.random() - 0.5) * 2));
        const newLeft = Math.max(10, Math.min(90, currentLeft + (Math.random() - 0.5) * 2));
        
        marker.style.top = newTop + '%';
        marker.style.left = newLeft + '%';
    });
}

// Start real-time simulation
setInterval(simulateRealTimeUpdates, 15000);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case 'm':
                e.preventDefault();
                toggleSidebar();
                break;
            case 'f':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'r':
                e.preventDefault();
                calculateRoute();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        closeInfoPanel();
    }
});

console.log('Mapa ResgateTech loaded successfully!');