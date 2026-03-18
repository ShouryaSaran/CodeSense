import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function App() {
  const [code, setCode] = useState("// paste your code here");
  const [language, setLanguage] = useState("javascript");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-semibold mb-4">CodeSense</h1>
      
      <select
        className="mb-4 bg-gray-800 text-white px-4 py-2 rounded"
        onChange={(e) => setLanguage(e.target.value)}
        value={language}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>

      <Editor
        height="70vh"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(val) => setCode(val)}
      />

      <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium">
        Analyse Code
      </button>
    </div>
  );
}