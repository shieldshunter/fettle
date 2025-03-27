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
            background-color: rgb(255, 255, 255);
            padding: 10px 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            font-family: sans-serif;
            font-size: 20px;
            font-weight: bold;
          }
          .logo-container {
            display: flex;
            align-items: center;
          }
          .logo {
            height: 40px;
            margin-right: 10px;
          }
          .header-buttons {
            display: flex;
            gap: 10px;
          }
          /* Style header buttons similar to sendmagiclinkbtn */
          .header-btn {
            background-color:rgb(255, 255, 255);
            color: black
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
            color: white;
          }
          /* Initially hide the logout button; you'll show it when needed */
          #logoutButton:hover {
            background-color: red
            color: white;
          }
        </style>
        <header>
          <div class="logo-container">
            <img src="data/Crescent1.png" alt="Logo" class="logo">
            <span>fettle</span>
          </div>
          <div class="header-buttons">
            <button class="header-btn" id="homeButton">Home</button>
            <button class="header-btn" id="featuresButton">Features</button>
            <button class="header-btn" id="aboutButton">About</button>
            <button class="header-btn" id="logoutButton">Logout</button>
          </div>
        </header>
      `;
    }
  }
  
  customElements.define('main-header', MainHeader);
  export default MainHeader;