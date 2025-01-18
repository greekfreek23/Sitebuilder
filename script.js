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

  const step2Hero        = document.getElementById("step2Hero");

  // Grab ?site= from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get("site");

  if (!siteParam) {
    statusMsg.textContent = "Error: No ?site= parameter found in URL.";
    return;
  }

  // We'll fetch the real data from your 'alabamaplumbersnowebsite' JSON
  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";

  fetch(DATA_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch finalWebsiteData.json: " + response.status);
      }
      return response.json();
    })
    .then(json => {
      const businesses = json.finalWebsiteData || [];
      // Find the matching record
      const found = businesses.find(biz =>
        (biz.siteId || "").toLowerCase() === siteParam.toLowerCase()
      );

      if (!found) {
        statusMsg.textContent = "No matching siteId found for: " + siteParam;
        return;
      }

      // If we get here, we have the business data
      statusMsg.textContent = `Loaded data for: ${siteParam}`;
      step1Logo.classList.remove("hidden"); // Show the step 1 container

      // Display the plumber's existing logo
      if (found.logo) {
        currentLogoImg.src = found.logo;
      } else {
        currentLogoImg.alt = "No logo found in data.";
      }

      // Now set up the rest of the logic

      // Radio change
      logoOptions.addEventListener("change", e => {
        const choice = e.target.value;
        // Hide sub-containers each time
        uploadContainer.classList.add("hidden");
        dalleContainer.classList.add("hidden");
        dalleResult.classList.add("hidden");

        switch (choice) {
          case "correct":
            showNextStepButton(); // Immediately show the Step 2 button
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

      // File Upload logic
      logoUploadInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
          currentLogoImg.src = evt.target.result; // local preview
          console.log("New logo file chosen:", file.name);
          showNextStepButton();
        };
        reader.readAsDataURL(file);
      });

      // DALL-E creation
      createLogoBtn.addEventListener("click", () => {
        const userPrompt = dallePromptInput.value.trim();
        const colors     = colorInput.value.trim();

        if (!userPrompt) {
          alert("Please enter a description for your logo.");
          return;
        }

        // Fake a DALL-E call
        simulateDalleGeneration(userPrompt, colors)
          .then(imgUrl => {
            dalleImage.src = imgUrl;
            dalleResult.classList.remove("hidden");
          });
      });

      acceptLogoBtn.addEventListener("click", () => {
        // Set the main logo to the generated DALL-E image
        currentLogoImg.src = dalleImage.src;
        console.log("User accepted DALL-E logo");
        showNextStepButton();
      });

      tryAgainBtn.addEventListener("click", () => {
        // Hide result so user can re-enter text
        dalleResult.classList.add("hidden");
      });

      // Next Step -> show Hero placeholder
      goToStep2Btn.addEventListener("click", () => {
        step1Logo.classList.add("hidden");
        goToStep2Btn.classList.add("hidden");
        step2Hero.classList.remove("hidden");
        statusMsg.textContent = "Now editing Step 2 (Hero)...";
      });

    })
    .catch(err => {
      statusMsg.textContent = "Error: " + err.message;
      console.error(err);
    });

  // Reveal the "Next Step" button
  function showNextStepButton() {
    goToStep2Btn.classList.remove("hidden");
  }

  // Simulated DALL·E image generation
  async function simulateDalleGeneration(prompt, colors) {
    console.log("Simulating a DALL-E request with prompt:", prompt, "colors:", colors);
    // Wait 1 second to mimic API call
    await new Promise(res => setTimeout(res, 1000));
    // Return a random placeholder
    const randomNum = Math.floor(Math.random() * 9999);
    return `https://via.placeholder.com/200x80?text=${encodeURIComponent(prompt)}+${randomNum}`;
  }
})();

