import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ChatHistory } from "../pages/ai-tutor-modern";

interface ChatHistoryPanelProps {
  chatHistory: ChatHistory[];
  currentChatId: string | null;
  loadChat: (chat: ChatHistory) => void;
  startNewChat: () => void;
  deleteChat: (chatId: string) => void;
  clearAllHistory: () => void;
}

export function ChatHistoryPanel({
  chatHistory,
  currentChatId,
  loadChat,
  startNewChat,
  deleteChat,
  clearAllHistory,
}: ChatHistoryPanelProps) {
  return (
    <Card className="h-full flex flex-col bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
      <CardHeader className="p-4 flex flex-row justify-between items-center border-b">
        <CardTitle className="text-lg font-semibold">Chat History</CardTitle>
        <div className="flex gap-2">
          <Button onClick={startNewChat} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button onClick={clearAllHistory} size="sm" variant="destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {chatHistory.length > 0 ? (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                    currentChatId === chat.id
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div>
                    <p className="font-semibold truncate">{chat.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {chat.messages.length} messages
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-10">
                No chat history yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
