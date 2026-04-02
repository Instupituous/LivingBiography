document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('concert-form');
  const supportingContainer = document.getElementById('supporting-acts-container');
  const addSupportingBtn = document.getElementById('add-supporting-act');
  const citySelect = document.getElementById('city-select');
  const otherCityWrapper = document.getElementById('other-city-wrapper');
  const otherCityInput = document.getElementById('other-city');
  const photosInput = document.getElementById('photos');
  const photoPreviews = document.getElementById('photo-previews');

  let uploadedImages = [];
  let heroImageId = null;

  // Supporting acts: add/remove rows
  addSupportingBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'lb-supporting-act-row';
    row.innerHTML = `
      <input type="text" name="supportingActs[]" placeholder="Supporting act">
      <button type="button" class="lb-icon-button lb-remove-supporting" aria-label="Remove supporting act">&times;</button>
    `;
    supportingContainer.appendChild(row);
  });

  supportingContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('lb-remove-supporting')) {
      const row = e.target.closest('.lb-supporting-act-row');
      if (supportingContainer.children.length > 1) {
        row.remove();
      } else {
        row.querySelector('input').value = '';
      }
    }
  });

  // City dropdown + Other
  citySelect.addEventListener('change', () => {
    if (citySelect.value === 'OTHER') {
      otherCityWrapper.hidden = false;
      otherCityInput.required = true;
    } else {
      otherCityWrapper.hidden = true;
      otherCityInput.required = false;
      otherCityInput.value = '';
    }
  });

  // Photo handling
  photosInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImages.push({
          id,
          name: file.name,
          dataUrl: event.target.result
        });
        renderPreviews();
      };
      reader.readAsDataURL(file);
    });
    // Clear input so same file can be re-selected later if needed
    photosInput.value = '';
  });

  function renderPreviews() {
    photoPreviews.innerHTML = '';
    uploadedImages.forEach((img) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'lb-photo-preview';
      wrapper.dataset.id = img.id;

      const imageEl = document.createElement('img');
      imageEl.src = img.dataUrl;
      imageEl.alt = img.name;
      imageEl.className = 'lb-photo-preview-img';

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'lb-icon-button lb-photo-delete';
      deleteBtn.innerHTML = '🗑';
      deleteBtn.title = 'Remove photo';

      const heroHeart = document.createElement('div');
      heroHeart.className = 'lb-hero-heart-corner';
      if (img.id === heroImageId) {
        heroHeart.classList.add('lb-hero-heart-corner--active');
      }

      wrapper.appendChild(imageEl);
      wrapper.appendChild(deleteBtn);
      wrapper.appendChild(heroHeart);
      photoPreviews.appendChild(wrapper);
    });
  }

  // Delete + hero selection (double-tap)
  let lastTapTime = 0;

  photoPreviews.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.lb-photo-delete');
    if (deleteBtn) {
      const wrapper = deleteBtn.closest('.lb-photo-preview');
      const id = wrapper.dataset.id;
      uploadedImages = uploadedImages.filter((img) => img.id !== id);
      if (heroImageId === id) {
        heroImageId = null;
      }
      renderPreviews();
      return;
    }

    const imgWrapper = e.target.closest('.lb-photo-preview');
    if (!imgWrapper) return;

    const currentTime = Date.now();
    const tapGap = currentTime - lastTapTime;

    if (tapGap < 350) {
      const id = imgWrapper.dataset.id;
      selectHero(id, imgWrapper);
    }

    lastTapTime = currentTime;
  });

  function selectHero(id, wrapper) {
    heroImageId = id;

    // Big center heart overlay
    const bigHeart = document.createElement('div');
    bigHeart.className = 'lb-hero-heart-center';
    bigHeart.innerHTML = '❤';
    wrapper.appendChild(bigHeart);

    setTimeout(() => {
      bigHeart.classList.add('lb-hero-heart-center--fade');
      setTimeout(() => bigHeart.remove(), 400);
    }, 50);

    // Update corner hearts
    const allWrappers = photoPreviews.querySelectorAll('.lb-photo-preview');
    allWrappers.forEach((w) => {
      const heart = w.querySelector('.lb-hero-heart-corner');
      if (!heart) return;
      if (w.dataset.id === id) {
        heart.classList.add('lb-hero-heart-corner--active');
      } else {
        heart.classList.remove('lb-hero-heart-corner--active');
      }
    });
  }

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const artist = form.artist.value.trim();
    const tour = form.tour.value.trim();
    const venue = form.venue.value.trim();
    const date = form.date.value;
    const time = form.time.value;
    const notes = form.notes.value.trim();

    let city = citySelect.value;
    if (city === 'OTHER') {
      city = normalizeCity(otherCityInput.value.trim());
      if (!city) {
        alert('Please enter a valid city in the format "City, ST".');
        otherCityInput.focus();
        return;
      }
    }

    if (!artist || !date || !city) {
      alert('Please fill in Artist, Date, and City.');
      return;
    }

    const supportingActs = Array.from(
      supportingContainer.querySelectorAll('input[name="supportingActs[]"]')
    )
      .map((input) => input.value.trim())
      .filter((v) => v.length > 0);

    const peopleRaw = form.people.value.split('\n');
    const people = peopleRaw
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const entry = {
      id: Date.now(),
      artist,
      tour,
      supportingActs,
      people,
      date,
      city,
      venue,
      time,
      notes,
      photos: uploadedImages,
      heroImageId
    };

    saveConcertEntry(entry);
    window.location.href = '../story/concert.html';
  });

  function normalizeCity(value) {
    if (!value) return '';
    const parts = value.split(',');
    if (parts.length !== 2) return '';
    const city = parts[0].trim();
    const state = parts[1].trim().toUpperCase();
    if (!city || state.length < 2 || state.length > 3) return '';
    return `${capitalizeWords(city)}, ${state}`;
  }

  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  }

  function saveConcertEntry(entry) {
    const key = 'lb_concert_entries';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(entry);
    localStorage.setItem(key, JSON.stringify(existing));
  }
});
