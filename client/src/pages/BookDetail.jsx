import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/books/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch book: ${response.statusText} (${response.status})`);
        }
        const data = await response.json();
        if (isMounted) {
          setBook(data);
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

    if (id) {
      fetchBook();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="skeleton-detail-card">
          <div className="skeleton-line skeleton-badge"></div>
          <div className="skeleton-line skeleton-title-lg"></div>
          <div className="skeleton-line skeleton-author-lg"></div>
          <div className="skeleton-line skeleton-para"></div>
          <div className="skeleton-line skeleton-para"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-page">
        <div className="detail-error-box">
          <p className="error-text">⚠️ {error}</p>
          <Link to="/" className="back-button">← Back to Catalog</Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="detail-empty-box">
          <p>Book not found.</p>
          <Link to="/" className="back-button">← Back to Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      <Link to="/" className="back-button">← Back to Catalog</Link>
      
      <article className="book-detail-card">
        <div className="detail-header">
          <span className="book-genre-pill">{book.genre?.name || 'General'}</span>
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">by <strong>{book.author}</strong></p>
        </div>

        <div className="detail-section">
          <h2 className="section-heading">About this Book</h2>
          <p className="detail-description">{book.description || 'No description provided.'}</p>
        </div>

        <div className="detail-meta-grid">
          <div className="meta-card">
            <span className="meta-title">ISBN</span>
            <span className="meta-info">{book.isbn || 'N/A'}</span>
          </div>
          <div className="meta-card">
            <span className="meta-title">Publication Year</span>
            <span className="meta-info">{book.publishedYear || 'N/A'}</span>
          </div>
          <div className="meta-card">
            <span className="meta-title">Total Copies</span>
            <span className="meta-info">{book.totalCopies ?? 'N/A'}</span>
          </div>
          <div className="meta-card">
            <span className="meta-title">Available Copies</span>
            <span className={`meta-info ${book.availableCopies > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {book.availableCopies > 0 ? `${book.availableCopies} available` : 'None currently available'}
            </span>
          </div>
        </div>

        {book.reviews && book.reviews.length > 0 && (
          <div className="detail-reviews-section">
            <h2 className="section-heading">Patron Reviews ({book.reviews.length})</h2>
            <div className="reviews-grid">
              {book.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  {review.comment && <p className="review-text">"{review.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
