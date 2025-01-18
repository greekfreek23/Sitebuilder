/***************************************************************
 * REPLACE THE PLACEHOLDER API KEY BELOW WITH YOUR REAL KEY 
 ***************************************************************/
const OPENAI_API_KEY = "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";

(function(){
  // DOM references
  const statusMsg          = document.getElementById("statusMsg");
  const step1Logo          = document.getElementById("step1Logo");
  const currentLogoImg     = document.getElementById("currentLogo");
  const logoOptions        = document.getElementById("logoOptions");
  const dalleLogoContainer = document.getElementById("dalleLogoContainer");
  const symbolDropdown     = document.getElementById("symbolDropdown");
  const colorInputPrimary  = document.getElementById("colorInputPrimary");
  const colorInputSecondary= document.getElementById("colorInputSecondary");
  const createLogoAI       = document.getElementById("createLogoAI");
  const logoAIResults      = document.getElementById("logoAIResults");
  const logoAIImages       = document.getElementById("logoAIImages");
  const tryLogoAgainBtn    = document.getElementById("tryLogoAgainBtn");
  const noneWorkBtn        = document.getElementById("noneWorkBtn");

  const uploadContainer    = document.getElementById("uploadContainer");
  const logoUploadInput    = document.getElementById("logoUpload");
  const goToStep2Btn       = document.getElementById("goToStep2Btn");

  const step2Hero          = document.getElementById("step2Hero");
  const heroImagesList     = document.getElementById("heroImagesList");
  const heroLooksGoodBtn   = document.getElementById("heroLooksGoodBtn");

  const step3About         = document.getElementById("step3About");

  // Grab ?site= from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get("site");

  if(!siteParam) {
    statusMsg.textContent = "Error: No ?site= parameter found in the URL.";
    return;
  }

  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";
  fetch(DATA_URL)
    .then(resp => {
      if (!resp.ok) throw new Error("Failed to fetch finalWebsiteData.json: " + resp.status);
      return resp.json();
    })
    .then(json => {
      const businesses = json.finalWebsiteData || [];
      const found = businesses.find(biz => (biz.siteId || "").toLowerCase() === siteParam.toLowerCase());
      if (!found) {
        statusMsg.textContent = `No matching siteId found for: ${siteParam}`;
        return;
      }

      statusMsg.textContent = "";
      step1Logo.classList.remove("hidden");

      // Show existing logo if any
      if(found.logo) {
        currentLogoImg.src = found.logo;
      }

      // Logo radio events
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

      // Generate AI logos
      createLogoAI.addEventListener("click", () => {
        logoAIImages.innerHTML = "";
        const chosenSymbol   = symbolDropdown.value || "pipe-wrench";
        const primaryColor   = colorInputPrimary.value.trim() || "blue";
        const secondaryColor = colorInputSecondary.value.trim() || "white";

        const prompt = `Create a plumbing-themed logo with symbol: ${chosenSymbol}, primary color: ${primaryColor}, secondary color: ${secondaryColor}. Return 3 small images.`;
        generateDalleLogos(prompt, 3).then(urls => {
          urls.forEach(u => {
            const img = document.createElement("img");
            img.src = u;
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

      // "Try Again" = hide results, let them regenerate
      tryLogoAgainBtn.addEventListener("click", () => {
        logoAIResults.classList.add("hidden");
      });

      // "None of These Work" = ask user for new instructions
      noneWorkBtn.addEventListener("click", () => {
        const moreFeedback = prompt("What should we change about the logo? (Colors, style, etc.)");
        if(!moreFeedback) return;

        logoAIImages.innerHTML = "";
        const newPrompt = `Create 3 new plumbing-themed logos. Additional feedback: ${moreFeedback}.`;
        generateDalleLogos(newPrompt, 3).then(urls => {
          urls.forEach(u => {
            const img = document.createElement("img");
            img.src = u;
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

      goToStep2Btn.addEventListener("click", () => {
        step1Logo.classList.add("hidden");
        goToStep2Btn.classList.add("hidden");
        step2Hero.classList.remove("hidden");
        loadHeroSection(found);
      });

      heroLooksGoodBtn.addEventListener("click", () => {
        step2Hero.classList.add("hidden");
        step3About.classList.remove("hidden");
      });

    })
    .catch(err => {
      statusMsg.textContent = "Error: " + err.message;
      console.error(err);
    });

  function showNextStepButton() {
    goToStep2Btn.classList.remove("hidden");
  }

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
      const originalText = heroObj.callToAction || "";
      ctaInput.value = originalText;
      itemDiv.appendChild(ctaInput);

      // 'Save' button if user changes >= 5 chars from original
      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.classList.add("save-cta-btn");
      itemDiv.appendChild(saveBtn);

      ctaInput.addEventListener("input", () => {
        const diff = Math.abs(ctaInput.value.length - originalText.length);
        if(diff >= 5) {
          saveBtn.style.display = "inline-block";
        } else {
          saveBtn.style.display = "none";
        }
      });

      saveBtn.addEventListener("click", () => {
        // user confirms new CTA
        heroObj.callToAction = ctaInput.value;
        // hide the button
        saveBtn.style.display = "none";
      });

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
        // We ask user how to refine
        const userFeedback = prompt("How should we improve this CTA? e.g. 'More friendly', 'Shorter', 'Add discount offer' etc.");
        if(!userFeedback) return;

        // We'll use a quick prompt to get 3 CTA variants
        const ctaPrompt = `Please write 3 short call-to-action lines for a plumbing hero image. 
        They should incorporate the feedback: "${userFeedback}". Return them as a list.`;
        
        generateChatGPTCTA(ctaPrompt).then(variants => {
          if(variants.length < 1) {
            alert("No variants returned.");
            return;
          }

          // Let user pick which variant
          const choice = prompt(
            "Here are new CTA ideas:\n\n1) " + variants[0] +
            "\n2) " + variants[1] +
            "\n3) " + (variants[2] || "") +
            "\n\nType 1, 2, or 3 to choose, or type 'none' to refine again."
          );

          if(choice === "1" || choice === "2" || choice === "3") {
            const index = parseInt(choice)-1;
            ctaInput.value = variants[index];
            heroObj.callToAction = variants[index];
            saveBtn.style.display = "none";  // user might want to confirm or not
          } else if(choice && choice.toLowerCase() === "none") {
            // user wants to refine again
            const newFeedback = prompt("What else would you like to change?");
            if(!newFeedback) return;
            const newPrompt = `Please write 3 short CTA lines for a plumbing hero image. Additional feedback: ${newFeedback}.`;
            generateChatGPTCTA(newPrompt).then(newVars => {
              if(newVars.length < 1) {
                alert("No variants returned.");
                return;
              }
              const secondChoice = prompt(
                "Here are new CTA ideas:\n\n1) " + newVars[0] +
                "\n2) " + newVars[1] +
                "\n3) " + (newVars[2] || "") +
                "\n\nType 1, 2, or 3 to choose, or CANCEL."
              );
              if(["1","2","3"].includes(secondChoice)) {
                const idx = parseInt(secondChoice)-1;
                ctaInput.value = newVars[idx];
                heroObj.callToAction = newVars[idx];
                saveBtn.style.display = "none"; 
              }
            });
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

  // DALL-E generation
  async function generateDalleLogos(prompt, n=3) {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
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

  // ChatGPT text completions
  async function generateChatGPTCTA(userPrompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful marketing copywriter for a plumbing company." },
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
    // We'll do a naive split
    const lines = rawText.split(/\n+/).map(l => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
    return lines.slice(0,3);
  }

})();


