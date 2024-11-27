if (!document.querySelector("#summarize-sidebar")) {
    const sidebar = document.createElement("div");
    sidebar.id = "summarize-sidebar";
  
    sidebar.innerHTML = `
      <h3>AI Sidebar</h3>
      <button id="summarize-btn">Summarize</button>
      <button id="translate-btn">Translate</button>
      <button id="take-notes-btn">Take Notes</button>
      <div id="output-area"></div>
    `;
  
    document.body.appendChild(sidebar);
  
    // Add event listeners for buttons
    document.getElementById("summarize-btn").addEventListener("click", () => {
      const text = document.body.innerText; // Extract text from the page
      // Call the summarization function
      summarizeText(text);
    });
  }
  
  function summarizeText(text) {
    // Placeholder summarization logic
    const summary = text.split(" ").slice(0, 50).join(" ") + "...";
    document.getElementById("output-area").innerText = summary;
  }
  