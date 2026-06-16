# Bali Flight & Layover Plan

Personal static travel planner for a New York to Bali honeymoon itinerary. It visualizes the full flight route, layover durations, airport transfer notes, Bali stay planning, and trip totals.

## Run Locally

Serve the folder with any static file server, then open `index.html`.

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then visit:

```text
http://127.0.0.1:8765/index.html#route
```

## Contents

- `index.html`: page structure and trip data
- `styles.css`: layout, map, drawer, and itinerary styling
- `route-map.js`: interactive public-map route rendering and detail drawer behavior
- `assets/`: generated local Bali visuals
