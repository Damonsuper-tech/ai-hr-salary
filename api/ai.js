export default async function handler(req, res) {

const { text } = req.body || {};

// 调用 OpenAI
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "你是薪酬计算助手，只返回计算结果数字"
      },
      {
        role: "user",
        content: text
      }
    ]
  })
});

const data = await response.json();

res.status(200).json({
  result: data.choices[0].message.content
});

}