import { useEffect, useState } from "react";

// Retarde la mise à jour d'une valeur jusqu'à ce que l'utilisateur arrête de taper
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timerId);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

