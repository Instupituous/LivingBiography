document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // GET ENTRY ID FROM URL
    // -----------------------------
    const params = new URLSearchParams(window.location.search);
    const entryId = params.get("id");

    if (!entryId) {
        alert("No entry ID provided.");
        return;
    }

    // -----------------------------
    // LOAD ENTRY FROM LOCALSTORAGE
    // -----------------------------
    const key = "lb_concert_entries";
    const entries = JSON.parse(localStorage.getItem(key) || "[]");
    const entry = entries.find(e => String(e.id) === String(entryId));

    if (!entry) {
        alert("Entry not found.");
        return;
    }

    // -----------------------------
    // ELEMENT REFERENCES
    // -----------------------------
    const heroImage = document.getElementById("heroImage");
    const artistName = document.getElementById("artistName");
    const dateField = document.getElementById("dateField");
    const venueField = document.getElementById("venueField");
    const locationField = document.getElementById("locationField");
    const ratingField = document.getElementById("ratingField");
    const tagsField = document.getElementById("tagsField");
    const notesField = document.getElementById("notesField");
    const accompanimentField = document.getElementById("accompanimentField");

    const headlinerPhotosDiv = document.getElementById("headlinerPhotos");
    const supportingActsContainer = document.getElementById("supportingActsContainer");
    const otherPhotosDiv = document.getElementById("otherPhotos");

    // -----------------------------
    // POPULATE HERO IMAGE
    // -----------------------------
    heroImage.src = entry.heroPhoto;

    // -----------------------------
    // POPULATE METADATA
    // -----------------------------
    artistName.textContent = entry.artist || "";

    // Date
    if (entry.date) {
        const d = new Date(entry.date);
        const formatted = d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        dateField.textContent = formatted;
    }

    // Venue
    venueField.textContent = entry.venue ? `Venue: ${entry.venue}` : "";

    // Location
    if (entry.location && entry.location.city && entry.location.state) {
        locationField.textContent = `Location: ${entry.location.city}, ${entry.location.state}`;
    }

    // Rating
    ratingField.textContent = `Rating: ${entry.rating} / 10`;

    // Tags
    if (entry.tags && entry.tags.length > 0) {
        tagsField.textContent = `Tags: ${entry.tags.join(", ")}`;
    }

    // Notes
    notesField.textContent = entry.notes || "";

    // -----------------------------
    // ACCOMPANIMENT (NYT-style block)
    // -----------------------------
    if (entry.accompaniment && entry.accompaniment.length > 0) {
        accompanimentField.textContent = entry.accompaniment.join("\n");
    } else {
        accompanimentField.textContent = "—";
    }

    // -----------------------------
    // HEADLINER PHOTOS
    // -----------------------------
    if (entry.headlinerPhotos && entry.headlinerPhotos.length > 0) {
        entry.headlinerPhotos.forEach(base64 => {
            const img = document.createElement("img");
            img.src = base64;
            headlinerPhotosDiv.appendChild(img);
        });
    }

    // -----------------------------
    // SUPPORTING ACTS
    // -----------------------------
    if (entry.supportingActs && entry.supportingActs.length > 0) {
        entry.supportingActs.forEach(act => {
            const block = document.createElement("div");
            block.className = "supporting-act-block";

            const title = document.createElement("h3");
            title.textContent = act.name;

            const grid = document.createElement("div");
            grid.className = "photo-grid";

            act.photos.forEach(base64 => {
                const img = document.createElement("img");
                img.src = base64;
                grid.appendChild(img);
            });

            block.appendChild(title);
            block.appendChild(grid);
            supportingActsContainer.appendChild(block);
        });
    }

    // -----------------------------
    // OTHER PHOTOS
    // -----------------------------
    if (entry.otherPhotos && entry.otherPhotos.length > 0) {
        entry.otherPhotos.forEach(base64 => {
            const img = document.createElement("img");
            img.src = base64;
            otherPhotosDiv.appendChild(img);
        });
    }

});
