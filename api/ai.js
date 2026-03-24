export default async function handler(req, res) {
  try {
    // 兼容没有 body 的情况
    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    const data = await response.json();

    // 👇 关键：确保一定返回JSON
    return res.status(200).json(data);

  } catch (error) {
    // 👇 把真实错误返回给前端（方便你看到）
    return res.status(500).json({
      error: error.message,
    });
  }
}