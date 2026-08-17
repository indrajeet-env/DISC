import { useEffect, useState } from "react";
import { Bot, Send, X, Sparkles, Trash2 } from "lucide-react";
import { askProcurementAssistant } from "../services/api";
import { authService } from "../services/authService";

import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from "../utils/chatStorage";


const initialMessage = {
  role: "assistant",
  content:
    "Hi! I can help you with procurement decisions, drug associations and ordering recommendations.",
};

export default function ProcurementAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState(() => {
    const saved = loadChatHistory();

    if (saved.length > 0) {
      return saved;
    }

    return [initialMessage];
  });

  // Save conversation whenever messages change.
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const sendMessage = async (text = message) => {
    const question = text.trim();

    if (!question || loading) {
      return;
    }

    // Keep the previous conversation for conversational memory.
    const previousHistory = messages
      .filter(
        (item) =>
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
      )
      .slice(-10);

    // Add user's message immediately.
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: question,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const session = await authService.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Please sign in again to use the procurement assistant."
        );
      }

      const answer = await askProcurementAssistant(
        question,
        session.access_token,
        previousHistory
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error.message ||
            "Unable to answer that question right now.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
    setMessages([initialMessage]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <section className="mb-4 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2 text-blue-300">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold">
                  Procurement Assistant
                </h2>

                <p className="text-xs text-slate-300">
                  AI procurement intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear chat */}
              <button
                type="button"
                onClick={handleClearChat}
                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-red-400"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Close chatbot */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Close assistant"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {/* Starter questions */}
            {messages.length === 1 &&
              messages[0].role === "assistant" && (
                <div className="space-y-3">
                  <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                    Ask about procurement patterns, drug associations,
                    reorder decisions or purchasing recommendations.
                  </p>

                  {/* {starters.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => sendMessage(starter)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                    >
                      {starter}
                    </button>
                  ))} */}
                </div>
              )}

            {/* Conversation */}
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-sm leading-6 ${
                  item.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : item.error
                      ? "border border-red-100 bg-red-50 text-red-700"
                      : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {item.content}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="w-fit rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                Thinking…
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={2000}
              placeholder="Ask a procurement question…"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="rounded-xl bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      {/* Open chatbot */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-bold text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        <Sparkles className="h-5 w-5" />
        Ask Procurement AI
      </button>
    </div>
  );
}