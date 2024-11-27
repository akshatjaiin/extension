if (!document.querySelector("#ai-sidebar")) {
    // Create the sidebar element
    const sidebar = document.createElement("div");
    sidebar.id = "ai-sidebar";
  
    // Add content to the sidebar
    sidebar.innerHTML = `
      <h3>AI Assistant</h3>
      <p>This is your AI-driven workspace. Add your AI functionalities here.</p>
    `;
  
    // Append the sidebar to the body
    document.body.appendChild(sidebar);
  }
  