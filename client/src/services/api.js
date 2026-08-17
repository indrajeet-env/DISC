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