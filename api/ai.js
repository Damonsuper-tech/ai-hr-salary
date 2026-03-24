export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";

    const safeText = encodeURIComponent(text);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 你的DeepSeek_API_Key"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: safeText
          }
        ]
      })
    });

    const data = await response.json();

    const result = decodeURIComponent(
      data.choices?.[0]?.message?.content || ""
    );

    return res.status(200).json({
      result
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}