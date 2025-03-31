var c=Object.defineProperty;var p=(e,o,n)=>o in e?c(e,o,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[o]=n;var d=(e,o,n)=>p(e,typeof o!="symbol"?o+"":o,n);(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(t){if(t.ep)return;t.ep=!0;const i=n(t);fetch(t.href,i)}})();function a(){const e=20+Math.random()*40,o=20+Math.random()*40,n=20+Math.random()*40,s=20+Math.random()*40,t=20+Math.random()*40,i=20+Math.random()*40;return`polygon(
      0% ${e}%,
      15% ${s}%,
      33% ${o}%,
      50% ${t}%,
      66% ${n}%,
      82% ${i}%,
      100% ${e}%,
      100% 100%,
      0 100%
    )`}function l(){const e=document.body.style,o=a(),n=a(),s=a();e.setProperty("--wave1-clip",o),e.setProperty("--wave2-clip",n),e.setProperty("--wave3-clip",s)}function u(){l(),setInterval(l,5e3)}class m extends HTMLElement{constructor(){super();d(this,"modal");d(this,"content");const n=this.attachShadow({mode:"open"});this.modal=document.createElement("div"),this.modal.classList.add("modal"),n.appendChild(this.modal),this.content=document.createElement("div"),this.content.classList.add("modal-content"),this.modal.appendChild(this.content),this.content.innerHTML=`
      <div class="container">
        <h2>Welcome</h2>
        <p>This site has moved routing</p>
        <button id="loginButton">Continue</button>
      </div>
    `,this.content.querySelector("#loginButton").addEventListener("click",()=>{window.location.href="https://fettle.vercel.app"});const t=document.createElement("style");t.textContent=`
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
    `,n.appendChild(t)}show(){this.modal.style.display="block",this.content.style.display="block"}close(){this.modal.style.display="none"}}customElements.define("login-dialog",m);window.addEventListener("DOMContentLoaded",()=>{u();const e=document.getElementById("login");e&&e.show()});
