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
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/genres`);
        if (response.ok) {
          const data = await response.json();
          setGenres(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div className="home-page">
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
