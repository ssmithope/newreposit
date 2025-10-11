// public/js/reviews.js
(function () {
  const form = document.querySelector('.review-form');
  if (!form) return;

  const errorBox = document.getElementById('review-errors');

  form.addEventListener('submit', (e) => {
    const rating = form.querySelector('#rating').value.trim();
    const comment = form.querySelector('#commentText').value.trim();
    const errors = [];

    const r = parseInt(rating, 10);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      errors.push('Select a valid rating 1–5.');
    }
    if (comment.length < 3) {
      errors.push('Comment must be at least 3 characters.');
    }
    if (comment.length > 2000) {
      errors.push('Comment must be less than 2000 characters.');
    }

    if (errors.length) {
      e.preventDefault();
      if (errorBox) {
        errorBox.innerHTML = errors.map(err => `<p>${err}</p>`).join('');
      } else {
        alert(errors.join('\n'));
      }
      if (!r || r < 1 || r > 5) form.querySelector('#rating').focus();
      else form.querySelector('#commentText').focus();
    } else if (errorBox) {
      errorBox.innerHTML = '';
    }
  });
})();
