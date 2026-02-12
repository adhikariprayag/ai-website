import React, { useState, useEffect } from 'react';
import { fetchComments, postComment, supabase } from '../services/supabaseClient';
import './Comments.css';

const Comments = () => {
    const [comments, setComments] = useState([]);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadComments();

        // Optional: Real-time updates
        if (supabase) {
            const subscription = supabase
                .channel('public:comments')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
                    setComments((prev) => [payload.new, ...prev]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, []);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await fetchComments();
            setComments(data);
            setError(null);
        } catch (err) {
            setError('Failed to load comments. Please check your connection or Supabase setup.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;

        try {
            setPosting(true);
            await postComment({ name, content });
            setName('');
            setContent('');
            // The real-time subscription will update the list if configured, 
            // but we can also manually refresh or let the subscription handle it.
            // If subscription isn't working/setup, loadComments() would be the fallback.
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
                <p>Connect with users from around the world.</p>
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
                                        {new Date(comment.created_at).toLocaleDateString()}
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
