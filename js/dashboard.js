// Global variables
let mapSidebarVisible = true;
let isPlaying = false;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeEventListeners();
    startDisasterTimer();
    startRealTimeUpdates();
});

// Initialize dashboard functionality
function initializeDashboard() {
    console.log('Dashboard initialized');
    
    // Initialize charts (placeholder)
    initializeCharts();
    
    // Load initial data
    loadDashboardData();
}

// Initialize all event listeners
function initializeEventListeners() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('toggleSidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // Optimize resources button
    const optimizeBtn = document.getElementById('optimizeResourcesBtn');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', optimizeResources);
    }

    // Sidebar menu active state
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });

    // Alert actions
    document.querySelectorAll('.alert-actions .btn').forEach(btn => {
        btn.addEventListener('click', handleAlertAction);
    });

    // Team action buttons
    document.querySelectorAll('.team-status-table .btn').forEach(btn => {
        btn.addEventListener('click', handleTeamAction);
    });

    // Priority area actions
    document.querySelectorAll('.priority-actions .btn').forEach(btn => {
        btn.addEventListener('click', handlePriorityAction);
    });

    // Dashboard action buttons
    document.querySelectorAll('.dashboard-actions .btn').forEach(btn => {
        btn.addEventListener('click', handleDashboardAction);
    });
}

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('dashboardSidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
        mapSidebarVisible = !mapSidebarVisible;
    }
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
        
        const timerElement = document.getElementById('disasterTimer');
        if (timerElement) {
            timerElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    setInterval(updateTimer, 1000);
    updateTimer();
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    if (!target) return;
    
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Optimize resources functionality
function optimizeResources() {
    const btn = document.getElementById('optimizeResourcesBtn');
    if (!btn) return;
    
    btn.innerHTML = '<span>⏳</span> Otimizando...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = '<span>✅</span> Otimizado!';
        btn.className = 'btn btn-success btn-sm';
        
        // Update progress bars to show optimization
        updateResourceAllocation();
        
        setTimeout(() => {
            btn.innerHTML = '<span>🪄</span> Otimizar com IA';
            btn.className = 'btn btn-primary btn-sm';
            btn.disabled = false;
        }, 2000);
    }, 3000);
}

// Update resource allocation display
function updateResourceAllocation() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach((bar, index) => {
        const currentWidth = parseInt(bar.style.width);
        const optimizedWidth = Math.min(currentWidth + Math.random() * 10, 100);
        bar.style.width = optimizedWidth + '%';
        
        // Update the percentage text
        const parentDiv = bar.closest('.col-md-6');
        if (parentDiv) {
            const percentSpan = parentDiv.querySelector('.fw-bold');
            if (percentSpan) {
                percentSpan.textContent = Math.floor(optimizedWidth) + '%';
            }
        }
    });
}

// Handle alert actions
function handleAlertAction(e) {
    const button = e.target.closest('.btn');
    const alertItem = button.closest('.alert-item');
    const actionType = button.textContent.trim();
    
    if (actionType.includes('Evacuar') || actionType.includes('Enviar') || actionType.includes('Realocar')) {
        button.innerHTML = '<span>⏳</span> Processando...';
        button.disabled = true;
        
        setTimeout(() => {
            alertItem.style.opacity = '0.5';
            button.innerHTML = '<span>✅</span> Executado';
            button.classList.remove('btn-danger', 'btn-warning', 'btn-info');
            button.classList.add('btn-success');
            
            // Update statistics
            updateStatistics();
        }, 2000);
    }
}

// Handle team actions
function handleTeamAction(e) {
    const button = e.target.closest('.btn');
    const teamRow = button.closest('tr');
    const actionType = button.title;
    
    console.log(`Team action: ${actionType} for team in row:`, teamRow);
    
    // Visual feedback
    button.style.background = '#10b981';
    button.style.color = 'white';
    
    setTimeout(() => {
        button.style.background = '';
        button.style.color = '';
    }, 500);
}

// Handle priority area actions
function handlePriorityAction(e) {
    const button = e.target.closest('.btn');
    const priorityItem = button.closest('li');
    
    button.innerHTML = '<span>⏳</span>';
    button.disabled = true;
    
    setTimeout(() => {
        button.innerHTML = '<span>✅</span>';
        button.classList.add('btn-success');
        priorityItem.style.opacity = '0.7';
    }, 1500);
}

// Handle dashboard actions
function handleDashboardAction(e) {
    const button = e.target.closest('.btn');
    const action = button.textContent.trim();
    
    if (action.includes('Exportar')) {
        exportDashboardData();
    } else if (action.includes('Atualizar')) {
        refreshDashboard();
    } else if (action.includes('Novo Alerta')) {
        createNewAlert();
    }
}

