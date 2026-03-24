import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个薪酬计算助手，只返回最终数字结果"
        },
        {
          role: "user",
          content: text
        }
      ],
    });

    return res.status(200).json({
      choices: completion.choices
    });

  } catch (error) {
    console.error("真实错误：", error); // ⭐ 关键

    return res.status(500).json({
      error: error.message
    });
  }
}