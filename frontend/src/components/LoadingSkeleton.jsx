import React from 'react'
import './ListingCard.css'

// Renders a grid of animated placeholder cards while listings load
export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="listings-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card glass-card">
          <div className="skeleton skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-desc" />
            <div className="skeleton skeleton-desc short" />
            <div className="skeleton-footer">
              <div className="skeleton skeleton-price" />
              <div className="skeleton skeleton-meta" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
