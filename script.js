/************************************************************************
 * 
 * WARNING: This code includes your API key inline—NOT SECURE. 
 * 
 * We strongly recommend removing or revoking this key when you're done!
 *
 ************************************************************************/
const OPENAI_API_KEY = "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";

(function(){
  // DOM references
  const statusMsg = document.getElementById("statusMsg");
  const step1Logo = document.getElementById("step1Logo");
  const currentLogoImg = document.getElementById("currentLogo");
  const logoOptions = document.getElementById("logoOptions");
  const dalleLogoContainer = document.getElementById("dalleLogoContainer");
  const symbolDropdown = document.getElementById("symbolDropdown");
  const colorInputPrimary = document.getElementById("colorInputPrimary");
  const colorInputSecondary = document.getElementById("colorInputSecondary");
  const createLogoAI = document.getElementById("createLogoAI");
  const logoAIResults = document.getElementById("logoAIResults");
  const logoAIImages = document.getElementById("logoAIImages");
  const tryLogoAgainBtn = document.getElementById("tryLogoAgainBtn");

  const uploadContainer = document.getElementById("uploadContainer");
  const logoUploadInput = document.getElementById("logoUpload");
  const goToStep2Btn = document.getElementById("goToStep2Btn");

  const step2Hero = document.getElementById("step2Hero");
  const heroImagesList = document.getElementById("heroImagesList");
  const heroLooksGoodBtn = document.getElementById("heroLooksGoodBtn");

  const step3About = document.getElementById("step3About");

  // Grab ?site= from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get("site");

  if(!siteParam) {
    statusMsg.textContent = "Error: No ?site= parameter found in the URL.";
    return;
  }

  // 1) Fetch data from your finalWebsiteData.json
  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";
  fetch(DATA_URL)
    .then(resp => {
      if (!resp.ok) throw new Error("Failed to fetch finalWebsiteData.json: " + resp.status);
      return resp.json();
    })
    .then(json => {
      const businesses = json.finalWebsiteData || [];
      // find matching record
      const found = businesses.find(biz =>
        (biz.siteId || "").toLowerCase() === siteParam.toLowerCase()
      );

      if (!found) {
        statusMsg.textContent = `No matching siteId found for: ${siteParam}`;
        return;
      }

      // We have the plumber data
      statusMsg.textContent = ""; // <--- Removed "Loaded data for..." per your request
      step1Logo.classList.remove("hidden");

      // Show the existing logo if any
      if(found.logo) {
        currentLogoImg.src = found.logo;
      }

      // LOGO - radio button logic
      logoOptions.addEventListener("change", e => {
        const choice = e.target.value;
        // Hide containers
        uploadContainer.classList.add("hidden");
        dalleLogoContainer.classList.add("hidden");
        logoAIResults.classList.add("hidden");

        switch(choice) {
          case "correct":
            showNextStepButton();
            break;
          case "upload":
            uploadContainer.classList.remove("hidden");
            break;
          case "dalle":
            dalleLogoContainer.classList.remove("hidden");
            break;
          case "later":
            showNextStepButton();
            break;
        }
      });

      // Upload new logo 
      logoUploadInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
          currentLogoImg.src = evt.target.result;
          showNextStepButton();
        };
        reader.readAsDataURL(file);
      });

      // AI-based logo generation
      createLogoAI.addEventListener("click", () => {
        // gather user inputs
        const chosenSymbol = symbolDropdown.value;
        const primaryColor = colorInputPrimary.value.trim() || "blue";
        const secondaryColor = colorInputSecondary.value.trim() || "white";

        // Simple prompt logic
        const prompt = `Create a plumbing-themed logo incorporating symbol: ${chosenSymbol}, primary color: ${primaryColor}, secondary color: ${secondaryColor}.`;

        generateDalleLogos(prompt, 3).then(urls => {
          logoAIImages.innerHTML = "";
          urls.forEach(u => {
            const img = document.createElement("img");
            img.src = u;
            img.style.maxWidth = "100px";
            img.style.border = "1px solid #ccc";
            img.style.marginRight = "5px";
            // On click, set this as the main logo
            img.addEventListener("click", () => {
              currentLogoImg.src = u;
              showNextStepButton();
            });
            logoAIImages.appendChild(img);
          });
          logoAIResults.classList.remove("hidden");
        }).catch(err => {
          alert("Error generating logos: " + err.message);
        });
      });

      tryLogoAgainBtn.addEventListener("click", () => {
        logoAIResults.classList.add("hidden");
      });

      // proceed to Step 2
      goToStep2Btn.addEventListener("click", () => {
        step1Logo.classList.add("hidden");
        goToStep2Btn.classList.add("hidden");
        step2Hero.classList.remove("hidden");
        loadHeroSection(found);
      });

      // Step 2 Hero
      heroLooksGoodBtn.addEventListener("click", () => {
        step2Hero.classList.add("hidden");
        step3About.classList.remove("hidden");
      });

    })
    .catch(err => {
      statusMsg.textContent = "Error: " + err.message;
      console.error(err);
    });

  // Show the "Go to Step 2" button
  function showNextStepButton() {
    goToStep2Btn.classList.remove("hidden");
  }

  // Load hero images into Step 2
  function loadHeroSection(plumberData) {
    if(!plumberData.photos || !plumberData.photos.heroImages) {
      heroImagesList.innerHTML = "<p>No hero images found.</p>";
      return;
    }
    const heroImages = plumberData.photos.heroImages;
    heroImagesList.innerHTML = "";

    heroImages.forEach(heroObj => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("hero-item");

      // show the image
      const imgEl = document.createElement("img");
      imgEl.src = heroObj.imageUrl || "";
      itemDiv.appendChild(imgEl);

      // CTA label & input
      const ctaLabel = document.createElement("label");
      ctaLabel.textContent = "Call-To-Action Text:";
      itemDiv.appendChild(ctaLabel);

      const ctaInput = document.createElement("input");
      ctaInput.type = "text";
      ctaInput.value = heroObj.callToAction || "";
      ctaInput.addEventListener("input", () => {
        heroObj.callToAction = ctaInput.value;
      });
      itemDiv.appendChild(ctaInput);

      // SWAP image button
      const swapBtn = document.createElement("button");
      swapBtn.textContent = "Swap Image";
      swapBtn.addEventListener("click", () => {
        const newUrl = prompt("Enter new image URL:");
        if(newUrl) {
          imgEl.src = newUrl;
          heroObj.imageUrl = newUrl;
        }
      });
      itemDiv.appendChild(swapBtn);

      // AI CTA generation
      const aiButton = document.createElement("button");
      aiButton.textContent = "Generate with AI";
      aiButton.classList.add("ai-button");
      aiButton.addEventListener("click", () => {
        // Instead of a full wizard, we do a quick feedback approach
        const userFeedback = prompt("How should we improve this CTA? e.g. 'More friendly', 'Shorter', 'Add discount offer' etc.");
        if(!userFeedback) return;

        // We'll use a quick prompt to get 3 CTA variants
        const ctaPrompt = `Please write 3 short call-to-action lines for a plumbing hero image. They should incorporate the following feedback: "${userFeedback}". Return them as a list.`;
        generateChatGPTCTA(ctaPrompt).then(variants => {
          // let user pick
          const choice = prompt("Here are new CTA ideas:\n\n1) " + variants[0] + "\n2) " + variants[1] + "\n3) " + variants[2] + "\n\nType 1, 2, or 3 to choose, or CANCEL to do nothing.");
          if(choice === "1" || choice === "2" || choice === "3") {
            const index = parseInt(choice)-1;
            ctaInput.value = variants[index];
            heroObj.callToAction = variants[index];
          }
        }).catch(err => {
          alert("Error generating CTA: " + err.message);
        });
      });
      itemDiv.appendChild(aiButton);

      heroImagesList.appendChild(itemDiv);
    });
  }

  // ============ AI Helpers ============

  // Example DALL-E generation for logos
  async function generateDalleLogos(prompt, n = 3) {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        // DALL·E 3 model is not publicly available via API as of Oct 2023, 
        // but we'll keep 'model' out to rely on the default endpoint (DALL·E 2).
        prompt: prompt,
        n,
        size: "256x256"
      })
    });
    if(!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "DALL·E API error");
    }
    const data = await response.json();
    return data.data.map(img => img.url);
  }

  // Example ChatGPT text completion for CTA
  async function generateChatGPTCTA(userPrompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.0-turbo",
        messages: [
          { role: "system", content: "You are a helpful marketing copywriter." },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });
    if(!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "ChatGPT API error");
    }
    const data = await response.json();
    const rawText = data.choices[0].message.content.trim();
    // We'll assume the AI returned them as separate lines or a list
    // We'll do a simple split by newline or bullet
    const lines = rawText.split(/\n+/).map(l => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
    return lines.slice(0, 3); 
  }

})();


