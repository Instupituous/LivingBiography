document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // ELEMENT REFERENCES
    // -----------------------------
    const form = document.getElementById("concertForm");

    const locationSelect = document.getElementById("locationSelect");
    const manualLocation = document.getElementById("manualLocation");
    const manualCityState = document.getElementById("manualCityState");

    const headlinerInput = document.getElementById("headlinerPhotos");
    const headlinerPreview = document.getElementById("headlinerPreview");

    const otherInput = document.getElementById("otherPhotos");
    const otherPreview = document.getElementById("otherPreview");

    const supportingActsContainer = document.getElementById("supportingActsContainer");
    const addActBtn = document.getElementById("addActBtn");

    const ratingSlider = document.getElementById("rating");
    const ratingValue = document.getElementById("ratingValue");

    const heroNotice = document.getElementById("heroNotice");

    let supportingActCount = 0;
    let heroPhotoBase64 = null; // stores the selected hero photo


    // -----------------------------
    // UTILITY: FILE → BASE64
    // -----------------------------
    const fileToBase64 = file =>
        new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });


    // -----------------------------
    // LOCATION DROPDOWN LOGIC
    // -----------------------------
    locationSelect.addEventListener("change", () => {
        if (locationSelect.value === "other") {
            manualLocation.style.display = "block";
        } else {
            manualLocation.style.display = "none";
            manualCityState.value = "";
        }
    });


    // -----------------------------
    // HERO SELECTION LOGIC
    // -----------------------------
    function attachHeroSelection(imgElement, base64) {
        imgElement.addEventListener("click", () => {
            // Remove hero class from all images
            document.querySelectorAll(".photo-preview img").forEach(img => {
                img.classList.remove("hero-selected");
            });

            // Add hero class to this one
            imgElement.classList.add("hero-selected");

            // Store hero
            heroPhotoBase64 = base64;

            // Hide notice if previously shown
            heroNotice.style.display = "none";
        });
    }


    // -----------------------------
    // PREVIEW HANDLER (GENERIC)
    // -----------------------------
    async function handlePreview(inputElement, previewContainer) {
        previewContainer.innerHTML = "";

        for (const file of inputElement.files) {
            const base64 = await fileToBase64(file);

            const img = document.createElement("img");
            img.src = base64;

            // Attach hero selection
            attachHeroSelection(img, base64);

            previewContainer.appendChild(img);
        }
    }


    // -----------------------------
    // HEADLINER PHOTOS
    // -----------------------------
    headlinerInput.addEventListener("change", () => {
        handlePreview(headlinerInput, headlinerPreview);
    });


    // -----------------------------
    // OTHER PHOTOS
    // -----------------------------
    otherInput.addEventListener("change", () => {
        handlePreview(otherInput, otherPreview);
    });


    // -----------------------------
    // SUPPORTING ACTS
    // -----------------------------
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

        photoInput.addEventListener("change", async () => {
            previewDiv.innerHTML = "";

            for (const file of photoInput.files) {
                const base64 = await fileToBase64(file);

                const img = document.createElement("img");
                img.src = base64;

                // Attach hero selection
                attachHeroSelection(img, base64);

                previewDiv.appendChild(img);
            }
        });
    });


    // -----------------------------
    // RATING SLIDER (LIVE UPDATE)
    // -----------------------------
    const updateRatingDisplay = () => {
        ratingValue.textContent = `${ratingSlider.value} / 10`;
    };

    ratingSlider.addEventListener("input", updateRatingDisplay);
    ratingSlider.addEventListener("touchmove", updateRatingDisplay);


    // -----------------------------
    // FORM SUBMIT
    // -----------------------------
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // HERO REQUIRED
        if (!heroPhotoBase64) {
            heroNotice.style.display = "block";
            window.scrollTo({ top: heroNotice.offsetTop - 40, behavior: "smooth" });
            return;
        }

        // LOCATION
        let city = "";
        let state = "";

        if (locationSelect.value === "other") {
            if (!manualCityState.value.includes(",")) {
                alert("Please enter location as City, State");
                return;
            }
            const parts = manualCityState.value.split(",");
            city = parts[0].trim();
            state = parts[1].trim();
        } else if (locationSelect.value.includes(",")) {
            const parts = locationSelect.value.split(",");
            city = parts[0];
            state = parts[1];
        }

        // SUPPORTING ACTS
        const supportingActs = [];
        const blocks = document.querySelectorAll(".supporting-act");

        for (const block of blocks) {
            const name = block.querySelector(".act-name").value.trim();
            const photoInput = block.querySelector(".act-photos");

            const photos = [];
            for (const f of photoInput.files) {
                photos.push(await fileToBase64(f));
            }

            if (name.length > 0) {
                supportingActs.push({ name, photos });
            }
        }

        // HEADLINER PHOTOS
        const headlinerPhotos = [];
        for (const f of headlinerInput.files) {
            headlinerPhotos.push(await fileToBase64(f));
        }

        // OTHER PHOTOS
        const otherPhotos = [];
        for (const f of otherInput.files) {
            otherPhotos.push(await fileToBase64(f));
        }

        // BUILD ENTRY OBJECT
        const entry = {
            id: Date.now(),
            artist: document.getElementById("artist").value.trim(),
            date: document.getElementById("date").value,
            venue: document.getElementById("venue").value.trim(),
            location: { city, state },
            headlinerPhotos,
            supportingActs,
            otherPhotos,
            heroPhoto: heroPhotoBase64,
            notes: document.getElementById("notes").value.trim(),
            tags: document.getElementById("tags").value
                .split(",")
                .map(t => t.trim())
                .filter(t => t.length > 0),
            rating: parseInt(ratingSlider.value, 10)
        };

        // SAVE TO LOCALSTORAGE
        const key = "lb_concert_entries";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push(entry);
        localStorage.setItem(key, JSON.stringify(existing));

        // REDIRECT
        window.location.href = `../story/concert.html?id=${entry.id}`;
    });

});
