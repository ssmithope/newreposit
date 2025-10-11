// controllers/commentController.js
const CommentModel = require('../models/comment-model');
const { validateCommentInput, requireAuth } = require('../utilities/comment-validation');

async function addComment(req, res) {
  try {
    const { vehicleId, rating, commentText } = req.body;
    const vid = Number(vehicleId);
    if (Number.isNaN(vid)) {
      req.flash('notice', 'Invalid vehicle.');
      return res.redirect('/inventory');
    }

    const { valid, errors, rating: r, commentText: t } = validateCommentInput({ rating, commentText });
    if (!valid) {
      req.flash('notice', errors.join(' '));
      return res.redirect(`/inv/detail/${vid}`);
    }

    await CommentModel.createComment({
      vehicleId: vid,
      accountId: req.session.account.account_id,
      rating: r,
      commentText: t,
    });

    req.flash('success', 'Thanks for your review!');
    return res.redirect(`/inv/detail/${vid}`);
  } catch (error) {
    console.error('addComment error:', error);
    req.flash('notice', 'Something went wrong saving your review.');
    return res.redirect(`/inv/detail/${req.body.vehicleId}`);
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = Number(req.params.id);
    const vehicleId = Number(req.query.vehicleId);
    if (Number.isNaN(commentId) || Number.isNaN(vehicleId)) {
      req.flash('notice', 'Invalid request.');
      return res.redirect(`/inv/detail/${vehicleId || ''}`);
    }

    const deleted = await CommentModel.deleteCommentOwned(commentId, req.session.account.account_id);
    if (!deleted) {
      req.flash('notice', 'You can only delete your own comment.');
    } else {
      req.flash('success', 'Comment deleted.');
    }

    return res.redirect(`/inv/detail/${vehicleId}`);
  } catch (error) {
    console.error('deleteComment error:', error);
    req.flash('notice', 'Failed to delete comment.');
    return res.redirect(`/inv/detail/${req.query.vehicleId}`);
  }
}

module.exports = {
  addComment,
  deleteComment,
  requireAuth,
};
