import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ResultsDashboard from './components/ResultsDashboard';
import { analyzeSurveyData } from './services/geminiService';
import { AnalysisResult, AnalysisStatus } from './types';
import { ArrowPathIcon, DocumentTextIcon, PresentationChartLineIcon, QueueListIcon, TableCellsIcon, QuestionMarkCircleIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

declare global { interface Window { XLSX: any; } }

const App: React.FC = () => {
  const [inputText, setInputText] = useState(() => localStorage.getItem('ipt') || '');
  const [questionText, setQuestionText] = useState(() => localStorage.getItem('qpt') || '');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => { localStorage.setItem('ipt', inputText); }, [inputText]);
  useEffect(() => { localStorage.setItem('qpt', questionText); }, [questionText]);
  useEffect(() => {
    if (status !== AnalysisStatus.LOADING) return;
    setProgress(0);
    const t = setInterval(() => setProgress(p => (p >= 95 ? 95 : p + 5)), 800);
    return () => clearInterval(t);
  }, [status]);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const res = await analyzeSurveyData(inputText, questionText);
      setResult(res);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message);
      setStatus(AnalysisStatus.ERROR);
    }
  }, [inputText, questionText]);

  const loadSample = () => {
    setQuestionText("Q1: 对产品的看法？\nQ2: 有什么建议？");
    setInputText("--- Q1: 对产品的看法？ ---\n[User A] 很棒。\n[User B] 一般。\n--- Q2: 有什么建议？ ---\n[User A] 降价。\n[User B] 增加功能。");
  };

  const handleFile = async (e: any, type: string) => {
    // 简化的文件读取逻辑占位符 - 实际部署时SheetJS会自动处理
    const file = e.target.files[0];
    if(!file) return;
    const data = await file.arrayBuffer();
    const wb = window.XLSX.read(data);
    const json = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
    let txt = "";
    if (type === 'rows_are_questions') {
        // 简单的转换逻辑演示
        txt = json.map((row:any) => row.join(" ")).join("\n");
    } else {
        txt = json.map((row:any) => row.join(" ")).join("\n");
    }
    setInputText(txt);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-[95%] mx-auto px-4 py-10">
        <div className="grid xl:grid-cols-12 gap-10">
          <div className="xl:col-span-4 space-y-6 bg-white p-6 rounded-xl shadow-sm h-fit">
            <div className="flex justify-between"><h2 className="font-bold">输入数据</h2><button onClick={loadSample} className="text-sm text-indigo-600 flex items-center"><DocumentTextIcon className="w-4 h-4 mr-1"/>示例</button></div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="border p-2 rounded text-center cursor-pointer hover:bg-slate-50"><input type="file" className="hidden" onChange={(e)=>handleFile(e,'rows_are_questions')}/>结构一 (行=题)</label>
                <label className="border p-2 rounded text-center cursor-pointer hover:bg-slate-50"><input type="file" className="hidden" onChange={(e)=>handleFile(e,'rows_are_users')}/>结构二 (行=人)</label>
            </div>

            <textarea value={questionText} onChange={e=>setQuestionText(e.target.value)} placeholder="输入题目..." className="w-full h-24 p-3 border rounded-lg text-sm"/>
            <div className="relative"><textarea value={inputText} onChange={e=>setInputText(e.target.value)} placeholder="输入回答..." className="w-full h-60 p-3 border rounded-lg text-sm font-mono"/><div className="absolute bottom-2 right-2 text-xs text-gray-400">{inputText.length}字</div></div>
            
            <button onClick={handleAnalyze} disabled={status===AnalysisStatus.LOADING} className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex justify-center">{status===AnalysisStatus.LOADING ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : "开始分析"}</button>
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
          </div>

          <div className="xl:col-span-8">
            {status === AnalysisStatus.SUCCESS && result ? <ResultsDashboard data={result}/> : (
              <div className="h-[500px] bg-white rounded-xl border border-dashed flex flex-col items-center justify-center">
                {status === AnalysisStatus.LOADING ? (
                  <div className="w-64"><div className="flex justify-between text-xs mb-2 text-indigo-600 font-bold"><span>分析中...</span><span>{progress}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-300" style={{width:`${progress}%`}}></div></div></div>
                ) : (<div className="text-slate-400 text-center"><PresentationChartLineIcon className="w-12 h-12 mx-auto mb-2"/>准备就绪</div>)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default App;