export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-980bcaef523b44388128f28f4cc6995a" // ❗必须替换成你真实Key（纯英文）
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: `请计算薪资，只返回数字：${text}` // ✅ 这里可以写中文
          }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}