const OPENAI_API_KEY = "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";

document.getElementById("generateBtn").addEventListener("click", () => {
  generateDalleImages("A cute baby sea otter", 3)
    .then(urls => {
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "";
      urls.forEach(u => {
        const img = document.createElement("img");
        img.src = u;
        img.style.width = "256px";
        img.style.height = "256px";
        img.style.marginRight = "10px";
        resultsDiv.appendChild(img);
      });
    })
    .catch(err => {
      alert("Error: " + err.message);
      console.error(err);
    });
});

async function generateDalleImages(prompt, n = 1) {
  try {
    const response = await fetch("https://api.openai.com/v1/im



