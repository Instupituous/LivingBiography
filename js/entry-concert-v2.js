document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // SAFE ELEMENT GETTER
    // -----------------------------
    const $ = (id) => document.getElementById(id);

    // -----------------------------
    // ELEMENT REFERENCES
    // -----------------------------
    const form = $("concertForm");

    const locationSelect = $("locationSelect");
    const manualLocation = $("manualLocation");
    const manualCityState = $("manualCityState");

    const headlinerInput = $("headlinerPhotos");
    const headlinerPreview = $("headlinerPreview");

    const otherInput = $("otherPhotos");
    const otherPreview = $("otherPreview");

    const supportingActsContainer = $("supportingActsContainer");
    const addActBtn = $("addActBtn");

    const ratingSlider = $("rating");
    const ratingValue = $("ratingValue");

    const heroNotice = $("heroNotice");
    const accompanimentInput = $("accompaniment");

    let supportingActCount = 0;
    let heroPhotoBase64 = null;

    // -----------------------------
    // LOGGING (SAFE FOR SAFARI)
    // -----------------------------
    const log = (...args) => {
        try { console.log(...args); } catch (e) {}
    };

    log("Entry JS loaded.");

    // -----------------------------
    // FILE → BASE64
    // -----------------------------
    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });

    // -----------------------------
    // LOCATION DROPDOWN
    // -----------------------------
    if (locationSelect) {
        locationSelect.addEventListener("change", () => {
            if (locationSelect.value === "other") {
                manualLocation.style.display = "block";
            } else {
                manualLocation.style.display = "none";
                manualCityState.value = "";
            }
        });
    }

    // -----------------------------
    // HERO SELECTION
    // -----------------------------
    function attachHeroSelection(imgElement, base64) {
        if (!imgElement) return;

        imgElement.addEventListener("click", () => {
            document.querySelectorAll(".photo-preview img").forEach((img) => {
                img.classList.remove("hero-selected");
            });

            imgElement.classList.add("hero-selected");
            heroPhotoBase64 = base64;
            heroNotice.style.display = "none";
        });
    }

    // -----------------------------
    // PREVIEW HANDLER
    // -----------------------------
    async function handlePreview(inputElement, previewContainer) {
        if (!inputElement || !previewContainer) return;

        previewContainer.innerHTML = "";

        const files = inputElement.files;
        if (!files || files.length === 0) return;

        for (const file of files) {
            const base64 = await fileToBase64(file);
            if (!base64) continue;

            const img = document.createElement("img");
            img.src = base64;

            attachHeroSelection(img, base64);
            previewContainer.appendChild(img);
        }
    }

    // -----------------------------
    // HEADLINER PHOTOS
    // -----------------------------
    if (headlinerInput) {
        headlinerInput.addEventListener("change", () => {
            handlePreview(headlinerInput, headlinerPreview);
        });
    }

    // -----------------------------
    // OTHER PHOTOS
    // -----------------------------
    if (otherInput) {
        otherInput.addEventListener("change", () => {
            handlePreview(otherInput, otherPreview);
        });
    }

    // -----------------------------
    // SUPPORTING ACTS
    // -----------------------------
    if (addActBtn) {
        addActBtn.addEventListener("click", () => {
            supportingActCount++;

            const block = document.createElement("div");
            block.className = "supporting-act";
            block.dataset.index = supportingActCount;

            block.innerHTML = `
                <label>Supporting Act Name</label>
                <input type="text" class="act-name">

                <label>Photos</label>
                <input type="file" class="act-photos" accept="image/*" multiple>

                <div class="photo-preview act-preview"></div>
            `;

            supportingActsContainer.appendChild(block);

            const photoInput = block.querySelector(".act-photos");
            const previewDiv = block.querySelector(".act-preview");

            if (photoInput) {
                photoInput.addEventListener("change", async () => {
                    previewDiv.innerHTML = "";

                    const files = photoInput.files;
                    if (!files) return;

                    for (const f of files) {
                        const base64 = await fileToBase64(f);
                        if (!base64) continue;

                        const img = document.createElement("img");
                        img.src = base64;

                        attachHeroSelection(img, base64);
                        previewDiv.appendChild(img);
                    }
                });
            }
        });
    }

    // -----------------------------
    // RATING SLIDER
    // -----------------------------
    function updateRatingDisplay() {
        if (ratingValue && ratingSlider) {
            ratingValue.textContent = `${ratingSlider.value} / 10`;
        }
    }

    if (ratingSlider) {
        ratingSlider.addEventListener("input", updateRatingDisplay);
        ratingSlider.addEventListener("touchmove", updateRatingDisplay);
        updateRatingDisplay();
    }

    // -----------------------------
    // FORM SUBMIT
    // -----------------------------
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            log("Save Entry clicked.");

            // HERO REQUIRED
            if (!heroPhotoBase64) {
                heroNotice.style.display = "block";
                window.scrollTo({ top: heroNotice.offsetTop - 40, behavior: "smooth" });
                return;
            }

            // LOCATION
            let city = "";
            let state = "";

            if (locationSelect && locationSelect.value === "other") {
                if (!manualCityState.value.includes(",")) {
                    alert("Please enter location as City, State");
                    return;
                }
                const parts = manualCityState.value.split(",");
                city = parts[0].trim();
                state = parts[1].trim();
            } else if (locationSelect && locationSelect.value.includes(",")) {
                const parts = locationSelect.value.split(",");
                city = parts[0];
                state = parts[1];
            }

            // SUPPORTING ACTS
            const supportingActs = [];
            const blocks = document.querySelectorAll(".supporting-act");

            for (const block of blocks) {
                const nameInput = block.querySelector(".act-name");
                const photoInput = block.querySelector(".act-photos");

                const name = nameInput ? nameInput.value.trim() : "";
                const photos = [];

                if (photoInput && photoInput.files) {
                    for (const f of photoInput.files) {
                        const base64 = await fileToBase64(f);
                        if (base64) photos.push(base64);
                    }
                }

                if (name.length > 0) {
                    supportingActs.push({ name, photos });
                }
            }

            // HEADLINER PHOTOS
            const headlinerPhotos = [];
            if (headlinerInput && headlinerInput.files) {
                for (const f of headlinerInput.files) {
                    const base64 = await fileToBase64(f);
                    if (base64) headlinerPhotos.push(base64);
                }
            }

            // OTHER PHOTOS
            const otherPhotos = [];
            if (otherInput && otherInput.files) {
                for (const f of otherInput.files) {
                    const base64 = await fileToBase64(f);
                    if (base64) otherPhotos.push(base64);
                }
            }

            // ACCOMPANIMENT
            const accompaniment = accompanimentInput.value
                .split("\n")
                .map((x) => x.trim())
                .filter((x) => x.length > 0);

            // BUILD ENTRY OBJECT
            const entry = {
                id: Date.now(),
                artist: $("artist").value.trim(),
                date: $("date").value,
                venue: $("venue").value.trim(),
                location: { city, state },
                headlinerPhotos,
                supportingActs,
                otherPhotos,
                heroPhoto: heroPhotoBase64,
                accompaniment,
                notes: $("notes").value.trim(),
                tags: $("tags").value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0),
                rating: parseInt(ratingSlider.value, 10)
            };

            // SAVE
            const key = "lb_concert_entries";
            const existing = JSON.parse(localStorage.getItem(key) || "[]");
            existing.push(entry);
            localStorage.setItem(key, JSON.stringify(existing));

            log("Entry saved:", entry);

            // REDIRECT
            window.location.href = `../story/concert.html?id=${entry.id}`;
        });
    }

});

