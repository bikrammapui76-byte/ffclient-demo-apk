(function () {
  "use strict";

  var DEFAULTS = {
    AIM: false,
    HEAD: false,
    BODY: false,
    ESP: false,
    M1: false,
    NORECOIL: false
  };

  var state = JSON.parse(localStorage.getItem("panelState") || "null") || DEFAULTS;
  var prefs = JSON.parse(localStorage.getItem("panelPrefs") || "null") || {
    name: "",
    accent: "cyan"
  };

  function save() {
    localStorage.setItem("panelState", JSON.stringify(state));
    localStorage.setItem("panelPrefs", JSON.stringify(prefs));
  }

  function normalize() {
    if (!state.AIM) {
      state.HEAD = false;
      state.BODY = false;
    } else if (!state.HEAD && !state.BODY) {
      state.HEAD = true;
    } else if (state.HEAD && state.BODY) {
      state.BODY = false;
    }
  }

  function applyState() {
    normalize();

    document.querySelectorAll("[data-key]").forEach(function (el) {
      el.checked = !!state[el.getAttribute("data-key")];
    });

    var sub = document.getElementById("aimSub");
    if (sub) sub.classList.toggle("locked", !state.AIM);

    document.querySelectorAll("[data-sub]").forEach(function (el) {
      el.classList.toggle("active", !!state[el.getAttribute("data-sub")]);
    });

    var welcome = document.getElementById("welcome");
    if (welcome) {
      welcome.textContent = prefs.name
        ? "Welcome, " + prefs.name
        : "A simple toggle board that saves its state locally.";
    }

    document.body.setAttribute("data-accent", prefs.accent || "cyan");
    save();
  }

  document.querySelectorAll("[data-key]").forEach(function (el) {
    el.addEventListener("change", function () {
      state[el.getAttribute("data-key")] = el.checked;
      normalize();
      applyState();
    });
  });

  document.querySelectorAll("[data-sub]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (!state.AIM) return;

      var key = el.getAttribute("data-sub");
      state.HEAD = key === "HEAD";
      state.BODY = key === "BODY";
      applyState();
    });
  });

  var reset = document.getElementById('resetBtn');
  if (reset) {
    reset.addEventListener("click", function () {
      state = {
        AIM: false,
        HEAD: false,
        BODY: false,
        ESP: false,
        M1: false,
        NORECOIL: false
      };
      applyState();
    });
  }

  var clear = document.getElementById('clearBtn');
  if (clear) {
    clear.addEventListener("click", function () {
      localStorage.removeItem("panelState");
      localStorage.removeItem("panelPrefs");
      state = Object.assign({}, DEFAULTS);
      prefs = { name: "", accent: "cyan" };
      applyState();
    });
  }

  var nameInput = document.getElementById("nameInput");
  if (nameInput) {
    nameInput.value = prefs.name || "";
    nameInput.addEventListener("input", function () {
      prefs.name = nameInput.value.slice(0, 24);
      save();
      applyState();
    });
  }

  document.querySelectorAll("[data-accent]").forEach(function (el) {
    el.addEventListener("click", function () {
      prefs.accent = el.getAttribute("data-accent");
      applyState();
    });
  });

  document.querySelectorAll("[data-open]").forEach(function (el) {
    el.addEventListener("click", function () {
      var id = el.getAttribute("data-open");
      var modal = document.getElementById(id);
      if (modal) modal.classList.add("show");
    });
  });

  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      var id = el.getAttribute("data-close");
      var modal = document.getElementById(id);
      if (modal) modal.classList.remove("show");
    });
  });

  document.querySelectorAll("[data-game]").forEach(function (el) {
    el.addEventListener("click", function () {
      document.querySelectorAll("[data-game]").forEach(function (item) {
        item.classList.remove("active");
      });
      el.classList.add("active");
    });
  });

  var saveProfile = document.getElementById("saveProfile");
  if (saveProfile) {
    saveProfile.addEventListener("click", function () {
      if (nameInput) {
        prefs.name = nameInput.value.slice(0, 24);
        save();
        applyState();
      }
      var modal = document.getElementById("profileModal");
      if (modal) modal.classList.remove("show");
    });
  }

  var injectBtn = document.getElementById("injectBtn");
  if (injectBtn) {
    injectBtn.addEventListener("click", function () {
      injectBtn.textContent = "✓ DEMO READY";
      setTimeout(function () {
        injectBtn.textContent = "𝗜𝗡𝗝𝗘𝗖";
      }, 1200);
    });
  }

  applyState();
})();
