import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = (import.meta.env.VITE_AURA_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";

type Voice = { id: string; name: string };

type Settings = {
  wake_enabled: boolean;
  wake_word: string;
  aura_keyword: boolean;
  tts_enabled: boolean;
  tts_voice: string;
  tts_rate: number;
  autostart: boolean;
  user_name: string;
  ollama_model: string;
  stt_model: string;
  command_seconds: number;
  speaker_verify_enabled: boolean;
  speaker_threshold: number;
  voices?: Voice[];
  capabilities?: {
    stt: boolean;
    openwakeword: boolean;
    speaker: boolean;
    speaker_enrolled: boolean;
  };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/settings`);
      const data = await res.json();
      setSettings(data);
    } catch {
      setStatus("Could not reach Aura backend at " + API);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setStatus("");
    try {
      const body = {
        wake_enabled: settings.wake_enabled,
        wake_word: settings.wake_word,
        aura_keyword: settings.aura_keyword,
        tts_enabled: settings.tts_enabled,
        tts_voice: settings.tts_voice,
        tts_rate: settings.tts_rate,
        autostart: settings.autostart,
        user_name: settings.user_name,
        ollama_model: settings.ollama_model,
        stt_model: settings.stt_model,
        command_seconds: settings.command_seconds,
        speaker_verify_enabled: settings.speaker_verify_enabled,
        speaker_threshold: settings.speaker_threshold,
      };
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setSettings(data);
      setStatus("Saved.");
    } catch {
      setStatus("Save failed — is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const enroll = async () => {
    setStatus("Recording 12s for voice enrollment — speak naturally…");
    try {
      const res = await fetch(`${API}/api/speaker/enroll?seconds=12`, { method: "POST" });
      const data = await res.json();
      setStatus(data.detail || (data.ok ? "Enrolled." : "Enrollment failed"));
      await load();
    } catch {
      setStatus("Enrollment failed — check mic and backend.");
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <p className="text-muted-foreground">{status || "Loading settings…"}</p>
      </div>
    );
  }

  const cap = settings.capabilities;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-wide">Aura Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Wake word, voice, startup, permissions</p>
          </div>
          <Link to="/" className="text-sm text-primary hover:underline">
            Back to orb
          </Link>
        </div>

        <div className="space-y-6 text-sm">
          <label className="flex items-center justify-between gap-4">
            <span>Wake word listening</span>
            <input
              type="checkbox"
              checked={settings.wake_enabled}
              onChange={(e) => setSettings({ ...settings, wake_enabled: e.target.checked })}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-muted-foreground">Wake model (openWakeWord)</span>
            <select
              className="w-full bg-background border border-border rounded-lg px-3 py-2"
              value={settings.wake_word}
              onChange={(e) => setSettings({ ...settings, wake_word: e.target.value })}
            >
              <option value="hey_jarvis">hey_jarvis (say “hey jarvis”)</option>
              <option value="alexa">alexa</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-4">
            <span>Also accept spoken “Aura” (keyword fallback)</span>
            <input
              type="checkbox"
              checked={settings.aura_keyword}
              onChange={(e) => setSettings({ ...settings, aura_keyword: e.target.checked })}
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span>Speak replies (local TTS)</span>
            <input
              type="checkbox"
              checked={settings.tts_enabled}
              onChange={(e) => setSettings({ ...settings, tts_enabled: e.target.checked })}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-muted-foreground">TTS voice</span>
            <select
              className="w-full bg-background border border-border rounded-lg px-3 py-2"
              value={settings.tts_voice || ""}
              onChange={(e) => setSettings({ ...settings, tts_voice: e.target.value })}
            >
              <option value="">System default</option>
              {(settings.voices || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-muted-foreground">Your name (Aura address)</span>
            <input
              className="w-full bg-background border border-border rounded-lg px-3 py-2"
              value={settings.user_name}
              onChange={(e) => setSettings({ ...settings, user_name: e.target.value })}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-muted-foreground">Ollama model</span>
            <input
              className="w-full bg-background border border-border rounded-lg px-3 py-2"
              value={settings.ollama_model}
              onChange={(e) => setSettings({ ...settings, ollama_model: e.target.value })}
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span>Start with Windows</span>
            <input
              type="checkbox"
              checked={settings.autostart}
              onChange={(e) => setSettings({ ...settings, autostart: e.target.checked })}
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span>Speaker verification (after wake)</span>
            <input
              type="checkbox"
              checked={settings.speaker_verify_enabled}
              onChange={(e) => setSettings({ ...settings, speaker_verify_enabled: e.target.checked })}
            />
          </label>

          <div className="rounded-xl border border-border bg-card/40 p-4 space-y-2">
            <p className="font-medium">Capabilities</p>
            <ul className="text-muted-foreground space-y-1">
              <li>STT (faster-whisper): {cap?.stt ? "ready" : "install packages"}</li>
              <li>Wake word (openWakeWord): {cap?.openwakeword ? "ready" : "optional fallback active"}</li>
              <li>Speaker (Resemblyzer): {cap?.speaker ? "ready" : "not installed"}</li>
              <li>Voice enrolled: {cap?.speaker_enrolled ? "yes" : "no"}</li>
            </ul>
            <button
              type="button"
              onClick={() => void enroll()}
              className="mt-2 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted"
            >
              Enroll my voice (12s)
            </button>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>

          {status && <p className="text-center text-muted-foreground">{status}</p>}
        </div>
      </div>
    </div>
  );
}
