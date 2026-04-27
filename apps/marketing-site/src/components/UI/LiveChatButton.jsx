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
            bg-brand-green text-white
            hover:bg-brand-blue
            transition
          "
          aria-label="Open live chat"
        >
          <MessageCircle className="h-5 w-5" />
        </motion.button>
      )}

      {/* Slide-over chat panel */}
      <AnimatePresence>
        {open && (
          <>
          <motion.button
            aria-label="Close live chat overlay"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-md"
          />
          <motion.div
            key="chat-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col rounded-l-[32px] border-l border-slate-200 bg-white sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-brand-green text-white">
              <h3 className="font-semibold">Live Chat</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages area (mocked) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-lightblue/40" />
                <div className="max-w-[75%] rounded-2xl bg-slate-200 p-2">
                  Hi there 👋 How can we help you today?
                </div>
              </div>
              <div className="flex gap-2 items-start justify-end">
                <div className="max-w-[75%] rounded-2xl bg-brand-blue p-2 text-white">
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
                className="h-11 flex-1 rounded-xl border border-slate-200/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:border-brand-blue"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-brand-green px-4 py-2 font-semibold text-brand-navy transition hover:bg-brand-blue hover:text-white"
              >
                Send
              </button>
            </form>
            {notice && (
              <div className="px-3 pb-3 text-xs text-slate-600">{notice}</div>
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
