exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: "No prompt provided" }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "You are an expert e-commerce copywriter. Generate compelling product descriptions that convert visitors into buyers. Adapt the language to match the input language (French if French, English if English, etc.)."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", JSON.stringify(data));
      return { statusCode: 500, body: JSON.stringify({ error: data.error?.message || "API error" }) };
    }

    const text = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: text })
    };

  } catch (err) {
    console.error("Function error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
