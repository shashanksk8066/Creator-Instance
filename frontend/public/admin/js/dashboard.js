// Main Dashboard Analytics Listener
document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const countUsers = document.getElementById('countUsers');
    const countDevices = document.getElementById('countDevices');
    const countCalls = document.getElementById('countCalls');
    const countNotifications = document.getElementById('countNotifications');
    const recentActivityTable = document.getElementById('recentActivityTable');

    // Realtime listeners
    
    // 1. Users count
    db.ref('users').on('value', snapshot => {
        const users = snapshot.val();
        const userCount = users ? Object.keys(users).length : 0;
        if (countUsers) countUsers.textContent = userCount;
    });

    // 2. Devices list & count
    db.ref('devices').on('value', snapshot => {
        const devicesData = snapshot.val();
        let totalDevicesCount = 0;
        let activeDevicesList = [];

        if (devicesData) {
            Object.keys(devicesData).forEach(uid => {
                const userDevices = devicesData[uid];
                Object.keys(userDevices).forEach(deviceId => {
                    totalDevicesCount++;
                    activeDevicesList.push({
                        uid: uid,
                        deviceId: deviceId,
                        ...userDevices[deviceId]
                    });
                });
            });
        }
        
        if (countDevices) countDevices.textContent = totalDevicesCount;
        renderRecentActivity(activeDevicesList);
    });

    // 3. Call logs count
    db.ref('call_logs').on('value', snapshot => {
        const callLogs = snapshot.val();
        let callCount = 0;
        if (callLogs) {
            Object.keys(callLogs).forEach(uid => {
                Object.keys(callLogs[uid]).forEach(deviceId => {
                    callCount += Object.keys(callLogs[uid][deviceId]).length;
                });
            });
        }
        if (countCalls) countCalls.textContent = callCount;
    });

    // 4. Notifications count
    db.ref('notification_logs').on('value', snapshot => {
        const notifLogs = snapshot.val();
        let notifCount = 0;
        if (notifLogs) {
            Object.keys(notifLogs).forEach(uid => {
                Object.keys(notifLogs[uid]).forEach(deviceId => {
                    notifCount += Object.keys(notifLogs[uid][deviceId]).length;
                });
            });
        }
        if (countNotifications) countNotifications.textContent = notifCount;
    });

    // Render device telemetry details in a brief table
    function renderRecentActivity(devices) {
        if (!recentActivityTable) return;
        
        if (devices.length === 0) {
            recentActivityTable.innerHTML = `<tr><td colspan="5" class="loading-indicator">No active telemetry registered.</td></tr>`;
            return;
        }

        // Sort by last active timestamp
        devices.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

        let html = '';
        const displayLimit = Math.min(devices.length, 5); // top 5 active

        for (let i = 0; i < displayLimit; i++) {
            const dev = devices[i];
            const lastActiveDate = dev.lastActive ? new Date(dev.lastActive).toLocaleString() : 'Never';
            
            // Check status indicator
            const isOnline = dev.lastActive && (Date.now() - dev.lastActive < 10 * 60 * 1000); // online if active within 10 mins
            const statusBadge = isOnline 
                ? `<span class="badge badge-success">ONLINE</span>` 
                : `<span class="badge badge-warning">OFFLINE</span>`;

            html += `
                <tr>
                    <td>${dev.manufacturer} ${dev.model}</td>
                    <td><code>${dev.deviceId.substring(0, 8)}...</code></td>
                    <td>${lastActiveDate}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn-action" onclick="window.location.href='user-details.html?uid=${dev.uid}&device=${dev.deviceId}'">
                            Inspect
                        </button>
                    </td>
                </tr>
            `;
        }
        recentActivityTable.innerHTML = html;
    }
});
