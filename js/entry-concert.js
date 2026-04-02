document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // ELEMENTS
  // ============================
  const form = document.getElementById("concert-form");

  const artistInput = document.getElementById("artist");
  const tourInput = document.getElementById("tour");
  const venueInput = document.getElementById("venue");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const notesInput = document.getElementById("notes");

  const citySelect = document.getElementById("city-select");
  const otherCityWrapper = document.getElementById("other-city-wrapper");
  const otherCityInput = document.getElementById("other-city");

  const peopleInput = document.getElementById("people");

  const headlinerPhotosInput = document.getElementById("headliner-photos");
  const headlinerPreviews = document.getElementById("headliner-photo-previews");

  const supportingActsContainer = document.getElementById("supporting-acts-container");
  const addSupportingActBtn = document.getElementById("add-supporting-act");

  // ============================
  // DATA STRUCTURES
  // ============================
  let headlinerImages = [];
  let supportingImages = {}; // { "Red Fang": [ ... ], "Tigercub": [ ... ] }
  let hero = null; // { act: "Red Fang", id: "abc123" }

  // ============================
  // CITY HANDLING
  // ============================
  citySelect.addEventListener("change", () => {
    if (citySelect.value === "OTHER") {
      otherCityWrapper.hidden = false;
      otherCityInput.required = true;
    } else {
      otherCityWrapper.hidden = true;
      otherCityInput.required = false;
      otherCityInput.value = "";
    }
  });

  // ============================
  // SUPPORTING ACTS
  // ============================
  addSupportingActBtn.addEventListener("click", () => {
    addSupportingActRow("");
  });

  function addSupportingActRow(initialValue) {
    const row = document.createElement("div");
    row.className = "lb-supporting-act-row";

    row.innerHTML = `
      <input type="text" class="lb-supporting-act-input" placeholder="Supporting act" value="${initialValue}">
      <button type="button" class="lb-icon-button lb-remove-supporting">&times;</button>
    `;

    supportingActsContainer.appendChild(row);

    const input = row.querySelector(".lb-supporting-act-input");
    const removeBtn = row.querySelector(".lb-remove-supporting");

    // Create uploader container
    const uploaderWrapper = document.createElement("div");
    uploaderWrapper.className = "lb-supporting-uploader-wrapper";

    const uploaderLabel = document.createElement("h3");
    uploaderLabel.className = "lb-subheading-nested";
    uploaderLabel.textContent = "Photos — (enter act name)";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.className = "lb-supporting-photo-input";

    const previewGrid = document.createElement("div");
    previewGrid.className = "lb-photo-previews";

    uploaderWrapper.appendChild(uploaderLabel);
    uploaderWrapper.appendChild(fileInput);
    uploaderWrapper.appendChild(previewGrid);

    row.insertAdjacentElement("afterend", uploaderWrapper);

    // Initialize empty array for this act
    let actName = input.value.trim();
    if (actName && !supportingImages[actName]) {
      supportingImages[actName] = [];
    }

    // Update label when act name changes
    input.addEventListener("input", () => {
      const newName = input.value.trim();
      uploaderLabel.textContent = `Photos — ${newName || "(enter act name)"}`;

      // If renamed, migrate images
      if (actName && supportingImages[actName]) {
        supportingImages[newName] = supportingImages[actName];
        delete supportingImages[actName];
      }

      actName = newName;
      if (!supportingImages[actName]) {
        supportingImages[actName] = [];
      }
    });

    // Remove supporting act + uploader
    removeBtn.addEventListener("click", () => {
      if (actName && supportingImages[actName]) {
        delete supportingImages[actName];
      }
      uploaderWrapper.remove();
      row.remove();
    });

    // Handle photo uploads
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
        const reader = new FileReader();
        reader.onload = (event) => {
          supportingImages[actName].push({
            id,
            name: file.name,
            dataUrl: event.target.result
          });
          renderSupportingPreviews(actName, previewGrid);
        };
        reader.readAsDataURL(file);
      });
      fileInput.value = "";
    });

    return row;
  }

  function renderSupportingPreviews(actName, container) {
    container.innerHTML = "";

    supportingImages[actName].forEach((img) => {
      const wrapper = document.createElement("div");
      wrapper.className = "lb-photo-preview";
      wrapper.dataset.id = img.id;
      wrapper.dataset.act = actName;

      const imageEl = document.createElement("img");
      imageEl.src = img.dataUrl;
      imageEl.className = "lb-photo-preview-img";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "lb-icon-button lb-photo-delete";
      deleteBtn.innerHTML = "🗑";

      const heart = document.createElement("div");
      heart.className = "lb-hero-heart-corner";
      if (hero && hero.id === img.id) {
        heart.classList.add("lb-hero-heart-corner--active");
      }

      wrapper.appendChild(imageEl);
      wrapper.appendChild(deleteBtn);
      wrapper.appendChild(heart);
      container.appendChild(wrapper);
    });
  }

  // ============================
  // HEADLINER PHOTO HANDLING
  // ============================
  headlinerPhotosInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
      const reader = new FileReader();
      reader.onload = (event) => {
        headlinerImages.push({
          id,
          name: file.name,
          dataUrl: event.target.result
        });
        renderHeadlinerPreviews();
      };
      reader.readAsDataURL(file);
    });
    headlinerPhotosInput.value = "";
  });

  function renderHeadlinerPreviews() {
    headlinerPreviews.innerHTML = "";

    headlinerImages.forEach((img) => {
      const wrapper = document.createElement("div");
      wrapper.className = "lb-photo-preview";
      wrapper.dataset.id = img.id;
      wrapper.dataset.act = "__HEADLINER__";

      const imageEl = document.createElement("img");
      imageEl.src = img.dataUrl;
      imageEl.className = "lb-photo-preview-img";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "lb-icon-button lb-photo-delete";
      deleteBtn.innerHTML = "🗑";

      const heart = document.createElement("div");
      heart.className = "lb-hero-heart-corner";
      if (hero && hero.id === img.id) {
        heart.classList.add("lb-hero-heart-corner--active");
      }

      wrapper.appendChild(imageEl);
      wrapper.appendChild(deleteBtn);
      wrapper.appendChild(heart);
      headlinerPreviews.appendChild(wrapper);
    });
  }

  // ============================
  // GLOBAL HERO SELECTION
  // ============================
  let lastTap = 0;

  document.body.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".lb-photo-delete");
    if (deleteBtn) {
      const wrapper = deleteBtn.closest(".lb-photo-preview");
      const id = wrapper.dataset.id;
      const act = wrapper.dataset.act;

      if (act === "__HEADLINER__") {
        headlinerImages = headlinerImages.filter((img) => img.id !== id);
      } else {
        supportingImages[act] = supportingImages[act].filter((img) => img.id !== id);
      }

      if (hero && hero.id === id) {
        hero = null;
      }

      renderHeadlinerPreviews();
      return;
    }

    const wrapper = e.target.closest(".lb-photo-preview");
    if (!wrapper) return;

    const now = Date.now();
    if (now - lastTap < 350) {
      const id = wrapper.dataset.id;
      const act = wrapper.dataset.act;

      hero = { act, id };

      updateAllHeroHearts();
      animateHero(wrapper);
    }
    lastTap = now;
  });

  function updateAllHeroHearts() {
    document.querySelectorAll(".lb-hero-heart-corner").forEach((heart) => {
      heart.classList.remove("lb-hero-heart-corner--active");
    });

    if (!hero) return;

    const heroWrapper = document.querySelector(`.lb-photo-preview[data-id="${hero.id}"]`);
    if (heroWrapper) {
      const heart = heroWrapper.querySelector(".lb-hero-heart-corner");
      if (heart) heart.classList.add("lb-hero-heart-corner--active");
    }
  }

  function animateHero(wrapper) {
    const bigHeart = document.createElement("div");
    bigHeart.className = "lb-hero-heart-center";
    bigHeart.innerHTML = "❤";
    wrapper.appendChild(bigHeart);

    setTimeout(() => {
      bigHeart.classList.add("lb-hero-heart-center--fade");
      setTimeout(() => bigHeart.remove(), 400);
    }, 50);
  }

  // ============================
  // FORM SUBMISSION
  // ============================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const artist = artistInput.value.trim();
    const tour = tourInput.value.trim();
    const venue = venueInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const notes = notesInput.value.trim();

    let city = citySelect.value;
    if (city === "OTHER") {
      city = normalizeCity(otherCityInput.value.trim());
      if (!city) {
        alert('Please enter a valid city in the format "City, ST".');
        return;
      }
    }

    const people = peopleInput.value
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const supportingActs = Array.from(
      supportingActsContainer.querySelectorAll(".lb-supporting-act-input")
    )
      .map((input) => input.value.trim())
      .filter((v) => v.length > 0);

    // ⭐ SAFETY FIX: ensure supportingImages is always an object
    const safeSupportingImages = supportingImages || {};

    const entry = {
      id: Date.now(),
      artist,
      tour,
      venue,
      date,
      time,
      city,
      notes,
      people,
      supportingActs,
      photos: {
        headliner: headlinerImages,
        supporting: safeSupportingImages
      },
      hero
    };

    saveEntry(entry);
    window.location.href = "../story/concert.html";
  });

  function saveEntry(entry) {
    const key = "lb_concert_entries";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(entry);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  function normalizeCity(value) {
    if (!value) return "";
    const parts = value.split(",");
    if (parts.length !== 2) return "";
    const city = parts[0].trim();
    const state = parts[1].trim().toUpperCase();
    if (!city || state.length < 2 || state.length > 3) return "";
    return `${capitalize(city)}, ${state}`;
  }

  function capitalize(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

});

