(function() {
  // Grab ?site= from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get('site');

  // Elements from the DOM
  const siteStatusEl = document.getElementById('siteStatus');
  const originalSiteIframe = document.getElementById('originalSiteIframe');
  const openBuilderBtn = document.getElementById('openBuilderBtn');
  const builderContainer = document.getElementById('builderContainer');
  const originalSiteContainer = document.getElementById('originalSiteContainer');

  const currentLogoImg = document.getElementById('currentLogo');
  const generateLogoBtn = document.getElementById('generateLogoBtn');
  const logoUploadInput = document.getElementById('logoUpload');

  // Check if we have a site param
  if (!siteParam) {
    siteStatusEl.textContent =
      "No ?site= parameter found in the URL. Example: ?site=cj-plumbing-and-gas";
    // Hide the iframe container, etc.
    originalSiteContainer.style.display = "none";
    return;
  }

  // Show user which site we are loading
  siteStatusEl.textContent = `Loading data for siteId: ${siteParam} ...`;

  // 1) Build the URL to the existing live site
  //    e.g. "https://greekfreek23.github.io/ALPlumbersSite/?site=cj-plumbing-and-gas"
  //    Adjust if your live site is named differently or in a different repo.
  const liveSiteUrl = `https://greekfreek23.github.io/ALPlumbersSite/?site=${encodeURIComponent(siteParam)}`;
  originalSiteIframe.src = liveSiteUrl;

  // 2) Fetch data from your "alabamaplumbersnowebsite" finalWebsiteData.json
  const DATA_URL =
    "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";

  fetch(DATA_URL)
    .then(resp => {
      if (!resp.ok) {
        throw new Error("Failed to fetch finalWebsiteData.json");
      }
      return resp.json();
    })
    .then(jsonData => {
      const businesses = jsonData.finalWebsiteData || [];
      // Find the matching record
      const found = businesses.find(biz =>
        (biz.siteId || "").toLowerCase() === siteParam.toLowerCase()
      );

      if (!found) {
        siteStatusEl.textContent =
          `No matching siteId found in data for: ${siteParam}`;
        return;
      }

      siteStatusEl.textContent = `Data loaded for: ${siteParam}`;

      // 3) Show the existing logo (the data key is "logo" and "name" = found.name, if you have it)
      if (found.logo) {
        currentLogoImg.src = found.logo;
      } else {
        currentLogoImg.alt = "No logo found in data.";
      }

      // Optionally display plumber name or phone, if you want
      // e.g. console.log("Plumber name:", found.name);

      // Set up the "Open Website Builder" button
      openBuilderBtn.addEventListener("click", () => {
        // Hide the original site container
        originalSiteContainer.style.display = "none";
        // Show the builder container
        builderContainer.classList.remove("hidden");
      });

      // 4) Handle new logo upload
      logoUploadInput.addEventListener("change", (evt) => {
        // This is just a placeholder example.
        // In reality, you'd handle file reading, upload to a server, etc.
        const file = evt.target.files[0];
        if (file) {
          // Could do a local preview if you want:
          const reader = new FileReader();
          reader.onload = e => {
            currentLogoImg.src = e.target.result;
          };
          reader.readAsDataURL(file);
          console.log("User selected a new logo file:", file.name);
        }
      });

      // 5) Handle "Create a new logo with DALL-E" button
      generateLogoBtn.addEventListener("click", () => {
        // Placeholder: you might open a modal or directly call your serverless function
        // that interacts with DALL-E using your API key.
        alert("DALL-E logo generation is not implemented in this demo!");
      });
    })
    .catch(err => {
      siteStatusEl.textContent = `Error: ${err.message}`;
      console.error(err);
    });
})();
