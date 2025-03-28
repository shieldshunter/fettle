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
          .header-btn#logoutButton {
            background-color:rgb(194, 69, 47);  /* or a different base color if you prefer */
            color: white;
            /* Don’t forget the semicolon! */
          }
          .header-btn#logoutButton:hover {
            background-color: darkred; /* or just 'red' if you want no change */
            transform: scale(1.1);
            color: white;
          }
          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 28px;
            margin-left: 10px;
          }

          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0;
            right: 0; bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 34px;
          }

          .slider::before {
            position: absolute;
            content: "☀️";
            height: 22px;
            width: 22px;
            left: 3px;
            bottom: 3px;
            background-color: var(--container-bg);
            border-radius: 50%;
            transition: 0.4s;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          input:checked + .slider {
            background-color: #555;
          }

          input:checked + .slider::before {
            transform: translateX(22px);
            content: "🌙";
          }

            
        </style>
        <header>
          <div class="logo-container">
            <img src="data/Crescent1.png" alt="Logo" class="logo">
            <span>fettle</span>
            <label class="toggle-switch" title="Toggle Dark Mode">
              <input type="checkbox" id="darkModeToggle" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="header-buttons">
            <button class="header-btn" id="homeButton">Home</button>
            <button class="header-btn" id="goCluster">Cluster</button>
            <button class="header-btn" id="goLogo">Logo</button>
            <button class="header-btn" id="goTreeBOM">TreeBOM</button>
            <button class="header-btn" id="featuresButton">Features</button>
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

    shadow.getElementById('goCluster')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'cluster' }));

    shadow.getElementById('goTreeBOM')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'treebom' }));

    shadow.getElementById('goLogo')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'logo' }));

    shadow.getElementById('logoutButton')!.onclick = () => 
      document.dispatchEvent(new CustomEvent('navigate', { detail: 'logout' }));

    shadow.getElementById('darkModeToggle')!.addEventListener('change', () => {
      document.dispatchEvent(new CustomEvent('toggleDarkMode'));
    });
  }
}

customElements.define('main-header', MainHeader);
export default MainHeader;