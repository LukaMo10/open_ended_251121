export async function onRequestPost(context) {
  try {
    // 1. 读取请求内容
    const { request, env } = context;
    const { textData, question } = await request.json();

    if (!textData) {
      return new Response(JSON.stringify({ error: "请输入问卷数据" }), { status: 400 });
    }

    // 2. 读取 Cloudflare 环境变量中的 API Key
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "服务端未配置 API Key" }), { status: 500 });
    }

    // 3. 准备 Prompt
    const promptText = `
      你是一位资深的中文数据分析专家。请对以下问卷回复进行深入的定性和定量分析。
      ${question ? `背景信息(题目): ${question}` : ''}
      
      任务:
      1. coreConclusions: 
         - overallConclusion: 一段话总结。
         - logicalModules: 3-4个逻辑模块(title, content)。
         - actionableInsights: 4-6条建议(string array)。
         - logicDiagramMermaid: Mermaid JS 流程图代码(graph TD), 不要markdown标记。
      2. questionInsights: 针对每个问题提取 corePoints (label, description, percentage, quotes[{text, source}]). 
         *注意*: quotes 必须包含 source(用户ID) 和 text(原话)，精选1-3条。
      3. userClusters: 用户画像 (name, description, percentage, userIds).

      输出格式: 纯 JSON。
      数据: """${textData.substring(0, 30000)}"""
    `;

    // 4. 直接调用 Google REST API (最稳的方式)
    // 想要用 2.5，就把这里改成 gemini-2.5-flash (如果 Google 已开放)
    // 为了保险，先用 gemini-1.5-flash
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `Google API Error: ${response.status} - ${errText}` }), { status: 500 });
    }

    const data = await response.json();
    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // 清洗数据
    resultText = resultText.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();

    return new Response(resultText, {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }

}



