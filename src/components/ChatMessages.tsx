import { useEffect, useRef } from "react";
import { type Message, type Emotion } from "@/hooks/useVoiceAssistant";

interface ChatMessagesProps {
  messages: Message[];
}

const emotionLabels: Record<Emotion, string> = {
  neutral: "🤖",
  happy: "😊",
  sad: "😢",
  excited: "🎉",
  friendly: "👋",
  comforting: "💙",
  funny: "😄",
};

export function ChatMessages({ messages }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground animate-fade-in">
        <p className="text-sm font-body">Say something like:</p>
        <div className="mt-3 flex flex-wrap gap-2 justify-center max-w-md">
          {['"Hello Nova"', '"Tell me a joke"', '"What time is it?"', '"Open YouTube"', '"I\'m feeling sad"'].map((s) => (
            <span key={s} className="px-3 py-1.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{s}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto px-2 py-3 scrollbar-thin">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}
          >
            {msg.role === "assistant" && msg.emotion && (
              <span className="mr-1.5">{emotionLabels[msg.emotion]}</span>
            )}
            <TypewriterText text={msg.text} animate={msg.role === "assistant"} />
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function TypewriterText({ text, animate }: { text: string; animate: boolean }) {
  if (!animate) return <span>{text}</span>;

  return (
    <span className="inline">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline"
          style={{
            animation: "fade-in 0.02s ease-out forwards",
            animationDelay: `${i * 12}ms`,
            opacity: 0,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
