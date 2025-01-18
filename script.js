(function(){
  // DOM references
  const statusMsg = document.getElementById("statusMsg");
  const step1Hero = document.getElementById("step1Hero");
  const heroImagesList = document.getElementById("heroImagesList");
  const heroLooksGoodBtn = document.getElementById("heroLooksGoodBtn");
  
  const step2About = document.getElementById("step2About");
  const aboutTextArea = document.getElementById("aboutUsText");
  const generateAboutBtn = document.getElementById("generateAboutAI");
  const backToHeroBtn = document.getElementById("backToHeroBtn");
  const goToStep3Btn = document.getElementById("goToStep3Btn");

  // Get URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get("site");

  if(!siteParam) {
    statusMsg.textContent = "Error: No ?site= parameter found in the URL.";
    return;
  }

  // Navigation Functions
  function showStep1() {
    step1Hero.classList.remove("hidden");
    step2About.classList.add("hidden");
  }

  function showStep2() {
    step1Hero.classList.add("hidden");
    step2About.classList.remove("hidden");
  }

  // Event Listeners for Navigation
  heroLooksGoodBtn.addEventListener("click", showStep2);
  backToHeroBtn.addEventListener("click", showStep1);

  // Update theme colors
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
  function initializeHeroSection(heroData) {
    if (!heroData?.photos?.heroImages) {
      heroImagesList.innerHTML = "<p>No hero images found.</p>";
      return;
    }

    heroImagesList.innerHTML = heroData.photos.heroImages.map(hero => `
      <div class="hero-item">
        <img src="${hero.imageUrl || ''}" alt="Hero image" onerror="this.src='placeholder.jpg'">
        <input type="text" class="form-input" value="${hero.callToAction || ''}" placeholder="Enter call-to-action text">
        <div class="button-group">
          <button class="nav-button save-btn">Save</button>
          <button class="ai-button generate-btn">Generate with AI</button>
        </div>
      </div>
    `).join('');

    // Add event listeners to buttons
    document.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const input = this.parentElement.parentElement.querySelector('input');
        console.log('Saving:', input.value);
        this.textContent = 'Saved!';
        setTimeout(() => this.textContent = 'Save', 2000);
      });
    });

    document.querySelectorAll('.generate-btn').forEach(btn => {
      btn.addEventListener('click', generateHeroText);
    });
  }

  // AI Generation Functions
  async function generateHeroText() {
    const button = this;
    const input = button.parentElement.parentElement.querySelector('input');
    
    try {
      button.disabled = true;
      button.textContent = 'Generating...';

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'heroText',
          businessName: siteParam
        })
      });

      if (!response.ok) throw new Error('Failed to generate text');
      
      const data = await response.json();
      input.value = data.text;

    } catch (error) {
      console.error('Error generating text:', error);
      alert('Failed to generate text. Please try again.');
    } finally {
      button.disabled = false;
      button.textContent = 'Generate with AI';
    }
  }

  async function generateAboutText() {
    try {
      generateAboutBtn.disabled = true;
      generateAboutBtn.textContent = 'Generating...';

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'aboutUs',
          businessName: siteParam
        })
      });

      if (!response.ok) throw new Error('Failed to generate about text');
      
      const data = await response.json();
      aboutTextArea.value = data.text;

    } catch (error) {
      console.error('Error generating about text:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      generateAboutBtn.disabled = false;
      generateAboutBtn.textContent = 'Generate with AI';
    }
  }

  // Initialize About Section
  function initializeAboutSection(plumberData) {
    if (plumberData.aboutUs) {
      aboutTextArea.value = plumberData.aboutUs;
    }
    generateAboutBtn.addEventListener('click', generateAboutText);
  }

  // Load Data and Initialize
  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";
  
  fetch(DATA_URL)
    .then(resp => resp.json())
    .then(json => {
      const businesses = json.finalWebsiteData || [];
      const found = businesses.find(biz => 
        (biz.siteId || "").toLowerCase() === siteParam.toLowerCase()
      );
      
      if (found) {
        updateThemeColors(found);
        showStep1();
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
