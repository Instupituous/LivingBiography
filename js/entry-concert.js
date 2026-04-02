// -----------------------------
// SUPPORTING ACTS
// -----------------------------
function addSupportingAct() {
  const container = document.getElementById("supporting-acts-container");

  const row = document.createElement("div");
  row.className = "supporting-act-row";

  row.innerHTML = `
    <input type="text" class="supporting-act" placeholder="Opening band…">
    <button type="button" class="remove-act-btn" onclick="removeSupportingAct(this)">×</button>
  `;

  container.appendChild(row);
}

function removeSupportingAct(button) {
  const row = button.parentElement;
  row.remove();
}



// -----------------------------
// PHOTO UPLOAD + PREVIEW
// -----------------------------
let uploadedImages = []; // Base64 strings
let heroIndex = null;

function previewImages() {
  const files = document.getElementById("photos").files;
  const preview = document.getElementById("photo-preview");
  const heroArea = document.getElementById("hero-selection");

  preview.innerHTML = "";
  heroArea.innerHTML = "";
  uploadedImages = [];

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const base64 = e.target.result;
      uploadedImages.push(base64);

      // Thumbnail preview
      const img = document.createElement("img");
      img.src = base64;
      img.className = "preview-thumb";
      preview.appendChild(img);

      // Hero selection
      const heroImg = document.createElement("img");
      heroImg.src = base64;
      heroImg.className = "hero-thumb";
      heroImg.onclick = () => selectHero(index);

      heroArea.appendChild(heroImg);
    };

    reader.readAsDataURL(file);
  });
}



// -----------------------------
// HERO SELECTION
// -----------------------------
function selectHero(index) {
  heroIndex = index;

  const heroThumbs = document.querySelectorAll(".hero-thumb");
  heroThumbs.forEach((img, i) => {
    img.classList.toggle("selected", i === index);
  });
}



// -----------------------------
// SAVE CONCERT (LOCAL STORAGE)
// -----------------------------
function saveConcert() {
  const artist = document.getElementById("artist").value.trim();
  const tour = document.getElementById("tour").value.trim();
  const date = document.getElementById("date").value;
  const city = document.getElementById("city").value.trim();
  const venue = document.getElementById("venue").value.trim();
  const time = document.getElementById("time").value;
  const notes = document.getElementById("notes").value.trim();

  if (!artist || !date) {
    alert("Artist and Date are required.");
    return;
  }

  if (uploadedImages.length === 0) {
    alert("Please upload at least one photo.");
    return;
  }

  if (heroIndex === null) {
    alert("Please select a hero image.");
    return;
  }

  // Supporting acts
  const supportingActs = Array.from(document.querySelectorAll(".supporting-act"))
    .map(input => input.value.trim())
    .filter(v => v.length > 0);

  // Build concert object
  const concertData = {
    artist,
    tour,
    supportingActs,
    date,
    city,
    venue,
    time,
    notes,
    photos: uploadedImages,
    heroIndex
  };

  // Save to localStorage
  const key = `concert-${date}`;
  localStorage.setItem(key, JSON.stringify(concertData));

  // Redirect to story page
  window.location.href = `../story/concert.html?date=${date}`;
}
