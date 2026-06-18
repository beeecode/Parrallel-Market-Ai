import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/simulation";

type ChatThreadProps = {
  messages: ChatMessage[];
};

export function ChatThread({ messages }: ChatThreadProps) {
  return (
    <div className="flex min-h-[28rem] flex-1 flex-col gap-4 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.09),transparent_32%)] px-4 py-5 sm:px-6">
      {messages.map((message) => {
        const outgoing = message.sender === "business";

        return (
          <div
            className={cn("flex", outgoing ? "justify-end" : "justify-start")}
            key={message.id}
          >
            <div
              className={cn(
                "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-[0_6px_14px_rgba(0,0,0,0.12)] sm:max-w-[68%]",
                outgoing
                  ? "rounded-br-md bg-emerald-700/85 text-white"
                  : "rounded-bl-md bg-slate-100 text-slate-950",
              )}
            >
              <p>{message.body}</p>
              <p
                className={cn(
                  "mt-1 text-right text-[10px]",
                  outgoing ? "text-emerald-100/75" : "text-slate-500",
                )}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
