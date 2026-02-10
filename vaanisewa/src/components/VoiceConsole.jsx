// import { useEffect, useRef } from "react";
// import { useDialogue } from "../context/DialogueContext";

// const VoiceConsole = () => {
//   const { messages } = useDialogue();
//   const consoleEndRef = useRef(null);

//   useEffect(() => {
//     // consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     if (consoleEndRef.current) {
//       const parent = consoleEndRef.current.parentElement;
//       parent.scrollTop = parent.scrollHeight;
//     }
//   }, [messages]);

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//   };

//   return (
//     <div
//       className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
//       role="log"
//       aria-live="polite"
//       aria-label="Voice conversation transcript"
//     >
//       <div className="mb-4 pb-3 border-b border-slate-200">
//         <h2 className="text-lg font-semibold text-slate-800">Conversation</h2>
//         <p className="text-sm text-slate-500 mt-0.5">Live transcript</p>
//       </div>

//       <div
//         className="space-y-2.5 h-80 overflow-y-auto pr-2 scrollbar-thin"
//       >
//         {messages.length === 0 ? (
//           <div className="text-center text-slate-400 py-8">
//             <p className="text-base">No messages yet</p>
//             <p className="text-sm mt-2">Start speaking to begin</p>
//           </div>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id}
//               className={`p-3.5 rounded-lg border-l-4 ${
//                 message.type === "user"
//                   ? "bg-blue-50 border-blue-400"
//                   : message.type === "system"
//                     ? "bg-emerald-50 border-emerald-400"
//                     : "bg-slate-50 border-slate-300 opacity-70"
//               }`}
//             >
//               <div className="flex justify-between items-start mb-1.5">
//                 <span
//                   className={`text-xs font-semibold uppercase tracking-wide ${
//                     message.type === "user"
//                       ? "text-blue-600"
//                       : message.type === "system"
//                         ? "text-emerald-600"
//                         : "text-slate-500"
//                   }`}
//                 >
//                   {message.type === "interim" ? "Listening..." : message.type}
//                 </span>
//                 <span className="text-xs text-slate-400">
//                   {formatTime(message.timestamp)}
//                 </span>
//               </div>
//               <p className="text-slate-700 text-sm leading-relaxed">
//                 {message.text}
//               </p>
//             </div>
//           ))
//         )}
//         <div ref={consoleEndRef} />
//       </div>
//     </div>
//   );
// };

// export default VoiceConsole;

import { useEffect, useRef } from "react";
import { useDialogue } from "../context/DialogueContext";

const VoiceConsole = () => {
  const { messages } = useDialogue();
  const scrollRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className="
        flex flex-col
        h-full min-h-0
        text-slate-800
      "
      role="log"
      aria-live="polite"
    >
      {/* HEADER */}
      <div className="mb-3 border-b border-slate-200 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Conversation
        </p>
        <p className="text-[11px] text-slate-400">Live Transcript</p>
      </div>

      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        className="
          flex-1 min-h-0
    overflow-y-auto
    pr-2
    space-y-3
        "
      >
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-10 text-sm">
            Awaiting voice input...
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.type === "user";
            const isSystem = m.type === "system";

            return (
              <div
                key={m.id}
                className={`
                  p-3 rounded-xl text-sm
                  border shadow-sm
                  ${
                    isUser
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : isSystem
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                  }
                `}
              >
                {/* top row */}
                <div className="flex justify-between text-[10px] mb-1 opacity-70 uppercase font-medium">
                  <span>{m.type === "interim" ? "Listening" : m.type}</span>
                  <span>{formatTime(m.timestamp)}</span>
                </div>

                {/* text */}
                <p className="leading-relaxed break-words">{m.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VoiceConsole;
