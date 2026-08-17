const STORAGE_KEY = "disc_procurement_chat";

export const loadChatHistory = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
};

export const saveChatHistory = (messages) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear chat history:", error);
  }
};