import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

/**
 * Floating Live Chat button + slide-over panel
 */
export default function LiveChatButton() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  return (
    <>
      {/* Floating button */}
      {!open && (
        <motion.button
          initial={{ scale: 0, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6 z-50
            flex items-center justify-center
            w-14 h-14 rounded-full
            bg-brand-green text-white shadow-lg
            hover:bg-brand-blue hover:shadow-xl
            transition
          "
          aria-label="Open live chat"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Slide-over chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-brand-green text-white">
              <h3 className="font-semibold">Live Chat</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages area (mocked) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-lightblue/40" />
                <div className="bg-slate-200 p-2 rounded-lg max-w-[75%]">
                  Hi there 👋 How can we help you today?
                </div>
              </div>
              <div className="flex gap-2 items-start justify-end">
                <div className="bg-brand-blue text-white p-2 rounded-lg max-w-[75%]">
                  I’d like to know about same-day service.
                </div>
              </div>
            </div>

            {/* Input area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotice("Live chat is coming soon. Please call 1300 551 350 for immediate help.");
              }}
              className="border-t p-3 flex gap-2"
            >
              <input
                type="text"
                placeholder="Type your message…"
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lightblue/60"
              />
              <button
                type="submit"
                className="bg-brand-green text-brand-navy px-3 py-2 rounded-md font-semibold hover:bg-brand-blue hover:text-white transition"
              >
                Send
              </button>
            </form>
            {notice && (
              <div className="px-3 pb-3 text-xs text-slate-600">{notice}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
