document.addEventListener('DOMContentLoaded', () => {
  const storyContainer = document.getElementById('concert-story');
  const key = 'lb_concert_entries';
  const entries = JSON.parse(localStorage.getItem(key) || '[]');

  if (!entries.length) {
    storyContainer.innerHTML = `
      <div class="lb-empty">
        <p>No concert found. Add one from the entry page.</p>
      </div>
    `;
    return;
  }

  // For now, show the most recent entry
  const entry = entries[entries.length - 1];

  const heroPhoto = entry.photos.find((p) => p.id === entry.heroImageId) || entry.photos[0] || null;
  const otherPhotos = entry.photos.filter((p) => !heroPhoto || p.id !== heroPhoto.id);

  const supportingActsHtml = entry.supportingActs && entry.supportingActs.length
    ? `<div class="lb-meta-line"><span class="lb-meta-label">Supporting Acts:</span> ${entry.supportingActs.join(', ')}</div>`
    : '';

  const peopleHtml = entry.people && entry.people.length
    ? `
      <div class="lb-meta-line lb-meta-line--stacked">
        <span class="lb-meta-label">Went with:</span>
        <ul class="lb-people-list">
          ${entry.people.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const metaLine = [
    entry.date || '',
    entry.venue || '',
    entry.city || '',
    entry.time || ''
  ].filter(Boolean).join(' • ');

  storyContainer.innerHTML = `
    ${heroPhoto ? `
      <figure class="lb-hero-figure">
        <img src="${heroPhoto.dataUrl}" alt="${escapeHtml(entry.artist)} hero image" class="lb-hero-image">
      </figure>
    ` : ''}

    <header class="lb-story-header">
      <h1 class="lb-story-artist">${escapeHtml(entry.artist)}</h1>
      ${entry.tour ? `<h2 class="lb-story-tour">${escapeHtml(entry.tour)}</h2>` : ''}
      ${supportingActsHtml}
      <div class="lb-meta-line lb-meta-line--primary">${metaLine}</div>
      ${peopleHtml}
    </header>

    ${entry.notes ? `
      <section class="lb-story-notes">
        <h3 class="lb-section-heading">Notes</h3>
        <p class="lb-notes-body">${escapeHtml(entry.notes).replace(/\n/g, '<br>')}</p>
      </section>
    ` : ''}

    ${otherPhotos.length ? `
      <section class="lb-story-gallery">
        <h3 class="lb-section-heading">Gallery</h3>
        <div class="lb-gallery-grid">
          ${otherPhotos.map((p) => `
            <figure class="lb-gallery-item">
              <img src="${p.dataUrl}" alt="${escapeHtml(entry.artist)} photo" class="lb-gallery-image">
            </figure>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

