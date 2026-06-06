import { useState, useEffect } from 'react';

export function useQueryParameter(param: string): string | null {
  const [val, setVal] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setVal(searchParams.get(param));
  }, [param]);

  return val;
}
