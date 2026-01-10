import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { apiRequest } from "../lib/queryClient";

interface ChatMessage {
  id: number;
  message: string;
  response: string;
  timestamp: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai', content: string, timestamp: Date }>>([
    {
      type: 'ai',
      content: "Hi! I'm your AI tutor. How can I help you with your studies today?",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory } = useQuery({
    queryKey: ["/api/chat/history"],
    enabled: isOpen,
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const res = await apiRequest("POST", "/api/chat", { message: userMessage });
      return await res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        }
      ]);
    },
    onError: (error) => {
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: "I'm sorry, I'm experiencing some technical difficulties. Please try again later.",
          timestamp: new Date()
        }
      ]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage = message.trim();
    setMessage("");
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      }
    ]);

    // Send to AI
    chatMutation.mutate(userMessage);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105"
        size="lg"
      >
        <Bot className="h-6 w-6" />
      </Button>
      
      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-primary text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                <CardTitle className="text-base">AI Tutor</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-600 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-64 p-4">
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex",
                      msg.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs p-3 rounded-lg text-sm",
                        msg.type === 'user'
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 max-w-xs p-3 rounded-lg text-sm flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 text-sm"
                  disabled={chatMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!message.trim() || chatMutation.isPending}
                  className="bg-primary hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
