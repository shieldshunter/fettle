class LoginDialog extends HTMLElement {
  modal: HTMLDivElement;
  content: HTMLDivElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });

    // Outer modal container
    this.modal = document.createElement('div');
    this.modal.classList.add('modal');
    shadowRoot.appendChild(this.modal);

    // Content area
    this.content = document.createElement('div');
    this.content.classList.add('modal-content');
    this.modal.appendChild(this.content);

    // Simple HTML: just a button
    this.content.innerHTML = `
      <div class="container">
        <h2>Welcome</h2>
        <p>This site has moved routing</p>
        <button id="loginButton">Continue</button>
      </div>
    `;

    // Grab the button and set up the redirect
    const loginBtn = this.content.querySelector('#loginButton') as HTMLButtonElement;
    loginBtn.addEventListener('click', () => {
      // Redirect directly
      window.location.href = 'https://fettle.vercel.app';
    });

    // Basic styling (feel free to simplify further)
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.5);
      }
      .modal-content {
        background-color: #fff;
        margin: 15% auto;
        padding: 20px;
        border-radius: 10px;
        width: 80%;
        max-width: 600px;
        /* Add optional fade/slide animations here if desired */
      }
      .container {
        text-align: center;
      }
      button {
        cursor: pointer;
        border: none;
        padding: 14px 20px;
        margin-top: 20px;
        width: 100%;
        font-size: 16px;
      }
    `;
    shadowRoot.appendChild(styleTag);
  }

  // Show the dialog
  show() {
    this.modal.style.display = 'block';
    this.content.style.display = 'block';
  }

  // Hide the dialog
  close() {
    this.modal.style.display = 'none';
  }
}

customElements.define('login-dialog', LoginDialog);
export { LoginDialog };
