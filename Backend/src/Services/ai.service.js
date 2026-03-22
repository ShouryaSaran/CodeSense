const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

function getPrettierParser(language) {
  const value = String(language || "").toLowerCase();
  if (value === "javascript" || value === "js") return "babel";
  if (value === "typescript" || value === "ts") return "typescript";
  if (value === "json") return "json";
  return null;
}

function basicJsFormat(source) {
  const withBreaks = source
    .replace(/;\s*/g, ";\n")
    .replace(/\{\s*/g, "{\n")
    .replace(/\}\s*/g, "}\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = withBreaks
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let indent = 0;
  const out = [];

  for (const line of lines) {
    if (line.startsWith("}")) {
      indent = Math.max(0, indent - 1);
    }

    out.push(`${"  ".repeat(indent)}${line}`);

    if (line.endsWith("{")) {
      indent += 1;
    }
  }

  return out.join("\n");
}

async function formatOptimizedCode(code, language) {
  const source = String(code || "").trim();
  if (!source) return "";

  const parser = getPrettierParser(language);

  if (parser) {
    try {
      const prettier = require("prettier");
      const formatted = await prettier.format(source, {
        parser,
        semi: true,
        singleQuote: true,
      });
      return formatted.trim();
    } catch (_) {
      // Fallback for environments where prettier is not installed.
    }
  }

  if ((String(language || "").toLowerCase() === "javascript" || String(language || "").toLowerCase() === "typescript") && !source.includes("\n")) {
    return basicJsFormat(source);
  }

  return source;
}

const reviewSchema = {
  type: "object",
  properties: {
    bugs: {
      type: "array",
      description: "One bug per finding with explicit function mapping.",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Bug category/type (e.g., Resource Leak, Syntax Error).",
          },
          severity: {
            type: "string",
            description: "Severity of this bug: low, medium, or high.",
          },
          functionName: {
            type: "string",
            description: "Exact function/method name where this bug occurs.",
          },
          lineHint: {
            type: "string",
            description: "Optional line number or line range hint (e.g., line 12 or lines 30-33).",
          },
          evidence: {
            type: "string",
            description: "Short explanation why the bug is in that function.",
          },
        },
        required: ["type", "severity", "functionName", "evidence"],
      },
    },
    optimizations: {
      type: "array",
      description: "One optimization per finding with explicit function mapping.",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Optimization category/type.",
          },
          functionName: {
            type: "string",
            description: "Exact function/method name where optimization is needed.",
          },
          evidence: {
            type: "string",
            description: "Short explanation for this optimization.",
          },
        },
        required: ["type", "functionName", "evidence"],
      },
    },
    optimizedCode: {
      type: "string",
      description: "The optimized version of the provided code with improvements implemented.",
    },
  },
  required: ["bugs", "optimizations", "optimizedCode"],
};

async function normalizeReviewResponse(raw, language) {
  const bugFindings = Array.isArray(raw?.bugs) ? raw.bugs : [];
  const optimizationFindings = Array.isArray(raw?.optimizations) ? raw.optimizations : [];

  const severities = bugFindings
    .map((b) => String(b?.severity || "").toLowerCase())
    .filter(Boolean);

  const Severity_of_Bugs = severities.includes("high")
    ? "high"
    : severities.includes("medium")
    ? "medium"
    : "low";

  const formattedOptimizedCode = await formatOptimizedCode(raw?.optimizedCode || "", language);

  return {
    bugs: {
      Severity_of_Bugs,
      Types_of_Bugs: bugFindings.map((b) => b?.type).filter(Boolean),
      Where_Bugs_Occurred: bugFindings
        .map((b) => {
          if (!b?.functionName) return null;
          return b.lineHint ? `${b.functionName} (${b.lineHint})` : b.functionName;
        })
        .filter(Boolean),
    },
    Optimizations: {
      Number_of_Optimizations: optimizationFindings.length,
      Types_of_Optimizations: optimizationFindings.map((o) => o?.type).filter(Boolean),
      Where_Optimizations_Are_Required: optimizationFindings
        .map((o) => o?.functionName)
        .filter(Boolean),
    },
    
    OptmizedCode: formattedOptimizedCode,
  };
}

async function generateReivew(code, language = "unknown") {
  const prompt = `You are a code review assistant. Analyze the following ${language} code and identify bugs and optimization opportunities.

Critical requirement:
- Every bug must be mapped to the exact function where it appears.
- Do not guess function names.
- If uncertain, use "<module-level>" instead of a wrong function.
- Keep one finding per bug in the bugs array and one finding per optimization in the optimizations array.
- Never return separate parallel arrays for types and locations.
- The optimizedCode must be properly formatted and readable with line breaks and indentation.
- For JavaScript/TypeScript, do not minify; preserve a standard pretty-printed style.

Code:
${code}

Return strictly valid JSON that matches the provided schema only.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: reviewSchema,
    },
  });

  const parsed = JSON.parse(response.text);
  return normalizeReviewResponse(parsed, language);
}

module.exports = generateReivew
