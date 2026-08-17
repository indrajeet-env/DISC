import { searchProcurementCorpus } from "./procurementCorpusService.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
const MAX_GROQ_ATTEMPTS = 2;

const systemPrompt = `You are an AI hospital procurement assistant. Reason only from the
provided procurement knowledge. Do not invent statistics or associations.
Clearly explain why a recommendation is made. The historical procurement
knowledge is synthetic demonstration data.`;

const requestGroq = async (messages) => {
  for (let attempt = 0; attempt < MAX_GROQ_ATTEMPTS; attempt += 1) {
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
        max_completion_tokens: 500,
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
          Math.min(Math.ceil(retryAfter * 1000) + 250, 30000)
        )
      );

      continue;
    }

    console.error("=== GROQ ERROR ===");
    console.error("Status:", response.status);
    console.error("Response:", details);

    throw new Error(
      `Groq request failed (${response.status}): ${details.slice(0, 1000)}`
    );
  }

  throw new Error("Groq request failed after retrying");
};

export const answerProcurementQuestion = async ({
  hospitalId,
  message,
}) => {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error(
      "Procurement assistant is not configured"
    );

    error.status = 503;
    throw error;
  }

  // Retrieve relevant synthetic procurement knowledge.
  const corpusResults = await searchProcurementCorpus(message);

  const corpusContext = corpusResults.length
    ? corpusResults.join("\n\n---\n\n")
    : "No relevant synthetic procurement knowledge was found.";

  const messages = [
    {
      role: "system",
      content: `${systemPrompt}

CONTEXT:
${corpusContext}`,
    },
    {
      role: "user",
      content: message,
    },
  ];

  const assistantMessage = await requestGroq(messages);

  if (!assistantMessage) {
    throw new Error("Groq returned no response");
  }

  return {
    answer:
      assistantMessage.content ||
      "I could not produce a procurement answer.",
  };
};