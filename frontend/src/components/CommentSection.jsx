// Comment section component for trip discussions
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Send, Heart, Reply, Trash2, User } from "lucide-react"
import { commentAPI } from "../utils/api"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "./LoadingSpinner"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"

const CommentSection = ({ tripId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [editingComment, setEditingComment] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchComments()
  }, [tripId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await commentAPI.getTripComments(tripId)
      setComments(response.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast.error("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please login to comment")
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const commentData = {
        content: newComment.trim(),
        trip: tripId,
        parentComment: replyTo,
        type: "general",
      }

      await commentAPI.createComment(commentData)
      setNewComment("")
      setReplyTo(null)
      fetchComments()
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error("Please login to like comments")
      return
    }

    try {
      await commentAPI.likeComment(commentId)
      fetchComments()
    } catch (error) {
      console.error("Error liking comment:", error)
      toast.error("Failed to like comment")
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      await commentAPI.deleteComment(commentId)
      fetchComments()
      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}
    >
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              {comment.author?.profilePicture ? (
                <img
                  src={comment.author.profilePicture || "/placeholder.svg"}
                  alt={comment.author.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-primary-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {comment.author?.firstName && comment.author?.lastName
                  ? `${comment.author.firstName} ${comment.author.lastName}`
                  : comment.author?.username}
              </p>
              <p className="text-gray-500 text-xs">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.isEdited && " (edited)"}
              </p>
            </div>
          </div>

          {comment.isOwner && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <p className="text-gray-700 mb-3">{comment.content}</p>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-sm">
          <button
            onClick={() => handleLikeComment(comment._id)}
            className={`flex items-center space-x-1 transition-colors duration-200 ${
              comment.isLikedByUser ? "text-red-600" : "text-gray-500 hover:text-red-600"
            }`}
          >
            <Heart className={`w-4 h-4 ${comment.isLikedByUser ? "fill-current" : ""}`} />
            <span>{comment.likeCount || 0}</span>
          </button>

          {!isReply && isAuthenticated && (
            <button
              onClick={() => setReplyTo(comment._id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors duration-200"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {replyTo === comment._id && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmitComment}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows="2"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null)
                      setNewComment("")
                    }}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="px-4 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {submitting ? "Posting..." : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2" />
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this trip..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {submitting ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Post Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-3">Please login to join the conversation</p>
          <a href="/login" className="btn-primary">
            Login to Comment
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="medium" />
        </div>
      ) : comments.length > 0 ? (
        <div>
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}

export default CommentSection
