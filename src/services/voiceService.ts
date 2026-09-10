export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  detectedLanguage: 'gu-IN' | 'hi-IN' | 'en-US';
}

export class VoiceController {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onStateChangeCallback: ((isListening: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'gu-IN'; // Default to Gujarati / Hindi / English flexible
      }
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition || !!this.synthesis;
  }

  public startListening(
    lang: 'gu-IN' | 'hi-IN' | 'en-US' = 'gu-IN',
    onTranscript: (text: string, isFinal: boolean) => void,
    onStateChange: (isListening: boolean) => void
  ) {
    if (!this.recognition) return;
    this.onTranscriptCallback = onTranscript;
    this.onStateChangeCallback = onStateChange;
    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.onStateChangeCallback?.(true);
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      this.onTranscriptCallback?.(final || interim, !!final);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      this.onStateChangeCallback?.(false);
    };

    this.recognition.onend = () => {
      this.onStateChangeCallback?.(false);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.onStateChangeCallback?.(false);
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synthesis) return;
    this.stopSpeaking();

    // Clean markdown and symbols
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .substring(0, 400);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isGujarati = /[\u0A80-\u0AFA]/.test(text);
    const isHindi = /[\u0900-\u097F]/.test(text);

    utterance.lang = isGujarati ? 'gu-IN' : isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const voiceController = new VoiceController();
