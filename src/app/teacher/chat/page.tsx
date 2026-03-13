'use client';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ChatLayout } from '@/components/chat/chat-layout';
import type { NavItem } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

const teacherNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: 'Home' },
    { title: 'Dashboard', href: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { title: 'Students', href: '/teacher/students', icon: 'Users' },
    { title: 'Assignments', href: '/teacher/assignments', icon: 'BookUser' },
    { title: 'Messages', href: '/teacher/chat', icon: 'MessageSquare' },
];

import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import type { ChatContact, Conversation } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function TeacherChatPage() {
    const searchParams = useSearchParams();
    const [contacts, setContacts] = useState<ChatContact[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Listen to contacts
        const contactsQuery = query(collection(db, 'contacts'));
        const unsubscribeContacts = onSnapshot(contactsQuery, (snapshot) => {
            const contactList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatContact));
            setContacts(contactList);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to contacts:", error);
            setLoading(false);
        });

        // Listen to conversations
        const conversationsQuery = query(collection(db, 'conversations'), orderBy('lastMessageTimestamp', 'desc'));
        const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
            const conversationList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Conversation));
            setConversations(conversationList);
        }, (error) => {
            console.error("Error listening to conversations:", error);
        });

        return () => {
            unsubscribeContacts();
            unsubscribeConversations();
        };
    }, []);

    const defaultContactId = searchParams.get('contactId') || (contacts.length > 0 ? contacts[0].id : '');
    const defaultConversation = conversations.find(c => c.contactId === defaultContactId);

    if (loading) {
        return (
            <DashboardLayout navItems={teacherNavItems}>
                <div className="flex justify-center items-center h-full">
                    <p>Loading messages...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={teacherNavItems}>
            <ChatLayout
                contacts={contacts}
                conversations={conversations}
                defaultContactId={defaultContactId}
            />
        </DashboardLayout>
    )
}
