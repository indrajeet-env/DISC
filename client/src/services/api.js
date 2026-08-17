export const getDashboard = async () => {
  try {
    const response = await fetch('http://localhost:5050/api/dashboard');
    if (!response.ok) {
      throw new Error('Unable to connect to the supply-chain backend.');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Unable to connect to the supply-chain backend.');
  }
};

const API_BASE = 'http://localhost:5050/api';

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