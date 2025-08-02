// Sakura Lanterns — front-end only. Share via URL params (?d=... base64).

const $ = (q) => document.querySelector(q);

// Elements
const composer = $("#composer");
const stage = $("#stage");
const sky = $("#sky");
const msgCard = $("#messageCard");
const toText = $("#toText");
const fromText = $("#fromText");
const msgText = $("#msgText");
const createBtn = $("#createBtn");

// Encode/decode data for URL
function encodeData(obj){
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64;
}
function decodeData(b64){
  try{
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  }catch(e){
    return null;
  }
}

// Theme mapping
function applyTheme(theme){
  const map = {
    "sakura": "theme-sakura",
    "sakura-dawn": "theme-sakura-dawn",
    "sakura-twilight": "theme-sakura-twilight",
    "pearl-sky": "theme-pearl-sky"
  };
  sky.className = "sky " + (map[theme] || "theme-sakura");
}

// Lanterns
function spawnLanterns(color){
  sky.innerHTML = "";
  const count = 16 + Math.floor(Math.random()*6);
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = `lantern ${color}`;
    el.style.left = (Math.random()*96 + 2) + 'vw';
    el.style.setProperty('--dur', (18 + Math.random()*18) + 's');
    el.style.setProperty('--drift', (Math.random()*80 - 40) + 'px');
    el.style.animationDelay = (-Math.random()*10) + 's';
    sky.appendChild(el);
  }
}

// Particles
function spawnParticles(type){
  const count = type==='petals' ? 90 : 70;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'particle ' + (type==='stars'?'p-stars':type==='sparks'?'p-sparks':'p-petals');
    p.style.left = (Math.random()*100) + 'vw';
    p.style.bottom = (-20 - Math.random()*200) + 'px';
    p.style.setProperty('--p-dur', (22 + Math.random()*26) + 's');
    p.style.animationDelay = (-Math.random()*22) + 's';
    sky.appendChild(p);
  }
}

// Show experience
function showExperience(obj, withControls=true){
  applyTheme(obj.theme || 'sakura');
  spawnLanterns(obj.lantern || 'pearl');
  if(obj.extras && obj.extras!=='none'){ spawnParticles(obj.extras); }

  toText.textContent = obj.to ? `For ${obj.to}` : '';
  fromText.textContent = obj.from ? `${obj.from}` : '';
  msgText.textContent = obj.msg || '';

  composer.classList.add('hidden');
  stage.classList.remove('hidden');
  msgCard.classList.remove('hidden');
  createBtn.classList.toggle('hidden', !withControls);
}

// Form helpers
function getFormData(){
  return {
    to: document.querySelector("#to").value.trim(),
    msg: document.querySelector("#msg").value.trim(),
    from: document.querySelector("#from").value.trim(),
    theme: document.querySelector("#theme").value,
    lantern: document.querySelector("#lantern").value,
    extras: document.querySelector("#extras").value
  };
}

// Buttons
document.querySelector("#preview").addEventListener('click', ()=>{
  const obj = getFormData();
  showExperience(obj);
});

document.querySelector("#form").addEventListener('submit', (e)=>{
  e.preventDefault();
  const obj = getFormData();
  const b64 = encodeData(obj);
  const url = location.origin + location.pathname + '?d=' + b64;
  navigator.clipboard.writeText(url).then(()=>{
    showExperience(obj);
    document.querySelector("#share").textContent = "Link copied!";
    setTimeout(()=> document.querySelector("#share").textContent = "Share", 1500);
  }).catch(()=>{
    prompt("Copy your link:", url);
    showExperience(obj);
  });
});

document.querySelector("#share").addEventListener('click', ()=>{
  const existing = getFormDataFromURL() || getFormData();
  const url = location.origin + location.pathname + '?d=' + encodeData(existing);
  if(navigator.share){
    navigator.share({ title: "A sakura lantern for you", text: existing.msg, url });
  }else{
    navigator.clipboard.writeText(url).then(()=>{
      document.querySelector("#share").textContent = "Link copied!";
      setTimeout(()=> document.querySelector("#share").textContent = "Share", 1500);
    });
  }
});

document.querySelector("#back").addEventListener('click', resetUI);
createBtn.addEventListener('click', ()=>{
  history.pushState({}, "", location.pathname);
  resetUI();
});

// State helpers
function resetUI(){
  stage.classList.add('hidden');
  composer.classList.remove('hidden');
  createBtn.classList.add('hidden');
  msgCard.classList.add('hidden');
}

function getFormDataFromURL(){
  const b64 = new URLSearchParams(location.search).get('d');
  return b64 ? decodeData(b64) : null;
}

// Init
window.addEventListener('DOMContentLoaded', ()=>{
  const obj = getFormDataFromURL();
  if(obj){
    showExperience(obj, /*withControls=*/true);
    document.querySelector("#to").value = obj.to || "";
    document.querySelector("#msg").value = obj.msg || "";
    document.querySelector("#from").value = obj.from || "";
    document.querySelector("#theme").value = obj.theme || "sakura";
    document.querySelector("#lantern").value = obj.lantern || "pearl";
    document.querySelector("#extras").value = obj.extras || "petals";
  }else{
    resetUI();
  }
});
