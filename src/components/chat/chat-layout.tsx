'use client';
import { useState } from 'react';
import type { ChatContact, Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatContactsList } from './chat-contacts';
import { ChatMessages } from './chat-messages';

interface ChatLayoutProps {
  contacts: ChatContact[];
  conversations: Conversation[];
  defaultContactId?: string;
}

export function ChatLayout({ contacts, conversations, defaultContactId }: ChatLayoutProps) {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    contacts.find(c => c.id === defaultContactId) || null
  );

  const selectedConversation = conversations.find(c => c.contactId === selectedContact?.id);

  return (
    <div className="z-10 h-[calc(100vh-11rem)] w-full border rounded-lg flex lg:grid lg:grid-cols-3">
      <div className={cn(
        "border-r",
        "lg:col-span-1",
        !selectedContact && "col-span-3 lg:col-span-1"
      )}>
        <ChatContactsList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
        />
      </div>
      <div className={cn(
        "lg:col-span-2",
        selectedContact ? "block" : "hidden lg:block"
      )}>
        <ChatMessages
          contact={selectedContact}
          conversation={selectedConversation}
          onBack={() => setSelectedContact(null)}
        />
      </div>
    </div>
  );
}
