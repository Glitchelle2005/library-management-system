import React from 'react';
import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  if (!book) return null;

  return (
    <div className="book-card">
      <div className="book-card-body">
        <span className="book-genre-pill">{book.genre?.name || 'General'}</span>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        {book.publishedYear && (
          <p className="book-year">Published: {book.publishedYear}</p>
        )}
        <div className="book-copies">
          <span className={`copies-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
            {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Out of stock'}
          </span>
        </div>
      </div>
      <div className="book-card-footer">
        <Link to={`/books/${book.id}`} className="view-details-btn">
          View Details →
        </Link>
      </div>
    </div>
  );
}
