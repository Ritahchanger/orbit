import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send,
  Shield,
  Trash2,
  CreditCard,
  Calendar,
  Users,
  XCircle,
  Loader2,
  Minimize2,
} from "lucide-react";
import {
  closeChat,
  clearMessages,
  sendSupportMessage,
  selectChatIsOpen,
  selectChatMessages,
  selectChatIsLoading,
} from "../slices/SupportChartSlice";

// ── Constants ──────────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  {
    label: "Payment method",
    text: "How do I update my payment method?",
    Icon: CreditCard,
  },
  {
    label: "Renewal date",
    text: "When does my subscription renew?",
    Icon: Calendar,
  },
  {
    label: "Add users",
    text: "How do I add more users to my plan?",
    Icon: Users,
  },
  {
    label: "Cancel plan",
    text: "How do I cancel my subscription?",
    Icon: XCircle,
  },
];

// ── Animation variants ─────────────────────────────────────────────────────────

const panelVariants = {
  hidden: { x: "100%", opacity: 0.6 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 65, damping: 18, mass: 0.9 },
      opacity: { duration: 0.25, ease: "easeOut" },
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 80, damping: 20 },
      opacity: { duration: 0.2 },
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatTime = (isoString) =>
  new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Sub-components ─────────────────────────────────────────────────────────────

const AiAvatar = () => (
  <div className="w-7 h-7 rounded-sm flex-shrink-0 flex items-center justify-center text-[11px] font-medium text-white bg-gradient-to-br from-purple-500 to-pink-500">
    AI
  </div>
);

const UserAvatar = () => (
  <div className="w-7 h-7 rounded-sm flex-shrink-0 flex items-center justify-center text-[11px] font-medium text-white bg-gray-600 dark:bg-gray-500">
    JD
  </div>
);

const TypingIndicator = () => (
  <div className="flex gap-2 items-start">
    <AiAvatar />
    <div className="bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-700 rounded-tl-none rounded-sm px-3 py-2.5">
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const Message = ({ msg }) => {
  const isAi = msg.role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-2 items-start ${isAi ? "" : "flex-row-reverse"}`}
    >
      {isAi ? <AiAvatar /> : <UserAvatar />}
      <div
        className={`max-w-[78%] rounded-sm px-3 py-2 border text-[13px] leading-relaxed ${
          isAi
            ? "bg-gray-100  dark:bg-gray-700/60 border-gray-200 dark:border-gray-700  dark:text-gray-200 rounded-tl-none"
            : "bg-purple-600 border-purple-600 text-white rounded-tr-none"
        }`}
      >
        <p className="whitespace-pre-wrap m-0 text-black">{msg.content}</p>
        <p
          className={`text-[10px] mt-1 m-0 ${
            isAi ? "text-gray-400 dark:text-gray-500" : "text-purple-200"
          }`}
        >
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </motion.div>
  );
};

// ── Input box ──────────────────────────────────────────────────────────────────

const ChatInput = ({ onSend, isLoading }) => {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const value = textareaRef.current?.value.trim();
    if (!value || isLoading) return;
    onSend(value);
    textareaRef.current.value = "";
    textareaRef.current.style.height = "auto";
  };

  return (
    <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message… (Enter to send)"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors disabled:opacity-50"
          style={{ minHeight: "36px", maxHeight: "100px" }}
        />
        <button
          onClick={submit}
          disabled={isLoading}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[10px]">
          Shift+Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
};

// ── Side Panel ─────────────────────────────────────────────────────────────────

export default function SupportChatModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectChatIsOpen);
  const messages = useSelector(selectChatMessages);
  const isLoading = useSelector(selectChatIsLoading);
  const messagesEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Esc to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isOpen) dispatch(closeChat());
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, dispatch]);

  const handleSend = (text) => dispatch(sendSupportMessage(text));
  const handleClear = () => dispatch(clearMessages());
  const handleClose = () => dispatch(closeChat());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[9998] bg-black/40 lg:hidden"
            onClick={handleClose}
          />

          {/* Side panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 z-[9999] h-full w-full sm:w-[650px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-sm bg-gradient-to-br from-purple-500 to-pink-500">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-0.5">
                    Orbit Support
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      AI Assistant · Online 24/7
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Clear chat"
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  title="Close panel"
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Quick chips ── */}
            <div className="flex-shrink-0 px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide font-medium">
                Quick help
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_PROMPTS.map(({ label, text, Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(text)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-sm hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                  >
                    <Icon className="w-3 h-3 flex-shrink-0 text-purple-500" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <Message key={msg.id} msg={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ── */}
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
