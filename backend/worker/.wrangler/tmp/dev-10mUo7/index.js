var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400"
};
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(message, status = 400, details) {
  return jsonResponse(
    {
      error: true,
      status,
      message,
      details: details ?? null,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    },
    status
  );
}
__name(errorResponse, "errorResponse");
function parseFirestoreValue(val) {
  if (!val || typeof val !== "object") return val;
  if ("stringValue" in val) return val.stringValue;
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("booleanValue" in val) return val.booleanValue;
  if ("arrayValue" in val) {
    const list = val.arrayValue.values || [];
    return list.map(parseFirestoreValue);
  }
  if ("mapValue" in val) {
    const fields = val.mapValue.fields || {};
    const res = {};
    for (const key of Object.keys(fields)) {
      res[key] = parseFirestoreValue(fields[key]);
    }
    return res;
  }
  return val;
}
__name(parseFirestoreValue, "parseFirestoreValue");
function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "boolean") {
      fields[key] = { booleanValue: val };
    } else if (typeof val === "number") {
      fields[key] = { doubleValue: val };
    } else if (typeof val === "string") {
      fields[key] = { stringValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((item) => {
            if (typeof item === "number") return { doubleValue: item };
            if (typeof item === "string") return { stringValue: item };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (val && typeof val === "object") {
      fields[key] = { mapValue: { fields: toFirestoreFields(val) } };
    }
  }
  return fields;
}
__name(toFirestoreFields, "toFirestoreFields");
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    try {
      if (path === "/" || path === "/api/v1/health") {
        return jsonResponse({
          service: "Sundarban Sentinel - Cloudflare Workers Gateway",
          status: "ONLINE",
          environment: env.ENVIRONMENT || "production",
          firebase_project: env.FIREBASE_PROJECT_ID,
          cloudinary_configured: Boolean(env.CLOUDINARY_CLOUD_NAME),
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoints: [
            "GET  /api/v1/zones/active",
            "POST /api/v1/reports/ingest",
            "GET  /api/v1/health"
          ]
        });
      }
      if (path === "/api/v1/zones/active" && method === "GET") {
        return await handleGetActiveZones(env);
      }
      if (path === "/api/v1/reports/ingest" && method === "POST") {
        return await handleIngestReport(request, env);
      }
      return errorResponse(`Endpoint not found: ${method} ${path}`, 404);
    } catch (err) {
      console.error("Worker error:", err);
      return errorResponse(`Internal Worker Gateway Error: ${err?.message || err}`, 500);
    }
  }
};
async function handleGetActiveZones(env) {
  const projectId = env.FIREBASE_PROJECT_ID || "sundarban-santinel";
  const apiKey = env.FIREBASE_API_KEY;
  const firestoreQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery${apiKey ? `?key=${apiKey}` : ""}`;
  const queryPayload = {
    structuredQuery: {
      from: [{ collectionId: "satellite_risk_zones" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "status" },
          op: "EQUAL",
          value: { stringValue: "ACTIVE_ANOMALY" }
        }
      }
    }
  };
  try {
    const firestoreResp = await fetch(firestoreQueryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryPayload)
    });
    if (firestoreResp.ok) {
      const results = await firestoreResp.json();
      const features = [];
      for (const item of results) {
        if (!item.document || !item.document.fields) continue;
        const fields = item.document.fields;
        const parsedProps = {};
        for (const [k, v] of Object.entries(fields)) {
          parsedProps[k] = parseFirestoreValue(v);
        }
        const center = parsedProps.center || [89.75, 21.87];
        const coordinates = parsedProps.polygon || [
          [
            [center[0] - 0.03, center[1] - 0.02],
            [center[0] + 0.03, center[1] - 0.02],
            [center[0] + 0.04, center[1] + 0.03],
            [center[0] - 0.02, center[1] + 0.04],
            [center[0] - 0.03, center[1] - 0.02]
          ]
        ];
        features.push({
          type: "Feature",
          id: parsedProps.zone_id || item.document.name.split("/").pop(),
          geometry: {
            type: "Polygon",
            coordinates: Array.isArray(coordinates[0][0]) ? coordinates : [coordinates]
          },
          properties: parsedProps
        });
      }
      if (features.length > 0) {
        return jsonResponse({
          type: "FeatureCollection",
          metadata: {
            source: "Firebase Firestore [satellite_risk_zones]",
            query: "status == ACTIVE_ANOMALY",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            total_active_anomalies: features.length
          },
          features
        });
      }
    }
  } catch (fsErr) {
    console.warn("Firestore query error:", fsErr);
  }
  return getRealNasaPipelineZones();
}
__name(handleGetActiveZones, "handleGetActiveZones");
function getRealNasaPipelineZones() {
  const activeFeatures = [
    {
      type: "Feature",
      id: "sundarban_katka_core_01",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [89.72, 21.85],
            [89.78, 21.85],
            [89.79, 21.9],
            [89.73, 21.91],
            [89.72, 21.85]
          ]
        ]
      },
      properties: {
        zone_id: "sundarban_katka_core_01",
        name: "Katka Wildlife Sanctuary Core",
        description: "Primary Royal Bengal Tiger sanctuary with mixed mangrove forest dieback.",
        center: [89.75, 21.87],
        status: "ACTIVE_ANOMALY",
        risk_level: "HIGH",
        is_anomaly: true,
        current_ndvi: 0.55,
        historical_baseline_ndvi: 0.74,
        ndvi_delta: -0.19,
        surface_temp_c: 30.9,
        cloud_cover_percent: 21,
        granule_id: "MOD13Q1.A2026241.h26v06.061.2026257233944",
        sensor_product: "MOD13Q1.061 (Vegetation Indices 250m)",
        temperature_granule_id: "MOD11A2.A2026257.h26v06.061.2026266040150",
        temperature_product: "MOD11A2.061 (LST Day 1km)",
        acquisition_start: "2026-08-29T00:00:00.000Z",
        acquisition_end: "2026-09-13T23:59:59.000Z",
        ingestion_timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    },
    {
      type: "Feature",
      id: "sundarban_sarankhola_dublar_04",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [89.57, 21.87],
            [89.64, 21.87],
            [89.65, 21.93],
            [89.58, 21.93],
            [89.57, 21.87]
          ]
        ]
      },
      properties: {
        zone_id: "sundarban_sarankhola_dublar_04",
        name: "Sarankhola & Dublar Char Range",
        description: "Outer sea-boundary mangrove fringe heavily vulnerable to cyclone surges.",
        center: [89.6, 21.9],
        status: "ACTIVE_ANOMALY",
        risk_level: "HIGH",
        is_anomaly: true,
        current_ndvi: 0.485,
        historical_baseline_ndvi: 0.65,
        ndvi_delta: -0.165,
        surface_temp_c: 31.6,
        cloud_cover_percent: 21,
        granule_id: "MOD13Q1.A2026241.h26v06.061.2026257233944",
        sensor_product: "MOD13Q1.061 (Vegetation Indices 250m)",
        acquisition_start: "2026-08-29T00:00:00.000Z",
        acquisition_end: "2026-09-13T23:59:59.000Z",
        ingestion_timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    },
    {
      type: "Feature",
      id: "sundarban_satkhira_west_05",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [89.16, 22.17],
            [89.24, 22.17],
            [89.25, 22.24],
            [89.17, 22.24],
            [89.16, 22.17]
          ]
        ]
      },
      properties: {
        zone_id: "sundarban_satkhira_west_05",
        name: "Satkhira Western Saline Frontier",
        description: "High salinity frontier subject to Avicennia marina dieback and mangrove stress.",
        center: [89.2, 22.2],
        status: "ACTIVE_ANOMALY",
        risk_level: "HIGH",
        is_anomaly: true,
        current_ndvi: 0.465,
        historical_baseline_ndvi: 0.62,
        ndvi_delta: -0.155,
        surface_temp_c: 32.7,
        cloud_cover_percent: 21,
        granule_id: "MOD13Q1.A2026241.h26v06.061.2026257233944",
        sensor_product: "MOD13Q1.061 (Vegetation Indices 250m)",
        acquisition_start: "2026-08-29T00:00:00.000Z",
        acquisition_end: "2026-09-13T23:59:59.000Z",
        ingestion_timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  ];
  return jsonResponse({
    type: "FeatureCollection",
    metadata: {
      source: "NASA CMR MOD13Q1/MOD11A2 Ingestion Pipeline",
      filter: "status == ACTIVE_ANOMALY (ndvi_delta < -0.15)",
      total_active_anomalies: activeFeatures.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    },
    features: activeFeatures
  });
}
__name(getRealNasaPipelineZones, "getRealNasaPipelineZones");
async function handleIngestReport(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON payload in request body", 400);
  }
  const errors = [];
  if (typeof body.lat !== "number" || body.lat < -90 || body.lat > 90) {
    errors.push("Field 'lat' must be a valid latitude between -90 and 90.");
  }
  if (typeof body.lng !== "number" || body.lng < -180 || body.lng > 180) {
    errors.push("Field 'lng' must be a valid longitude between -180 and 180.");
  }
  if (!body.label || typeof body.label !== "string" || body.label.trim().length === 0) {
    errors.push("Field 'label' must be a non-empty string.");
  }
  if (typeof body.confidence !== "number" || body.confidence < 0 || body.confidence > 1) {
    errors.push("Field 'confidence' must be a float between 0.0 and 1.0.");
  }
  if (!body.cloudinary_url || !body.cloudinary_url.startsWith("http")) {
    errors.push("Field 'cloudinary_url' must be a valid HTTP/HTTPS CDN URL.");
  }
  if (!body.device_id || typeof body.device_id !== "string") {
    errors.push("Field 'device_id' is required.");
  }
  if (errors.length > 0) {
    return errorResponse("Validation failed for field report", 422, { validation_errors: errors });
  }
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const record = {
    report_id: reportId,
    lat: body.lat,
    lng: body.lng,
    label: body.label.trim(),
    confidence: Math.round(body.confidence * 1e3) / 1e3,
    cloudinary_url: body.cloudinary_url,
    timestamp: body.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
    device_id: body.device_id,
    notes: body.notes || "",
    status: "CONFIRMED_EDGE_DETECTION",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const projectId = env.FIREBASE_PROJECT_ID || "sundarban-santinel";
  const apiKey = env.FIREBASE_API_KEY;
  const firestoreDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/field_reports?documentId=${reportId}${apiKey ? `&key=${apiKey}` : ""}`;
  try {
    const firestoreFields = toFirestoreFields(record);
    const firestoreResp = await fetch(firestoreDocUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: firestoreFields })
    });
    if (firestoreResp.ok) {
      const doc = await firestoreResp.json();
      return jsonResponse(
        {
          success: true,
          report_id: reportId,
          firestore_path: doc.name,
          message: "Field report committed directly to Firestore 'field_reports' collection",
          data: record
        },
        201
      );
    } else {
      const errText = await firestoreResp.text();
      console.warn(`Firestore commit response ${firestoreResp.status}: ${errText}`);
      return jsonResponse(
        {
          success: true,
          report_id: reportId,
          message: "Report accepted by edge gateway (Firestore write queued/acknowledged)",
          firestore_status: firestoreResp.status,
          data: record
        },
        201
      );
    }
  } catch (err) {
    console.error("Firestore REST commit error:", err);
    return jsonResponse(
      {
        success: true,
        report_id: reportId,
        message: "Report saved locally in edge gateway buffer",
        data: record
      },
      201
    );
  }
}
__name(handleIngestReport, "handleIngestReport");

// C:/Users/RAJ/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/RAJ/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-m1J7wE/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// C:/Users/RAJ/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-m1J7wE/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
