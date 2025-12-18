// Configuration
const STATUS_API_URL = 'https://lofi-status.ldraney.com/status.json';
// Fallback for development/testing
const FALLBACK_STATUS_URL = 'http://135.181.150.82:8080/status.json';

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
        console.warn('Primary status URL failed, trying fallback:', error);

        try {
            const fallbackResponse = await fetch(FALLBACK_STATUS_URL, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!fallbackResponse.ok) {
                throw new Error(`HTTP ${fallbackResponse.status}`);
            }

            return await fallbackResponse.json();
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return null;
        }
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
        const isLive = status.status === 'running' || status.status === 'live';
        const statusClass = isLive ? 'status-live' : status.status === 'unknown' ? 'status-unknown' : 'status-down';
        const statusText = isLive ? 'LIVE' : status.status === 'unknown' ? 'UNKNOWN' : 'DOWN';

        const card = document.createElement('div');
        card.className = 'stream-card';
        card.innerHTML = `
            <div class="stream-header">
                <span class="stream-name">${stream.name}</span>
                <span class="stream-status ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusText}
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
