(function(){
  // DOM references
  const statusMsg = document.getElementById("statusMsg");
  const step1Hero = document.getElementById("step1Hero");
  const heroImagesList = document.getElementById("heroImagesList");
  const heroLooksGoodBtn = document.getElementById("heroLooksGoodBtn");
  
  const step2About = document.getElementById("step2About");
  const aboutTextArea = document.getElementById("aboutUsText");
  const generateAboutBtn = document.getElementById("generateAboutAI");
  const aboutPreview = document.getElementById("aboutUsPreview");
  const backToHeroBtn = document.getElementById("backToHeroBtn");
  const goToStep3Btn = document.getElementById("goToStep3Btn");
  const previewSiteBtn = document.getElementById("previewSiteBtn");
  const fullSitePreview = document.getElementById("fullSitePreview");
  
  const step3WhyUs = document.getElementById("step3WhyUs");
  const mainPitchText = document.getElementById("mainPitchText");
  const generatePitchAI = document.getElementById("generatePitchAI");
  const sellingPointsList = document.getElementById("sellingPointsList");
  const addSellingPoint = document.getElementById("addSellingPoint");
  const generatePointsAI = document.getElementById("generatePointsAI");
  const whyUsPreview = document.getElementById("whyUsPreview");
  const backToAboutBtn = document.getElementById("backToAboutBtn");
  const goToStep4Btn = document.getElementById("goToStep4Btn");

  // Get URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get("site");

  if(!siteParam) {
    statusMsg.textContent = "Error: No ?site= parameter found in the URL.";
    return;
  }

  // Update theme colors based on JSON data
  function updateThemeColors(plumberData) {
    const root = document.documentElement;
    if (plumberData.primaryColor) {
      root.style.setProperty('--primary-color', plumberData.primaryColor);
    }
    if (plumberData.secondaryColor) {
      root.style.setProperty('--secondary-color', plumberData.secondaryColor);
    }
  }

  // Initialize Hero Section
  function initializeHeroSection(plumberData) {
    if(!plumberData.photos || !plumberData.photos.heroImages) {
      heroImagesList.innerHTML = "<p>No hero images found.</p>";
      return;
    }

    const heroImages = plumberData.photos.heroImages;
    heroImagesList.innerHTML = "";

    heroImages.forEach(heroObj => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("hero-item");

      // Image
      const imgEl = document.createElement("img");
      imgEl.src = heroObj.imageUrl || "";
      imgEl.alt = "Hero image";
      itemDiv.appendChild(imgEl);

      // CTA Text Input
      const ctaInput = document.createElement("input");
      ctaInput.type = "text";
      ctaInput.classList.add("form-input");
      ctaInput.value = heroObj.callToAction || "";
      ctaInput.placeholder = "Enter call-to-action text";
      itemDiv.appendChild(ctaInput);

      // Save Button
      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.classList.add("nav-button");
      saveBtn.addEventListener("click", () => {
        heroObj.callToAction = ctaInput.value;
      });
      itemDiv.appendChild(saveBtn);

      // Generate AI Button
      const aiBtn = document.createElement("button");
      aiBtn.textContent = "Generate with AI";
      aiBtn.classList.add("ai-button");
      aiBtn.addEventListener("click", () => generateHeroCTA(ctaInput, heroObj));
      itemDiv.appendChild(aiBtn);

      heroImagesList.appendChild(itemDiv);
    });
  }

  // Initialize About Section
  function initializeAboutSection(plumberData) {
    if (plumberData.aboutUs) {
      aboutTextArea.value = plumberData.aboutUs;
      updateAboutPreview();
    }

    aboutTextArea.addEventListener("input", updateAboutPreview);
    generateAboutBtn.addEventListener("click", generateAboutText);
    backToHeroBtn.addEventListener("click", () => {
      step2About.classList.add("hidden");
      step1Hero.classList.remove("hidden");
    });

    goToStep3Btn.addEventListener("click", () => {
      step2About.classList.add("hidden");
      step3WhyUs.classList.remove("hidden");
      initializeWhyUsSection(plumberData);
    });

    previewSiteBtn.addEventListener("click", () => toggleFullPreview(plumberData));
  }

  // Initialize Why Us Section
  function initializeWhyUsSection(plumberData) {
    if (plumberData.whyChooseUs) {
      mainPitchText.value = plumberData.whyChooseUs.mainPitch || "";
      updateWhyUsPreview();
      
      if (plumberData.whyChooseUs.sellingPoints) {
        plumberData.whyChooseUs.sellingPoints.forEach(point => addSellingPointInput(point));
      }
    }

    mainPitchText.addEventListener("input", updateWhyUsPreview);
    generatePitchAI.addEventListener("click", generatePitch);
    addSellingPoint.addEventListener("click", () => addSellingPointInput());
    generatePointsAI.addEventListener("click", generateSellingPoints);

    backToAboutBtn.addEventListener("click", () => {
      step3WhyUs.classList.add("hidden");
      step2About.classList.remove("hidden");
    });
  }

  // Helper Functions
  function updateAboutPreview() {
    aboutPreview.innerHTML = aboutTextArea.value || "No content yet";
  }

  function updateWhyUsPreview() {
    const points = Array.from(sellingPointsList.querySelectorAll("input"))
      .map(input => input.value)
      .filter(Boolean);

    whyUsPreview.innerHTML = `
      <p><strong>Main Pitch:</strong></p>
      <p>${mainPitchText.value || "No main pitch yet"}</p>
      <p><strong>Selling Points:</strong></p>
      <ul>
        ${points.map(point => `<li>${point}</li>`).join("")}
      </ul>
    `;
  }

  function addSellingPointInput(value = "") {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "1rem";
    wrapper.style.marginBottom = "1rem";

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("form-input");
    input.value = value;
    input.placeholder = "Enter selling point";
    input.addEventListener("input", updateWhyUsPreview);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("nav-button");
    removeBtn.addEventListener("click", () => {
      wrapper.remove();
      updateWhyUsPreview();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    sellingPointsList.appendChild(wrapper);
  }

  function toggleFullPreview(plumberData) {
    const isHidden = fullSitePreview.classList.contains("hidden");
    
    if (isHidden) {
      // Update preview content
      fullSitePreview.innerHTML = `
        <div id="previewHero">
          ${plumberData.photos?.heroImages?.[0]?.imageUrl ? 
            `<img src="${plumberData.photos.heroImages[0].imageUrl}" alt="Hero" style="width:100%;max-height:300px;object-fit:cover;">` : 
            ''}
        </div>
        <div id="previewAbout">
          <h2>About Us</h2>
          <div>${aboutTextArea.value || 'No content yet'}</div>
        </div>
      `;
      
      fullSitePreview.classList.remove("hidden");
      previewSiteBtn.textContent = "Hide Preview";
    } else {
      fullSitePreview.classList.add("hidden");
      previewSiteBtn.textContent = "Preview Full Site";
    }
  }

  // AI Generation Functions
  async function generateHeroCTA(input, heroObj) {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "heroText",
          businessName: plumberData.businessName
        })
      });

      if (!response.ok) throw new Error("Failed to generate CTA");
      
      const data = await response.json();
      input.value = data.text;
      heroObj.callToAction = data.text;
    } catch (error) {
      console.error("Error generating CTA:", error);
      alert("Failed to generate CTA. Please try again.");
    }
  }

  async function generateAboutText() {
    try {
      generateAboutBtn.disabled = true;
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "aboutUs",
          businessName: plumberData.businessName,
          businessContext: {
            location: plumberData.city + ", " + plumberData.state,
            services: plumberData.services || []
          }
        })
      });

      if (!response.ok) throw new Error("Failed to generate about text");
      
      const data = await response.json();
      aboutTextArea.value = data.text;
      updateAboutPreview();
    } catch (error) {
      console.error("Error generating about text:", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      generateAboutBtn.disabled = false;
    }
  }

  async function generatePitch() {
    // Similar to generateAboutText but for pitch
  }

  async function generateSellingPoints() {
    // Similar to generateAboutText but for selling points
  }

  // Initialize everything
  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";
  
  fetch(DATA_URL)
    .then(resp => resp.json())
    .then(json => {
      const businesses = json.finalWebsiteData || [];
      const found = businesses.find(biz => 
        (biz.siteId || "").toLowerCase() === siteParam.toLowerCase()
      );
      
      if (found) {
        // Update theme colors first
        updateThemeColors(found);
        
        // Initialize sections
        step1Hero.classList.remove("hidden");
        initializeHeroSection(found);
        initializeAboutSection(found);
      } else {
        statusMsg.textContent = `No matching siteId found for: ${siteParam}`;
      }
    })
    .catch(err => {
      statusMsg.textContent = "Error: " + err.message;
      console.error(err);
    });

})();
