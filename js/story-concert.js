// Load concert data from localStorage based on ?date=YYYY-MM-DD
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const date = getQueryParam("date");
const key = `concert-${date}`;
const data = JSON.parse(localStorage.getItem(key));

if (!data) {
  document.body.innerHTML = "<h2>Concert not found.</h2>";
  throw new Error("No concert data found");
}

// -----------------------------
// Populate Story Page
// -----------------------------

// HERO IMAGE
document.getElementById("hero-image").src = data.photos[data.heroIndex];

// TITLE BLOCK
document.getElementById("artist").textContent = data.artist;
document.getElementById("tour").textContent = data.tour || "";

// SUPPORTING ACTS
const supportingContainer = document.getElementById("supporting-acts");
if (data.supportingActs.length > 0) {
  supportingContainer.innerHTML = `
    <div class="supporting-label">With:</div>
    <ul class="supporting-list">
      ${data.supportingActs.map(act => `<li>${act}</li>`).join("")}
    </ul>
  `;
}

// META
document.getElementById("date").textContent = data.date;
document.getElementById("venue").textContent = data.venue;
document.getElementById("city").textContent = data.city;
document.getElementById("time").textContent = data.time || "";

// NOTES
document.getElementById("notes").textContent = data.notes;

// GALLERY
const gallery = document.getElementById("gallery-grid");
data.photos.forEach((img, i) => {
  if (i === data.heroIndex) return; // skip hero image

  const el = document.createElement("img");
  el.src = img;
  el.className = "gallery-thumb";
  gallery.appendChild(el);
});
