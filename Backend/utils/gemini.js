import "dotenv/config";

const getGeminiAPIResponse = async (message) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from the environment");
  }

  const models = [
    process.env.GEMINI_MODEL || "gemini-3.6-flash",
    "gemini-3-flash-preview",
  ].filter((model, index, list) => list.indexOf(model) === index);

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: message }],
            }],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        const providerMessage = data?.error?.message || `Gemini request failed (${response.status})`;
        const canFallback = response.status === 400 || response.status === 404;
        if (canFallback && model !== models[models.length - 1]) continue;
        throw new Error(`${model}: ${providerMessage}`);
      }

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error(`${model}: Gemini returned an empty response`);
      return reply;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error(`${model}: Gemini request timed out after 60 seconds`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
};

export default getGeminiAPIResponse;
