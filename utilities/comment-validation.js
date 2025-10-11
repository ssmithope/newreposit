// Comment-validation
function validateCommentInput({ rating, commentText }) {
  const errors = [];
  const parsedRating = Number(rating);

  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    errors.push('Rating must be an integer between 1 and 5.');
  }

  const text = (commentText || '').trim();
  if (text.length < 3) {
    errors.push('Comment must be at least 3 characters long.');
  } else if (text.length > 2000) {
    errors.push('Comment must be less than 2000 characters.');
  }

  return {
    valid: errors.length === 0,
    errors,
    rating: parsedRating,
    commentText: text,
  };
}

function requireAuth(req, res, next) {
  if (!req?.session?.account) {
    req.flash('notice', 'Please sign in to continue.');
    return res.redirect('/account/login');
  }
  next();
}

module.exports = { validateCommentInput, requireAuth };
