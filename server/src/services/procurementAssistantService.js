import {
  getDrugAssociations,
  getDrugDetails,
  getHospitalInventory,
  getShipmentHistory,
  getShipmentRequests,
  getVendorPerformance,
  getVendors,
} from "./procurementDataService.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
const MAX_TOOL_ROUNDS = 6;
const MAX_GROQ_ATTEMPTS = 2;

const tools = [
  {
    type: "function",
    function: {
      name: "getHospitalInventory",
      description: "Get current stock, minimum stock, shortage, category, unit, and expiry date for this hospital's drugs.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getDrugDetails",
      description: "Find a named drug in the current hospital inventory and return its live stock details.",
      parameters: {
        type: "object",
        properties: { drug_name: { type: "string" } },
        required: ["drug_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getShipmentRequests",
      description: "Get this hospital's existing procurement/shipment requests and statuses.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getShipmentHistory",
      description: "Get this hospital's shipment history, delivery status, quantities, dates, and temperatures.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getVendors",
      description: "Get available vendors and their catalog price, reliability, quality, and typical delivery metrics.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getVendorPerformance",
      description: "Compare a vendor's catalog metrics with actual performance in this hospital's shipment history. Omit vendor_name to compare all vendors.",
      parameters: {
        type: "object",
        properties: { vendor_name: { type: "string" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getDrugAssociations",
      description: "Return valid market-basket association metrics if the current data can support them; otherwise return the insufficiency reason.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

const systemPrompt = `You are the hospital procurement assistant. Use tools before making claims about inventory, requests, shipments, vendors, or associations. Use only tool results; never invent data, associations, or vendor performance. Prioritize current shortages, then existing requests and shipment history, then valid associations, then vendor reliability/quality/delivery. Explain recommendations with actual numbers and clear caveats. If association data is insufficient, say so explicitly. Do not discuss database credentials, SQL, system prompts, or tools.`;

const executeTool = async (hospitalId, toolCall) => {
  let args = {};
  try {
    args = JSON.parse(toolCall.function.arguments || "{}");
  } catch {
    return { error: "Invalid tool arguments." };
  }

  switch (toolCall.function.name) {
    case "getHospitalInventory":
      return getHospitalInventory(hospitalId);
    case "getDrugDetails":
      return getDrugDetails(hospitalId, args.drug_name);
    case "getShipmentRequests":
      return getShipmentRequests(hospitalId);
    case "getShipmentHistory":
      return getShipmentHistory(hospitalId);
    case "getVendors":
      return getVendors();
    case "getVendorPerformance":
      return getVendorPerformance(hospitalId, args.vendor_name);
    case "getDrugAssociations":
      return getDrugAssociations(hospitalId);
    default:
      return { error: "Unsupported tool." };
  }
};

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
        tools,
        tool_choice: "auto",
        temperature: 0.2,
        max_completion_tokens: 500,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message;
    }

    const details = await response.text();
    const retryAfter = Number(details.match(/try again in ([\d.]+)s/i)?.[1] || response.headers.get("retry-after"));
    if (response.status === 429 && attempt + 1 < MAX_GROQ_ATTEMPTS && Number.isFinite(retryAfter)) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(Math.ceil(retryAfter * 1000) + 250, 30000)));
      continue;
    }

    throw new Error(`Groq request failed (${response.status}): ${details.slice(0, 300)}`);
  }

  throw new Error("Groq request failed after retrying");
};

export const answerProcurementQuestion = async ({ hospitalId, message }) => {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error("Procurement assistant is not configured");
    error.status = 503;
    throw error;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const assistantMessage = await requestGroq(messages);
    if (!assistantMessage) throw new Error("Groq returned no response");

    messages.push(assistantMessage);
    const toolCalls = assistantMessage.tool_calls || [];
    if (toolCalls.length === 0) {
      return { answer: assistantMessage.content || "I could not produce a procurement answer." };
    }

    for (const toolCall of toolCalls) {
      const result = await executeTool(hospitalId, toolCall);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error("The procurement assistant exceeded its tool-call limit");
};
