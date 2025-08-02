// ——— Sakura Lanterns: pretty + colorful ———
const $ = (q) => document.querySelector(q);

const composer = $("#composer");
const stage = $("#stage");
const sky = $("#sky");
const msgCard = $("#messageCard");
const toText = $("#toText");
const fromText = $("#fromText");
const msgText = $("#msgText");
const createBtn = $("#createBtn");

// Encode/Decode
const encodeData = (o)=> btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const decodeData = (b)=> { try{ return JSON.parse(decodeURIComponent(escape(atob(b)))) }catch(e){ return null } };

// Themes
function applyTheme(theme){
  const cls = {
    "sakura":"theme-sakura",
    "aurora":"theme-aurora",
    "peach":"theme-peach",
    "lilac":"theme-lilac"
  }[theme] || "theme-sakura";
  sky.className = "sky " + cls;
}

// Lanterns (with varied sizes & speeds)
function spawnLanterns(color){
  sky.querySelectorAll(".lantern, .particle").forEach(n=>n.remove());
  const count = 18 + Math.floor(Math.random()*8);
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = `lantern ${color}`;
    const left = Math.random()*96 + 2;
    const sizeScale = 0.85 + Math.random()*0.5; // different sizes
    const dur = 18 + Math.random()*20;
    const drift = (Math.random()*100 - 50) + 'px';
    el.style.left = left + 'vw';
    el.style.transform = `scale(${sizeScale})`;
    el.style.setProperty('--dur', dur + 's');
    el.style.setProperty('--drift', drift);
    el.style.animationDelay = (-Math.random()*10) + 's';
    sky.appendChild(el);
  }
}

// Particles with parallax
function spawnParticles(type){
  if(type==='none') return;
  const count = type==='petals' ? 120 : 80;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    const cls = type==='stars' ? 'p-stars' : type==='sparks' ? 'p-sparks' : 'p-petals';
    p.className = 'particle ' + cls;
    const depth = Math.random(); // parallax depth
    p.style.left = (Math.random()*100) + 'vw';
    p.style.bottom = (-40 - Math.random()*260) + 'px';
    p.style.opacity = 0.6 + depth*0.5;
    p.style.transform = `translateZ(${depth*2}px)`;
    p.style.setProperty('--p-dur', (22 + Math.random()*26) + 's');
    p.style.animationDelay = (-Math.random()*22) + 's';
    sky.appendChild(p);
  }
}

function showExperience(obj, withControls=true){
  applyTheme(obj.theme || 'sakura');
  spawnLanterns(obj.lantern || 'pearl');
  spawnParticles(obj.extras || 'petals');

  toText.textContent = obj.to ? `For ${obj.to}` : '';
  fromText.textContent = obj.from ? `${obj.from}` : '';
  msgText.textContent = obj.msg || '';

  composer.classList.add('hidden');
  stage.classList.remove('hidden');
  msgCard.classList.remove('hidden');
  createBtn.classList.toggle('hidden', !withControls);
}

function getFormData(){
  return {
    to: $("#to").value.trim(),
    msg: $("#msg").value.trim(),
    from: $("#from").value.trim(),
    theme: $("#theme").value,
    lantern: $("#lantern").value,
    extras: $("#extras").value
  };
}

// Buttons
$("#preview").addEventListener('click', ()=>{
  showExperience(getFormData());
});

$("#form").addEventListener('submit', (e)=>{
  e.preventDefault();
  const obj = getFormData();
  const url = location.origin + location.pathname + '?d=' + encodeData(obj);
  navigator.clipboard.writeText(url).then(()=>{
    showExperience(obj);
    $("#share").textContent = "Link copied!";
    setTimeout(()=> $("#share").textContent = "Share", 1500);
  }).catch(()=>{
    prompt("Copy your link:", url);
    showExperience(obj);
  });
});

$("#share").addEventListener('click', ()=>{
  const obj = getFormDataFromURL() || getFormData();
  const url = location.origin + location.pathname + '?d=' + encodeData(obj);
  if(navigator.share){
    navigator.share({ title: "A sakura lantern for you", text: obj.msg, url });
  }else{
    navigator.clipboard.writeText(url).then(()=>{
      $("#share").textContent = "Link copied!";
      setTimeout(()=> $("#share").textContent = "Share", 1500);
    });
  }
});

$("#back").addEventListener('click', resetUI);
$("#createBtn").addEventListener('click', ()=>{ history.pushState({}, "", location.pathname); resetUI(); });

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

window.addEventListener('DOMContentLoaded', ()=>{
  const obj = getFormDataFromURL();
  if(obj){
    showExperience(obj, true);
    $("#to").value = obj.to || "";
    $("#msg").value = obj.msg || "";
    $("#from").value = obj.from || "";
    $("#theme").value = obj.theme || "sakura";
    $("#lantern").value = obj.lantern || "pearl";
    $("#extras").value = obj.extras || "petals";
  }else{
    resetUI();
  }
});
