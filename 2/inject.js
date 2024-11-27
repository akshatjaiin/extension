if (!document.querySelector("#extension-sidebar")) {
    const sidebar = document.createElement("div");
    sidebar.id = "extension-sidebar";
    sidebar.innerHTML = `
      <h3>Extension Sidebar</h3>
      <p>This dynamically appears without reloading the page!</p>
    `;
    document.body.appendChild(sidebar);
  }
  