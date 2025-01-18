(function() {
  // Grab ?site= from URL
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get('site');

  const statusMsg = document.getElementById('statusMsg');
  const plumberNameEl = document.getElementById('plumberName');
  const plumberLogoEl = document.getElementById('plumberLogo');

  if (!siteParam) {
    statusMsg.textContent = "No ?site= parameter found. Example: ?site=cj-plumbing-and-gas";
    return;
  }

  // The JSON is in your other repo: alabamaplumbersnowebsite
  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";

  fetch(DATA_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load finalWebsiteData.json (status " + response.status + ")");
      }
      return response.json();
    })
    .then(json => {
      // If your structure is { finalWebsiteData: [ {...}, {...} ] }
      const businesses = json.finalWebsiteData || [];

      // Find the matching site by siteId (case-insensitive)
      const found = businesses.find(biz =>
        (biz.siteId || "").toLowerCase() === siteParam.toLowerCase()
      );

      if (!found) {
        statusMsg.textContent = "No matching siteId found for: " + siteParam;
        return;
      }

      statusMsg.textContent = "Loaded data for " + siteParam;

      // 'found.name' in your JSON is the plumber's name
      if (found.name) {
        plumberNameEl.textContent = found.name;
      } else {
        plumberNameEl.textContent = siteParam; // fallback
      }

      // 'found.logo' in your JSON is the plumber's logo
      if (found.logo) {
        plumberLogoEl.src = found.logo;
        plumberLogoEl.alt = found.name ? found.name + " Logo" : "Logo";
      } else {
        plumberLogoEl.alt = "No logo field in data for " + siteParam;
      }
    })
    .catch(err => {
      statusMsg.textContent = "Error: " + err.message;
    });
})();
