var C=Object.defineProperty;var L=(o,t,n)=>t in o?C(o,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):o[t]=n;var c=(o,t,n)=>L(o,typeof t!="symbol"?t+"":t,n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function n(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(e){if(e.ep)return;e.ep=!0;const i=n(e);fetch(e.href,i)}})();let w=!1;class S extends HTMLElement{constructor(){super();c(this,"modal");c(this,"content");c(this,"loadFileCallback");const n=this.attachShadow({mode:"open"});this.modal=document.createElement("div"),this.modal.classList.add("modal"),n.appendChild(this.modal),this.content=document.createElement("div"),this.content.classList.add("modal-content"),this.modal.appendChild(this.content),this.content.innerHTML=`<div id="fileDropZone" class="fixed w-full flex h-screen">
    <input
      accept=".zcad, .gltf, .glb, gltf, .obj"
      multiple
      type="file"
      class="absolute inset-0 z-50 m-0 p-0 w-full h-full outline-none opacity-0"
      id="dropHotSpot"
    />
      <div
        class="border-2 border-gray-400 py-12 justify-center items-center p-4 m-auto rounded-lg w-3/12 h-1/3 bg-gray-200 bg-opacity-25 hover:bg-blue-200 hover:bg-opacity-25 text-black grid justify-items-center"
      >
        <div class="m-auto">
          <div class="flex flex-col space-y-2 items-center justify-center">
            <i class="fas fa-cloud-upload-alt fa-3x text-currentColor" />
            <p class="text-gray-700 text-center">Drag your gltf, obj or zcad files here or click in this area.</p>
          </div>
        </div>
      </div>
  </div>`;const s=a=>{w&&this.shadowRoot.getElementById("fileDropZone").classList.remove("pointer-events-none"),a.preventDefault()},e=a=>{a.preventDefault()},i=a=>{if(a.dataTransfer){for(var r=0;r<a.dataTransfer.items.length;r++)if(a.dataTransfer.items[r].kind==="file"){const d=a.dataTransfer.items[r].getAsFile();d&&u(d)}}a.preventDefault()},l=a=>{for(var r=0;r<a.target.files.length;r++){let d=a.target.files[r];u(d)}a.preventDefault()},u=a=>{const r=new FileReader;r.addEventListener("load",()=>{const d=r.result,E=a.name;this.loadFile(d,E)},!1),r.readAsDataURL(a)},p=this.shadowRoot.getElementById("dropHotSpot");p.addEventListener("change",l),p.addEventListener("drop",i),document.body.addEventListener("dragover",e),document.body.addEventListener("dragenter",s),document.body.addEventListener("drop",i);const h=document.createElement("style");h.appendChild(document.createTextNode(`
/* The Modal (background) */
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  background-color: #eeeeee88;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
  max-width: 600px;
}

`)),n.appendChild(h),this.hide()}display(n){this.loadFileCallback=n,this.modal.style.setProperty("pointer-events","auto"),this.modal.style.setProperty("display","block")}hide(){this.modal.style.setProperty("pointer-events","none"),this.modal.style.setProperty("display","none")}loadFile(n,s){this.hide(),w=!0,this.loadFileCallback&&this.loadFileCallback(n,s)}}customElements.define("drop-zone",S);async function x(){const o="https://partsmanual.blob.core.windows.net/authenticationhash/credentials.json?sp=racwdli&st=2025-03-10T16:47:55Z&se=2025-08-01T00:47:55Z&sv=2022-11-02&sr=c&sig=4BjCw6SBZmI606wTM3GEQUYRcuhRQMlgKrj0Wy%2B4Y8g%3D";try{const t=await fetch(o,{cache:"no-cache"});if(!t.ok)throw new Error(`Failed to fetch whitelisted emails: ${t.statusText}`);const n=await t.json(),s=new Set;return n.forEach(e=>{s.add(e.Email.toLowerCase())}),console.log("Fetched whitelisted emails:",s),s}catch(t){return console.error("Error fetching whitelist. Returning fallback set:",t),new Set(["hshields@trebro.com"])}}let k=[];(async()=>{const o=await x();k=Array.from(o)})();function T(o){const t=document.cookie.match(new RegExp("(^| )"+o+"=([^;]+)"));return t?decodeURIComponent(t[2]):null}class M{async isAuthenticated(){return!!T("auth")}async setUserData(t){const n=t.email.toLowerCase();if(!k.includes(n))throw new Error("Email not registered. Please request access.");window.localStorage.zeaUserData=JSON.stringify({email:n})}async getUserData(){const{zeaUserData:t}=window.localStorage;return t?JSON.parse(t):null}async signOut(){localStorage.removeItem("zeaUserData"),document.cookie="auth=; Path=/; Max-Age=0"}}const m=new M;let f=null;function D(o){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o)}class B extends HTMLElement{constructor(){super();c(this,"modal");c(this,"content");c(this,"onCloseCallback");const n=this.attachShadow({mode:"open"});this.modal=document.createElement("div"),this.modal.classList.add("modal"),n.appendChild(this.modal),this.content=document.createElement("div"),this.content.classList.add("modal-content"),this.modal.appendChild(this.content),this.content.innerHTML=`
      <div class="container">
        <div class="imgcontainer">
          <img src="data/Crescent1.png" alt="Logo" class="logo">
        </div>
        <label for="uname"><b>Email</b></label>
        <input id="uname" type="text" placeholder="Enter Email" name="uname" required>

        <!-- CHANGED: remove password container entirely -->
        <button id="sendLinkBtn" class="btn">
          <span class="icon-text">
            <i class="far fa-paper-plane"></i>
            <span class="text">Send Magic Link</span>
          </span>
          <span class="wave-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </span>
        </button>

        <!-- Microsoft Form container (unchanged) -->
        <div id="msFormContainer" style="display: none; margin-top: 1rem;">
          <p>If you don’t have an account, please fill out the form below:</p>
          <iframe id="msForm"
            width="640px"
            height="480px"
            frameborder="0"
            marginwidth="0"
            marginheight="0"
            style="border: none; max-width: 100%; max-height: 100vh;"
            allowfullscreen
            webkitallowfullscreen
            mozallowfullscreen
            msallowfullscreen
          ></iframe>
        </div>
      </div>
    `;const s=this.shadowRoot.getElementById("uname"),e=this.shadowRoot.getElementById("sendLinkBtn"),i=this.shadowRoot.getElementById("msFormContainer"),l=[{step0:"rgb(255, 255, 255)",step40:"rgb(255, 160, 105)",step50:"#f36f21"},{step0:"rgb(255, 255, 255)",step40:"rgb(255, 228, 141)",step50:"#FABF35"},{step0:"rgb(255, 255, 255)",step40:"rgb(255, 143, 143)",step50:"#EA3546"},{step0:"rgb(255, 255, 255)",step40:"rgb(136, 148, 255)",step50:"#345995"}];e.querySelectorAll(".wave-spinner > div").forEach(a=>{const r=l[Math.floor(Math.random()*l.length)];a.style.setProperty("--wave-color-0",r.step0),a.style.setProperty("--wave-color-40",r.step40),a.style.setProperty("--wave-color-50",r.step50)}),e.style.display="none",s.addEventListener("input",async()=>{const a=s.value.trim().toLowerCase();f||(f=await x()),D(a)?Array.from(f).some(d=>d.startsWith(a))?(e.style.display="block",i.style.display="none"):(e.style.display="none",i.style.display="block"):(e.style.display="none",i.style.display="none")});const p=e.innerHTML;e.onclick=async()=>{const a=s.value.trim().toLowerCase();await m.setUserData({email:a}),e.disabled=!0,e.classList.add("loading");try{await fetch("https://trebrosinglesignon.azurewebsites.net/api/send_magic_link_function",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a})}),e.classList.remove("loading"),e.classList.add("success"),e.textContent="Success! Check your email",setTimeout(()=>{e.disabled=!1,e.classList.remove("success"),e.innerHTML=p},6e3)}catch(r){console.error(`Error: ${r}`),e.disabled=!1,e.classList.remove("loading"),e.innerHTML=p}};const h=document.createElement("style");h.appendChild(document.createTextNode(`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
        /* The Modal (background) */
        .modal {
          display: none; /* Hidden by default */
          position: fixed; /* Stay in place */
          z-index: 1; /* Sit on top */
          left: 0;
          top: 0;
          width: 100%; /* Full width */
          height: 100%; /* Full height */
          overflow: auto; /* Enable scroll if needed */
          background-color: rgb(0,0,0); /* Fallback color */
          background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
        }

        /* Modal Content/Box */
        .modal-content {
          background-color:rgb(255, 255, 255);
          margin: 15% auto; /* 15% from the top and centered */
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #888;
          width: 80%; /* Could be more or less, depending on screen size */
          max-width: 600px;
        }
        /* By default, hide animations (unless class is added) */
        opacity: 0;
        transform: translateY(-50px);
       }

        /* Opening animation */
        .opening-animation {
          animation: slideDown 0.4s ease forwards;
        }

        /* Closing animation */
        .closing-animation {
          animation: slideUp 0.4s ease forwards;
        }

        /* The Close Button */
        .close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
        }

        .close:hover,
        .close:focus {
          color: black;
          text-decoration: none;
          cursor: pointer;
        }

        /* Full-width inputs */
        input[type=text], input[type=password] {
          width: 100%;
          padding: 12px 20px;
          margin: 12px 0;
          display: inline-block;
          border: 1px solid #ccc;
          box-sizing: border-box;
          border-radius: 12px;
        }

        /* Set a style for all buttons */
        button {
          background-color: #f36f21;
          color: black;
          padding: 14px 20px;
          margin: 8px 0;
          border: none;
          cursor: pointer;
          width: 100%;
        }

        /* Add a hover effect for buttons */
        button:hover {
          opacity: 0.8;
        }

        /* Extra style for the cancel button (red) */
        .cancelbtn {
          width: auto;
          padding: 10px 18px;
          background-color: #f44336;
        }

        /* Center the avatar image inside this container */
        .imgcontainer {
          text-align: center;
          margin: 24px 0 12px 0;
        }

        /* Avatar image */
        img.avatar {
          height: 40px;
        }

        /* Add padding to containers */
        .container {
          padding: 16px;
        }

        /* The "Forgot password" text */
        span.psw {
          float: right;
          padding-top: 16px;
        }

        /* Change styles for span and cancel button on extra small screens */
        @media screen and (max-width: 300px) {
          span.psw {
            display: block;
            float: none;
          }
          .cancelbtn {
            width: 100%;
          }
        }

        /* Style for the logo image */
        .logo {
          width: 200px; /* Adjust the width as needed */
          height: auto;
        }
              /* Base Button Styles */
      .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #f36f21;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      height: 45px;
      margin: auto;
      padding: 0 16px;
      transition: width 0.25s ease, height 0.25s ease, padding 0.25s ease;
      overflow: hidden;
      }

      /* Container for Icon and Text */
      .btn .icon-text {
      display: absolute;
      align-items: center;
      justify-content: center;
      transition: opacity 0.25s ease;
      }

      .btn .icon-text i {
      margin-right: 8px;
      }

      /* Wave Spinner Container (hidden by default) */
      .btn .wave-spinner {
      display: none;
      }

      /* Loading State: Button shrinks to a specific size */
      .btn.loading {
      width: 140px;
      height: 60px;
      border-radius: 25px;
      background-color:rgb(255, 255, 255);
      padding: 0; /* Remove extra padding */
      animation: colorTransition 0.5s ease forwards; /* Add color transition */
      }

      /* In Loading State, remove the icon/text and reveal the spinner */
      .btn.loading .icon-text {
      display: none;
      }

      .btn.loading .wave-spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      }

      /* Wave Spinner Dot Styles */
      .wave-spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      }

      .wave-spinner > div {
      width: 6px;
      height: 8px;
      margin: 0 6px;
      border-radius: 20%; /* Rotate to form diamond shape */
      background-color: rgb(255, 255, 255);
      animation: scaling 1.2s ease-in-out infinite;
      }

      /* Set staggered animation delays for a wave effect */
      .wave-spinner > div:nth-child(1) {
      animation-delay: -0.6s;
      }
      .wave-spinner > div:nth-child(2) {
      animation-delay: -0.4s;
      }
      .wave-spinner > div:nth-child(3) {
      animation-delay: -0.2s;
      }
      .wave-spinner > div:nth-child(4) {
      animation-delay: 0s;
      }
      .wave-spinner > div:nth-child(5) {
      animation-delay: 0.2s;
      }

      @keyframes scaling {
        0%, 100% {
          transform: scaleY(0.5);
          background-color: var(--wave-color-0, rgb(255, 255, 255));
        }
        40% {
          transform: scaleY(1.5);
          background-color: var(--wave-color-40, rgb(255, 160, 105));
        }
        50% {
          transform: scaleY(3);
          background-color: var(--wave-color-50, #f36f21);
        }
      }

      /* Color Transition Animation */
      @keyframes colorTransition {
      0% {
      background-color: #f36f21;
      }
      100% {
      background-color: #ffffff;
      }
      }

      @keyframes successTransition {
        0% {

          background-color:rgb(255, 255, 255);
        }
        50% {
          background-color: #ffffff;
        }
        100% {
          background-color: #28a745;
        }
      }

      /* Success State Styling */
      .btn.success {
        animation: successTransition 0.7s ease forwards;
        background-color: #28a745;  /* Green */
        color: #fff;
      }
      `)),n.appendChild(h)}show(n){this.onCloseCallback=n,m.isAuthenticated().then(s=>{s?this.close():this.modal.style.display="block"})}close(){this.modal.style.display="none",this.onCloseCallback&&this.onCloseCallback()}}customElements.define("login-dialog",B);function g(){const o=20+Math.random()*40,t=20+Math.random()*40,n=20+Math.random()*40,s=20+Math.random()*40,e=20+Math.random()*40,i=20+Math.random()*40;return`polygon(
      0% ${o}%,
      15% ${s}%,
      33% ${t}%,
      50% ${e}%,
      66% ${n}%,
      82% ${i}%,
      100% ${o}%,
      100% 100%,
      0 100%
    )`}function v(){const o=document.body.style,t=g(),n=g(),s=g();o.setProperty("--wave1-clip",t),o.setProperty("--wave2-clip",n),o.setProperty("--wave3-clip",s)}function F(){v(),setInterval(v,5e3)}window.addEventListener("DOMContentLoaded",()=>{F()});async function y(){const o=document.getElementById("catalog"),t=document.getElementById("logoutButton");await m.isAuthenticated()?(o.src="",t.style.display="block"):(o.src="",t.style.display="none",b.show(()=>{y()})),t.onclick=async()=>{await m.signOut(),o.src="",t.style.display="none",b.show(()=>{y()})}}const b=document.getElementById("login");b.show(()=>{y()});
