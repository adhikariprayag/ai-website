import React, { useState, useEffect } from 'react';
import { subscribeToComments, postComment } from '../services/firebase';
import './Comments.css';

const Comments = () => {
    const [comments, setComments] = useState([]);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        // Firebase real-time subscription
        const unsubscribe = subscribeToComments((data) => {
            setComments(data);
            setLoading(false);
            setError(null);
        }, (err) => {
            setError(`Connection Error: ${err.message}. Please check your Firebase rules.`);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;

        // Check if Firebase is configured
        if (import.meta.env.VITE_FIREBASE_API_KEY === 'your-api-key') {
            setError("Firebase is not configured yet. Please add your credentials to the .env file.");
            return;
        }

        try {
            setPosting(true);
            await postComment({ name, content });
            setName('');
            setContent('');
            setError(null);
        } catch (err) {
            setError(`Failed to post comment: ${err.message}`);
            console.error("Submit Error:", err);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="comments-container">
            <div className="comments-header">
                <h1>Global Feed</h1>
                <p>Connect with users from around the world via Firebase.</p>
            </div>

            <section className="comment-form-section">
                <form onSubmit={handleSubmit} className="comment-form">
                    <div className="form-group">
                        <label htmlFor="name">Your Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Your Message</label>
                        <textarea
                            id="content"
                            placeholder="Share your thoughts..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={posting}>
                        {posting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </section>

            <section className="comments-list-section">
                {loading ? (
                    <div className="loading-spinner">Loading global conversation...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : comments.length === 0 ? (
                    <div className="no-comments">No comments yet. Be the first to start the conversation!</div>
                ) : (
                    <div className="comments-grid">
                        {comments.map((comment) => (
                            <div key={comment.id} className="comment-card">
                                <div className="comment-card-header">
                                    <span className="comment-author">{comment.name}</span>
                                    <span className="comment-date">
                                        {comment.created_at ? new Date(comment.created_at.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                                <div className="comment-content">
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Comments;
