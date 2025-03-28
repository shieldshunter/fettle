/*********************************
 * main.ts
 *********************************/
import './pages/treeBOM/treeBOM-page';
import { LoginDialog } from './pages/login/login-dialog';
import './pages/treeBOM/drop-zone';
import './pages/login/login-dialog';
import auth from './utils/auth';
import './pages/treeBOM/treeBOM-page';
import './components/main-header'; // Make sure this path is correct
import { initWaves } from './utils/wave'; // or correct path



window.addEventListener('DOMContentLoaded', () => {
  initWaves();
  // Insert the header at the top if not already present.
  let header = document.querySelector('main-header') as HTMLElement;
  if (!header) {
    header = document.createElement('main-header');
    document.body.prepend(header);
  }
  
  // Create a main content container if it doesn't exist.
  let mainContainer = document.getElementById('mainContainer') as HTMLElement;
  if (!mainContainer) {
    mainContainer = document.createElement('div');
    mainContainer.id = 'mainContainer';
    document.body.appendChild(mainContainer);
  }
  
  // Call init() once at startup.
  init();
});

/**
 * init() checks auth. If authenticated, loads the treeBOM.
 * If not, shows the login dialog.
 */
async function init() {
  const header = document.querySelector('main-header') as HTMLElement;
  const mainContainer = document.getElementById('mainContainer') as HTMLElement;
  const loginDialog = document.getElementById('login') as LoginDialog;
  
  // Access the logout button from header's shadow DOM.
  const logoutButton = (document.querySelector('main-header') as any)
    .shadowRoot.querySelector('#logoutButton') as HTMLButtonElement;
  
  logoutButton.onclick = async () => {
    console.log("Logout button clicked");
    await auth.signOut();
    mainContainer.innerHTML = '';
    header.style.display = 'none';
    logoutButton.style.display = 'none';
    
    // Remove the visible classes when logging out.
    header.classList.remove('visible');
    mainContainer.classList.remove('visible');
    
    loginDialog.resetSendLinkButton();
    loginDialog.show();
  };

  if (await auth.isAuthenticated()) {
    console.log("User is authenticated - showing header + BOM");
    header.style.display = 'block';
    logoutButton.style.display = 'block';
    
    // Hide the login dialog.
    loginDialog.style.display = 'none';
    
    // Load the treeBOM page into the main container.
    mainContainer.innerHTML = '';
    mainContainer.appendChild(document.createElement('tree-bom-page'));

    // Use a slight delay to ensure the element is rendered, then add the visible classes
    setTimeout(() => {
      header.classList.add('visible');
      mainContainer.classList.add('visible');
    }, 50);
  } else {
    console.log("User is NOT authenticated - hiding header + showing login");
    header.style.display = 'none';
    logoutButton.style.display = 'none';
    mainContainer.innerHTML = '';
    loginDialog.show();
  }
}


let isDarkMode = false;

document.addEventListener('toggleDarkMode', () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
});
/**
 * Listen for a custom 'login-success' event from the login dialog
 * and re-run init() so we can check isAuthenticated() again.
 */
document.addEventListener('login-success', () => {
  console.log("login-success event received - re-checking auth via init()");
  init();
});
