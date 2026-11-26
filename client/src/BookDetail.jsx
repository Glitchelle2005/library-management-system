import React, { useEffect, useState } from 'react';
import { useParams, Link, useInRouterContext } from 'react-router-dom';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let inRouter = false;
  try {
    inRouter = useInRouterContext();
  } catch (e) {
    inRouter = false;
  }

  const renderBackLink = (className = 'back-button') => {
    if (inRouter) {
      return <Link to="/" className={className}>← Back to Catalog</Link>;
    }
    return <a href="/" className={className}>← Back to Catalog</a>;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const base = rawUrl.replace(/\/+$/, '');
        const response = await fetch(`${base}/books/${id}`);
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
      <div className="book-detail-page" data-testid="detail-loading">
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
      <div className="book-detail-page" data-testid="detail-error">
        <div className="detail-error-box">
          <p className="error-text">⚠️ {error}</p>
          {renderBackLink()}
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page" data-testid="detail-empty">
        <div className="detail-empty-box">
          <p>Book not found.</p>
          {renderBackLink()}
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page" data-testid="book-detail">
      {renderBackLink()}
      
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
            <div className="reviews-list">
              {book.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-rating">{'★'.repeat(review.rating || 5)}</div>
                  <p className="review-comment">"{review.comment}"</p>
                  <span className="review-user">— {review.user?.name || 'Patron'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