// Export dashboard data
function exportDashboardData() {
    console.log('Exporting dashboard data...');
    
    const data = {
        timestamp: new Date().toISOString(),
        statistics: {
            peopleAffected: 12458,
            medicalResources: 87,
            teamsInField: 42,
            criticalAlerts: 7
        },
        teams: getTeamsData(),
        alerts: getAlertsData()
    };
    
    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Refresh dashboard
function refreshDashboard() {
    console.log('Refreshing dashboard...');
    
    // Simulate data refresh
    const refreshBtn = document.querySelector('[title="Atualizar"]');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<span>🔄</span>';
        refreshBtn.style.animation = 'spin 1s linear infinite';
        
        setTimeout(() => {
            refreshBtn.innerHTML = '<span>✅</span>';
            refreshBtn.style.animation = '';
            
            setTimeout(() => {
                refreshBtn.innerHTML = '<span>🔄</span>';
            }, 1000);
        }, 2000);
    }
    
    // Update statistics with small variations
    updateStatistics();
}

// Create new alert
function createNewAlert() {
    console.log('Creating new alert...');
    
    const alertsContainer = document.querySelector('.alert-timeline');
    if (!alertsContainer) return;
    
    const newAlert = document.createElement('div');
    newAlert.className = 'alert-item medium';
    newAlert.innerHTML = `
        <div class="alert-time">${new Date().toLocaleTimeString().slice(0, 5)}</div>
        <div class="alert-content">
            <h5><span>ℹ️</span>Novo alerta criado</h5>
            <p>Alerta criado pelo usuário para monitoramento.</p>
            <div class="alert-actions">
                <button class="btn btn-sm btn-info">
                    <span>👁️</span> Monitorar
                </button>
                <button class="btn btn-sm btn-outline-secondary">Detalhes</button>
            </div>
        </div>
    `;
    
    alertsContainer.insertBefore(newAlert, alertsContainer.firstChild);
    
    // Add event listeners to new buttons
    newAlert.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', handleAlertAction);
    });
}

// Update statistics
function updateStatistics() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        if (!stat.getAttribute('data-count')) {
            const currentValue = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
            if (stat.textContent.includes('%')) {
                const variation = Math.floor(Math.random() * 6) - 3; // -3 to +3
                const newValue = Math.max(0, Math.min(100, currentValue + variation));
                stat.textContent = newValue + '%';
            } else {
                const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10
                const newValue = Math.max(0, currentValue + variation);
                stat.textContent = newValue.toLocaleString();
            }
        }
    });
}

// Get teams data
function getTeamsData() {
    const teams = [];
    document.querySelectorAll('.team-status-table tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
            teams.push({
                name: cells[0].textContent.trim(),
                type: cells[1].textContent.trim(),
                location: cells[2].textContent.trim(),
                status: cells[3].textContent.trim()
            });
        }
    });
    return teams;
}

// Get alerts data
function getAlertsData() {
    const alerts = [];
    document.querySelectorAll('.alert-item').forEach(item => {
        const time = item.querySelector('.alert-time')?.textContent.trim();
        const title = item.querySelector('h5')?.textContent.trim();
        const description = item.querySelector('p')?.textContent.trim();
        const priority = item.className.includes('critical') ? 'critical' : 
                        item.className.includes('high') ? 'high' :
                        item.className.includes('medium') ? 'medium' : 'low';
        
        alerts.push({
            time,
            title,
            description,
            priority
        });
    });
    return alerts;
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading data
    console.log('Loading dashboard data...');
    
    // Animate counters
    document.querySelectorAll('[data-count]').forEach(counter => {
        animateCounter(counter);
    });
}

// Initialize charts (placeholder)
function initializeCharts() {
    console.log('Charts initialized (placeholder)');
    // Here you would initialize actual charts with Chart.js or similar
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update every 30 seconds
    setInterval(() => {
        updateStatistics();
        console.log('Real-time update performed');
    }, 30000);
}

// Responsive sidebar handling
function handleResize() {
    const sidebar = document.getElementById('dashboardSidebar');
    if (window.innerWidth <= 1200) {
        sidebar?.classList.remove('show');
    }
}

window.addEventListener('resize', handleResize);
handleResize();

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('dashboardSidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    
    if (window.innerWidth <= 1200 && 
        sidebar?.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        !toggleBtn?.contains(e.target)) {
        sidebar.classList.remove('show');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case 'd':
                e.preventDefault();
                refreshDashboard();
                break;
            case 'e':
                e.preventDefault();
                exportDashboardData();
                break;
            case 'n':
                e.preventDefault();
                createNewAlert();
                break;
        }
    }
});

// Add CSS for spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('Dashboard ResgateTech loaded successfully!');