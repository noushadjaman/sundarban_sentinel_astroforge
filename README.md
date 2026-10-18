# Sundarban Sentinel (100% Production Pipeline - Zero Mock Data)

Sundarban Sentinel is an end-to-end, zero-mock production distributed system that integrates live **NASA Earthdata** satellite feeds, **Firebase Firestore**, a **Cloudflare Workers** edge gateway, and an offline-first **Flutter** mobile client running on-device **TensorFlow Lite (TFLite)** inference for mangrove conservation and anti-poaching operations.

---

## Architecture Overview

```
                                  +-----------------------------+
                                  |   NASA Earthdata LP DAAC    |
                                  | CMR Search API (MOD13Q1/11) |
                                  +--------------+--------------+
                                                 | Bearer Token Auth
                                                 v
                                  +-----------------------------+
                                  | Python Ingestion Pipeline   |
                                  | (NDVI Delta & Anomaly Engine|
                                  +-------+--------------+------+
                                          |              |
                      Direct Ingest / REST|              | GeoJSON Mirror
                                          v              v
+--------------------------+       +--------------+  +--------------------------+
|  Cloudinary Media CDN    |<------|   Firebase   |  | Cloudflare Workers       |
|  Unsigned Preset Upload  |       |  Firestore   |<-| Gateway (TypeScript)     |
+------------+-------------+       +--------------+  +------------+-------------+
             ^                                                    |
             | Upload Capture                        GeoJSON Zones| Ingest Report
             |                                                    v
+------------+----------------------------------------------------+-------------+
|                               Flutter Edge Client                             |
|  * TFLite 640x640x3 Engine (IoU 0.45, Conf 0.55)                              |
|  * Hive Offline Persistence (`reports_box`)                                   |
|  * Background Auto-Sync on Network Reconnect                                  |
|  * FlutterMap with Live GPS and NASA Risk Polygons                            |
+-------------------------------------------------------------------------------+
```

---

## 1. NASA Earthdata Ingestion Pipeline (`/backend/nasa_pipeline`)

The ingestion pipeline queries real-time NASA Common Metadata Repository (CMR) search endpoints for MODIS products over the Sundarbans Biosphere Reserve.

### Queried Collections:
1. **MOD13Q1.061**: Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid.
2. **MOD11A2.061**: Terra Land Surface Temperature and Emissivity 8-Day L3 Global 1km.

### Spatial Bounds (Sundarbans):
`89.00, 21.50, 89.95, 22.50` (Longitudes 89.00°E to 89.95°E, Latitudes 21.50°N to 22.50°N).

### Anomaly Logic:
$$\text{NDVI Delta} = \text{Current NDVI} - \text{Historical Baseline NDVI}$$
$$\text{Active Anomaly} = \text{NDVI Delta} < -0.15$$

### Setup & Execution:
1. Navigate to `/backend/nasa_pipeline`:
   ```bash
   cd backend/nasa_pipeline
   ```
2. Install Python requirements:
   ```bash
   py -m pip install -r requirements.txt
   ```
3. Verify or edit `.env`:
   ```env
   EARTHDATA_TOKEN=<your_earthdata_bearer_token>
   FIREBASE_PROJECT_ID=sundarban-santinel
   FIREBASE_API_KEY=AIzaSyATp6EqT2rteEQ9Xuo2NmWH2bSTz5_qgX4
   FIREBASE_SERVICE_ACCOUNT_PATH=service.json
   SUNDARBAN_BBOX=89.00,21.50,89.95,22.50
   NDVI_ANOMALY_THRESHOLD=-0.15
   ```
4. Run the ingestion pipeline:
   ```bash
   py nasa_ingestor.py
   ```
   Or double-click `run_pipeline.bat` on Windows.

Outputs generated:
- `satellite_risk_zones.geojson`: Valid GeoJSON FeatureCollection with real coordinates and calculated NDVI metrics.
- Firestore synchronization into collection `satellite_risk_zones`.

---

## 2. Cloudflare Workers Gateway (`/backend/worker`)

The Cloudflare Worker functions as a low-latency proxy connecting the mobile edge to Firestore and providing strict CORS handling.

### Live Production Gateway:
**`https://sundarban-sentinel-gateway.sundarban-sentinel.workers.dev`**

### Endpoints:
- `GET /api/v1/zones/active`: Authenticates with Firestore REST API, executes structured queries for `status == "ACTIVE_ANOMALY"`, and returns a GeoJSON `FeatureCollection`.
- `POST /api/v1/reports/ingest`: Accepts edge captures (`lat`, `lng`, `label`, `confidence`, `cloudinary_url`, `timestamp`, `device_id`), validates inputs, and commits to Firestore `field_reports`.
- `GET /api/v1/health`: Returns distributed pipeline health and environment status.

### Running Locally:
```bash
cd backend/worker
npx wrangler dev --port 8787
```

### Deploying to Cloudflare:
```bash
npx wrangler deploy
```

---

## 3. Media CDN Pipeline (Cloudinary)

Edge captures are uploaded directly from the client to Cloudinary without overloading backend servers:
- **Cloud Name**: `dsnb5jiht`
- **Upload Preset**: `sundarban_santinel` (Unsigned mode)
- **Direct Upload URL**: `https://api.cloudinary.com/v1_1/dsnb5jiht/image/upload`

---

## 4. Flutter Edge Application (`/mobile`)

### Features:
1. **On-Device TFLite Engine (`ClassifierService`)**:
   - Image resizing to $640 \times 640 \times 3$.
   - Normalization to $[-1.0, 1.0]$.
   - Non-Maximum Suppression (NMS) with IoU threshold 0.45 and Confidence threshold 0.55.
   - Maps bounding boxes $[ymin, xmin, ymax, xmax]$ to loaded `assets/models/labels.txt`.
2. **Offline Cache & Sync Engine (`SyncService`)**:
   - Hive local storage (`reports_box`).
   - Image binary cached locally on disk.
   - Network change listener via `connectivity_plus`.
   - On network reconnect:
     1. Uploads binary image to Cloudinary CDN.
     2. Posts incident JSON payload to `/api/v1/reports/ingest`.
     3. Marks local record `isSynced = true`.
3. **Field Ranger Map (`RangerMapScreen`)**:
   - `flutter_map` with satellite / topographic raster tile switching.
   - Renders active NASA anomaly polygons with danger/warning glows.
   - Live GPS tracking of the ranger via `geolocator`.
   - Tap-to-inspect modal displaying real NASA metadata (Granule ID, sensor product, 16-day cycle dates, surface temperature, NDVI metrics).

### Running the Mobile Client:
```bash
cd mobile
flutter pub get
flutter run
```

---

## 5. Developer Credentials Guide

### How to Generate NASA Earthdata Bearer Token:
1. Register for a free account at [NASA Earthdata Login (URS)](https://urs.earthdata.nasa.gov/).
2. Log in and navigate to **Profile** -> **Generate Token**.
3. Copy the token and paste it into `backend/nasa_pipeline/.env` as `EARTHDATA_TOKEN`.

### How to Generate Firebase Service Account Key:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Open project **sundarban-santinel**.
3. Ensure Cloud Firestore is enabled by clicking **Firestore Database** -> **Create Database**.
4. Go to **Project Settings** (gear icon) -> **Service accounts**.
5. Click **Generate new private key** and download the JSON file.
6. Rename the file to `service.json` and place it in `backend/nasa_pipeline/service.json` (or set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`).

# sundarban_sentinel_astroforge
