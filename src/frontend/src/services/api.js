const API_BASE = '/api';

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend unavailable. Please ensure the server is running on port 8000.');
    }
    throw err;
  }
}

// ── Dashboard ────────────────────────────────────────────────────────
export const fetchDashboard = () => request('/dashboard');

// ── Shipments ────────────────────────────────────────────────────────
export const fetchShipments = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/shipments${q ? `?${q}` : ''}`);
};
export const fetchShipment = (id) => request(`/shipments/${id}`);

// ── Disruptions ──────────────────────────────────────────────────────
export const fetchDisruptions = () => request('/disruptions');
export const fetchDisruption = (id) => request(`/disruptions/${id}`);
export const simulateDisruption = () => request('/disruptions/simulate', { method: 'POST' });
export const resetSimulation = () => request('/disruptions/reset', { method: 'POST' });

// ── Fleet ────────────────────────────────────────────────────────────
export const fetchFleet = () => request('/fleet');
export const fetchFleetRecommendations = (shipmentId) => request(`/fleet/recommendations/${shipmentId}`);

// ── Cold Chain ───────────────────────────────────────────────────────
export const fetchColdChain = () => request('/cold-chain');
export const fetchColdChainDetail = (shipmentId) => request(`/cold-chain/${shipmentId}`);

// ── Risk ─────────────────────────────────────────────────────────────
export const fetchRiskSummary = () => request('/risk/summary');

// ── AI Copilot ───────────────────────────────────────────────────────
export const askCopilot = (query) => request('/ai/copilot', {
  method: 'POST',
  body: JSON.stringify({ query }),
});

// ── Health ────────────────────────────────────────────────────────────
export const checkHealth = () => request('/health');
