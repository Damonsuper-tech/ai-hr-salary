export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
       model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个薪酬计算助手，只返回计算结果数字"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0
      }),
    });

    const data = await response.json();

    // ❗ 如果 OpenAI 返回错误，直接透出
    if (data.error) {
      return res.status(500).json({
        error: data.error.message
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}