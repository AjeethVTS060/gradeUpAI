import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { 
  Bot, 
  Send, 
  Loader2, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Calculator,
  BookOpen,
  Brain,
  Zap,
  Settings,
  Trash2,
  User,
  Copy,
  RotateCcw,
  Globe
} from "lucide-react";
import Navigation from "../components/navigation";
import { apiRequest } from "../lib/queryClient";
import { cn } from "../lib/utils";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  subject?: string;
}

const subjects = [
  { name: "Mathematics", icon: Calculator, color: "bg-blue-500" },
  { name: "Physics", icon: BookOpen, color: "bg-green-500" },
  { name: "Chemistry", icon: BookOpen, color: "bg-purple-500" },
  { name: "Biology", icon: BookOpen, color: "bg-emerald-500" },
  { name: "History", icon: BookOpen, color: "bg-red-500" },
  { name: "Literature", icon: BookOpen, color: "bg-orange-500" },
];

const quickQuestions = [
  "Solve: 2x² + 5x - 3 = 0",
  "Explain photosynthesis",
  "What caused World War I?",
  "Help with essay writing",
  "Explain gravity",
  "Solve algebra problems"
];

const accentOptions = [
  { value: 'us', label: 'US English', flag: '🇺🇸' },
  { value: 'uk', label: 'UK English', flag: '🇬🇧' },
  { value: 'indian', label: 'Indian English', flag: '🇮🇳' }
];

