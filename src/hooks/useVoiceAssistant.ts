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

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😄",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "I told my computer I needed a break, and now it won't stop sending me Kit-Kat ads! 🍫",
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
];

const motivationalQuotes = [
  "You are capable of amazing things. Keep pushing forward! 💪",
  "Every day is a new chance to grow. Believe in yourself! 🌟",
  "The only limit is the one you set for yourself. Dream big! 🚀",
  "You've survived 100% of your worst days. You're doing great! ❤️",
];

const greetings = [
  "Hey there! I'm Nova, your AI assistant. How can I brighten your day? ✨",
  "Hello! Nova here, ready to help! What's on your mind? 😊",
  "Hi! Great to hear from you! What can I do for you today? 🌟",
];

function detectEmotion(input: string): Emotion {
  const lower = input.toLowerCase();
  if (/sad|upset|depressed|unhappy|crying|lonely|hurt|pain/.test(lower)) return "comforting";
  if (/happy|great|awesome|amazing|wonderful|fantastic|excited/.test(lower)) return "excited";
  if (/joke|funny|laugh|humor/.test(lower)) return "funny";
  if (/hello|hi|hey|greet|good morning|good evening|good afternoon/.test(lower)) return "friendly";
  if (/thank|thanks|appreciate/.test(lower)) return "happy";
  if (/love|beautiful|gorgeous/.test(lower)) return "happy";
  return "neutral";
}

function processCommand(input: string): { response: string; emotion: Emotion; action?: () => void } {
  const lower = input.toLowerCase().trim();
  const emotion = detectEmotion(input);

  // Open websites
  if (/open\s+(youtube|google|instagram|twitter|facebook|github|reddit|spotify|netflix)/.test(lower)) {
    const match = lower.match(/open\s+(\w+)/);
    const site = match?.[1] || "";
    const urls: Record<string, string> = {
      youtube: "https://www.youtube.com",
      google: "https://www.google.com",
      instagram: "https://www.instagram.com",
      twitter: "https://twitter.com",
      facebook: "https://www.facebook.com",
      github: "https://github.com",
      reddit: "https://www.reddit.com",
      spotify: "https://www.spotify.com",
      netflix: "https://www.netflix.com",
    };
    const url = urls[site];
    if (url) {
      return {
        response: `Opening ${site.charAt(0).toUpperCase() + site.slice(1)} for you! 🌐`,
        emotion: "happy",
        action: () => window.open(url, "_blank"),
      };
    }
  }

  // Time
  if (/what('s| is) the time|current time|time now|tell me the time/.test(lower)) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { response: `It's currently ${time} ⏰`, emotion: "friendly" };
  }

  // Date
  if (/what('s| is) (the |today'?s? )?date|today'?s? date|what day is it/.test(lower)) {
    const date = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return { response: `Today is ${date} 📅`, emotion: "friendly" };
  }

  // Jokes
  if (/tell me a joke|joke|make me laugh|something funny/.test(lower)) {
    return { response: jokes[Math.floor(Math.random() * jokes.length)], emotion: "funny" };
  }

  // Motivation
  if (/motivat|inspire|encourage|i (can't|cannot|can not)|i give up|i('m| am) tired/.test(lower)) {
    return { response: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], emotion: "comforting" };
  }

  // Greetings
  if (/^(hello|hi|hey|good morning|good evening|good afternoon|howdy|what'?s? up)/.test(lower)) {
    return { response: greetings[Math.floor(Math.random() * greetings.length)], emotion: "friendly" };
  }

  // How are you
  if (/how are you|how('re| are) you doing|how do you feel/.test(lower)) {
    return { response: "I'm feeling absolutely electric today! ⚡ Thanks for asking. How about you?", emotion: "excited" };
  }

  // Name
  if (/what('s| is) your name|who are you/.test(lower)) {
    return { response: "I'm Nova — your futuristic AI voice assistant! ✨ I'm here to help, chat, and make your day better!", emotion: "happy" };
  }

  // Sad user
  if (/i('m| am) (feeling )?(sad|depressed|lonely|upset|unhappy|down)/.test(lower)) {
    return {
      response: "I'm really sorry you're feeling that way. 💙 Remember, it's okay to not be okay sometimes. I'm here for you, and brighter days are ahead. Would you like to hear a joke or some motivation?",
      emotion: "comforting",
    };
  }

  // Happy user
  if (/i('m| am) (feeling )?(happy|great|awesome|amazing|wonderful|fantastic|excited)/.test(lower)) {
    return { response: "That's wonderful to hear! 🎉 Your positive energy is contagious! Keep shining! ✨", emotion: "excited" };
  }

  // Thank you
  if (/thank you|thanks|thank u/.test(lower)) {
    return { response: "You're welcome! Always happy to help! 😊💜", emotion: "happy" };
  }

  // Weather (basic)
  if (/weather|temperature|forecast/.test(lower)) {
    return { response: "I can't check live weather right now, but you can ask me to open a weather site! Try saying 'open google' and search for weather there. 🌤️", emotion: "friendly" };
  }

  // Calculator basics
  if (/what('s| is) (\d+)\s*(\+|-|\*|x|times|plus|minus)\s*(\d+)/.test(lower)) {
    const match = lower.match(/what(?:'s| is) (\d+)\s*(\+|-|\*|x|times|plus|minus)\s*(\d+)/);
    if (match) {
      const a = parseInt(match[1]);
      const op = match[2];
      const b = parseInt(match[3]);
      let result: number;
      switch (op) {
        case "+": case "plus": result = a + b; break;
        case "-": case "minus": result = a - b; break;
        case "*": case "x": case "times": result = a * b; break;
        default: result = a + b;
      }
      return { response: `The answer is ${result}! 🧮`, emotion: "friendly" };
    }
  }

  // Default
  return {
    response: `I heard you say: "${input}". I'm still learning, but I'm here to help! Try asking me the time, a joke, or to open a website! 🤖`,
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

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      synthRef.current.cancel();
    };
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    synthRef.current.cancel();
    const cleanText = text.replace(/[✨💪🌟🚀❤️😊😄🍝🌾🍫🐛⏰📅🌐🎉💜🌤️🧮🤖💙⚡]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Google") && v.lang.startsWith("en")
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => {
      setState("idle");
      onDone?.();
    };
    utterance.onerror = () => {
      setState("idle");
      onDone?.();
    };

    synthRef.current.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        text: "Sorry, your browser doesn't support speech recognition. Try Chrome or Edge! 🌐",
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
          setState("processing");
          const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: current.trim(),
            timestamp: new Date(),
          };

          const doBackendFetch = async (input: string) => {
            try {
              const res = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input })
              });
              
              if (!res.ok) throw new Error("Backend error");
              
              const data = await res.json();
              const response = data.reply;
              const emotion: Emotion = "neutral";
              
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
                if (data.action === "open_url" && data.url) {
                  window.open(data.url, "_blank");
                }
                speak(response);
              }, 300);
            } catch (e) {
              // fallback if backend is down
              const { response, emotion, action } = processCommand(input);
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
                action?.();
                speak(response);
              }, 300);
            }
          };

          doBackendFetch(current.trim());
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
  }, [speak]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    synthRef.current.cancel();
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
  };
}
