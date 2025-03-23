var C=Object.defineProperty;var k=(a,e,t)=>e in a?C(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var p=(a,e,t)=>k(a,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=t(o);fetch(o.href,i)}})();let x=!1;class L extends HTMLElement{constructor(){super();p(this,"modal");p(this,"content");p(this,"loadFileCallback");const t=this.attachShadow({mode:"open"});this.modal=document.createElement("div"),this.modal.classList.add("modal"),t.appendChild(this.modal),this.content=document.createElement("div"),this.content.classList.add("modal-content"),this.modal.appendChild(this.content),this.content.innerHTML=`<div id="fileDropZone" class="fixed w-full flex h-screen">
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
  </div>`;const n=s=>{x&&this.shadowRoot.getElementById("fileDropZone").classList.remove("pointer-events-none"),s.preventDefault()},o=s=>{s.preventDefault()},i=s=>{if(s.dataTransfer){for(var r=0;r<s.dataTransfer.items.length;r++)if(s.dataTransfer.items[r].kind==="file"){const d=s.dataTransfer.items[r].getAsFile();d&&f(d)}}s.preventDefault()},c=s=>{for(var r=0;r<s.target.files.length;r++){let d=s.target.files[r];f(d)}s.preventDefault()},f=s=>{const r=new FileReader;r.addEventListener("load",()=>{const d=r.result,y=s.name;this.loadFile(d,y)},!1),r.readAsDataURL(s)},l=this.shadowRoot.getElementById("dropHotSpot");l.addEventListener("change",c),l.addEventListener("drop",i),document.body.addEventListener("dragover",o),document.body.addEventListener("dragenter",n),document.body.addEventListener("drop",i);const m=document.createElement("style");m.appendChild(document.createTextNode(`
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

`)),t.appendChild(m),this.hide()}display(t){this.loadFileCallback=t,this.modal.style.setProperty("pointer-events","auto"),this.modal.style.setProperty("display","block")}hide(){this.modal.style.setProperty("pointer-events","none"),this.modal.style.setProperty("display","none")}loadFile(t,n){this.hide(),x=!0,this.loadFileCallback&&this.loadFileCallback(t,n)}}customElements.define("drop-zone",L);async function E(){const a="";try{const e=await fetch(a,{cache:"no-cache"});if(!e.ok)throw new Error(`Failed to fetch auth data: ${e.statusText}`);const t=await e.json(),n={};return t.forEach(o=>{n[o.Email.toLowerCase()]=o.Password}),console.log("Fetched authentication data:",n),n}catch(e){return console.error("Error fetching authentication data:",e),{}}}let h={};(async()=>h=await E())();async function F(){return Object.keys(h).length===0&&(h=await E()),h}async function D(a){const e=new TextEncoder().encode(a),t=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t)).map(o=>o.toString(16).padStart(2,"0")).join("")}class A{async isAuthenticated(){const e=await this.getUserData();return!e||!e.email?!1:h[e.email.toLowerCase()]===e.hashedPassword||!1}async getUserData(){const{zeaUserData:e}=window.localStorage;return e?JSON.parse(e):null}async setUserData(e){{const t=e.email.toLowerCase();if(!h[t])throw new Error("Email not registered. Please request access.");if(!e.password)throw new Error("Password not provided.");const n=await D(e.password);if(h[t]!==n)throw new Error("Wrong password.");e.hashedPassword=n,e.password="".padEnd(6,"*")}window.localStorage.zeaUserData=JSON.stringify(e)}async signOut(){localStorage.removeItem("zeaUserData")}}const u=new A;function M(a){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)}class B extends HTMLElement{constructor(){super();p(this,"modal");p(this,"content");p(this,"onCloseCallback");const t=this.attachShadow({mode:"open"});this.modal=document.createElement("div"),this.modal.classList.add("modal"),t.appendChild(this.modal),this.content=document.createElement("div"),this.content.classList.add("modal-content"),this.modal.appendChild(this.content),this.content.innerHTML=`
      <div class="container">
        <div class="imgcontainer">
          <img src="data/Crescent1.png" alt="Logo" class="logo">
        </div>
        <label for="uname"><b>Email</b></label>
        <input id="uname" type="text" placeholder="Enter Email" name="uname" required>

        <!-- Password Container (initially hidden) -->
        <div id="passwordContainer" style="display: none;">
          <label for="psw" id="pswLabel"><b>Password</b></label>
          <input id="psw" type="password" placeholder="Enter Password" name="psw" required>
        </div>

        <!-- Login button (initially hidden) -->
        <button type="submit" id="login" style="display: none;">Login</button>

        <!-- Microsoft Form container (initially hidden) -->
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
            >
            </iframe>
        </div>
    `;const n=this.shadowRoot.getElementById("uname"),o=this.shadowRoot.getElementById("passwordContainer"),i=this.shadowRoot.getElementById("login"),c=this.shadowRoot.getElementById("msFormContainer"),f=this.shadowRoot.getElementById("msForm");let l=null;l=this.shadowRoot.getElementById("psw"),l.addEventListener("input",()=>{l.style.border=""}),u.getUserData().then(s=>{s&&l&&(l.value=s.password,n.value=s.firstName)}),n.addEventListener("input",async()=>{const s=n.value.trim().toLowerCase();if(o.style.display="none",i.style.display="none",c.style.display="none",M(s)){const r=await F();Object.keys(r).some(y=>y.startsWith(s))?(o.style.display="block",i.style.display="block"):(f.src="",c.style.display="block")}}),i.onclick=async()=>{const s=n.value.trim().toLowerCase(),r=l==null?void 0:l.value.trim();try{await u.setUserData({email:s,password:r}),this.close()}catch(d){console.warn("Authentication failed:",d),d instanceof Error?alert(d.message):alert("An unknown error occurred"),l&&(l.style.border="2px solid red")}};const m=document.createElement("style");m.appendChild(document.createTextNode(`
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
          background-color: rgba(0,0,0,0.5); /* Black w/ opacity */
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
      `)),t.appendChild(m)}show(t){this.onCloseCallback=t,u.isAuthenticated().then(n=>{n?this.close():this.modal.style.display="block"})}close(){this.modal.style.display="none",this.onCloseCallback&&this.onCloseCallback()}}customElements.define("login-dialog",B);function g(){const a=20+Math.random()*40,e=20+Math.random()*40,t=20+Math.random()*40,n=20+Math.random()*40,o=20+Math.random()*40,i=20+Math.random()*40;return`polygon(
      0% ${a}%,
      15% ${n}%,
      33% ${e}%,
      50% ${o}%,
      66% ${t}%,
      82% ${i}%,
      100% ${a}%,
      100% 100%,
      0 100%
    )`}function v(){const a=document.body.style,e=g(),t=g(),n=g();a.setProperty("--wave1-clip",e),a.setProperty("--wave2-clip",t),a.setProperty("--wave3-clip",n)}function P(){v(),setInterval(v,5e3)}window.addEventListener("DOMContentLoaded",()=>{P()});async function w(){const a=document.getElementById("catalog"),e=document.getElementById("logoutButton");await u.isAuthenticated()?(a.src="",e.style.display="block"):(a.src="",e.style.display="none",b.show(()=>{w()})),e.onclick=async()=>{await u.signOut(),a.src="",e.style.display="none",b.show(()=>{w()})}}const b=document.getElementById("login");b.show(()=>{w()});
