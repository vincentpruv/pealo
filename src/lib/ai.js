import OpenAI from "openai";

/**
 * Creates an OpenAI-compatible client using env variables.
 * Works with DeepSeek, OpenAI, Mistral, Groq, Ollama, etc.
 */
function getClient() {
  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL;

  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: baseURL || undefined,
  });
}

/**
 * Generates AI insights from a list of feedback objects.
 * Returns structured JSON with summary, sentiment, top issues, top requests, and action items.
 */
export async function generateInsights(feedbacks) {
  const client = getClient();
  if (!client) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const modelName = process.env.AI_MODEL_NAME || "gpt-4o-mini";

  // Prepare feedback data for the prompt (limit context size)
  const feedbackSummaries = feedbacks.slice(0, 200).map((f, i) => {
    const parts = [`#${i + 1}`];
    if (f.type) parts.push(`Type: ${f.type}`);
    if (f.rating) parts.push(`Rating: ${f.rating}/5`);
    if (f.status) parts.push(`Status: ${f.status}`);
    if (f.message) parts.push(`Message: "${f.message}"`);
    if (f.metadata?.url) parts.push(`Page: ${f.metadata.url}`);
    return parts.join(" | ");
  });

  const systemPrompt = `You are an expert product analyst. You analyze user feedback data and provide actionable insights. Always respond in valid JSON format matching the exact schema requested. Be concise and specific. If the feedback is in a specific language, respond in that same language for the summary and action items.`;

  const userPrompt = `Analyze the following ${feedbacks.length} user feedbacks and provide insights.

FEEDBACKS:
${feedbackSummaries.join("\n")}

Respond with this exact JSON structure:
{
  "summary": "A 2-3 sentence overview of what users are saying overall",
  "sentiment": {
    "positive": <percentage 0-100>,
    "neutral": <percentage 0-100>,
    "negative": <percentage 0-100>
  },
  "topIssues": [
    { "title": "Short issue title", "count": <number of feedbacks mentioning this>, "severity": "high|medium|low" }
  ],
  "topRequests": [
    { "title": "Short feature request title", "count": <number of feedbacks mentioning this>, "priority": "high|medium|low" }
  ],
  "actionItems": [
    { "action": "Specific recommendation", "impact": "high|medium|low" }
  ]
}

Rules:
- topIssues: Return up to 5 most reported bugs/problems. If none, return empty array.
- topRequests: Return up to 5 most requested features/suggestions. If none, return empty array.
- actionItems: Return exactly 3 prioritized recommendations.
- Sentiment percentages must add up to 100.
- Be data-driven: base counts on actual feedback content.`;

  const response = await client.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("AI_INVALID_JSON");
  }
}
