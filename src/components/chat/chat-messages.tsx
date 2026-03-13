import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatContact, Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatMessagesProps {
  contact: ChatContact | null;
  conversation: Conversation | undefined;
  onBack: () => void;
}

export function ChatMessages({ contact, conversation, onBack }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id || isSending) return;

    setIsSending(true);
    try {
      const conversationRef = doc(db, 'conversations', conversation.id);
      const messageData = {
        id: Math.random().toString(36).substr(2, 9),
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: new Date(),
      };

      await updateDoc(conversationRef, {
        messages: arrayUnion(messageData),
        lastMessage: newMessage,
        lastMessageTimestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!contact) {
    return (
      <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="w-10 h-10 border">
          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{contact.name}</p>
          <p className="text-sm text-muted-foreground">{contact.role}</p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation?.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'other' && (
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 lg:max-w-md',
                  message.sender === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p>{message.text}</p>
                <p className={cn(
                  "text-xs mt-1",
                  message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>{message.timestamp}</p>
              </div>
              {message.sender === 'me' && (
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            placeholder="Type your message..."
            className="pr-12"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="h-5 w-5 text-muted-foreground" />
          </Button>
        </form>
      </div>
    </div>
  );
}
