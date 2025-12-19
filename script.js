// Configuration
const STATUS_API_URL = 'http://135.181.150.82:8080/status.json';

// Stream configuration - matches our infrastructure
const STREAMS = [
    {
        id: 'youtube',
        name: 'Night City',
        platform: 'YouTube',
        service: 'lofi-stream',
        display: ':99',
        watchUrl: 'https://www.youtube.com/@LofiNightCity/live',
        siteUrl: 'https://ldraney.github.io/lofi-stream-youtube/'
    },
    {
        id: 'twitch',
        name: 'Coffee Shop',
        platform: 'Twitch',
        service: 'lofi-stream-twitch',
        display: ':98',
        watchUrl: 'https://www.twitch.tv/lofi_coffee_shop',
        siteUrl: 'https://ldraney.github.io/lofi-stream-twitch/'
    },
    {
        id: 'kick',
        name: 'Arcade',
        platform: 'Kick',
        service: 'lofi-stream-kick',
        display: ':97',
        watchUrl: 'https://kick.com/lofi-arcade',
        siteUrl: 'https://ldraney.github.io/lofi-stream-kick/'
    },
    {
        id: 'rumble',
        name: 'Library',
        platform: 'Rumble',
        service: 'lofi-stream-rumble',
        display: ':96',
        watchUrl: 'https://rumble.com/c/LofiLibrary',
        siteUrl: 'https://ldraney.github.io/lofi-stream-rumble/'
    },
    {
        id: 'dlive',
        name: 'Space Station',
        platform: 'DLive',
        service: 'lofi-stream-dlive',
        display: ':95',
        watchUrl: 'https://dlive.tv/lofi-stream',
        siteUrl: 'https://ldraney.github.io/lofi-stream-dlive/'
    },
    {
        id: 'odysee',
        name: 'Underwater',
        platform: 'Odysee',
        service: 'lofi-stream-odysee',
        display: ':94',
        watchUrl: 'https://odysee.com/@lofi-stream',
        siteUrl: 'https://ldraney.github.io/lofi-stream-odysee/'
    }
];

// Fetch status from VPS
async function fetchStatus() {
    try {
        const response = await fetch(STATUS_API_URL, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch status:', error);
        return null;
    }
}

// Get status display info
function getStatusDisplay(status) {
    switch (status.status) {
        case 'live':
        case 'running':
            return { class: 'status-live', text: 'LIVE', showReason: false };
        case 'degraded':
            return { class: 'status-degraded', text: 'DEGRADED', showReason: true };
        case 'stalled':
            return { class: 'status-warning', text: 'STALLED', showReason: true };
        case 'down':
            return { class: 'status-down', text: 'DOWN', showReason: true };
        case 'stopped':
            return { class: 'status-down', text: 'STOPPED', showReason: true };
        default:
            return { class: 'status-unknown', text: 'UNKNOWN', showReason: false };
    }
}

// Render stream cards
function renderStreams(statusData) {
    const grid = document.getElementById('streams-grid');

    if (!statusData) {
        grid.innerHTML = `
            <div class="error-message">
                Unable to fetch stream status. The status API may be offline.
            </div>
        `;
        renderOfflineCards(grid);
        return;
    }

    grid.innerHTML = '';

    STREAMS.forEach(stream => {
        const status = statusData.streams?.[stream.id] || { status: 'unknown' };
        const display = getStatusDisplay(status);
        const reason = status.reason && display.showReason ? status.reason : '';

        const card = document.createElement('div');
        card.className = 'stream-card';
        card.innerHTML = `
            <div class="stream-header">
                <span class="stream-name">${stream.name}</span>
                <span class="stream-status ${display.class}">
                    <span class="status-dot"></span>
                    ${display.text}
                </span>
            </div>
            <div class="stream-platform">${stream.platform}</div>
            ${reason ? `<div class="stream-reason">${reason}</div>` : ''}
            <div class="stream-links">
                <a href="${stream.watchUrl}" target="_blank" class="stream-link watch">Watch</a>
                <a href="${stream.siteUrl}" target="_blank" class="stream-link site">Site</a>
            </div>
        `;
        grid.appendChild(card);
    });

    // Update timestamp
    const lastUpdated = document.getElementById('last-updated');
    if (statusData.timestamp) {
        const date = new Date(statusData.timestamp);
        lastUpdated.textContent = date.toLocaleString();
    } else {
        lastUpdated.textContent = new Date().toLocaleString();
    }
}

// Render cards without status (offline mode)
function renderOfflineCards(grid) {
    STREAMS.forEach(stream => {
        const card = document.createElement('div');
        card.className = 'stream-card';
        card.innerHTML = `
            <div class="stream-header">
                <span class="stream-name">${stream.name}</span>
                <span class="stream-status status-unknown">
                    <span class="status-dot"></span>
                    UNKNOWN
                </span>
            </div>
            <div class="stream-platform">${stream.platform}</div>
            <div class="stream-links">
                <a href="${stream.watchUrl}" target="_blank" class="stream-link watch">Watch</a>
                <a href="${stream.siteUrl}" target="_blank" class="stream-link site">Site</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Initialize
async function init() {
    const statusData = await fetchStatus();
    renderStreams(statusData);

    // Refresh every 60 seconds
    setInterval(async () => {
        const newStatus = await fetchStatus();
        renderStreams(newStatus);
    }, 60000);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
