export function showLoader(show: boolean, message = '처리 중입니다...') {
  let loaderEl = document.getElementById('loader');
  if (!loaderEl) {
    loaderEl = document.createElement('div');
    loaderEl.id = 'loader';
    loaderEl.setAttribute('role', 'dialog');
    loaderEl.setAttribute('aria-modal', 'true');
    loaderEl.setAttribute('aria-label', '로딩 중');
    loaderEl.innerHTML = `
      <div class="spinner"></div>
      <p class="loader-text">${message}</p>
    `;
    document.body.appendChild(loaderEl);
  } else {
    const textEl = loaderEl.querySelector('.loader-text');
    if (textEl) textEl.textContent = message;
  }

  if (show) {
    loaderEl.classList.add('show');
  } else {
    loaderEl.classList.remove('show');
  }
}
