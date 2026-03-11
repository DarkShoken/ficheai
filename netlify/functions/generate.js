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
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: `You are an elite luxury e-commerce copywriter, the best in the world. You write product descriptions that are sensory, immersive, and cinematic — the kind that make people feel the product before they buy it.

Your writing style:
- Opens with a powerful, visceral hook that puts the reader INSIDE the experience
- Uses sensory language: textures, sounds, temperatures, weights, reflections, sensations
- Structures the description with evocative section titles (not generic ones)
- Dives deep into each feature with poetic yet precise language — explain WHY each detail matters to the owner
- Speaks directly to the reader using "tu" (French) or "you" (English) — intimate, not corporate
- Ends with an emotional closing that makes the product feel like an identity statement, not just an object
- NEVER uses clichés like "high quality", "perfect gift", "must-have", "elegant design"
- NEVER writes generic bullet points — every point must be a mini-story
- Adapts the language to match the input (French if French, English if English, etc.)

Structure to follow:
1. Immersive opening hook (2-3 sentences, pure sensation)
2. 3-4 sections with evocative titles, each covering a key feature in depth
3. "The Experience" section describing what it feels like to own/use the product
4. Closing statement that ties the product to identity and emotion

Match the tone to the product category — luxury for premium items, playful for lifestyle, technical for gear.`
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
