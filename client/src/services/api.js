const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export const getDashboard = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard`);

    if (!response.ok) {
      throw new Error("Unable to connect to the supply-chain backend.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Unable to connect to the supply-chain backend.");
  }
};

export const getDashboardData = async () => {
  const response = await fetch(`${API_BASE}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  const data = await response.json();
  return data.data;
};

export const getAlerts = async () => {
  const response = await fetch(`${API_BASE}/alerts`);
  if (!response.ok) throw new Error('Failed to fetch alerts');
  const data = await response.json();
  return data.data;
};

// Drugs API
export const getDrugs = async () => {
  const response = await fetch(`${API_BASE}/drugs`);
  if (!response.ok) throw new Error('Failed to fetch drugs');
  const data = await response.json();
  return data.data; // Return the inner data array
};

export const getDrug = async (id) => {
  const response = await fetch(`${API_BASE}/drugs/${id}`);
  if (!response.ok) throw new Error('Failed to fetch drug');
  const data = await response.json();
  return data.data;
};

export const createDrug = async (drugData) => {
  const response = await fetch(`${API_BASE}/drugs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(drugData),
  });
  if (!response.ok) throw new Error('Failed to create drug');
  const data = await response.json();
  return data.data;
};

export const updateDrug = async (id, drugData) => {
  const response = await fetch(`${API_BASE}/drugs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(drugData),
  });
  if (!response.ok) throw new Error('Failed to update drug');
  const data = await response.json();
  return data.data;
};

export const deleteDrug = async (id) => {
  const response = await fetch(`${API_BASE}/drugs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete drug');
  return true;
};

// Shipments API
export const getShipments = async () => {
  const response = await fetch(`${API_BASE}/shipments`);
  if (!response.ok) throw new Error('Failed to fetch shipments');
  const data = await response.json();
  return data.data;
};

export const getShipment = async (id) => {
  const response = await fetch(`${API_BASE}/shipments/${id}`);
  if (!response.ok) throw new Error('Failed to fetch shipment');
  const data = await response.json();
  return data.data;
};

export const createShipment = async (shipmentData) => {
  const response = await fetch(`${API_BASE}/shipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipmentData),
  });
  if (!response.ok) throw new Error('Failed to create shipment');
  const data = await response.json();
  return data.data;
};

export const updateShipment = async (id, shipmentData) => {
  const response = await fetch(`${API_BASE}/shipments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipmentData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to update shipment');
  }
  const data = await response.json();
  return data.data;
};

export const deleteShipment = async (id) => {
  const response = await fetch(`${API_BASE}/shipments/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete shipment');
  return true;
};

// Vendors API

export const getVendors = async () => {
  const response = await fetch(`${API_BASE}/vendors`);
  if (!response.ok) throw new Error('Failed to fetch vendors');
  const data = await response.json();
  return data.data;
};

export const getVendor = async (id) => {
  const response = await fetch(`${API_BASE}/vendors/${id}`);
  if (!response.ok) throw new Error('Failed to fetch vendor');
  const data = await response.json();
  return data.data;
};

// Shipment Requests API
export const getShipmentRequests = async () => {
  const { authService } = await import("./authService");
  const session = await authService.getSession();
  const headers = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const response = await fetch(`${API_BASE}/shipment-requests`, { headers });
  if (!response.ok) throw new Error('Failed to fetch shipment requests');
  const data = await response.json();
  return data.data;
};

export const createShipmentRequest = async (requestData) => {
  const { authService } = await import("./authService");
  const session = await authService.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const response = await fetch(`${API_BASE}/shipment-requests`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to create shipment request');
  }
  const data = await response.json();
  return data.data;
};

export const updateShipmentRequest = async (id, requestData) => {
  const { authService } = await import("./authService");
  const session = await authService.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const response = await fetch(`${API_BASE}/shipment-requests/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(requestData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to update shipment request');
  }
  const data = await response.json();
  return data.data;
};

export const askProcurementAssistant = async (message, accessToken, history = []) => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message, history }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Unable to reach the procurement assistant.');
  return data.data.answer;
};
