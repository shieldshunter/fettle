import './pages/treeBOM/treeBOM-page';
import { LoginDialog } from './pages/login/login-dialog';
import './pages/login/login-dialog'; // define custom element
import './pages/treeBOM/drop-zone';
import './components/main-header'; 
import auth from './utils/auth';
import { initWaves } from './utils/wave';
import './pages/cluster/cluster-page'; // Import the cluster page

window.addEventListener('DOMContentLoaded', () => {
  initWaves();

  let header = document.querySelector('main-header') as HTMLElement;
  if (!header) {
    header = document.createElement('main-header');
    document.body.prepend(header);
  }

  let mainContainer = document.getElementById('mainContainer') as HTMLElement;
  if (!mainContainer) {
    mainContainer = document.createElement('div');
    mainContainer.id = 'mainContainer';
    document.body.appendChild(mainContainer);
  }

  // Call init() once at startup
  init();
});

async function init() {
  const header = document.querySelector('main-header') as HTMLElement;
  const mainContainer = document.getElementById('mainContainer') as HTMLElement;
  const loginDialog = document.getElementById('login') as LoginDialog;

  // Access the logout button from header's shadow DOM
  const logoutButton = (document.querySelector('main-header') as any)
    .shadowRoot.querySelector('#logoutButton') as HTMLButtonElement;

  logoutButton.onclick = async () => {
    console.log("Logout button clicked");
    await auth.signOut();
    mainContainer!.innerHTML = '';
    header.style.display = 'none';
    logoutButton.style.display = 'none';

    // Remove visible classes
    header.classList.remove('visible');
    mainContainer.classList.remove('visible');

    // Reset login dialog
    loginDialog.resetSendLinkButton();
    loginDialog.show();
  };

  if (await auth.isAuthenticated()) {
    console.log("User is authenticated - showing header + main container");
    header.style.display = 'block';
    logoutButton.style.display = 'block';

    // Hide the login dialog
    loginDialog.style.display = 'none';

    // Load the default page (e.g. treeBOM) into mainContainer
    mainContainer!.innerHTML = '';
    mainContainer!.appendChild(document.createElement('tree-bom-page'));

    // Optional: call a helper to set up nav button listeners
    setupHeaderNav();

    // Add visible classes with slight delay
    setTimeout(() => {
      header.classList.add('visible');
      mainContainer.classList.add('visible');
    }, 50);
  } else {
    console.log("User is NOT authenticated - hiding header + showing login");
    header.style.display = 'none';
    logoutButton.style.display = 'none';
    mainContainer!.innerHTML = '';
    loginDialog.show();
  }
}

function setupHeaderNav() {
  // Grab the main container
  const mainContainer = document.getElementById('mainContainer');

  // For example, if you have these nav buttons inside <main-header>’s shadowRoot:
  //  <button id="goTreeBom">Tree BOM</button>
  //  <button id="goOtherPanel">Other Panel</button>

  // Hook up events
  document.addEventListener('navigate', (evt: Event) => {
      const customEvt = evt as CustomEvent;
      const pageId = customEvt.detail;
    
      if (pageId === 'treebom') {
        mainContainer!.innerHTML = '';
        mainContainer!.appendChild(document.createElement('tree-bom-page'));
      } else if (pageId === 'cluster') {
        mainContainer!.innerHTML = '';
        mainContainer!.appendChild(document.createElement('cluster-page'));
      }
      // ... etc ...
    });
  // Repeat or generalize as needed for other nav buttons…
}

// Toggle dark mode example
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
