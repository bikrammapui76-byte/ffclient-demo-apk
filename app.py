import json
import os
import time

from flask import Flask, jsonify, render_template, request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(BASE_DIR, "state.json")
PREFS_FILE = os.path.join(BASE_DIR, "prefs.json")

VERSION = "1.0.1"
DEFAULTS = {"AIM": False, "HEAD": False, "BODY": False,
            "ESP": False, "M1": False, "NORECOIL": False}
PREF_DEFAULTS = {"name": "", "accent": "cyan"}
ACCENTS = {"cyan", "pink", "green"}

app = Flask(__name__)


@app.after_request
def no_cache(resp):
    resp.headers["Cache-Control"] = "no-store, max-age=0"
    return resp


def read_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {}


def write_json(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, path)


def normalize(state):
    if not state["AIM"]:
        state["HEAD"] = False
        state["BODY"] = False
    else:
        if state["HEAD"] and state["BODY"]:
            state["BODY"] = False
        if not state["HEAD"] and not state["BODY"]:
            state["HEAD"] = True
    return state


def load_state():
    saved = read_json(STATE_FILE)
    state = {k: bool(saved.get(k, v)) for k, v in DEFAULTS.items()}
    return normalize(state)


def load_prefs():
    saved = read_json(PREFS_FILE)
    prefs = dict(PREF_DEFAULTS)
    if isinstance(saved.get("name"), str):
        prefs["name"] = saved["name"][:24]
    if saved.get("accent") in ACCENTS:
        prefs["accent"] = saved["accent"]
    return prefs


@app.route("/")
def index():
    return render_template("index.html", state=load_state(), prefs=load_prefs(),
                           version=VERSION, bust=int(time.time()))


@app.route("/api/state", methods=["GET"])
def api_state():
    return jsonify(load_state())


@app.route("/api/toggle", methods=["POST"])
def api_toggle():
    data = request.get_json(silent=True) or {}
    key = data.get("key")
    if key not in DEFAULTS:
        return jsonify({"error": "Unknown key"}), 400
    value = data.get("value")
    if value is not None and not isinstance(value, bool):
        return jsonify({"error": "value must be true or false"}), 400
    state = load_state()
    if key in ("HEAD", "BODY"):
        if not state["AIM"]:
            return jsonify({"error": "Turn AIM on first"}), 409
        other = "BODY" if key == "HEAD" else "HEAD"
        state[key] = True
        state[other] = False
    else:
        state[key] = (not state[key]) if value is None else value
    write_json(STATE_FILE, normalize(state))
    return jsonify(state)


@app.route("/api/reset", methods=["POST"])
def api_reset():
    state = dict(DEFAULTS)
    write_json(STATE_FILE, state)
    return jsonify(state)


@app.route("/api/prefs", methods=["GET", "POST"])
def api_prefs():
    if request.method == "GET":
        return jsonify(load_prefs())
    data = request.get_json(silent=True) or {}
    prefs = load_prefs()
    if "name" in data:
        if not isinstance(data["name"], str):
            return jsonify({"error": "name must be text"}), 400
        prefs["name"] = data["name"].strip()[:24]
    if "accent" in data:
        if data["accent"] not in ACCENTS:
            return jsonify({"error": "invalid accent"}), 400
        prefs["accent"] = data["accent"]
    write_json(PREFS_FILE, prefs)
    return jsonify(prefs)


@app.route("/api/clear", methods=["POST"])
def api_clear():
    for path in (STATE_FILE, PREFS_FILE):
        try:
            os.remove(path)
        except FileNotFoundError:
            pass
    return jsonify({"state": dict(DEFAULTS), "prefs": dict(PREF_DEFAULTS)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5055, debug=False)
