(function(){
  // DOM references
  const statusMsg = document.getElementById("statusMsg");
  const step1Hero = document.getElementById("step1Hero");
  const heroImagesList = document.getElementById("heroImagesList");
  const heroLooksGoodBtn = document.getElementById("heroLooksGoodBtn");
  const step2About = document.getElementById("step2About");
  const aboutTextArea = document.getElementById("aboutUsText");
  const generateAboutBtn = document.getElementById("generateAboutAI");
  const step3WhyUs = document.getElementById("step3WhyUs");
  const mainPitchText = document.getElementById("mainPitchText");
  const sellingPointsList = document.getElementById("sellingPointsList");
  const step4Services = document.getElementById("step4Services");
  const step5Area = document.getElementById("step5Area");

  // Services Data
  const commonServices = [
    "Emergency Plumbing",
    "Drain Cleaning",
    "Water Heater Services",
    "Pipe Repair",
    "Fixture Installation",
    "Sewer Line Services",
    "Gas Line Services",
    "Water Line Services",
    "Bathroom Remodeling",
    "Kitchen Plumbing",
    "Leak Detection",
    "Hydro Jetting",
    "Backflow Prevention",
    "Sump Pump Services",
    "Commercial Plumbing"
  ];

  // Get URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get("site"); // 'site' is treated as 'placeId'

  if(!siteParam) {
    statusMsg.textContent = "Error: No ?site= parameter found in the URL.";
    return;
  }

  // Navigation Functions
  function showStep(stepToShow) {
    [step1Hero, step2About, step3WhyUs, step4Services, step5Area].forEach(step => {
      if (step === stepToShow) {
        step.classList.remove("hidden");
      } else {
        step.classList.add("hidden");
      }
    });
  }

  // Event Listeners for Navigation
  heroLooksGoodBtn.addEventListener("click", () => showStep(step2About));
  document.getElementById("backToHeroBtn").addEventListener("click", () => showStep(step1Hero));
  document.getElementById("goToStep3Btn").addEventListener("click", () => showStep(step3WhyUs));
  document.getElementById("backToAboutBtn").addEventListener("click", () => showStep(step2About));
  document.getElementById("goToServicesBtn").addEventListener("click", () => showStep(step4Services));
  document.getElementById("backToWhyUsBtn").addEventListener("click", () => showStep(step3WhyUs));
  document.getElementById("goToServiceAreaBtn").addEventListener("click", () => showStep(step5Area));
  document.getElementById("backToServicesBtn").addEventListener("click", () => showStep(step4Services));

  // Initialize Hero Section
  function initializeHeroSection(plumberData) {
    if(!plumberData.photos?.heroImages) {
      heroImagesList.innerHTML = "<p>No hero images found.</p>";
      return;
    }

    heroImagesList.innerHTML = plumberData.photos.heroImages.map(hero => `
      <div class="hero-item">
        <img src="${hero.imageUrl || ''}" alt="Hero image">
        <input type="text" class="form-input" value="${hero.callToAction || ''}" placeholder="Enter call-to-action text">
        <div class="button-group">
          <button class="nav-button save-btn">Save</button>
          <button class="ai-button generate-btn">Generate with AI</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.generate-btn').forEach(btn => {
      btn.addEventListener('click', generateHeroText);
    });
  }

  // Initialize Why Choose Us Section
  function initializeWhyUsSection(data) {
    if (data.whyChooseUs) {
      mainPitchText.value = data.whyChooseUs.mainPitch || '';
      if (data.whyChooseUs.sellingPoints) {
        data.whyChooseUs.sellingPoints.forEach(point => addSellingPoint(point));
      }
    }

    document.getElementById('addSellingPoint').addEventListener('click', () => addSellingPoint());
    document.getElementById('generatePitchAI').addEventListener('click', generatePitch);
    document.getElementById('generatePointsAI').addEventListener('click', generateSellingPoints);
  }

  // Initialize Services Section
  function initializeServicesSection(data) {
    const availableList = document.getElementById('availableServicesList');
    const selectedList = document.getElementById('selectedServicesList');
    
    // Populate available services
    commonServices.forEach(service => {
      if (!data.services?.includes(service)) {
        addToAvailable(service);
      }
    });

    // Load existing services
    if (data.services) {
      data.services.forEach(service => addToSelected(service));
    }

    // Initialize drag and drop
    initializeSortable(selectedList);
  }

  // Initialize Service Area
  function initializeServiceArea(data) {
    const serviceCounties = document.getElementById('serviceCounties');
    const serviceRadius = document.getElementById('serviceRadius');
    
    if (data.serviceArea) {
      serviceCounties.value = data.serviceArea.counties?.join('\n') || '';
      serviceRadius.value = data.serviceArea.radius || '';
    }
  }

  // Utility Functions
  function addSellingPoint(text = '') {
    const div = document.createElement('div');
    div.className = 'service-item';
    div.innerHTML = `
      <input type="text" class="form-input" value="${text}" placeholder="Enter selling point">
      <button class="nav-button">Remove</button>
    `;
    div.querySelector('button').addEventListener('click', () => div.remove());
    sellingPointsList.appendChild(div);
  }

  function addToSelected(service) {
    const selectedList = document.getElementById('selectedServicesList');
    const div = document.createElement('div');
    div.className = 'service-item';
    div.draggable = true;
    div.innerHTML = `
      <span class="drag-handle">☰</span>
      <span>${service}</span>
      <button class="nav-button">Remove</button>
    `;
    div.querySelector('button').addEventListener('click', () => {
      addToAvailable(service);
      div.remove();
    });
    selectedList.appendChild(div);
  }

  function addToAvailable(service) {
    const availableList = document.getElementById('availableServicesList');
    const div = document.createElement('div');
    div.className = 'service-item';
    div.innerHTML = `
      <span>${service}</span>
      <button class="nav-button">Add</button>
    `;
    div.querySelector('button').addEventListener('click', () => {
      addToSelected(service);
      div.remove();
    });
    availableList.appendChild(div);
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
          businessName: siteParam // Using 'siteParam' as 'placeId'
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

  async function generatePitch() {
    try {
      const button = document.getElementById('generatePitchAI');
      button.disabled = true;
      button.textContent = 'Generating...';

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'whyChooseUs',
          businessName: siteParam // Using 'siteParam' as 'placeId'
        })
      });

      if (!response.ok) throw new Error('Failed to generate pitch');
      
      const data = await response.json();
      mainPitchText.value = data.text;

    } catch (error) {
      console.error('Error generating pitch:', error);
      alert('Failed to generate pitch. Please try again.');
    } finally {
      button.disabled = false;
      button.textContent = 'Generate with AI';
    }
  }

  async function generateSellingPoints() {
    try {
      const button = document.getElementById('generatePointsAI');
      button.disabled = true;
      button.textContent = 'Generating...';

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'sellingPoints',
          businessName: siteParam // Using 'siteParam' as 'placeId'
        })
      });

      if (!response.ok) throw new Error('Failed to generate points');
      
      const data = await response.json();
      sellingPointsList.innerHTML = ''; // Clear existing points
      data.points.forEach(point => addSellingPoint(point));

    } catch (error) {
      console.error('Error generating points:', error);
      alert('Failed to generate points. Please try again.');
    } finally {
      button.disabled = false;
      button.textContent = 'Generate with AI';
    }
  }

  // Initialize drag and drop
  function initializeSortable(element) {
    element.addEventListener('dragstart', e => {
      if (e.target.classList.contains('service-item')) {
        e.target.classList.add('dragging');
      }
    });

    element.addEventListener('dragend', e => {
      if (e.target.classList.contains('service-item')) {
        e.target.classList.remove('dragging');
      }
    });

    element.addEventListener('dragover', e => {
      e.preventDefault();
      const afterElement = getDragAfterElement(element, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (draggable) {
        if (afterElement) {
          element.insertBefore(draggable, afterElement);
        } else {
          element.appendChild(draggable);
        }
      }
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.service-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Load Data and Initialize
  const DATA_URL = "https://raw.githubusercontent.com/greekfreek23/alabamaplumbersnowebsite/main/finalWebsiteData.json";
  
  fetch(DATA_URL)
    .then(resp => resp.json())
    .then(json => {
      const businesses = json.finalWebsiteData || [];
      
      // Modify the matching logic to use 'placeId' instead of 'siteId'
      const found = businesses.find(biz => 
        (biz.placeId || "").toLowerCase() === siteParam.toLowerCase()
      );
      
      if (found) {
        // Update theme colors
        if (found.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', found.primaryColor);
        }
        if (found.secondaryColor) {
          document.documentElement.style.setProperty('--secondary-color', found.secondaryColor);
        }

        // Initialize all sections
        showStep(step1Hero);
        initializeHeroSection(found);
        initializeWhyUsSection(found);
        initializeServicesSection(found);
        initializeServiceArea(found);
      } else {
        statusMsg.textContent = `No matching placeId found for: ${siteParam}`;
      }
    })
    .catch(err => {
      statusMsg.textContent = "Error: " + err.message;
      console.error(err);
    });

})();