export default function AITutorPage() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  const currentRole = user.role || "student";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI tutor with enhanced voice capabilities. I can help you learn any subject with natural speech in different accents. What would you like to study today?',
      timestamp: new Date()
    }
  ]);
  
  // Core states
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [tutorMode, setTutorMode] = useState<'basic' | 'educational' | 'enhanced'>('enhanced');
  const [selectedModel, setSelectedModel] = useState<string>('google/gemma-3-12b-it');
  
  // Enhanced Voice states with UK English and human-like defaults
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.7);
  const [selectedVoice, setSelectedVoice] = useState<string>('openai-fable');
  const [selectedAccent, setSelectedAccent] = useState<'us' | 'uk' | 'indian'>('uk');
  const [humanization, setHumanization] = useState<number>(1.0);
  const [voiceBreathing, setVoiceBreathing] = useState(true);
  const [voicePauses, setVoicePauses] = useState(true);
  const [voiceEmphasis, setVoiceEmphasis] = useState(true);
  
  // Text highlighting states
  const [currentlyReadingText, setCurrentlyReadingText] = useState<string>('');
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [lastSpokenMessage, setLastSpokenMessage] = useState<string>('');
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean>(false);
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: tutorStatus } = useQuery({
    queryKey: ["/api/chat/status"],
    refetchInterval: 30000,
  });

  const { data: voiceModels } = useQuery({
    queryKey: ["/api/voice/models"],
    staleTime: 300000,
  });

  const { data: aiModels } = useQuery({
    queryKey: ["/api/ai/models"],
    staleTime: 300000,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const actualSubject = selectedSubject === "all" ? "" : selectedSubject;
      const context = actualSubject ? `Subject: ${actualSubject}. ` : '';
      const res = await apiRequest("POST", "/api/chat", { 
        message: userMessage,
        context: context,
        mode: tutorMode,
        subject: actualSubject,
        modelId: selectedModel
      });
      return { ...await res.json(), actualSubject };
    },
    onSuccess: (data) => {
      const aiMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: data.response,
        timestamp: new Date(),
        subject: data.actualSubject
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-speak AI responses if voice is enabled
      if (voiceEnabled) {
        setTimeout(async () => {
          if (!audioPermissionGranted) {
            await enableAudio();
          }
          speakText(data.response);
        }, 100);
      }
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: "I'm experiencing some technical difficulties. Please try again later.",
          timestamp: new Date()
        }
      ]);
    }
  });

  // Enhanced Speech synthesis with scientific terminology support
  // Initialize audio permission and test browser audio
  const enableAudio = async () => {
    try {
      // Create and play a silent audio element to trigger user gesture
      const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+XxtGIcBjmR2e/DdysI6OeHxMTBciYE');
      silentAudio.volume = 0.01;
      
      // Test Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Test speech synthesis with a very short phrase
      if ('speechSynthesis' in window) {
        const testUtterance = new SpeechSynthesisUtterance('.');
        testUtterance.volume = 0.01;
        testUtterance.rate = 2;
        speechSynthesis.speak(testUtterance);
      }
      
      audioContext.close();
      setAudioPermissionGranted(true);
      // console.log('Audio permission granted and tested');
    } catch (error) {
      console.warn('Audio permission failed:', error);
      setAudioPermissionGranted(true); // Allow fallback attempt
    }
  };

  const speakWithOpenAITTS = async (text: string) => {
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: selectedVoice === 'openai-fable' ? 'fable' : 'alloy',
          speed: 0.7,
          format: 'mp3'
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      
      const words = text.split(/\s+/);
      setHighlightedText(text);
      setHighlightedWordIndex(0);
      
      let wordIndex = 0;
      let highlightInterval: NodeJS.Timeout;

      const updateHighlight = () => {
        if (wordIndex < words.length && isSpeaking && speechActive) {
          

      audio.onerror = (error) => {
        console.error('OpenAI TTS audio error:', error);
        setIsSpeaking(false);
        setSpeechActive(false);
        setHighlightedWordIndex(-1);
        if (highlightInterval) clearTimeout(highlightInterval);
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback failed');
      };

      currentAudioRef.current = audio;
      await audio.play();
      
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      setIsSpeaking(false);
      setSpeechActive(false);
      setHighlightedWordIndex(-1);
      throw error;
    }
  };

  const speakText = async (text: string) => {
    if (!text || !voiceEnabled) return;
    
    // Stop any existing speech cleanly
    if (speechActive || isSpeaking) {
      stopSpeaking();
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Clear any existing speech timeouts
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    // Set active states
    setSpeechActive(true);
    setLastSpokenMessage(text);
    
    // Request audio permission if not granted
    if (!audioPermissionGranted) {
      await enableAudio();
    }

    // Try OpenAI TTS first for better STEM pronunciation
    try {
      await speakWithOpenAITTS(text);
      return;
    } catch (error) {
      // console.log('OpenAI TTS failed, falling back to browser TTS:', error);
      // Fall back to browser TTS
    }
    
    try {
      
      let processedText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/```[\s\S]*?```/g, '[code block]')
        .replace(/`([^`]+)`/g, '$1')
        .trim();

      // Enhance scientific and biological terminology pronunciation
      processedText = enhanceScientificPronunciation(processedText, selectedAccent);
      
      // Set up text highlighting
      setCurrentlyReadingText(processedText);
      const words = processedText.split(' ');

      // Try browser speech synthesis with enhanced settings
      if ('speechSynthesis' in window) {
        // Wait for voices to load if not already loaded
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          speechSynthesis.addEventListener('voiceschanged', () => {
            voices = speechSynthesis.getVoices();
          });
          // Small delay to allow voices to load
          await new Promise(resolve => setTimeout(resolve, 100));
          voices = speechSynthesis.getVoices();
        }
        
        const utterance = new SpeechSynthesisUtterance(processedText);
        
        // Select the best voice based on accent and quality
        let selectedVoiceObj = selectOptimalVoice(voices, selectedAccent);
        
        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
          utterance.lang = selectedVoiceObj.lang;
        } else {
          // Fallback language setting
          utterance.lang = selectedAccent === 'uk' ? 'en-GB' : selectedAccent === 'indian' ? 'en-IN' : 'en-US';
        }
        
        // Apply enhanced humanization settings for more natural speech
        const baseRate = speechSpeed;
        const humanizedRate = baseRate * (0.8 + humanization * 0.4); // More natural rate variation
        const humanizedPitch = 0.9 + (humanization * 0.3); // Enhanced pitch variation
        const humanizedVolume = 0.95 + (humanization * 0.05); // Subtle volume variation
        
        utterance.rate = Math.max(0.1, Math.min(2.0, humanizedRate));
        utterance.pitch = Math.max(0.0, Math.min(2.0, humanizedPitch));
        utterance.volume = Math.max(0.0, Math.min(1.0, humanizedVolume));
        
        // Add natural pauses and emphasis for better comprehension
        let finalText = processedText;
        if (voicePauses) {
          finalText = addNaturalPauses(finalText);
        }
        if (voiceEmphasis) {
          // Add emphasis markers for important words
          finalText = finalText
            .replace(/\b(important|crucial|essential|key|significant)\b/gi, '$1!')
            .replace(/\b(remember|note|observe|notice)\b/gi, '$1:');
        }
        utterance.text = finalText;
        
        // Store reference for stopping
        speechSynthRef.current = utterance;
        
        // Enhanced word highlighting with better timing
        let wordIndex = 0;
        let highlightInterval: NodeJS.Timeout;
        let startTime: number;
        
        const startHighlighting = () => {
          // console.log('🎯 Starting text highlighting for', words.length, 'words');
          startTime = Date.now();
          wordIndex = 0;
          setHighlightedWordIndex(0); // Start with first word
          
          const updateHighlight = () => {
            // Use a more reliable check - continue if we have words and speech synthesis is active
            const shouldContinue = wordIndex < words.length && (speechSynthesis.speaking || isSpeaking);
            
            if (shouldContinue) {
              // console.log('📝 Highlighting word', wordIndex, ':', words[wordIndex]);
              setHighlightedWordIndex(wordIndex);
              wordIndex++;
              
              // Simple and fast timing calculation
              const speechRate = utterance.rate; // Current speech rate (0.7)
              
              // Base delay per word - much faster
              let wordDelay = 250; // Base 250ms per word
              
              // Adjust for speech rate
              wordDelay = wordDelay / speechRate;
              
              // Minimal adjustments for word length
              const currentWord = words[wordIndex - 1] || '';
              if (currentWord.length > 8) {
                wordDelay += 50; // Small extra for long words
              } else if (currentWord.length < 3) {
                wordDelay -= 50; // Faster for short words
              }
              
              // Small pause for punctuation
              if (currentWord.includes('.') || currentWord.includes('!') || currentWord.includes('?')) {
                wordDelay += 100; // Brief pause for sentence endings
              }
              
              highlightInterval = setTimeout(updateHighlight, Math.max(80, wordDelay));
            } else {
              // console.log('🏁 Highlighting complete - words:', wordIndex, '/', words.length, 'speechSynthesis.speaking:', speechSynthesis.speaking, 'isSpeaking:', isSpeaking);
              setHighlightedWordIndex(-1);
            }
          };
          
          // Start highlighting immediately
          updateHighlight();
        };
        
        const stopHighlighting = () => {
          if (highlightInterval) {
            clearTimeout(highlightInterval);
          }
          setHighlightedWordIndex(-1);
        };
        
        utterance.onstart = () => {
          // console.log('✅ Speech STARTED with voice:', utterance.voice?.name || 'default');
          // console.log('🔊 Voice settings - Rate:', utterance.rate, 'Pitch:', utterance.pitch, 'Volume:', utterance.volume);
          setCurrentlyReadingText(text); // Set the text being read for highlighting
          setIsSpeaking(true); // Ensure isSpeaking state is true
          startHighlighting();
        };
        
        utterance.onend = () => {
          // console.log('✅ Speech ENDED successfully');
          setSpeechActive(false);
          setIsSpeaking(false);
          setCurrentlyReadingText('');
          stopHighlighting();
          speechSynthRef.current = null;
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Speech synthesis ERROR:', event.error, event);
          setSpeechActive(false);
          setIsSpeaking(false);
          setCurrentlyReadingText('');
          stopHighlighting();
          speechSynthRef.current = null;
        };
        
        // Ensure speech synthesis is ready and speak
        try {
          
          // Ensure volume is audible
          utterance.volume = 1.0; // Full volume
          
          // Log detailed info for debugging
          // console.log('🎯 Attempting speech with:', {
          //   text: finalText.substring(0, 50) + '...',
          //   voice: utterance.voice?.name,
          //   lang: utterance.lang,
          //   rate: utterance.rate,
          //   pitch: utterance.pitch,
          //   volume: utterance.volume,
          //   speechSynthAvailable: 'speechSynthesis' in window,
          //   voicesCount: speechSynthesis.getVoices().length,
          //   speaking: speechSynthesis.speaking,
          //   pending: speechSynthesis.pending,
          //   paused: speechSynthesis.paused
          // });
          
          // Force ensure voices are loaded
          if (speechSynthesis.getVoices().length === 0) {
            // console.log('⏳ Waiting for voices to load...');
            // Force voice loading
            speechSynthesis.getVoices();
            await new Promise(resolve => {
              if (speechSynthesis.getVoices().length > 0) {
                resolve(true);
              } else {
                speechSynthesis.addEventListener('voiceschanged', () => {
                  // console.log('🔄 Voices loaded:', speechSynthesis.getVoices().length);
                  resolve(true);
                }, { once: true });
              }
            });
          }
          
          // Ensure clean state before speaking
          if (speechSynthesis.speaking || speechSynthesis.pending) {
            speechSynthesis.cancel();
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // console.log('🚀 Initiating speech synthesis...');
          speechSynthesis.speak(utterance);
          
          // Verify speech actually started
          setTimeout(() => {
            if (!speechSynthesis.speaking && isSpeaking) {
              console.warn('⚠️ Speech synthesis may have failed silently. Retrying...');
              speechSynthesis.speak(utterance);
            }
          }, 200);
          
        } catch (error) {
          console.error('Speech synthesis failed:', error);
          setIsSpeaking(false);
        }
      } else {
        setIsSpeaking(false);
        console.warn('Speech synthesis not available in this browser');
      }
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
      setHighlightedWordIndex(-1);
      setCurrentlyReadingText('');
    }
  };

  // Repeat last spoken message
  const repeatLastMessage = () => {
    if (lastSpokenMessage) {
      speakText(lastSpokenMessage);
    }
  };

  // Enhanced scientific pronunciation function
  const enhanceScientificPronunciation = (text: string, accent: string): string => {
    const scientificTerms: { [key: string]: string } = {
      // Mathematical terms
      'π': 'pie',
      'α': 'alpha',
      'β': 'beta',
      'γ': 'gamma',
      'δ': 'delta',
      'θ': 'theta',
      'λ': 'lambda',
      'μ': 'mu',
      'σ': 'sigma',
      'Σ': 'sigma',
      '∫': 'integral',
      '∂': 'partial derivative',
      '∇': 'nabla',
      '∞': 'infinity',
      '≈': 'approximately equals',
      '≤': 'less than or equal to',
      '≥': 'greater than or equal to',
      
      // Chemistry terms
      'H₂O': 'H two O',
      'CO₂': 'C O two',
      'NaCl': 'sodium chloride',
      'H₂SO₄': 'sulfuric acid',
      'CH₄': 'methane',
      'C₆H₁₂O₆': 'glucose',
      'ATP': 'A T P',
      'DNA': 'D N A',
      'RNA': 'R N A',
      'mRNA': 'messenger R N A',
      'HCl': 'hydrochloric acid',
      'H₂CO₃': 'carbonic acid',
      'CaCO₃': 'calcium carbonate',
      'NaOH': 'sodium hydroxide',
      'NH₃': 'ammonia',
      'O₂': 'oxygen gas',
      'N₂': 'nitrogen gas',
      'Cl₂': 'chlorine gas',
      'pH': 'P H',
      'pOH': 'P O H',
      'molarity': 'molarity',
      'molality': 'molality',
      'stoichiometry': 'stoich-io-metry',
      'equilibrium': 'equi-librium',
      'catalyst': 'cata-lyst',
      'isotope': 'iso-tope',
      'periodic': 'peri-odic',
      'electronegativity': 'electro-negativity',
      'covalent': 'co-valent',
      'ionic': 'i-onic',
      'polar': 'po-lar',
      'nonpolar': 'non-polar',
      
      // Biology terms
      'photosynthesis': 'photo-synthesis',
      'mitochondria': 'mito-chondria',
      'chloroplast': 'chloro-plast',
      'chromosome': 'chromo-some',
      'deoxyribonucleic': 'de-oxy-ribo-nucleic',
      'ribonucleic': 'ribo-nucleic',
      'cytoplasm': 'cyto-plasm',
      'nucleus': 'nucleus',
      'organelle': 'organ-elle',
      'endoplasmic': 'endo-plasmic',
      'ribosome': 'ribo-some',
      'lysosome': 'lyso-some',
      'vacuole': 'vacuo-le',
      'prokaryote': 'pro-karyo-te',
      'eukaryote': 'eu-karyo-te',
      'metabolism': 'meta-bolism',
      'homeostasis': 'homeo-stasis',
      'osmosis': 'os-mosis',
      'diffusion': 'di-ffusion',
      'meiosis': 'meio-sis',
      'mitosis': 'mito-sis',
      'enzyme': 'en-zyme',
      'protein': 'pro-tein',
      'amino acid': 'amino acid',
      'carbohydrate': 'carbo-hydrate',
      'lipid': 'li-pid',
      'nucleotide': 'nucleo-tide',
      'phenotype': 'pheno-type',
      'genotype': 'geno-type',
      'allele': 'a-lele',
      'dominant': 'domi-nant',
      'recessive': 're-cessive',
      'heterozygous': 'hetero-zygous',
      'homozygous': 'homo-zygous',
      
      // Physics terms
      'electromagnetic': 'electro-magnetic',
      'thermodynamics': 'thermo-dynamics',
      'quantum': 'quantum',
      'relativity': 'relativity',
      'wavelength': 'wave-length',
      'frequency': 'frequency',
      'amplitude': 'amplitude',
      'acceleration': 'acceleration',
      'velocity': 'velocity',
      
      // Common scientific prefixes
      'nano': 'nano',
      'micro': 'micro',
      'milli': 'milli',
      'kilo': 'kilo',
      'mega': 'mega',
      'giga': 'giga'
    };

    let enhancedText = text;
    
    // Replace scientific symbols and terms
    Object.entries(scientificTerms).forEach(([term, pronunciation]) => {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      enhancedText = enhancedText.replace(regex, pronunciation);
    });

    // Remove emojis and clean up text for better speech synthesis
    enhancedText = enhancedText
      .replace(/🧬/g, '') // DNA emoji
      .replace(/⚗️/g, '') // Chemistry emoji
      .replace(/⚡/g, '') // Lightning emoji
      .replace(/😊/g, '') // Smiling face
      .replace(/😀/g, '') // Grinning face
      .replace(/👋/g, '') // Waving hand
      .replace(/💡/g, '') // Light bulb
      .replace(/🎯/g, '') // Target
      .replace(/📚/g, '') // Books
      .replace(/🔬/g, '') // Microscope
      .replace(/⭐/g, '') // Star
      .replace(/✨/g, '') // Sparkles
      .replace(/🌟/g, '') // Glowing star
      .replace(/🎉/g, '') // Party
      .replace(/🤔/g, '') // Thinking
      .replace(/👍/g, '') // Thumbs up
      .replace(/🔥/g, '') // Fire
      .replace(/💪/g, '') // Muscle
      .replace(/🚀/g, '') // Rocket
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();

    // Add specific accent adjustments
    if (accent === 'uk') {
      enhancedText = enhancedText
        .replace(/aluminum/gi, 'aluminium')
        .replace(/sulfur/gi, 'sulphur');
    } else if (accent === 'indian') {
      // Indian English tends to pronounce certain terms more syllabically
      enhancedText = enhancedText
        .replace(/process/gi, 'pro-cess')
        .replace(/analysis/gi, 'ana-ly-sis');
    }

    return enhancedText;
  };

  // Select optimal voice based on accent and quality
  const selectOptimalVoice = (voices: SpeechSynthesisVoice[], accent: string): SpeechSynthesisVoice | null => {
    let preferredVoices: SpeechSynthesisVoice[] = [];
    
    if (accent === 'uk') {
      // Priority order for UK voices - look for high-quality British voices
      preferredVoices = voices.filter(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        return (
          lang.includes('gb') || 
          lang.includes('en-gb') ||
          name.includes('uk') || 
          name.includes('british') ||
          name.includes('daniel') ||
          name.includes('kate') ||
          name.includes('serena') ||
          name.includes('arthur') ||
          name.includes('fable') ||
          name.includes('hazel') ||
          name.includes('william') ||
          name.includes('oliver')
        );
      });
      
      // If no specific UK voices, try premium voices that can do British accent
      if (preferredVoices.length === 0) {
        preferredVoices = voices.filter(voice => {
          const name = voice.name.toLowerCase();
          return (
            voice.lang.startsWith('en') && (
              name.includes('premium') ||
              name.includes('enhanced') ||
              name.includes('neural') ||
              name.includes('female') ||
              name.includes('male')
            )
          );
        });
      }
    } else if (accent === 'indian') {
      preferredVoices = voices.filter(voice => 
        voice.lang.includes('IN') || 
        voice.lang.includes('en-IN') ||
        voice.name.toLowerCase().includes('indian') ||
        voice.name.toLowerCase().includes('ravi') ||
        voice.name.toLowerCase().includes('veena')
      );
    } else {
      // US English - prefer higher quality voices
      preferredVoices = voices.filter(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        return (
          (lang.includes('us') || lang === 'en-us') &&
          (name.includes('samantha') ||
           name.includes('alex') ||
           name.includes('susan') ||
           name.includes('allison') ||
           name.includes('nova') ||
           name.includes('alloy') ||
           name.includes('fable'))
        );
      });
    }
    
    // If no specific accent voices found, get any high-quality English voice
    if (preferredVoices.length === 0) {
      preferredVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && 
        !voice.name.toLowerCase().includes('compact')
      );
    }
    
    // Final fallback to any English voice
    if (preferredVoices.length === 0) {
      preferredVoices = voices.filter(voice => voice.lang.startsWith('en'));
    }
    
    // Prefer local voices (they tend to be higher quality and more responsive)
    const localVoices = preferredVoices.filter(voice => voice.localService);
    const finalVoice = localVoices.length > 0 ? localVoices[0] : preferredVoices[0];
    
    if (finalVoice) {
      // console.log(`Selected voice: ${finalVoice.name} (${finalVoice.lang}) - Local: ${finalVoice.localService}`);
    }
    
    return finalVoice || voices[0];
  };

  // Add natural pauses for better comprehension
  const addNaturalPauses = (text: string): string => {
    return text
      .replace(/\. /g, '. ... ') // Pause after sentences
      .replace(/\, /g, ', .. ') // Short pause after commas
      .replace(/\; /g, '; ... ') // Pause after semicolons
      .replace(/\: /g, ': .. ') // Short pause after colons
      .replace(/\? /g, '? ... ') // Pause after questions
      .replace(/\! /g, '! ... '); // Pause after exclamations
  };

  const stopSpeaking = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    speechSynthesis.cancel();
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    setSpeechActive(false);
    setIsSpeaking(false);
    setHighlightedWordIndex(-1);
    setCurrentlyReadingText('');
    speechSynthRef.current = null;
  };

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;
    
    const actualSubject = selectedSubject === "all" ? "" : selectedSubject;
    
    chatMutation.mutate(message);
    setMessage("");
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      subject: actualSubject
    }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI tutor with enhanced voice capabilities. I can help you learn any subject with natural speech in different accents. What would you like to study today?',
      timestamp: new Date()
    }]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation currentRole={currentRole} onRoleChange={() => {}} />
      
      <div className="flex flex-col lg:flex-row gap-6 p-4 pt-20">
        {/* Enhanced Sidebar with Voice Controls */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Subject Selection */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.name} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-2">
                {subjects.slice(0, 4).map(subject => {
                  const Icon = subject.icon;
                  return (
                    <Button
                      key={subject.name}
                      variant={selectedSubject === subject.name ? "default" : "outline"}
                      className="text-xs h-8"
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {subject.name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Mode Selection */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={tutorMode === 'basic' ? 'default' : 'outline'}
                  className="justify-start text-sm h-10"
                  onClick={() => setTutorMode('basic')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Basic Guidance
                </Button>
                <Button
                  variant={tutorMode === 'educational' ? 'default' : 'outline'}
                  className="justify-start text-sm h-10"
                  onClick={() => setTutorMode('educational')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Educational Tutor
                </Button>
                <Button
                  variant={tutorMode === 'enhanced' ? 'default' : 'outline'}
                  className="justify-start text-sm h-10"
                  onClick={() => setTutorMode('enhanced')}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Enhanced AI
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Selection */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select AI Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels?.models?.map((model: any) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                          {model.recommended && (
                            <span className="text-xs text-green-600">Recommended</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Current Model Info */}
              <div className="text-xs text-muted-foreground">
                {tutorStatus?.activeModel && (
                  <p>Active: {tutorStatus.activeModel}</p>
                )}
                {tutorStatus?.capabilities?.includes('gemini_2_flash') && (
                  <p className="text-green-600">✓ Gemini 2.0 Flash Available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Voice Settings */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Voice & Accent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voice Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Responses</span>
                <Switch 
                  checked={voiceEnabled} 
                  onCheckedChange={setVoiceEnabled}
                />
              </div>

              {voiceEnabled && (
                <>
                  {/* Accent Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Accent</label>
                    <Select value={selectedAccent} onValueChange={(value) => setSelectedAccent(value as 'us' | 'uk' | 'indian')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accentOptions.map(accent => (
                          <SelectItem key={accent.value} value={accent.value}>
                            <span className="flex items-center gap-2">
                              <span>{accent.flag}</span>
                              {accent.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice Model Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice Model</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai-alloy">Alloy (Neutral)</SelectItem>
                        <SelectItem value="openai-echo">Echo (Male)</SelectItem>
                        <SelectItem value="openai-fable">Fable (British)</SelectItem>
                        <SelectItem value="openai-onyx">Onyx (Deep)</SelectItem>
                        <SelectItem value="openai-nova">Nova (Young)</SelectItem>
                        <SelectItem value="openai-shimmer">Shimmer (Soft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Speech Speed */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Speech Speed: {speechSpeed.toFixed(1)}x
                    </label>
                    <Slider
                      value={[speechSpeed]}
                      onValueChange={(value) => setSpeechSpeed(value[0])}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Humanization Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Human-like Speech: {Math.round(humanization * 100)}%
                    </label>
                    <Slider
                      value={[humanization]}
                      onValueChange={(value) => setHumanization(value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Voice Enhancement Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Natural Breathing</span>
                      <Switch 
                        checked={voiceBreathing} 
                        onCheckedChange={setVoiceBreathing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Smart Pauses</span>
                      <Switch 
                        checked={voicePauses} 
                        onCheckedChange={setVoicePauses}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emphasis & Tone</span>
                      <Switch 
                        checked={voiceEmphasis} 
                        onCheckedChange={setVoiceEmphasis}
                      />
                    </div>
                  </div>

                  {/* Audio Permission */}
                  {!audioPermissionGranted && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Audio Permission Required
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                        Click below to enable voice responses in your browser.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={enableAudio}
                        className="w-full"
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        Enable Audio
                      </Button>
                    </div>
                  )}

                  {/* Voice Control Buttons */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText("Hello! This is a test of the voice system with " + selectedAccent + " accent.")}
                        disabled={isSpeaking || !audioPermissionGranted}
                        className="flex-1"
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        {isSpeaking ? 'Speaking...' : 'Test Voice'}
                      </Button>
                      <Button
                        variant={isSpeaking ? "destructive" : "outline"}
                        size="sm"
                        onClick={stopSpeaking}
                        disabled={!isSpeaking}
                      >
                        <VolumeX className="h-4 w-4" />
                      </Button>
                    </div>
                    

                  </div>
                  
                  {/* Voice Status Indicator */}
                  {isSpeaking && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                          Speaking with {selectedAccent.toUpperCase()} accent
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopSpeaking}
                          className="h-6 px-2 text-blue-600 hover:text-blue-800"
                        >
                          Stop
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>AI Model:</span>
                <Badge variant="default">
                  {tutorMode === 'enhanced' ? 'Gemma 3n 4B' : 'Educational Tutor'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Voice System:</span>
                <Badge variant={voiceEnabled ? "default" : "secondary"}>
                  {voiceEnabled ? `${selectedAccent.toUpperCase()} Accent` : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Speech Recognition:</span>
                <Badge variant={'webkitSpeechRecognition' in window ? "default" : "secondary"}>
                  {('webkitSpeechRecognition' in window) ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-rows-[1fr_auto] gap-4">
            {/* Chat Messages */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="h-6 w-6 text-blue-600" />
                    AI Tutor Chat
                    {selectedSubject && (
                      <Badge variant="outline" className="ml-2">
                        {selectedSubject}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Global Voice Status Indicator */}
                    {voiceEnabled && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {selectedAccent.toUpperCase()}
                        </span>
                        {isSpeaking ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={stopSpeaking}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                            title="Stop speaking"
                          >
                            <VolumeX className="h-3 w-3" />
                          </Button>
                        ) : (
                          <div className="w-6 h-6 flex items-center justify-center">
                            <Volume2 className="h-3 w-3 text-green-600" />
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearChat}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-96">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg",
                          msg.type === 'user' 
                            ? "bg-blue-50 dark:bg-blue-900/20 ml-8" 
                            : "bg-gray-50 dark:bg-gray-800/50 mr-8"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          msg.type === 'user' 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-600 text-white"
                        )}>
                          {msg.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {msg.type === 'user' ? user?.username || 'You' : 'AI Tutor'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                            {msg.subject && (
                              <Badge variant="outline" className="text-xs">
                                {msg.subject}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {msg.type === 'ai' && currentlyReadingText === msg.content ? (
                              // Show highlighted text when reading
                              <div>
                                {currentlyReadingText.split(' ').map((word, index) => (
                                  <span
                                    key={index}
                                    className={cn(
                                      'transition-all duration-200',
                                      index === highlightedWordIndex 
                                        ? 'bg-yellow-200 dark:bg-yellow-700 font-semibold' 
                                        : index < highlightedWordIndex 
                                        ? 'bg-green-100 dark:bg-green-800' 
                                        : ''
                                    )}
                                  >
                                    {word}{index < currentlyReadingText.split(' ').length - 1 ? ' ' : ''}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>
                          {msg.type === 'ai' && (
                            <div className="flex gap-1 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(msg.content)}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {voiceEnabled && !isSpeaking && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => speakText(msg.content)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              )}
                              {voiceEnabled && isSpeaking && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={stopSpeaking}
                                  className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                                >
                                  <VolumeX className="h-3 w-3" />
                                </Button>
                              )}
                              {voiceEnabled && !isSpeaking && lastSpokenMessage === msg.content && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={repeatLastMessage}
                                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                                  title="Repeat this message"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 mr-8">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Questions & Input */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4">
                {/* Quick Questions */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Quick Questions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleListening}
                    disabled={isListening}
                    className={cn(
                      "flex-shrink-0",
                      isListening && "bg-red-50 border-red-200 text-red-600"
                    )}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1"
                    disabled={chatMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={chatMutation.isPending || !message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                
                {isListening && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Listening for your voice...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}