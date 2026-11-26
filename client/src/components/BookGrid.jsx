import React, { useEffect, useState } from 'react';
import BookCard from './BookCard';

export default function BookGrid({ search, genreId, sortBy }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const params = new URLSearchParams();
        if (genreId) params.append('genreId', genreId);
        if (search) params.append('search', search);

        const response = await fetch(`${apiUrl}/books?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to load books: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        if (isMounted) {
          const list = Array.isArray(data) ? data : (data.data || []);
          setBooks(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, [search, genreId]);

  const displayedBooks = [...books].sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'author') {
      return (a.author || '').localeCompare(b.author || '');
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="book-grid skeleton-container" data-testid="loading-state">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="book-card skeleton-card">
            <div className="skeleton-line skeleton-badge"></div>
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-author"></div>
            <div className="skeleton-line skeleton-copies"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-box" data-testid="error-state">
        <p className="error-message">⚠️ {error}</p>
      </div>
    );
  }

  if (displayedBooks.length === 0) {
    return (
      <div className="empty-box" data-testid="empty-state">
        <p className="empty-message">No books found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="book-grid" data-testid="book-grid">
      {displayedBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
