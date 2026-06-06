import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { MatchResult } from '../types';

export function useSessionSync(sessionId: string | undefined, user: User | null | undefined) {
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, 'sessions', sessionId);
    const unsub = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.matchResults) {
          setMatchResults(data.matchResults as Record<string, MatchResult>);
        }
      }
    });
    return () => unsub();
  }, [sessionId]);

  const updateMatchResult = async (
    key: string,
    field: 'scoreA' | 'scoreB',
    value: number | '',
  ) => {
    const newResults = {
      ...matchResults,
      [key]: { ...matchResults[key], [field]: value },
    };
    setMatchResults(newResults);

    if (sessionId && user) {
      try {
        const updates = { matchResults: newResults };
        await setDoc(
          doc(db, 'users', user.uid, 'sessions', sessionId),
          updates,
          { merge: true },
        );
        await setDoc(doc(db, 'sessions', sessionId), updates, { merge: true });
      } catch (e) {
        console.error('Error updating scores', e);
      }
    }
  };

  return { matchResults, setMatchResults, updateMatchResult };
}
