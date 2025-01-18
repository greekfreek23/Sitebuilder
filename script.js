/***************************************************************
 * 1) Replace "YOUR_OPENAI_API_KEY_HERE" with your real key.
 * 2) Serve these files from a local or remote server 
 *    (cannot just open index.html from the file system).
 ***************************************************************/
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
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: prompt,
      n: n,
      size: "256x256"
    })
  });

  if (!response.ok) {
    // If there's an error from the server
    const errDetail = await response.json().catch(() => ({}));
    const errMsg = errDetail.error?.message || "Unknown error from DALL·E";
    throw new Error(errMsg);
  }

  const data = await response.json();
  // data.data is an array of objects with { url: "..."}
  return data.data.map(obj => obj.url);
}


