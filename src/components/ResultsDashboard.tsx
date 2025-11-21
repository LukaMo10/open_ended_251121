import React, { useEffect, useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { 
  LightBulbIcon, UserGroupIcon, ChatBubbleBottomCenterTextIcon, ListBulletIcon,
  DocumentTextIcon, PresentationChartLineIcon, BeakerIcon, ArrowsRightLeftIcon, CubeIcon
} from '@heroicons/react/24/outline';

declare global { interface Window { PptxGenJS: any; mermaid: any; } }

const MermaidChart: React.FC<{ chart: string }> = React.memo(({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (window.mermaid && ref.current && chart) {
      window.mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      ref.current.innerHTML = '';
      const id = `mermaid-${Math.random().toString(36).substr(2,9)}`;
      window.mermaid.render(id, chart).then(({svg}: any) => {
        if (ref.current) ref.current.innerHTML = svg;
      }).catch(() => setErr("无法生成逻辑图"));
    }
  }, [chart]);
  return <div className="w-full overflow-x-auto flex justify-center py-4 bg-white rounded-lg">{err ? <span className="text-xs text-red-400">{err}</span> : <div ref={ref}/>}</div>;
});

const ResultsDashboard: React.FC<{ data: AnalysisResult }> = React.memo(({ data }) => {
  const exportPPT = () => {
    if (!window.PptxGenJS) return alert("组件加载中...");
    const pptx = new window.PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    const slide = pptx.addSlide();
    slide.addText("问卷洞察报告", { x:0.5, y:1, fontSize:24, bold:true });
    slide.addText(data.coreConclusions.overallConclusion, { x:0.5, y:2, w:'90%', fontSize:12 });
    pptx.writeFile({ fileName: 'Report.pptx' });
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">分析报告</h2>
        <button onClick={exportPPT} className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-sm flex items-center"><PresentationChartLineIcon className="w-4 h-4 mr-2"/>导出 PPT</button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center mb-6 space-x-2 text-indigo-600"><BeakerIcon className="w-6 h-6"/><h3 className="text-xl font-bold text-slate-900">核心结论</h3></div>
        <div className="p-6 bg-indigo-50/50 rounded-lg mb-8"><p className="text-slate-700 leading-relaxed">{data.coreConclusions.overallConclusion}</p></div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">{data.coreConclusions.logicalModules.map((m,i)=><div key={i} className="p-4 border rounded-lg"><h4 className="font-bold mb-2 flex items-center"><CubeIcon className="w-4 h-4 mr-2 text-indigo-500"/>{m.title}</h4><p className="text-sm text-slate-600">{m.content}</p></div>)}</div>
        <div className="bg-amber-50/50 p-6 rounded-lg mb-8"><h4 className="font-bold text-amber-800 mb-4 flex items-center"><LightBulbIcon className="w-5 h-5 mr-2"/>建议</h4><div className="grid md:grid-cols-2 gap-4">{data.coreConclusions.actionableInsights.map((s,i)=><div key={i} className="flex text-sm"><span className="font-bold mr-2">{i+1}.</span>{s}</div>)}</div></div>
        <div><h4 className="font-bold text-slate-800 mb-4 flex items-center"><ArrowsRightLeftIcon className="w-5 h-5 mr-2 text-indigo-500"/>逻辑图</h4><div className="bg-slate-50 p-2 rounded border"><MermaidChart chart={data.coreConclusions.logicDiagramMermaid}/></div></div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center mb-6 space-x-2 text-indigo-600"><UserGroupIcon className="w-6 h-6"/><h3 className="text-xl font-bold text-slate-900">用户画像</h3></div>
        <div className="grid md:grid-cols-3 gap-6">{data.userClusters.map((c,i)=><div key={i} className="p-5 bg-slate-50 rounded-lg border"><div className="flex justify-between mb-2"><h4 className="font-bold">{c.name}</h4><span className="text-xs bg-white px-2 py-1 rounded border">~{c.percentage}%</span></div><p className="text-sm text-slate-600 mb-4">{c.description}</p><div className="text-xs text-slate-400 pt-3 border-t">用户: {c.userIds.slice(0,10).join(', ')}</div></div>)}</div>
      </div>

      <div className="space-y-6">{data.questionInsights.map((q,i)=><div key={i} className="bg-white p-8 rounded-xl shadow-sm border"><h3 className="text-lg font-bold mb-6 flex items-center"><ListBulletIcon className="w-6 h-6 mr-2 text-indigo-600"/>{q.question}</h3><div className="space-y-6">{q.corePoints.map((p,j)=><div key={j} className="pl-4 border-l-4 border-indigo-100 hover:border-indigo-500 transition-colors"><div className="flex justify-between mb-2"><span className="font-bold">{p.label}</span><span className="text-sm bg-slate-100 px-2 rounded">{p.percentage}%</span></div><p className="text-slate-600 text-sm mb-3">{p.description}</p>{p.quotes.length>0 && <div className="bg-slate-50 p-3 rounded text-xs italic text-slate-500 space-y-1">{p.quotes.map((qt,k)=><div key={k}><span className="font-semibold not-italic text-indigo-600 mr-1">{qt.source}</span>{qt.text}</div>)}</div>}</div>)}</div></div>)}</div>
    </div>
  );
});
export default ResultsDashboard;