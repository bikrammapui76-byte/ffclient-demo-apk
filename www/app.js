(function(){
"use strict";
var KEY="demoPanelState";
var PREF="demoPanelPrefs";
var DEFAULT_STATE={AIM:false,HEAD:false,BODY:false,ESP:false,M1:false,NORECOIL:false};
var DEFAULT_PREFS={name:"",accent:"cyan"};
function clone(o){return JSON.parse(JSON.stringify(o));}
function getState(){try{return Object.assign(clone(DEFAULT_STATE),JSON.parse(localStorage.getItem(KEY)||"{}"));}catch(e){return clone(DEFAULT_STATE);}}
function saveState(s){localStorage.setItem(KEY,JSON.stringify(s));}
function getPrefs(){try{return Object.assign(clone(DEFAULT_PREFS),JSON.parse(localStorage.getItem(PREF)||"{}"));}catch(e){return clone(DEFAULT_PREFS);}}
function savePrefs(p){localStorage.setItem(PREF,JSON.stringify(p));}
var statusEl=document.getElementById("status");
function setStatus(m,e){if(statusEl){statusEl.textContent=m;statusEl.classList.toggle("error",!!e);}}
var welcomeEl=document.getElementById("welcome");
var nameInput=document.getElementById("nameInput");
var istTime=document.getElementById("istTime");
var istDate=document.getElementById("istDate");
var netSpeed=document.getElementById("netSpeed");
var netType=document.getElementById("netType");
var settingsModal=document.getElementById("settingsModal");
var boxes=document.querySelectorAll('input[type="checkbox"][data-key]');
var subWrap=document.getElementById("aimSub");
var opts=document.querySelectorAll(".opt[data-sub]");
var swatches=document.querySelectorAll(".swatch");
function normalize(s){if(!s.AIM){s.HEAD=false;s.BODY=false;}if(s.HEAD&&s.BODY)s.BODY=false;return s;}
function applyState(s){s=normalize(s);boxes.forEach(function(b){var k=b.getAttribute("data-key"),on=!!s[k];b.checked=on;var c=b.closest(".card");if(c){c.classList.toggle("on",on);var t=c.querySelector(".tag");if(t)t.textContent=on?"ON":"OFF";}});if(subWrap)subWrap.classList.toggle("locked",!s.AIM);opts.forEach(function(o){o.classList.toggle("active",!!s[o.getAttribute("data-sub")]);});saveState(s);}
boxes.forEach(function(b){b.addEventListener("change",function(){var s=getState(),k=b.getAttribute("data-key");if(k==="HEAD"||k==="BODY"){if(!s.AIM){b.checked=false;setStatus("Turn AIM on first.",true);return;}s.HEAD=k==="HEAD";s.BODY=k==="BODY";}else{s[k]=b.checked;}applyState(s);setStatus(k+" set to "+(s[k]?"ON":"OFF")+".");});});
opts.forEach(function(o){o.addEventListener("click",function(){var s=getState();if(!s.AIM){setStatus("Turn AIM on first.",true);return;}var k=o.getAttribute("data-sub");s.HEAD=k==="HEAD";s.BODY=k==="BODY";applyState(s);setStatus(k+" selected.");});});
var resetBtn=document.getElementById("resetBtn");if(resetBtn)resetBtn.addEventListener("click",function(){applyState(clone(DEFAULT_STATE));setStatus("All toggles reset to OFF.");});
var injectBtn=document.getElementById("injectBtn");if(injectBtn)injectBtn.addEventListener("click",function(){setStatus("Demo mode: no game hooks or injection performed.");});
document.querySelectorAll("[data-open]").forEach(function(b){b.addEventListener("click",function(){var id=b.getAttribute("data-open");openModal(id);});});
function openModal(id){var m=document.getElementById(id);if(m)m.hidden=false;}
function closeModal(m){if(m)m.hidden=true;}
document.querySelectorAll(".modal").forEach(function(m){m.addEventListener("click",function(e){if(e.target===m||e.target.hasAttribute("data-close"))closeModal(m);});});
document.addEventListener("keydown",function(e){if(e.key==="Escape")document.querySelectorAll(".modal").forEach(closeModal);});
function tickTime(){if(!istTime||!istDate)return;var n=new Date(Date.now()+19800000),h=n.getUTCHours(),a=h>=12?"PM":"AM",h12=h%12||12;istTime.textContent=(h12<10?"0":"")+h12+":"+String(n.getUTCMinutes()).padStart(2,"0")+":"+String(n.getUTCSeconds()).padStart(2,"0")+" "+a;istDate.textContent=n.toUTCString().slice(0,16)+" • IST";}
function updateNetwork(){if(!netSpeed||!netType)return;if(!navigator.onLine){netSpeed.textContent="Offline";netType.textContent="No connection";return;}netSpeed.textContent="Local";netType.textContent="WebView";}
tickTime();updateNetwork();setInterval(tickTime,1000);
applyState(getState());applyPrefs(getPrefs());setStatus("Ready • Local storage enabled.");
})();
