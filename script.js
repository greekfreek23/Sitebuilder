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

        generateDalleLogos(chosenSymbol, primaryColor, secondaryColor, 3).then(urls => {
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
        generateDalleLogos(symbolDropdown.value, colorInputPrimary.value.trim(), colorInputSecondary.value.trim(), 3, moreFeedback).then(urls => {
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

        generateChatGPTCTA(userFeedback).then(variants => {
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
            generateChatGPTCTA(newFeedback).then(newVars => {
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
  async function generateDalleLogos(symbol, primaryColor, secondaryColor, n=3, additionalFeedback="") {
    try {
      const responses = [];
      // Make multiple calls since our endpoint returns one image at a time
      for(let i = 0; i < n; i++) {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requestType: "logo",
            symbol,
            primaryColor,
            secondaryColor,
            additionalFeedback
          })
        });

        if(!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "API error");
        }

        const data = await response.json();
        responses.push(data.imageUrl);
      }
      return responses;
    } catch (error) {
      console.error("Error generating logos:", error);
      throw error;
    }
  }

  // ChatGPT text completions
  async function generateChatGPTCTA(userFeedback) {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestType: "heroText",
          businessName: siteParam,
          feedback: userFeedback
        })
      });

      if(!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "API error");
      }

      const data = await response.json();
      // Split the response into lines
      const lines = data.text.split(/\n+/).map(l => 
        l.replace(/^\d+\.\s*/, "").trim()
      ).filter(Boolean);
      
      return lines.slice(0,3);
    } catch (error) {
      console.error("Error generating CTA:", error);
      throw error;
    }
  }

})();
