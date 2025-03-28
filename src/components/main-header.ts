class MainHeader extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
    
      shadow.innerHTML = `
        <style>
          header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: var(--container-bg);
            padding: 10px 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            font-family: sans-serif;
            font-size: 20px;
            font-weight: bold;
            box-shadow: 0 5px 10px black (0, 0, 0, 0.2);
          }
            .logo-container {
            display: flex;
            align-items: center;
            color: var(--color-text);
            }

          #darkModeToggle {
            margin-left: 10px;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            transition: transform 0.3s ease;
          }

          #darkModeToggle:hover {
            transform: rotate(20deg) scale(1.2);
          }
            
            @keyframes slideRight {
            to {
                transform: translateX(0) rotate(90);
                opacity: 1;
            }
            }

            .logo {
            height: 40px;
            margin-right: 10px;
            transform: scale(0.5) rotate(-90deg);
            opacity: 0;
            animation: logoScaleIn 1.4s ease forwards;
            }

            @keyframes logoScaleIn {
            to {
                transform: scale(1);
                opacity: 1;
            }
            }
          .header-buttons {
            display: flex;
            gap: 10px;
          }
          /* Style header buttons similar to sendmagiclinkbtn */
          .header-btn {
            background-color: var(--container-bg);
            color: var(--color-text);
            font-size: 14px;
            font-weight: bold;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            padding: 10px 16px;
            transition: background-color 0.25s ease;
          }

          .header-btn:hover {
            background-color: #e36a1e;
            transform: scale(1.1);
            transition: transform 0.1s ease;
            color: white;
          }
          /* Initially hide the logout button; you'll show it when needed */
          .header-btn#logoutButton {
            background-color: red
            color: white;
          }
          .logoutButton:hover {
            background-color: red;
          }
        </style>
        <header>
          <div class="logo-container">
            <img src="data/Crescent1.png" alt="Logo" class="logo">
            <span>fettle</span>
            <button id="darkModeToggle" title="Toggle Dark Mode">🌓</button>
          </div>
          <div class="header-buttons">
            <button class="header-btn" id="homeButton">Home</button>
            <button class="header-btn" id="featuresButton">Features</button>
            <button class="header-btn" id="aboutButton">TreeBOM</button>
            <button class="header-btn" id="logoutButton">Logout</button>
          </div>
        </header>
      `;
    }

  
  connectedCallback() {
    const shadow = this.shadowRoot!;
    
    shadow.getElementById('homeButton')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));

    shadow.getElementById('featuresButton')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'features' }));

    shadow.getElementById('aboutButton')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'treebom' }));

    shadow.getElementById('logoutButton')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'logout' }));

    shadow.getElementById('darkModeToggle')!.onclick = () => {
      document.dispatchEvent(new CustomEvent('toggleDarkMode'));
    };
  }
}

customElements.define('main-header', MainHeader);
export default MainHeader;