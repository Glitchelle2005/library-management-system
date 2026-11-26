import React, { useState, useEffect } from 'react';
import BookGrid from '../components/BookGrid';
import SearchBar from '../components/SearchBar';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const base = rawUrl.replace(/\/+$/, '');
        const response = await fetch(`${base}/genres`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setGenres(Array.isArray(data) ? data : (data.data || []));
          }
        }
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      } finally {
        if (isMounted) {
          setLoadingGenres(false);
        }
      }
    };

    fetchGenres();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page" data-testid="home-page">
      <header className="page-header">
        <h1 className="header-title">📚 Library Catalog</h1>
        <p className="header-subtitle">Explore our collection of titles, search by author or topic, and filter by genre.</p>
      </header>

      <div className="controls-bar">
        <div className="search-control">
          <SearchBar onSearch={(query) => setSearch(query)} />
        </div>

        <div className="filters-control">
          <div className="genre-filter-wrapper">
            <label htmlFor="genre-select" className="filter-label">Genre:</label>
            <select
              id="genre-select"
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
              className="genre-select"
              aria-label="Filter by genre"
              disabled={loadingGenres && genres.length === 0}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-control-wrapper">
            <label htmlFor="sort-select" className="filter-label">Sort By:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              aria-label="Sort books"
            >
              <option value="">Default</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <main className="catalog-main">
        <BookGrid search={search} genreId={genreId} sortBy={sortBy} />
      </main>
    </div>
  );
}
