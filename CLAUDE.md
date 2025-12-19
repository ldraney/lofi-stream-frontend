# lofi-stream-frontend

Public-facing status page and sitemap for all lofi streams.

## Purpose

Central hub showing:
- Live status of all streams (fetched from VPS)
- Links to watch on each platform
- Links to each vibe site

## Architecture

```
User visits VPS (http://135.181.150.82)
        │
        ▼
┌───────────────────────┐
│  VPS (135.181.150.82) │  ← Static HTML/CSS/JS + Dynamic status.json
│  nginx serves both    │
│  status.json by cron  │
└───────────────────────┘
        │
        │ Links to vibe sites
        ▼
┌───────────────────────┐
│  GitHub Pages         │  ← Individual stream vibe sites
│  (separate repos)     │
└───────────────────────┘
```

Note: This repo is NOT deployed to GitHub Pages. The frontend is served directly from the VPS.

## Files

```
lofi-stream-frontend/
├── index.html      # Main status page
├── style.css       # Styling (dark theme)
├── script.js       # Fetches status, renders cards
├── CLAUDE.md       # This file
└── scripts/
    └── status-api.sh  # Deploy to VPS - generates status.json
```

## Local Development

```bash
cd ~/lofi-stream-frontend
python3 -m http.server 8080
# Open http://localhost:8080
```

## Deployment

### Deploy frontend to VPS

```bash
scp index.html style.css script.js root@135.181.150.82:/var/www/html/
```

### Deploy status script to VPS

```bash
scp scripts/status-api.sh root@135.181.150.82:/opt/scripts/
ssh root@135.181.150.82 'chmod +x /opt/scripts/status-api.sh'
ssh root@135.181.150.82 'crontab -l | grep -v status-api; echo "* * * * * /opt/scripts/status-api.sh" | crontab -'
```

## VPS Status Endpoint

The VPS serves both the frontend and `/status.json` via nginx:
- Frontend at `/var/www/html/` (index.html, style.css, script.js)
- Status updated every minute by cron
- Located at `/var/www/html/status.json`

## Streams

| ID | Name | Platform | Service |
|----|------|----------|---------|
| youtube | Night City | YouTube | lofi-stream |
| twitch | Coffee Shop | Twitch | lofi-stream-twitch |
| kick | Arcade | Kick | lofi-stream-kick |
| rumble | Library | Rumble | lofi-stream-rumble |

## Adding New Streams

1. Add to `STREAMS` array in `script.js`
2. Add site card in `index.html`
3. Update VPS `status-api.sh` to check new service
