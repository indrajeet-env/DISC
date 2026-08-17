import { searchProcurementCorpus } from "./procurementCorpusService.js";

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const MODEL = "openai/gpt-oss-120b";

const MAX_GROQ_ATTEMPTS = 2;

const systemPrompt = `You are DISC's hospital procurement assistant.

Give SHORT, practical answers.

Rules:
- Recommend at most 3 items.
- Use bullet points.
- Give ONE short reason for each recommendation.
- Include association percentages only when useful.
- Include quantity ranges only when useful.
- Maximum 100 words.
- Do not repeat the user's question.
- Do not write long introductions or conclusions.
- Do not use tables.
- Do not invent data.
- Use only the supplied synthetic procurement corpus.
- If the corpus does not contain enough information, say so briefly.
- Historical procurement data is synthetic demonstration data.

Example:

• Normal Saline 500ml — associated with Ceftriaxone in ~72% of historical baskets.
• 5ml Syringes — associated in ~64% of baskets.
• IV Cannula — associated in ~58% of baskets.

These patterns come from synthetic procurement data.`;

const requestGroq = async (messages) => {
  for (
    let attempt = 0;
    attempt < MAX_GROQ_ATTEMPTS;
    attempt += 1
  ) {
    const response = await fetch(GROQ_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },

      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        max_completion_tokens: 220,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      return data.choices?.[0]?.message;
    }

    const details = await response.text();

    const retryAfter = Number(
      details.match(/try again in ([\d.]+)s/i)?.[1] ||
        response.headers.get("retry-after")
    );

    if (
      response.status === 429 &&
      attempt + 1 < MAX_GROQ_ATTEMPTS &&
      Number.isFinite(retryAfter)
    ) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(
            Math.ceil(retryAfter * 1000) + 250,
            30000
          )
        )
      );

      continue;
    }

    console.error("=== GROQ ERROR ===");
    console.error("Status:", response.status);
    console.error("Response:", details);

    throw new Error(
      `Groq request failed (${response.status}): ${details.slice(
        0,
        1000
      )}`
    );
  }

  throw new Error(
    "Groq request failed after retrying"
  );
};

export const answerProcurementQuestion = async ({
  message,
  history = [],
}) => {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error(
      "Procurement assistant is not configured"
    );

    error.status = 503;

    throw error;
  }

  // Find relevant sections from the local synthetic corpus.
  const corpusResults =
    await searchProcurementCorpus(message);

  const corpusContext = corpusResults.length
    ? corpusResults.join("\n\n---\n\n")
    : "No relevant synthetic procurement knowledge was found.";

  // Only send valid conversational messages to Groq.
  const cleanHistory = history
    .filter(
      (item) =>
        item &&
        (item.role === "user" ||
          item.role === "assistant") &&
        typeof item.content === "string"
    )
    .slice(-10);

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },

    ...cleanHistory,

    {
      role: "user",
      content: `Relevant procurement knowledge:

${corpusContext}

User question:
${message}`,
    },
  ];

  const assistantMessage =
    await requestGroq(messages);

  if (!assistantMessage) {
    throw new Error("Groq returned no response");
  }

  return {
    answer:
      assistantMessage.content ||
      "I could not produce a procurement answer.",
  };
};