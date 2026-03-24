import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `请计算薪资，只返回数字结果：${text}`
    });

    return res.status(200).json({
      result: response.output_text
    });

  } catch (error) {
    console.error("真实错误：", error);

    return res.status(500).json({
      error: error.message
    });
  }
}