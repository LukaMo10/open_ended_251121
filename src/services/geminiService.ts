import { AnalysisResult } from "../types";

export const analyzeSurveyData = async (textData: string, question?: string): Promise<AnalysisResult> => {
  if (!textData.trim()) throw new Error("输入内容不能为空。");

  try {
    // 调用 Cloudflare Functions
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textData, question }),
    });

    if (!response.ok) {
      let errMsg = `请求失败 (${response.status})`;
      try {
        const errData = await response.json();
        if (errData.error) errMsg = errData.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const result = await response.json();
    
    // 再次清洗 Mermaid 代码，防止前端渲染报错
    if (result.coreConclusions?.logicDiagramMermaid) {
        let diagram = result.coreConclusions.logicDiagramMermaid;
        diagram = diagram.replace(/```mermaid\s*/g, "").replace(/```\s*/g, "");
        if (!diagram.startsWith("graph") && !diagram.startsWith("flowchart")) {
             if (diagram.includes("-->")) diagram = "graph TD\n" + diagram;
        }
        result.coreConclusions.logicDiagramMermaid = diagram.trim();
    }

    return result as AnalysisResult;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "网络错误，请稍后重试");
  }
};