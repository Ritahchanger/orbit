const GEMINI_MODELS = {
  PRODUCTION: "gemini-2.5-flash",

  FALLBACK: [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
  ],

  FAST: "gemini-1.5-flash",
  BALANCED: "gemini-2.5-flash",
  REASONING: "gemini-1.5-pro",

  DEPRECATED: {
    FLASH_2_0: "gemini-2.0-flash",
    FLASH_LITE_2_0: "gemini-2.0-flash-lite",
    PRO_2_5: "gemini-2.5-pro",
  },
};

module.exports = { GEMINI_MODELS }