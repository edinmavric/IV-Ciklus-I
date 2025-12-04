import { useState, useMemo } from 'react';

// Debounce helper funkcija
function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Kreiranje debounced search funkcije
  const debouncedSearch = useMemo(
    () =>
      debounce(async searchQuery => {
        if (!searchQuery.trim()) {
          setResults([]);
          return;
        }

        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${searchQuery}`);
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoading(false);
        }
      }), // Default 300ms delay
    []
  );

  const handleChange = e => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value); // Poziva debounced verziju
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Pretraži..."
      />
      {isLoading && <p>Učitavanje...</p>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
