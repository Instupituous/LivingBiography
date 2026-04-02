document.addEventListener("DOMContentLoaded", () => {
  const storyContainer = document.getElementById("concert-story");
  const key = "lb_concert_entries";
  const entries = JSON.parse(localStorage.getItem(key) || "[]");

  if (!entries.length) {
    storyContainer.innerHTML = `
      <div class="lb-empty">
        <p>No concert found. Add one from the entry page.</p>
      </div>
    `;
    return;
  }

  // Show the most recent entry
  const entry = entries[entries.length - 1];

  const {
    artist,
    tour,
    venue,
    date,
    time,
    city,
    notes,
    people,
    supportingActs,
    photos,
    hero
  } = entry;

  // ============================
  // HERO IMAGE
  // ============================
  let heroPhoto = null;

  if (hero) {
    if (hero.act === "__HEADLINER__") {
      heroPhoto = photos.headliner.find((p) => p.id === hero.id);
    } else if (photos.supporting[hero.act]) {
      heroPhoto = photos.supporting[hero.act].find((p) => p.id === hero.id);
    }
  }

  // Fallback if no hero selected
  if (!heroPhoto) {
    if (photos.headliner.length > 0) {
      heroPhoto = photos.headliner[0];
      hero = { act: "__HEADLINER__", id: heroPhoto.id };
    } else {
      const firstAct = supportingActs[0];
      if (firstAct && photos.supporting[firstAct]?.length > 0) {
        heroPhoto = photos.supporting[firstAct][0];
        hero = { act: firstAct, id: heroPhoto.id };
      }
    }
  }

  // ============================
  // BUILD STORY HTML
  // ============================

  let html = "";

  // HERO SECTION
  if (heroPhoto) {
    html += `
      <figure class="lb-hero-figure">
        <img src="${heroPhoto.dataUrl}" 
             alt="Hero photo" 
             class="lb-hero-image">
      </figure>

      <div class="lb-hero-label">
        Hero photo: ${escapeHtml(hero.act === "__HEADLINER__" ? artist : hero.act)}
      </div>
    `;
  }

  // HEADER SECTION
  html += `
    <header class="lb-story-header">
      <h1 class="lb-story-artist">${escapeHtml(artist)}</h1>
      ${tour ? `<h2 class="lb-story-tour">${escapeHtml(tour)}</h2>` : ""}
      <div class="lb-meta-line lb-meta-line--primary">
        ${[
          date || "",
          venue || "",
          city || "",
          time || ""
        ].filter(Boolean).join(" • ")}
      </div>
  `;

  // PEOPLE
  if (people && people.length) {
    html += `
      <div class="lb-meta-line lb-meta-line--stacked">
        <span class="lb-meta-label">Went with:</span>
        <ul class="lb-people-list">
          ${people.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  html += `</header>`;

  // NOTES
  if (notes) {
    html += `
      <section class="lb-story-notes">
        <h3 class="lb-section-heading">Notes</h3>
        <p class="lb-notes-body">${escapeHtml(notes).replace(/\n/g, "<br>")}</p>
      </section>
    `;
  }

  // ============================
  // GALLERY (CHRONOLOGICAL)
  // Supporting acts first → headliner last
  // ============================

  html += `<section class="lb-story-gallery">
             <h3 class="lb-section-heading">Gallery</h3>
           `;

  // Supporting acts in order
  supportingActs.forEach((act) => {
    const imgs = photos.supporting[act] || [];
    if (!imgs.length) return;

    html += `
      <h4 class="lb-gallery-act">${escapeHtml(act)}</h4>
      <div class="lb-gallery-grid">
        ${imgs
          .map(
            (p) => `
          <figure class="lb-gallery-item">
            <img src="${p.dataUrl}" 
                 alt="${escapeHtml(act)} photo" 
                 class="lb-gallery-image">
          </figure>
        `
          )
          .join("")}
      </div>
    `;
  });

  // Headliner last
  if (photos.headliner.length > 0) {
    html += `
      <h4 class="lb-gallery-act">${escapeHtml(artist)} (Headliner)</h4>
      <div class="lb-gallery-grid">
        ${photos.headliner
          .map(
            (p) => `
          <figure class="lb-gallery-item">
            <img src="${p.dataUrl}" 
                 alt="${escapeHtml(artist)} photo" 
                 class="lb-gallery-image">
          </figure>
        `
          )
          .join("")}
      </div>
    `;
  }

  html += `</section>`;

  // Inject into page
  storyContainer.innerHTML = html;
});

// ============================
// HTML ESCAPING
// ============================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
