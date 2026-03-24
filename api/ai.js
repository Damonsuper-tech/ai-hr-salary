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
          content: `请计算薪资，只返回数字：${text}`
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

          const result =
            json.choices?.[0]?.message?.content || "没有结果";

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