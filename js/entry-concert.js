document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("concertForm");
    const supportingActsContainer = document.getElementById("supportingActsContainer");
    const addActBtn = document.getElementById("addActBtn");

    const heroInput = document.getElementById("heroPhoto");
    const heroPreview = document.getElementById("heroPreview");

    const otherInput = document.getElementById("otherPhotos");
    const otherPreview = document.getElementById("otherPreview");

    let supportingActCount = 0;

    // Utility: convert file to Base64
    const fileToBase64 = file =>
        new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });

    // Add supporting act block
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

        // Attach preview handler
        const photoInput = block.querySelector(".act-photos");
        const previewDiv = block.querySelector(".act-preview");

        photoInput.addEventListener("change", async () => {
            previewDiv.innerHTML = "";
            for (const file of photoInput.files) {
                const base64 = await fileToBase64(file);
                const img = document.createElement("img");
                img.src = base64;
                previewDiv.appendChild(img);
            }
        });
    });

    // Hero preview
    heroInput.addEventListener("change", async () => {
        heroPreview.innerHTML = "";
        if (heroInput.files.length > 0) {
            const base64 = await fileToBase64(heroInput.files[0]);
            const img = document.createElement("img");
            img.src = base64;
            heroPreview.appendChild(img);
        }
    });

    // Other photos preview
    otherInput.addEventListener("change", async () => {
        otherPreview.innerHTML = "";
        for (const file of otherInput.files) {
            const base64 = await fileToBase64(file);
            const img = document.createElement("img");
            img.src = base64;
            otherPreview.appendChild(img);
        }
    });

    // Save entry
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Hero photo required
        if (heroInput.files.length === 0) {
            alert("Please select a hero photo.");
            return;
        }

        const heroBase64 = await fileToBase64(heroInput.files[0]);

        // Supporting acts
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

        // Other photos
        const otherPhotos = [];
        for (const f of otherInput.files) {
            otherPhotos.push(await fileToBase64(f));
        }

        // Build entry object
        const entry = {
            id: Date.now(),
            artist: document.getElementById("artist").value.trim(),
            date: document.getElementById("date").value,
            venue: document.getElementById("venue").value.trim(),
            location: {
                city: document.getElementById("city").value.trim(),
                state: document.getElementById("state").value.trim(),
                country: document.getElementById("country").value.trim()
            },
            supportingActs,
            heroPhoto: heroBase64,
            otherPhotos,
            notes: document.getElementById("notes").value.trim(),
            tags: document.getElementById("tags").value.split(",").map(t => t.trim()).filter(t => t.length > 0),
            rating: parseInt(document.getElementById("rating").value, 10)
        };

        // Save to localStorage
        const key = "lb_concert_entries";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push(entry);
        localStorage.setItem(key, JSON.stringify(existing));

        // Redirect to story page
        window.location.href = `../story/concert.html?id=${entry.id}`;
    });

});

