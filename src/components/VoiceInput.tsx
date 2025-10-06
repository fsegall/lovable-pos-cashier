import React, { useCallback, useEffect, useRef, useState } from 'react';

type RealtimeSession = {
  client_secret?: { value: string };
  model?: string;
};

const FUNCTIONS_BASE = (import.meta as any).env?.VITE_SUPABASE_FUNCTIONS_URL || '/functions/v1';

export function VoiceInput() {
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const closeConnection = useCallback(() => {
    try { recorderRef.current?.stop(); } catch {}
    try {
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    } catch {}
    try { wsRef.current?.close(); } catch {}
    recorderRef.current = null;
    mediaStreamRef.current = null;
    wsRef.current = null;
    setRecording(false);
    setConnected(false);
  }, []);

  useEffect(() => () => closeConnection(), [closeConnection]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');
    try {
      // 1) Get ephemeral token from Edge Function
      const r = await fetch(`${FUNCTIONS_BASE}/openai-realtime-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!r.ok) throw new Error(`token http ${r.status}`);
      const session: RealtimeSession = await r.json();
      const ephemeral = session?.client_secret?.value;
      if (!ephemeral) throw new Error('missing ephemeral token');

      // 2) Connect WebSocket to OpenAI Realtime
      const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(session.model || 'gpt-4o-realtime-preview-2024-12-17')}`;
      const ws = new WebSocket(url, []);
      wsRef.current = ws;

      ws.addEventListener('open', async () => {
        setConnected(true);
        // Authenticate with ephemeral token
        ws.send(JSON.stringify({ type: 'session.update', session: { client_secret: { value: ephemeral } } }));

        // 3) Capture microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const rec = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        recorderRef.current = rec;
        rec.addEventListener('dataavailable', (e) => {
          const blob = e.data;
          if (blob && blob.size > 0 && ws.readyState === WebSocket.OPEN) {
            blob.arrayBuffer().then((buf) => {
              // Send binary audio chunk
              ws.send(buf);
            }).catch(() => {});
          }
        });
        rec.start(250);
        setRecording(true);
      });

      ws.addEventListener('message', (ev) => {
        try {
          const data = JSON.parse(ev.data as string);
          // Simple transcript extraction; adjust based on Realtime payloads
          const text = data?.output?.[0]?.content || data?.text || data?.response?.output_text;
          if (typeof text === 'string' && text.trim().length > 0) {
            setTranscript(prev => (prev ? prev + '\n' : '') + text);
          }
        } catch {
          // Non-JSON (e.g., audio binary) — ignore
        }
      });

      ws.addEventListener('error', (e) => {
        setError('WebSocket error');
        closeConnection();
      });

      ws.addEventListener('close', () => {
        closeConnection();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      closeConnection();
    }
  }, [closeConnection]);

  const stop = useCallback(() => {
    closeConnection();
  }, [closeConnection]);

  return (
    <div className="flex flex-col gap-3 p-3 border rounded-md">
      <div className="text-sm text-muted-foreground">
        {connected ? 'Conectado ao OpenAI Realtime' : 'Desconectado'}
        {recording ? ' — Gravando' : ''}
      </div>
      <div className="flex gap-2">
        {!recording ? (
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={start}>
            Push-to-talk
          </button>
        ) : (
          <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={stop}>
            Parar
          </button>
        )}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {transcript && (
        <pre className="text-sm whitespace-pre-wrap bg-muted p-2 rounded max-h-48 overflow-auto">
{transcript}
        </pre>
      )}
    </div>
  );
}


