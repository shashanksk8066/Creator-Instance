// Users Directory Loader
document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('usersTableBody');

    if (usersTableBody) {
        loadUsersDirectory();
    }

    function loadUsersDirectory() {
        usersTableBody.innerHTML = `<tr><td colspan="5" class="loading-indicator"><div class="spinner"></div>Loading directory...</td></tr>`;

        // Fetch users node
        db.ref('users').once('value')
            .then(usersSnapshot => {
                const users = usersSnapshot.val() || {};
                
                // Fetch devices node
                return db.ref('devices').once('value')
                    .then(devicesSnapshot => {
                        const devices = devicesSnapshot.val() || {};
                        renderTable(users, devices);
                    });
            })
            .catch(error => {
                console.error("Directory loading error:", error);
                usersTableBody.innerHTML = `<tr><td colspan="5" class="badge badge-danger">Failed to load directory files. Verify rules permissions.</td></tr>`;
            });
    }

    function renderTable(users, devices) {
        let html = '';
        let devicesList = [];

        // Flatten devices list mapping with user emails
        Object.keys(devices).forEach(uid => {
            const userEmail = users[uid]?.email || 'Unknown User';
            const userDevices = devices[uid];
            
            Object.keys(userDevices).forEach(deviceId => {
                devicesList.push({
                    uid: uid,
                    email: userEmail,
                    deviceId: deviceId,
                    ...userDevices[deviceId]
                });
            });
        });

        if (devicesList.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="loading-indicator">No registered device profiles found.</td></tr>`;
            return;
        }

        // Sort by last active timestamp
        devicesList.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

        devicesList.forEach(dev => {
            const lastActiveTime = dev.lastActive ? new Date(dev.lastActive).toLocaleString() : 'Never';
            const isOnline = dev.lastActive && (Date.now() - dev.lastActive < 10 * 60 * 1000);
            const statusBadge = isOnline 
                ? `<span class="badge badge-success">ONLINE</span>` 
                : `<span class="badge-warning badge">OFFLINE</span>`;

            html += `
                <tr>
                    <td><strong>${dev.email}</strong></td>
                    <td>${dev.manufacturer} ${dev.model}</td>
                    <td><code>${dev.deviceId.substring(0, 12)}...</code></td>
                    <td>${lastActiveTime} ${statusBadge}</td>
                    <td>
                        <button class="btn-action" onclick="window.location.href='user-details.html?uid=${dev.uid}&device=${dev.deviceId}'">
                            Inspect details
                        </button>
                    </td>
                </tr>
            `;
        });

        usersTableBody.innerHTML = html;
    }
});
