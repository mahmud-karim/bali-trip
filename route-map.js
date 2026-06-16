(() => {
  const root = document.querySelector("[data-route-explorer]");
  const mapNode = document.querySelector("#public-route-map");
  const dataNode = document.querySelector("#route-map-data");
  const detail = document.querySelector("[data-route-detail]");

  if (!root || !mapNode || !dataNode || !detail) {
    return;
  }

  let routeData;
  try {
    routeData = JSON.parse(dataNode.textContent);
  } catch {
    return;
  }

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const quickActions = Array.from(root.querySelectorAll("[data-route-jump-kind][data-route-jump-key]"));
  const itineraryTarget = document.querySelector("#layovers");

  const detailVisuals = {
    lga: {
      badge: "Departure kit",
      tabs: ["Pack", "Buffer", "Sleep mode"],
      photos: [
        ["https://news.delta.com/sites/default/files/2022-06/dal_lga_open_nite-22.jpg", "LGA Terminal C"],
        ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=760&q=82", "Boarding rhythm"],
        ["https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=760&q=82", "Night departure"],
      ],
    },
    dtw: {
      badge: "Airport hotel",
      tabs: ["Sleep", "Shower", "Breakfast"],
      photos: [
        ["https://www.michigan.org/sites/default/files/styles/listing_slideshow/public/listing_images/profile/8369/edd709c4785da61f8b7d10d72af90187_westindetroitlobbyatriumwestindetroitmetroairport.jpg?itok=nohJ-2G_", "Westin DTW lobby"],
        ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=760&q=82", "Sleep block"],
        ["https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=760&q=82", "Easy breakfast"],
      ],
    },
    "icn-out": {
      badge: "Airside transfer",
      tabs: ["Gate", "Stretch", "Hydrate"],
      photos: [
        ["https://www.airport.kr/sites/ap_en/images/sub/first-terminal-img01.jpg", "Transfer signs"],
        ["https://www.airport.kr/sites/ap_en/images/sub/first-terminal-img02.jpg", "Transfer desk"],
        ["https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=760&q=82", "Next gate"],
      ],
    },
    dps: {
      badge: "Bali stay",
      tabs: ["Transfer", "Seminyak", "Slow morning"],
      photos: [
        ["assets/bali-late-arrival-transfer.png", "Late arrival"],
        ["assets/bali-first-morning-pool.png", "Seminyak base"],
        ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=760&q=82", "First morning"],
      ],
    },
    "icn-return": {
      badge: "Seoul window",
      tabs: ["Transit tour", "AREX", "Lunch"],
      photos: [
        ["https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=760&q=82", "Seoul streets"],
        ["https://www.airport.kr/sites/ap_en/images/sub/first-terminal-img02.jpg", "ICN transfer desk"],
        ["https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=760&q=82", "Transit lunch"],
      ],
    },
    atl: {
      badge: "Gateway sleep",
      tabs: ["Customs", "Hotel", "Early return"],
      photos: [
        ["https://cache.marriott.com/is/image/marriotts7prod/mc-atlma-skytrain-27525%3AClassic-Hor?fit=constrain&wid=1300", "ATL SkyTrain hotel"],
        ["https://cache.marriott.com/content/dam/marriott-renditions/ATLMA/atlma-suite-7550-hor-feat.jpg?downsize=1920px%3A%2A&interpolation=progressive-bilinear&output-quality=70", "Gateway room"],
        ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=760&q=82", "Early flight"],
      ],
    },
    flight: {
      badge: "Flight leg",
      tabs: ["Seat", "Sleep", "Next stop"],
      photos: [
        ["https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=760&q=82", "Flight plan"],
        ["https://images.unsplash.com/photo-1483450388369-9ed95738483c?auto=format&fit=crop&w=760&q=82", "Long haul"],
        ["https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=760&q=82", "Window time"],
      ],
    },
  };

  const locations = {
    lga: { code: "LGA", label: "Start", lat: 40.7769, lng: -73.874, tone: "start", offset: { x: 58, y: -26 }, mobileOffset: { x: 56, y: -24 } },
    dtw: { code: "DTW", label: "13h 19m", lat: 42.2162, lng: -83.3554, tone: "sleep", offset: { x: -78, y: -32 }, mobileOffset: { x: -44, y: -44 } },
    "icn-out": { code: "ICN", label: "1h 35m", mapLabel: "1h 35m + 9h 25m", lat: 37.4602, lng: 126.4407, displayLng: -233.5593, tone: "transfer", offset: { x: 2, y: -84 }, mobileOffset: { x: 52, y: -42 } },
    dps: { code: "DPS", label: "Bali stay", lat: -8.7482, lng: 115.167, displayLng: -244.833, tone: "bali", offset: { x: -82, y: 58 }, mobileOffset: { x: 24, y: 54 } },
    "icn-return": { code: "ICN", label: "9h 25m", lat: 37.4602, lng: 126.4407, displayLng: -233.5593, tone: "seoul", offset: { x: 214, y: 18 }, mobileOffset: { x: 30, y: 46 } },
    atl: { code: "ATL", label: "10h 10m", lat: 33.6407, lng: -84.4277, tone: "sleep", offset: { x: -40, y: 58 }, mobileOffset: { x: -52, y: 40 } },
  };

  const segments = {
    "lga-dtw": { from: "lga", to: "dtw", label: "LGA -> DTW", duration: "2h 21m", direction: "outbound", labelT: 0.52, offset: { x: 8, y: -66 }, mobileOffset: { x: -22, y: -58 } },
    "dtw-icn-out": { from: "dtw", to: "icn-out", label: "DTW -> ICN", duration: "14h 45m", direction: "outbound", labelT: 0.48, offset: { x: 0, y: -34 }, mobileOffset: { x: 8, y: -58 } },
    "icn-dps": { from: "icn-out", to: "dps", label: "ICN -> DPS", duration: "6h 50m", direction: "outbound", labelT: 0.56, offset: { x: 130, y: -10 }, mobileOffset: { x: 64, y: -8 } },
    "dps-icn": { from: "dps", to: "icn-return", label: "DPS -> ICN", duration: "7h 15m", direction: "return", labelT: 0.48, offset: { x: -120, y: -26 }, mobileOffset: { x: -56, y: 10 } },
    "icn-atl": { from: "icn-return", to: "atl", label: "ICN -> ATL", duration: "14h", direction: "return", labelT: 0.5, offset: { x: 0, y: 36 }, mobileOffset: { x: 0, y: 54 } },
    "atl-lga": { from: "atl", to: "lga", label: "ATL -> LGA", duration: "2h 10m", direction: "return", labelT: 0.46, offset: { x: 82, y: 60 }, mobileOffset: { x: -62, y: 56 } },
  };

  const sourceZoom = 3;
  const tileSize = 256;
  const worldSize = tileSize * 2 ** sourceZoom;
  const routeBounds = { north: 66, south: -24, west: -255, east: -25 };
  const zoomLimits = { min: 0.62, max: 5.2 };

  const project = ({ lat, lng }) => {
    const clampedLat = Math.max(-85.0511, Math.min(85.0511, lat));
    const sin = Math.sin((clampedLat * Math.PI) / 180);
    return {
      x: ((lng + 180) / 360) * worldSize,
      y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * worldSize,
    };
  };

  const projectForDisplay = ({ lat, lng, displayLng }) => project({ lat, lng: displayLng ?? lng });

  const projectedBounds = {
    nw: project({ lat: routeBounds.north, lng: routeBounds.west }),
    se: project({ lat: routeBounds.south, lng: routeBounds.east }),
  };

  const initialCenter = {
    x: (projectedBounds.nw.x + projectedBounds.se.x) / 2,
    y: (projectedBounds.nw.y + projectedBounds.se.y) / 2,
  };

  const view = {
    center: { ...initialCenter },
    zoom: 1,
  };

  let active = { kind: "location", key: "dps" };
  let markerButtons = new Map();
  let segmentButtons = new Map();
  let routePaths = new Map();
  let renderFrame = 0;

  const getMetrics = () => {
    const rect = mapNode.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 600;
    const detailRect = detail.getBoundingClientRect();
    const drawerHeight = detailRect.height || 0;
    const topClearance = width < 680 ? 154 : width < 980 ? 142 : 118;
    const bottomClearance = drawerHeight ? drawerHeight + (width < 680 ? 42 : 78) : height * 0.34;
    const usableHeight = Math.max(260, height - topClearance - bottomClearance);
    const spanX = projectedBounds.se.x - projectedBounds.nw.x;
    const spanY = projectedBounds.se.y - projectedBounds.nw.y;
    const baseScale = Math.min(width / spanX, usableHeight / spanY);
    const fitScale = width < 560 ? 0.72 : width < 780 ? 0.86 : 1;

    return {
      width,
      height,
      scale: baseScale * view.zoom * fitScale,
      screenCenter: {
        x: width / 2,
        y: topClearance + usableHeight / 2,
      },
    };
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const clampView = () => {
    view.zoom = clamp(view.zoom, zoomLimits.min, zoomLimits.max);
    view.center.y = clamp(view.center.y, 0, worldSize);
  };

  const renderDetail = (entry, visualKey = "flight") => {
    if (!entry) {
      return;
    }

    const visual = detailVisuals[visualKey] || detailVisuals.flight;

    detail.classList.remove("is-changing");
    detail.offsetHeight;
    detail.classList.add("is-changing");
    const [heroPhoto, ...cardPhotos] = visual.photos;
    const cards = cardPhotos.length ? cardPhotos : visual.photos;

    detail.innerHTML = `
      <div class="drawer-grip" aria-hidden="true"></div>
      <div class="sheet-content">
        <section class="sheet-place">
          <div class="sheet-hero-photo" style="--photo: url('${escapeHtml(heroPhoto[0])}')">
            <span>${escapeHtml(visual.badge)}</span>
          </div>
          <div class="sheet-place-copy">
            <p class="eyebrow">${escapeHtml(entry.eyebrow)}</p>
            <h3>${escapeHtml(entry.title)}</h3>
            <p>${escapeHtml(entry.summary)}</p>
          </div>
        </section>

        <section class="sheet-explore">
          <div class="detail-tabs" aria-label="Plan focus">
            ${visual.tabs
              .map((tab, index) => `<span class="detail-tab${index === 0 ? " is-active" : ""}">${escapeHtml(tab)}</span>`)
              .join("")}
          </div>
          <div class="sheet-card-row">
            ${cards
              .slice(0, 4)
              .map(
                ([url, label], index) => `
                  <article class="sheet-card">
                    <div class="sheet-card-photo" style="--photo: url('${escapeHtml(url)}')"></div>
                    <strong>${escapeHtml(label)}</strong>
                    <span>${escapeHtml(entry.items[index] || entry.eyebrow)}</span>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>

        <aside class="sheet-note">
          <p class="eyebrow">Travel note</p>
          <p>${escapeHtml(entry.items[0] || entry.summary)}</p>
          <button type="button">Airport & transit info</button>
        </aside>
      </div>

      <div class="sheet-stats" aria-label="Trip totals">
        <span class="sheet-stat">
          <span class="sheet-stat-icon" aria-hidden="true">
            <svg class="plane-solid" viewBox="0 0 24 24"><path d="M21 16v-2L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z"></path></svg>
          </span>
          <span class="sheet-stat-copy"><span>Total travel time</span><strong>43h 45m</strong></span>
        </span>
        <span class="sheet-stat">
          <span class="sheet-stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7v5l3.5 2"></path></svg>
          </span>
          <span class="sheet-stat-copy"><span>Total layovers</span><strong>35h 44m</strong></span>
        </span>
        <span class="sheet-stat">
          <span class="sheet-stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M3.5 12h17"></path><path d="M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5Z"></path></svg>
          </span>
          <span class="sheet-stat-copy"><span>Total distance</span><strong>19,742 km</strong></span>
        </span>
        <span class="sheet-stat">
          <span class="sheet-stat-icon leaf" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M20 4c-7.5.2-12.4 3-14.2 7.4-1.5 3.7.2 7 3.2 8.2 4.1 1.7 8.4-1.2 9.6-5.2C19.4 11.7 19.8 8 20 4Z"></path><path d="M8 18c2.5-4.6 5.7-7.7 10-9.5"></path></svg>
          </span>
          <span class="sheet-stat-copy"><span>Est. CO2</span><strong>2,134 kg</strong></span>
        </span>
        <button type="button" data-itinerary-trigger>
          <span>View full itinerary</span>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2V6Z"></path><path d="M8 4v13"></path><path d="M16 7v13"></path></svg>
        </button>
      </div>
    `;
  };

  const jumpToFullItinerary = () => {
    if (!itineraryTarget) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    itineraryTarget.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    history.replaceState(null, "", "#layovers");
    itineraryTarget.classList.remove("is-itinerary-focus");
    itineraryTarget.offsetHeight;
    itineraryTarget.classList.add("is-itinerary-focus");
  };

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-itinerary-trigger]")) {
      return;
    }

    event.preventDefault();
    jumpToFullItinerary();
  });

  const setActive = (kind, key) => {
    active = { kind, key };

    markerButtons.forEach((button, markerKey) => {
      const isActive = kind === "location" && markerKey === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    segmentButtons.forEach((button, segmentKey) => {
      const isActive = kind === "segment" && segmentKey === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    routePaths.forEach((path, segmentKey) => {
      path.classList.toggle("is-active", kind === "segment" && segmentKey === key);
    });

    quickActions.forEach((button) => {
      const isActive =
        button.dataset.routeJumpKind === kind && button.dataset.routeJumpKey === key;
      button.classList.toggle("is-active", isActive);
      button.toggleAttribute("aria-current", isActive);
    });
  };

  const selectLocation = (key) => {
    const entry = routeData.locations[key];
    if (!entry) {
      return;
    }
    setActive("location", key);
    renderDetail(entry, key);
  };

  const selectSegment = (key) => {
    const entry = routeData.segments[key];
    if (!entry) {
      return;
    }
    setActive("segment", key);
    renderDetail(entry, "flight");
  };

  quickActions.forEach((button) => {
    button.addEventListener("click", () => {
      const { routeJumpKind, routeJumpKey } = button.dataset;
      if (routeJumpKind === "segment") {
        selectSegment(routeJumpKey);
      } else {
        selectLocation(routeJumpKey);
      }
    });
  });

  const renderMap = () => {
    clampView();

    const { width, height, scale, screenCenter } = getMetrics();
    const isCompact = width < 560;
    const toScreen = ({ lat, lng, displayLng }) => {
      const point = projectForDisplay({ lat, lng, displayLng });
      return {
        x: (point.x - view.center.x) * scale + screenCenter.x,
        y: (point.y - view.center.y) * scale + screenCenter.y,
      };
    };

    const getRouteCurve = (segment) => {
      const from = toScreen(locations[segment.from]);
      const to = toScreen(locations[segment.to]);
      const directionSign = segment.direction === "outbound" ? -1 : 1;
      const curve = directionSign * 74 * Math.min(1.35, Math.max(0.78, view.zoom));
      return {
        from,
        to,
        control: {
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2 + curve,
        },
      };
    };

    const pointOnCurve = ({ from, control, to }, t) => {
      const inverse = 1 - t;
      return {
        x: inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
        y: inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y,
      };
    };

    const mapRect = mapNode.getBoundingClientRect();
    const detailRect = detail.getBoundingClientRect();
    const drawerTop = detailRect.height > 0 ? detailRect.top - mapRect.top : height;
    const safeBottom = clamp(drawerTop - (isCompact ? 82 : 106), isCompact ? 300 : 320, height - 84);
    const labelSafeBottom = clamp(drawerTop - (isCompact ? 58 : 34), isCompact ? 300 : 360, height - 56);
    const safeTop = isCompact ? 150 : 96;

    const placeOverlayItem = (x, y, paddingX = 48, top = safeTop, bottom = safeBottom) => {
      return {
        x: clamp(x, paddingX, width - paddingX),
        y: clamp(y, top, bottom),
      };
    };

    const markerPlacements = new Map();
    const getMarkerPlacement = (key, location) => {
      if (!markerPlacements.has(key)) {
        const point = toScreen(location);
        const offset = (isCompact && location.mobileOffset) || location.offset || { x: 0, y: -62 };
        const padding = isCompact ? 50 : 64;
        markerPlacements.set(key, {
          point,
          placed: placeOverlayItem(point.x + offset.x, point.y + offset.y, padding, safeTop, safeBottom),
        });
      }
      return markerPlacements.get(key);
    };

    const visibleNw = {
      x: view.center.x - screenCenter.x / scale,
      y: view.center.y - screenCenter.y / scale,
    };
    const visibleSe = {
      x: view.center.x + (width - screenCenter.x) / scale,
      y: view.center.y + (height - screenCenter.y) / scale,
    };

    const tileMinX = Math.floor(visibleNw.x / tileSize) - 1;
    const tileMaxX = Math.ceil(visibleSe.x / tileSize) + 1;
    const tileMinY = Math.floor(visibleNw.y / tileSize) - 1;
    const tileMaxY = Math.ceil(visibleSe.y / tileSize) + 1;
    const tileCount = 2 ** sourceZoom;
    const tileImages = [];

    for (let x = tileMinX; x <= tileMaxX; x += 1) {
      for (let y = tileMinY; y <= tileMaxY; y += 1) {
        if (y < 0 || y >= tileCount) {
          continue;
        }
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        tileImages.push(`
          <img
            class="osm-tile"
            alt=""
            draggable="false"
            src="https://a.basemaps.cartocdn.com/rastertiles/voyager/${sourceZoom}/${wrappedX}/${y}.png"
            onerror="this.onerror=null;this.src='https://tile.openstreetmap.org/${sourceZoom}/${wrappedX}/${y}.png';"
            style="left:${(x * tileSize - view.center.x) * scale + screenCenter.x}px; top:${(y * tileSize - view.center.y) * scale + screenCenter.y}px; width:${tileSize * scale}px; height:${tileSize * scale}px;"
          >
        `);
      }
    }

    const pathMarkup = Object.entries(segments)
      .map(([key, segment]) => {
        const curve = getRouteCurve(segment);
        const d = `M ${curve.from.x} ${curve.from.y} Q ${curve.control.x} ${curve.control.y} ${curve.to.x} ${curve.to.y}`;
        return `
          <path class="osm-flight-hit" data-path-hit="${key}" d="${d}" />
          <path class="osm-flight-path ${segment.direction}" data-path="${key}" d="${d}" />
        `;
      })
      .join("");

    const tetherMarkup = Object.entries(locations)
      .filter(([key]) => key !== "icn-return")
      .map(([key, location]) => {
        const { point, placed } = getMarkerPlacement(key, location);
        return `<path class="airport-callout-line ${location.tone}" data-tether="${key}" d="M ${point.x} ${point.y} L ${placed.x} ${placed.y}" />`;
      })
      .join("");

    const planeMarkup = Object.entries(segments)
      .map(([key, segment]) => {
        const curve = getRouteCurve(segment);
        const t = segment.planeT || (segment.direction === "outbound" ? 0.64 : 0.42);
        const point = pointOnCurve(curve, t);
        const next = pointOnCurve(curve, Math.min(0.98, t + 0.025));
        const angle = (Math.atan2(next.y - point.y, next.x - point.x) * 180) / Math.PI;
        return `
          <span
            class="flight-plane ${segment.direction}"
            data-flight-plane="${key}"
            style="left:${point.x}px; top:${point.y}px; transform: translate(-50%, -50%) rotate(${angle}deg);"
          >&#9992;</span>
        `;
      })
      .join("");

    const dotMarkup = Object.entries(locations)
      .filter(([key]) => key !== "icn-return")
      .map(([key, location]) => {
        const point = toScreen(location);
        return `
          <span
            class="airport-map-dot ${location.tone}"
            data-map-dot="${key}"
            style="left:${point.x}px; top:${point.y}px;"
          ></span>
        `;
      })
      .join("");

    const markerMarkup = Object.entries(locations)
      .filter(([key]) => key !== "icn-return")
      .map(([key, location]) => {
        const { placed } = getMarkerPlacement(key, location);
        const label = location.mapLabel || location.label;
        return `
          <button
            class="airport-map-marker ${location.tone}"
            type="button"
            data-map-location="${key}"
            aria-label="${escapeHtml(location.code)} ${escapeHtml(label)}"
            aria-pressed="false"
            style="left:${placed.x}px; top:${placed.y}px;"
          >
            <span class="code">${escapeHtml(location.code)}</span>
            <span>${escapeHtml(label)}</span>
          </button>
        `;
      })
      .join("");

    const labelMarkup = Object.entries(segments)
      .map(([key, segment]) => {
        const curve = getRouteCurve(segment);
        const point = pointOnCurve(curve, segment.labelT || 0.5);
        const offset = (isCompact && segment.mobileOffset) || segment.offset || { x: 0, y: 0 };
        const placed = placeOverlayItem(point.x + offset.x, point.y + offset.y, 36, safeTop, labelSafeBottom);
        return `
          <button
            class="flight-map-label ${segment.direction}"
            type="button"
            data-map-segment="${key}"
            aria-label="${escapeHtml(segment.label)} ${escapeHtml(segment.duration)}"
            aria-pressed="false"
            style="left:${placed.x}px; top:${placed.y}px;"
          >
            <span>${escapeHtml(segment.label)}</span>
            <strong>${escapeHtml(segment.duration)}</strong>
          </button>
        `;
      })
      .join("");

    const focused = mapNode.contains(document.activeElement) ? document.activeElement : null;
    const focusSelector = focused?.dataset?.mapZoom
      ? `[data-map-zoom="${focused.dataset.mapZoom}"]`
      : focused?.dataset?.mapLocation
        ? `[data-map-location="${focused.dataset.mapLocation}"]`
        : focused?.dataset?.mapSegment
          ? `[data-map-segment="${focused.dataset.mapSegment}"]`
          : focused?.hasAttribute("data-map-reset")
            ? "[data-map-reset]"
            : null;

    mapNode.innerHTML = `
      <div class="osm-tile-stage">
        ${tileImages.join("")}
      </div>
      <svg class="osm-route-overlay" viewBox="0 0 ${width} ${height}" aria-hidden="true">
        ${tetherMarkup}
        ${pathMarkup}
      </svg>
      <div class="osm-control-layer">
        ${dotMarkup}
        ${planeMarkup}
        ${markerMarkup}
        ${labelMarkup}
      </div>
      <div class="osm-zoom-controls" aria-label="Map zoom controls">
        <button type="button" data-map-zoom="in" aria-label="Zoom in">+</button>
        <button type="button" data-map-zoom="out" aria-label="Zoom out">-</button>
        <button type="button" data-map-reset aria-label="Reset map view">Reset</button>
      </div>
      <div class="osm-map-tools" aria-hidden="true">
        <span class="map-drag-hint">Drag map to explore</span>
      </div>
    `;

    markerButtons = new Map(
      Array.from(mapNode.querySelectorAll("[data-map-location]")).map((button) => [
        button.dataset.mapLocation,
        button,
      ])
    );
    segmentButtons = new Map(
      Array.from(mapNode.querySelectorAll("[data-map-segment]")).map((button) => [
        button.dataset.mapSegment,
        button,
      ])
    );
    routePaths = new Map(
      Array.from(mapNode.querySelectorAll("[data-path]")).map((path) => [path.dataset.path, path])
    );

    markerButtons.forEach((button, key) => {
      button.addEventListener("click", () => selectLocation(key));
    });
    segmentButtons.forEach((button, key) => {
      button.addEventListener("click", () => selectSegment(key));
    });
    routePaths.forEach((path, key) => {
      path.addEventListener("click", () => selectSegment(key));
    });
    mapNode.querySelectorAll("[data-path-hit]").forEach((path) => {
      path.addEventListener("click", () => selectSegment(path.dataset.pathHit));
    });

    mapNode.querySelector('[data-map-zoom="in"]')?.addEventListener("click", () => zoomAt(1.32));
    mapNode.querySelector('[data-map-zoom="out"]')?.addEventListener("click", () => zoomAt(1 / 1.32));
    mapNode.querySelector("[data-map-reset]")?.addEventListener("click", resetView);
    setActive(active.kind, active.key);

    if (focusSelector) {
      mapNode.querySelector(focusSelector)?.focus({ preventScroll: true });
    }
  };

  const scheduleRender = () => {
    if (renderFrame) {
      return;
    }
    renderFrame = requestAnimationFrame(() => {
      renderFrame = 0;
      renderMap();
    });
  };

  const zoomAt = (factor, clientPoint) => {
    const { width, scale: oldScale, screenCenter: oldScreenCenter } = getMetrics();
    const rect = mapNode.getBoundingClientRect();
    const localX = clientPoint ? clientPoint.x - rect.left : oldScreenCenter.x;
    const localY = clientPoint ? clientPoint.y - rect.top : oldScreenCenter.y;
    const worldX = view.center.x + (localX - oldScreenCenter.x) / oldScale;
    const worldY = view.center.y + (localY - oldScreenCenter.y) / oldScale;

    view.zoom = clamp(view.zoom * factor, zoomLimits.min, zoomLimits.max);
    const { scale: newScale, screenCenter: newScreenCenter } = getMetrics();
    view.center.x = worldX - (localX - newScreenCenter.x) / newScale;
    view.center.y = worldY - (localY - newScreenCenter.y) / newScale;
    scheduleRender();
  };

  const resetView = () => {
    view.center = { ...initialCenter };
    view.zoom = 1;
    scheduleRender();
  };

  let dragState = null;
  mapNode.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) {
      return;
    }
    const { scale } = getMetrics();
    const pathTarget = event.target.closest?.("[data-path-hit], [data-path]");
    dragState = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      centerX: view.center.x,
      centerY: view.center.y,
      scale,
      moved: false,
      pathKey: pathTarget?.dataset.pathHit || pathTarget?.dataset.path || null,
    };
    mapNode.classList.add("is-dragging");
    mapNode.setPointerCapture(event.pointerId);
  });

  mapNode.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.id !== event.pointerId) {
      return;
    }
    if (Math.hypot(event.clientX - dragState.x, event.clientY - dragState.y) > 4) {
      dragState.moved = true;
    }
    view.center.x = dragState.centerX - (event.clientX - dragState.x) / dragState.scale;
    view.center.y = dragState.centerY - (event.clientY - dragState.y) / dragState.scale;
    scheduleRender();
  });

  const stopDrag = (event) => {
    if (!dragState || dragState.id !== event.pointerId) {
      return;
    }
    const pathKey = dragState.pathKey;
    const moved = dragState.moved;
    mapNode.classList.remove("is-dragging");
    dragState = null;
    if (pathKey && !moved) {
      selectSegment(pathKey);
    }
  };

  mapNode.addEventListener("pointerup", stopDrag);
  mapNode.addEventListener("pointercancel", stopDrag);
  mapNode.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomAt(event.deltaY < 0 ? 1.18 : 1 / 1.18, { x: event.clientX, y: event.clientY });
    },
    { passive: false }
  );

  mapNode.addEventListener("click", (event) => {
    const pathTarget = event.target.closest?.("[data-path-hit], [data-path]");
    if (!pathTarget) {
      return;
    }

    const segmentKey = pathTarget.dataset.pathHit || pathTarget.dataset.path;
    if (segmentKey) {
      selectSegment(segmentKey);
    }
  });

  renderMap();
  renderDetail(routeData.locations.dps, "dps");

  if (window.location.hash === "#route") {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.closest("#route")?.scrollIntoView({ block: "start" });
      });
    });
  }

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleRender);
    observer.observe(mapNode);
  }

  detail.addEventListener("animationend", () => {
    detail.classList.remove("is-changing");
  });
})();
