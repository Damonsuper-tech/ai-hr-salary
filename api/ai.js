const https = require("https");

module.exports = async function (req, res) {
  try {
    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";

    const postData = JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `
你是一个薪酬计算器。

规则：
- 工资 + 奖金 = 总收入
- 只返回最终数字
- 不要解释

输入：${text}

输出：
`
        }
      ]
    });

    const options = {
      hostname: "api.deepseek.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-980bcaef523b44388128f28f4cc6995a",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const json = JSON.parse(data);

          let result = "";

// 多种结构兼容解析
if (json.choices && json.choices.length > 0) {
  const msg = json.choices[0].message;

  if (typeof msg.content === "string") {
    result = msg.content;
  } else if (Array.isArray(msg.content)) {
    result = msg.content.map(c => c.text || "").join("");
  } else if (msg.reasoning_content) {
    result = msg.reasoning_content;
  }
}

// 如果AI没返回，兜底自己算
if (!result) {
  const nums = text.match(/\d+/g);
  if (nums && nums.length >= 2) {
    result = String(Number(nums[0]) + Number(nums[1]));
  } else {
    result = "无法计算";
  }
}

res.status(200).json({ result });


        } catch (e) {
          res.status(500).json({ error: "解析失败：" + data });
        }
      });
    });

    request.on("error", (error) => {
      res.status(500).json({ error: error.message });
    });

    request.write(postData);
    request.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};