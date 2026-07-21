import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, MessageSquare } from "lucide-react";
import { DB } from "../db";

export default function Reviews({ user, triggerToast }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("General");
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = [
    "General",
    "Ahaar Setu",
    "Swachh Setu",
    "Sahaayak Setu",
    "Shiksha Setu",
    "Swasthya Setu",
    "Vastra Setu",
    "Punya Setu",
    "Vriksha Setu",
    "Pashu Setu"
  ];

  useEffect(() => {
    const unsub = DB.subscribe("reviews", (list) => {
      // Sort reviews by date descending
      const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
      setReviews(sorted);
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      triggerToast("Review text cannot be empty!", true);
      return;
    }

    const nameToUse = user ? user.name : (authorName.trim() || "Anonymous Citizen");

    try {
      await DB.submitReview(nameToUse, rating, category, text);
      triggerToast("Thank you! Your review has been posted successfully.");
      setText("");
      setAuthorName("");
      setRating(5);
      setCategory("General");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const filteredReviews = filter === "All" 
    ? reviews 
    : reviews.filter(r => r.category === filter);

  return (
    <div className="module-panel reveal-on-scroll reveal-visible" style={{ gap: "36px" }}>
      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon teal">
            <Star fill="currentColor" size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">
              {reviews.length > 0 
                ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
                : "5.0"}
            </span>
            <span className="stat-label">Average Star Rating</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon violet">
            <MessageSquare size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{reviews.length}</span>
            <span className="stat-label">Total Verified Reviews</span>
          </div>
        </div>
      </div>

      <div className="dashboard-columns" style={{ gridTemplateColumns: "1.8fr 1.2fr" }}>
        {/* Left Column: Reviews List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="info-header" style={{ marginBottom: "20px" }}>
              <h3>Community Testimonials</h3>
              <div className="tab-group" style={{ flexWrap: "wrap", gap: "6px" }}>
                <button 
                  className={`tab-btn ${filter === "All" ? "active" : ""}`}
                  onClick={() => setFilter("All")}
                >
                  All
                </button>
                {categories.slice(1).map(cat => (
                  <button
                    key={cat}
                    className={`tab-btn ${filter === cat ? "active" : ""}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", fontWeight: "500" }}>
                No reviews found in this category. Be the first to add one!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {filteredReviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="card" 
                    style={{ 
                      padding: "20px", 
                      boxShadow: "inset 3px 3px 6px rgba(180, 172, 130, 0.25), inset -3px -3px 6px #ffffff",
                      background: "var(--color-beige-light)",
                      border: "none",
                      borderRadius: "18px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>{rev.userName}</h4>
                        <span className="badge badge-pending" style={{ fontSize: "8px", padding: "2px 8px", marginTop: "4px" }}>
                          {rev.category}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "2px", color: "#f59e0b" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < rev.rating ? "#f59e0b" : "none"} 
                            stroke={i < rev.rating ? "none" : "#f59e0b"} 
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--color-green-dark)", margin: "8px 0 0 0" }}>
                      "{rev.text}"
                    </p>
                    <span style={{ display: "block", fontSize: "10px", color: "var(--text-secondary)", textAlign: "right", marginTop: "8px" }}>
                      {new Date(rev.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Write a Review Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card">
            <div className="info-header" style={{ marginBottom: "16px" }}>
              <h3>Share Your Story</h3>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {!user && (
                <div className="form-group">
                  <label htmlFor="author-name">Your Name</label>
                  <input
                    id="author-name"
                    type="text"
                    placeholder="Enter your name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="form-control"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: "flex", gap: "8px", padding: "4px 0" }}>
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setRating(stars)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 0 }}
                    >
                      <Star 
                        size={24} 
                        fill={rating >= stars ? "#f59e0b" : "none"} 
                        stroke="#f59e0b" 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review-category">Module Category</label>
                <select
                  id="review-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control"
                  style={{ cursor: "pointer" }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="review-text">Your Feedback</label>
                <textarea
                  id="review-text"
                  placeholder="How has SevaSetu impacted you? Share your experience..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                <MessageSquarePlus size={16} /> Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
