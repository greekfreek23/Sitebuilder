(function() {
  // DOM references
  const statusMsg        = document.getElementById("statusMsg");
  const step1Logo        = document.getElementById("step1Logo");
  const currentLogoImg   = document.getElementById("currentLogo");
  const logoOptions      = document.getElementById("logoOptions");
  const uploadContainer  = document.getElementById("uploadContainer");
  const dalleContainer   = document.getElementById("dalleContainer");
  const logoUploadInput  = document.getElementById("logoUpload");
  const dallePromptInput = document.getElementById("dallePrompt");
  const colorInput       = document.getElementById("colorInput");
  const createLogoBtn    = document.getElementById("createLogoBtn");
  const dalleResult      = document.getElementById("dalleResult");
  const dalleImage       = document.getElementById("dalleImage");
  const acceptLogoBtn    = document.getElementById("acceptLogoBtn");
  const tryAgainBtn      = document.getElementById("tryAgainBtn");
  const goToStep2Btn     = document.getElementById("goToStep2Btn");

  const step2Hero             = document.getElementById("step2Hero");
  const heroImagesList        = document.getElementById("heroImagesList");
  const heroLooksGoodBtn      = document.getElementById("heroLooksGoodBtn");

  const step3About            = document.getElementById("step3About");

  // 1) Grab ?site= from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get("site");

  if (!siteParam) {
    statusMsg.textContent = "Error: No ?site= parameter found in URL.";
    return;
  }

  // 2) Fetch data from your finalWebsiteData.json
  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";
  fetch(DATA_URL)
    .then(resp => {
      if (!resp.ok) {
        throw new Error("Failed to fetch finalWebsiteData.json: " + resp.status);
      }
      return resp.json();
    })
    .then(json => {
      const businesses = json.finalWebsiteData || [];
      // Find matching record
      const found = businesses.find(biz =>
        (biz.siteId || "").toLowerCase() === siteParam.toLowerCase()
      );

      if (!found) {
        statusMsg.textContent = "No matching siteId found for: " + siteParam;
        return;
      }

      // We have data for the plumber
      statusMsg.textContent = `Loaded data for: ${siteParam}`;
      step1Logo.classList.remove("hidden"); // Show Step 1 container

      // Display the existing logo
      if (found.logo) {
        currentLogoImg.src = found.logo;
      } else {
        currentLogoImg.alt = "No logo found in data.";
      }

      // --- LOGO STEP 1 EVENTS ---
      logoOptions.addEventListener("change", e => {
        const choice = e.target.value;
        uploadContainer.classList.add("hidden");
        dalleContainer.classList.add("hidden");
        dalleResult.classList.add("hidden");

        switch (choice) {
          case "correct":
            showNextStepButton();
            break;
          case "upload":
            uploadContainer.classList.remove("hidden");
            break;
          case "dalle":
            dalleContainer.classList.remove("hidden");
            break;
          case "later":
            showNextStepButton();
            break;
        }
      });

      // Upload file logic
      logoUploadInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
          currentLogoImg.src = evt.target.result; // local preview
          // In real code, you'd store or upload it
          showNextStepButton();
        };
        reader.readAsDataURL(file);
      });

      // DALL-E creation
      createLogoBtn.addEventListener("click", () => {
        const promptText = dallePromptInput.value.trim();
        const colors     = colorInput.value.trim();
        if (!promptText) {
          alert("Please enter a description for your logo.");
          return;
        }
        simulateDalleGeneration(promptText, colors).then(imgUrl => {
          dalleImage.src = imgUrl;
          dalleResult.classList.remove("hidden");
        });
      });

      acceptLogoBtn.addEventListener("click", () => {
        currentLogoImg.src = dalleImage.src;
        showNextStepButton();
      });

      tryAgainBtn.addEventListener("click", () => {
        dalleResult.classList.add("hidden");
      });

      goToStep2Btn.addEventListener("click", () => {
        // Hide Step 1, Show Step 2
        step1Logo.classList.add("hidden");
        goToStep2Btn.classList.add("hidden");
        step2Hero.classList.remove("hidden");
        statusMsg.textContent = "Now editing Step 2 (Hero)...";

        // Load hero section
        loadHeroSection(found);
      });

      // --- HERO STEP 2 EVENTS ---
      heroLooksGoodBtn.addEventListener("click", () => {
        // Hide Step 2, show Step 3
        step2Hero.classList.add("hidden");
        step3About.classList.remove("hidden");
        statusMsg.textContent = "Now editing Step 3 (About Us)...";
      });

    })
    .catch(err => {
      statusMsg.textContent = "Error: " + err.message;
      console.error(err);
    });

  // Show "Go to Step 2" button
  function showNextStepButton() {
    goToStep2Btn.classList.remove("hidden");
  }

  // Load the hero images into Step 2
  function loadHeroSection(plumberData) {
    if (!plumberData.photos || !plumberData.photos.heroImages) {
      console.log("No hero images found in the data.");
      heroImagesList.innerHTML = "<p>No hero images found.</p>";
      return;
    }
    const heroImages = plumberData.photos.heroImages;
    heroImagesList.innerHTML = "";

    heroImages.forEach((heroObj, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("hero-item");

      // Show the image
      const imgEl = document.createElement("img");
      imgEl.src = heroObj.imageUrl || "";
      itemDiv.appendChild(imgEl);

      // CTA label & input
      const ctaLabel = document.createElement("label");
      ctaLabel.textContent = "Call-to-Action Text:";
      itemDiv.appendChild(ctaLabel);

      const ctaInput = document.createElement("input");
      ctaInput.type = "text";
      ctaInput.value = heroObj.callToAction || "";
      ctaInput.addEventListener("input", () => {
        heroObj.callToAction = ctaInput.value;
      });
      itemDiv.appendChild(ctaInput);

      // Swap image button
      const swapBtn = document.createElement("button");
      swapBtn.textContent = "Swap Image";
      swapBtn.style.display = "block";
      swapBtn.style.marginTop = "8px";
      swapBtn.addEventListener("click", () => {
        const newUrl = prompt("Enter new image URL:");
        if (newUrl) {
          imgEl.src = newUrl;
          heroObj.imageUrl = newUrl;
        }
      });
      itemDiv.appendChild(swapBtn);

      heroImagesList.appendChild(itemDiv);
    });
  }

  // Fake DALL-E generation (demo only)
  async function simulateDalleGeneration(prompt, colors) {
    console.log("Simulating DALL-E with prompt:", prompt, "colors:", colors);
    await new Promise(r => setTimeout(r, 1000)); // wait 1s
    const randomNum = Math.floor(Math.random() * 9999);
    return `https://via.placeholder.com/200x80?text=${encodeURIComponent(prompt)}+${randomNum}`;
  }
})();

