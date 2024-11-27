// Create a sidebar div
const sidebar = document.createElement('div');
sidebar.id = 'extension-sidebar';
sidebar.innerHTML = `
  <h3>My Extension Sidebar</h3>
  <p>This is a 20%-width sidebar.</p>
`;

document.body.appendChild(sidebar);
