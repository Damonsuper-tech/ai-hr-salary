const https = require("https");
const ExcelJS = require("exceljs");

module.exports = async function (req, res) {
  try {
    const body = req.body || {};
    const text = body.text || "工资10000 奖金2000";
    const name = body.name || "员工";

    // 调用 Deepseek API
    const totalIncome = await new Promise((resolve, reject) => {
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

            if (json.choices && json.choices.length > 0) {
              const msg = json.choices[0].message;
              if (typeof msg.content === "string") result = msg.content;
              else if (Array.isArray(msg.content))
                result = msg.content.map(c => c.text || "").join("");
              else if (msg.reasoning_content) result = msg.reasoning_content;
            }

            if (!result) {
              const nums = text.match(/\d+/g);
              if (nums && nums.length >= 2) result = String(Number(nums[0]) + Number(nums[1]));
              else result = "0";
            }

            resolve(Number(result));
          } catch (e) {
            reject(e);
          }
        });
      });

      request.on("error", (error) => reject(error));
      request.write(postData);
      request.end();
    });

    // 中国个税计算
    const calcChinaTax = (income) => {
      const threshold = 5000;
      const socialSecurity = income * 0.105;
      const taxableIncome = income - socialSecurity - threshold;
      if (taxableIncome <= 0) return 0;
      let tax = 0;
      if (taxableIncome <= 36000) tax = taxableIncome * 0.03;
      else if (taxableIncome <= 144000) tax = taxableIncome * 0.1 - 2520;
      else if (taxableIncome <= 300000) tax = taxableIncome * 0.2 - 16920;
      else if (taxableIncome <= 420000) tax = taxableIncome * 0.25 - 31920;
      else if (taxableIncome <= 660000) tax = taxableIncome * 0.3 - 52920;
      else if (taxableIncome <= 960000) tax = taxableIncome * 0.35 - 85920;
      else tax = taxableIncome * 0.45 - 181920;
      return Math.max(tax, 0);
    };

    const tax = calcChinaTax(totalIncome);
    const netIncome = totalIncome - tax;

    // 生成 Excel buffer
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("薪酬表");
    sheet.columns = [
      { header: "姓名", key: "name", width: 15 },
      { header: "总收入", key: "total", width: 15 },
      { header: "个税", key: "tax", width: 15 },
      { header: "净收入", key: "net", width: 15 },
    ];
    sheet.addRow({ name, total: totalIncome, tax, net: netIncome });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Disposition", `attachment; filename=salary.xlsx`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.end(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};