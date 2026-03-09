require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const { GEMINI_MODELS } = require("./ai.constants");

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is required in environment variables");
    }

    this.ai = new GoogleGenAI({ apiKey: this.apiKey });

    // ✅ CRITICAL: Use the same model as your working project
    // Check your other project's GEMINI_MODEL constant - likely "gemini-2.0-flash" or "gemini-1.5-pro"
    this.modelName = GEMINI_MODELS.PRODUCTION || "gemini-2.5-flash";

    this.contexts = {
      general: "general business data analysis",
      dashboard: "business intelligence and performance overview",
      products: "product management, inventory, and sales analysis",
      stores: "store operations, performance comparison, and management",
      workers: "staff management, performance, and scheduling",
      newsletter: "marketing, communication, and customer engagement",
      analytics: "data analysis, trends, and insights generation",
      consultation: "customer support, service analysis, and improvement",
      system: "system configuration, settings, and technical analysis",
      payments: "financial transactions, revenue, and payment processing",
      inventory: "stock management, turnover, and optimization",
      reports: "report generation, data summarization, and insights",
      profile: "user activity, preferences, and personalization",
      transactions: "sales transactions, patterns, and financial analysis",
      permissions: "role-based access control and security analysis",
      community: "user engagement, feedback, and community analysis",
    };
  }

  async generateContent(prompt, options = {}) {
    try {
      const { tools = [{ googleSearch: {} }] } = options;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          tools,
        },
      });

      return response.text || "";
    } catch (error) {
      console.error("AI generation error:", error.message);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  extractJsonFromText(text = "") {
    try {
      // Match JSON array or object in code blocks
      const jsonMatch = text.match(
        /```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/,
      );
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find any JSON object/array
      const possibleJson = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (possibleJson) {
        return JSON.parse(possibleJson[0]);
      }

      return [];
    } catch {
      return [];
    }
  }

  async analyzeData(data, options = {}) {
    const {
      context = "general",
      type = "analysis",
      audience = "manager",
    } = options;

    const contextDescription = this.contexts[context] || "business data";

    const prompt = `
You are Orbit AI, an intelligent business assistant.

Analyze this ${contextDescription} data and provide insights.

DATA:
${JSON.stringify(data, null, 2)}

Return a JSON object with:
- summary: Brief overview (1 sentence)
- insights: Array of 3 key findings
- metrics: Key performance indicators
- recommendations: Array of 2-3 actionable suggestions
- confidence: "high", "medium", or "low"

Return ONLY the JSON inside \`\`\`json\`\`\` tags.
`;

    try {
      const text = await this.generateContent(prompt);
      const parsed = this.extractJsonFromText(text);

      return {
        success: true,
        ...parsed,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`AI analysis error:`, error.message);
      return this.getFallbackResponse(context);
    }
  }

  async analyzeDashboard(data) {
    console.log("📊 analyzeDashboard called");
    console.log("🔑 API Key exists:", !!this.apiKey);
    console.log("🤖 Model:", this.modelName);

    try {
      const result = await this.analyzeData(data, { context: "dashboard" });
      console.log("✅ analyzeDashboard success:", result);
      return result;
    } catch (error) {
      console.error("❌ analyzeDashboard error:", error);
      return this.getFallbackResponse("dashboard");
    }
  }

  async analyzeProducts(data) {
    return this.analyzeData(data, { context: "products" });
  }

  async analyzeTransactions(data) {
    return this.analyzeData(data, { context: "transactions" });
  }

  async generateReport(data, reportType = "summary") {
    const prompt = `
Generate a ${reportType} report from this data:

${JSON.stringify(data, null, 2)}

Return a JSON with:
- title: Report title
- summary: Executive summary
- sections: Array of report sections
- recommendations: Array of recommendations
`;

    try {
      const text = await this.generateContent(prompt);
      const parsed = this.extractJsonFromText(text);

      return {
        success: true,
        ...parsed,
        reportType,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  async chat(message, history = []) {
    const prompt = `
You are Orbit AI, an intelligent business assistant.

Conversation:
${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

User: ${message}

Respond helpfully and concisely.
`;

    try {
      const text = await this.generateContent(prompt, { tools: [] });

      return {
        success: true,
        message: text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: "AI service unavailable",
        error: error.message,
      };
    }
  }

  async healthCheck() {
    try {
      const text = await this.generateContent("Say OK", { tools: [] });
      return {
        status: "healthy",
        model: this.modelName,
        response: text.includes("OK") ? "OK" : text.substring(0, 20),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        model: this.modelName,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getFallbackResponse(context) {
    return {
      success: false,
      fallback: true,
      context,
      summary: "AI analysis temporarily unavailable",
      insights: ["Please try again later"],
      metrics: {},
      recommendations: ["Refresh and retry"],
      confidence: "low",
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new AIService();
