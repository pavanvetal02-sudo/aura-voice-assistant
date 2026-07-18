import { useState, useCallback, useRef, useEffect } from "react";

export type AssistantState = "idle" | "listening" | "processing" | "speaking";
export type Emotion = "neutral" | "happy" | "sad" | "excited" | "friendly" | "comforting" | "funny";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  emotion?: Emotion;
  timestamp: Date;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
  resultIndex: number;
}

const API_BASE = (import.meta.env.VITE_AURA_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";

const VALID_EMOTIONS: Emotion[] = ["neutral", "happy", "sad", "excited", "friendly", "comforting", "funny"];

function asEmotion(value: unknown): Emotion {
  if (typeof value === "string" && VALID_EMOTIONS.includes(value as Emotion)) {
    return value as Emotion;
  }
  return "friendly";
}

/** Lightweight offline fallback when the Aura backend is unreachable. */
function processCommand(input: string): { response: string; emotion: Emotion; action?: () => void } {
  const lower = input.toLowerCase().trim();

  if (/open\s+(.+)/.test(lower)) {
    const match = lower.match(/open\s+(.+)/);
    let site = match?.[1]?.toLowerCase().trim() || "";
    const urls: Record<string, string> = {
      youtube: "https://www.youtube.com",
      google: "https://www.google.com",
      github: "https://github.com",
      spotify: "https://open.spotify.com",
    };
    const url = urls[site] || `https://www.google.com/search?q=${encodeURIComponent(site)}`;
    return {
      response: `Opening ${site} (offline mode). Start the Aura backend for full laptop control.`,
      emotion: "happy",
      action: () => window.open(url, "_blank"),
    };
  }

  if (/what('s| is) the time|current time|time now/.test(lower)) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { response: `It's currently ${time}.`, emotion: "friendly" };
  }

  if (/what('s| is) (the |today'?s? )?date|what day is it/.test(lower)) {
    const date = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { response: `Today is ${date}.`, emotion: "friendly" };
  }

  if (/^(hello|hi|hey|good morning|good evening)/.test(lower)) {
    return {
      response: "Hey! I'm Aura, your local OS assistant. Start the backend for full control, or ask me the time.",
      emotion: "friendly",
    };
  }

  if (/what('s| is) your name|who are you/.test(lower)) {
    return {
      response: "I'm Aura 2.0 — your Jarvis-style local assistant. I can open apps, control volume, and more when my backend is running.",
      emotion: "happy",
    };
  }

  return {
    response: `I heard: "${input}". The Aura backend isn't reachable at ${API_BASE}. Start it with: uvicorn app:app --port 8000`,
    emotion: "neutral",
  };
}

export function useVoiceAssistant() {
  const [state, setState] = useState<AssistantState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);
  const processingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      synthRef.current.cancel();
    };
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    synthRef.current.cancel();
    const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText || text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    const isFemale = (v: SpeechSynthesisVoice) => {
      const lower = v.name.toLowerCase();
      return lower.includes("female") || lower.includes("zira") || lower.includes("samantha") || lower.includes("victoria");
    };

    const preferred =
      voices.find((v) => v.lang.startsWith("en") && isFemale(v)) ||
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => {
      processingRef.current = false;
      setState("idle");
      onDone?.();
    };
    utterance.onerror = () => {
      processingRef.current = false;
      setState("idle");
      onDone?.();
    };

    setState("speaking");
    synthRef.current.speak(utterance);
  }, []);

  const sendMessage = useCallback(
    (input: string) => {
      if (!input.trim() || processingRef.current) return;

      processingRef.current = true;
      setState("processing");
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: input.trim(),
        timestamp: new Date(),
      };

      const finishWith = (response: string, emotion: Emotion, openUrl?: string | null, browserAction?: () => void) => {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: response,
          emotion,
          timestamp: new Date(),
        };
        setCurrentEmotion(emotion);
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setTimeout(() => {
          if (openUrl) window.open(openUrl, "_blank");
          browserAction?.();
          speak(response);
        }, 200);
      };

      const doBackendFetch = async (inputStr: string) => {
        try {
          const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: inputStr }),
          });

          if (!res.ok) throw new Error("Backend error");

          const data = await res.json();
          const response: string = data.reply || "Done.";
          const emotion = asEmotion(data.emotion);
          const url: string | null = data.url || data.result?.url || null;
          finishWith(response, emotion, url);
        } catch {
          const { response, emotion, action } = processCommand(inputStr);
          finishWith(response, emotion, null, action);
        }
      };

      synthRef.current.cancel();
      void doBackendFetch(input.trim());
    },
    [speak],
  );

  const startListening = useCallback(() => {
    if (processingRef.current || state === "processing" || state === "speaking") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        text: "Sorry, your browser doesn't support speech recognition. Try Chrome or Edge!",
        emotion: "sad",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
      return;
    }

    synthRef.current.cancel();
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    setState("listening");
    setTranscript("");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if ((result as any).isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setTranscript((current) => {
        if (current.trim()) {
          sendMessage(current.trim());
        } else {
          setState("idle");
        }
        return current;
      });
    };

    recognition.onerror = () => {
      setState("idle");
    };

    recognition.start();
  }, [sendMessage, state]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    synthRef.current.cancel();
    processingRef.current = false;
    setState("idle");
  }, []);

  return {
    state,
    messages,
    currentEmotion,
    transcript,
    startListening,
    stopListening,
    stopSpeaking,
    sendMessage,
  };
}
