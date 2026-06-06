import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { firestoreSessionSchema } from '../types';
import type { SessionPayload, MatchResult } from '../types';

export function useSessions(user: User | null | undefined) {
  const [mySessions, setMySessions] = useState<
    (SessionPayload & { matchResults: Record<string, MatchResult> })[]
  >([]);

  useEffect(() => {
    if (!user) {
      setMySessions([]);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'sessions'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const sessions = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const parsed = firestoreSessionSchema.safeParse(data);
            return {
              id: doc.id,
              title: parsed.success ? parsed.data.title : data.title || 'Untitled Session',
              format: parsed.success ? parsed.data.format : data.format || 'league',
              players: parsed.success ? parsed.data.players : data.players || [],
              createdAt: parsed.success
                ? parsed.data.createdAt
                : data.createdAt || new Date().toISOString(),
              matchResults: parsed.success
                ? (parsed.data.matchResults as Record<string, MatchResult>) || {}
                : data.matchResults || {},
            } as SessionPayload & { matchResults: Record<string, MatchResult> };
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        setMySessions(sessions);
      },
      (err: Error) => {
        console.error('Firestore error:', err);
      },
    );
    return () => unsub();
  }, [user]);

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!user) return;

    if (
      window.confirm(
        'Are you sure you want to delete this session? It will be removed from your history and career stats.',
      )
    ) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', sessionId));
        await deleteDoc(doc(db, 'sessions', sessionId));
      } catch (err) {
        console.error('Error deleting session:', err);
        alert('Failed to delete session.');
      }
    }
  };

  return { mySessions, handleDeleteSession };
}
