import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatContact } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface ChatContactsListProps {
  contacts: ChatContact[];
  selectedContact: ChatContact | null;
  onSelectContact: (contact: ChatContact) => void;
}

export function ChatContactsList({ contacts, selectedContact, onSelectContact }: ChatContactsListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Messages</h2>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted',
                selectedContact?.id === contact.id && 'bg-muted'
              )}
              onClick={() => onSelectContact(contact)}
            >
              <Avatar className="w-10 h-10 border">
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.lastMessageTime}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
              </div>
              {contact.unreadCount > 0 && (
                <Badge className="h-5 w-5 flex items-center justify-center p-0">{contact.unreadCount}</Badge>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
