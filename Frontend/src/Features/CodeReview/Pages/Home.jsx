import { useState, useRef } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { GenerateCodeReview } from "../Services/review.api";
 
export default function Home() {
  const [language, setLanguage] = useState("TypeScript");
  const [code, setCode] = useState("");
  const [review, setReview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [diffView, setDiffView] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const editorRef = useRef(null);
 
  const languageOptions = [
    "TypeScript",
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
  ];
  const monacoLanguage = language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase();

  const mapReviewToUi = (apiReview) => {
    const bugs = apiReview?.bugs ?? {};
    const optimizations = apiReview?.Optimizations ?? {};

    const bugTypes = Array.isArray(bugs.Types_of_Bugs) ? bugs.Types_of_Bugs : [];
    const bugLocations = Array.isArray(bugs.Where_Bugs_Occurred) ? bugs.Where_Bugs_Occurred : [];
    const optimizationTypes = Array.isArray(optimizations.Types_of_Optimizations)
      ? optimizations.Types_of_Optimizations
      : [];
    const optimizationLocations = Array.isArray(
      optimizations.Where_Optimizations_Are_Required,
    )
      ? optimizations.Where_Optimizations_Are_Required
      : [];

    const insights = [
      ...bugTypes.map((type, i) => ({
        title: type,
        type: "bug",
        complexity: String(bugs.Severity_of_Bugs || "medium").toUpperCase(),
        description: bugLocations[i] || "Check related logic in this section.",
      })),
      ...optimizationTypes.map((type, i) => ({
        title: type,
        type: "optimization",
        complexity: "IMPROVEMENT",
        description: optimizationLocations[i] || "Optimization opportunity detected.",
      })),
    ];

    const tags = [];
    if (bugTypes.length) tags.push("BUG");
    if (optimizationTypes.length) tags.push("OPTIMIZATION");

    return {
      tags,
      insights,
      original: code,
      optimised: apiReview?.OptmizedCode || code,
      bugCount: bugTypes.length,
      optimizationCount: Number(optimizations.Number_of_Optimizations || optimizationTypes.length || 0),
    };
  };
 
  const handleAnalyse = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("Please enter code before running analysis.");
      setReview(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReview(null);

      const data = await GenerateCodeReview({ code: trimmedCode, language });
      const uiReview = mapReviewToUi(data?.review || {});
      setReview(uiReview);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to analyze code. Please try again.");
      setReview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (!review?.optimised) {
      return;
    }

    setCode(review.optimised);
  };
 
  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-[#f0f0f0] font-mono overflow-hidden">
 
      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 h-12 bg-[#0d0d0d] border-b border-[#1e1e1e] shrink-0">
        <div className="flex items-center gap-8">
          <span className="text-[15px] font-bold text-[#f0f0f0] tracking-tight">CodeSense</span>
        </div>
      </nav>
 
      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="flex-1 flex flex-col border-r border-[#1e1e1e] overflow-hidden">
 
          {/* Tab bar */}
          <div className="flex items-center gap-3 px-4 h-9 bg-[#0d0d0d] border-b border-[#1e1e1e] shrink-0">
            <span className="text-[10px] text-[#444] tracking-widest">EDITOR</span>
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
              <select
                aria-label="Select code language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs text-[#f0f0f0] border-none outline-none font-mono cursor-pointer"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option} className="bg-[#1a1a1a] text-[#f0f0f0]">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1" />
            <span className="text-[11px] text-[#444]">{language}</span>
            <span className="text-[11px] text-[#444] ml-2">UTF-8</span>
          </div>
 
          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={(editor) => {
                editorRef.current = editor;
                const model = editor.getModel();
                if (model) {
                  editor.onDidChangeCursorPosition((event) => {
                    setCursorLine(event.position.lineNumber);
                    setCursorColumn(event.position.column);
                  });
                  const initialPosition = editor.getPosition();
                  if (initialPosition) {
                    setCursorLine(initialPosition.lineNumber);
                    setCursorColumn(initialPosition.column);
                  }
                }
              }}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                padding: { top: 12 },
                scrollbar: { verticalScrollbarSize: 4 },
              }}
            />
          </div>
 
          {/* Analyse button */}
          <button
            onClick={handleAnalyse}
            disabled={loading}
            className="mx-4 my-3 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 border-none rounded text-white text-xs font-bold tracking-widest cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-colors font-mono"
          >
            <span className="text-sm">⚡</span>
            {loading ? "ANALYSING..." : "ANALYSE CODE"}
          </button>
        </div>
 
        {/* Review panel */}
        <div className="w-95 flex flex-col bg-[#0d0d0d] shrink-0 overflow-hidden">
 
          {/* Review header */}
          <div className="px-4 h-9 flex items-center text-[10px] text-[#444] tracking-widest border-b border-[#1e1e1e] shrink-0">
            REVIEW INSIGHTS
          </div>
 
          {/* Review scroll */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {loading ? (
              <SkeletonLoader />
            ) : review ? (
              <>
                {/* Summary */}
                <div className="flex flex-col gap-2">
                  <div className="text-base font-bold text-[#f0f0f0] font-sans">Analysis Summary</div>
                  <p className="text-[13px] text-[#888] leading-relaxed m-0 font-sans">
                    Detected{" "}
                    <strong className="text-red-400">{review.bugCount} potential bugs</strong> and{" "}
                    <strong className="text-indigo-400">{review.optimizationCount} optimization</strong> opportunities in the current scope.
                  </p>
                  <div className="flex gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-sm text-white tracking-wide
                          ${tag === "BUG" ? "bg-red-500" : "bg-indigo-500"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
 
                {/* Insight cards */}
                {review.insights.map((insight, i) => (
                  <div key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-md p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#f0f0f0] font-sans">{insight.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border
                          ${insight.type === "bug"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-green-500/10 text-green-400 border-green-500/30"
                          }`}
                      >
                        {insight.complexity}
                      </span>
                    </div>
                    <p className="text-xs text-[#777] leading-relaxed m-0 font-sans">{insight.description}</p>
                  </div>
                ))}
 
                {/* Diff section */}
                <div className="bg-[#141414] border border-[#1e1e1e] rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1e1e1e]">
                    <span className="text-[10px] text-[#444] tracking-widest">OPTIMIZED SUGGESTION</span>
                    <button
                      onClick={() => setDiffView(!diffView)}
                      className="bg-transparent border border-[#2a2a2a] hover:border-indigo-400 text-indigo-400 text-[11px] px-2.5 py-0.5 rounded cursor-pointer font-mono transition-colors"
                    >
                      {diffView ? "Editor View" : "Diff View"}
                    </button>
                  </div>
                  <div className="overflow-hidden">
                    {diffView ? (
                      <DiffEditor
                        height="200px"
                        language={monacoLanguage}
                        theme="vs-dark"
                        original={review.original}
                        modified={review.optimised}
                        options={{
                          fontSize: 11,
                          fontFamily: "'JetBrains Mono', monospace",
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          readOnly: true,
                          renderSideBySide: true,
                        }}
                      />
                    ) : (
                      <div className="flex">
                        <div className="flex-1 p-2.5 overflow-hidden">
                          <div className="text-[9px] text-[#444] tracking-widest mb-1.5">ORIGINAL</div>
                          <pre className="m-0 text-[10px] leading-relaxed text-red-400 whitespace-pre-wrap break-all font-mono">
                            {review.original}
                          </pre>
                        </div>
                        <div className="flex-1 p-2.5 overflow-hidden border-l border-[#1e1e1e]">
                          <div className="text-[9px] text-[#444] tracking-widest mb-1.5">OPTIMIZED</div>
                          <pre className="m-0 text-[10px] leading-relaxed text-green-400 whitespace-pre-wrap break-all font-mono">
                            {review.optimised}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
 
                {/* Apply button */}
                <button
                  onClick={handleApplySuggestion}
                  disabled={!review?.optimised}
                  className="w-full py-3 bg-[#141414] border border-[#2a2a2a] hover:border-[#444] hover:text-[#f0f0f0] disabled:opacity-50 disabled:cursor-not-allowed rounded text-[#888] text-[11px] font-bold tracking-widest cursor-pointer font-mono transition-colors"
                >
                  APPLY SUGGESTION
                </button>
              </>
            ) : (
              <>
                {error ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 text-sm text-red-300 font-sans">
                    {error}
                  </div>
                ) : (
                  <div className="bg-[#141414] border border-[#1e1e1e] rounded-md p-4 text-sm text-[#777] font-sans">
                    No review insights yet. Run analysis to populate this panel.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
 
      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 h-6 bg-[#0d0d0d] border-t border-[#1e1e1e] shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="text-[11px] text-[#444]">System Ready</span>
        <span className="text-[11px] text-[#444]">Line {cursorLine}, Col {cursorColumn}</span>
        <div className="flex-1" />
        <span className="text-[11px] text-[#444]">AI Model: CodeSense-V2-Turbo</span>
        <span className="text-[11px] text-[#444]">UTF-8</span>
      </div>
    </div>
  );
}
 
function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[120, 80, 160, 100].map((w, i) => (
        <div
          key={i}
          className="h-3.5 bg-[#2a2a2a] rounded animate-pulse"
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  );
}
 



