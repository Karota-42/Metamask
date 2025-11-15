let clickSound;

document.addEventListener("DOMContentLoaded", () => {
    // Prepare sound
    clickSound = new Audio("/static/sounds/click.mp3");

    // Init typing effect
    startTypingEffect();

    // Init Matrix rain
    initMatrixRain();

    // ASCII intro controls
    initAsciiIntro();
});

function playClick() {
    if (!clickSound) return;
    // restart from beginning
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
}

/* === HASH FUNCTIONS === */
function generateHash() {
    playClick();

    let text = document.getElementById("textInput").value;
    if (!text) {
        alert(">> ENTER SOME PLAINTEXT FIRST");
        return;
    }

    fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("resultBox").classList.remove("hidden");
        document.getElementById("hashOutput").textContent =
            JSON.stringify(data.hashes, null, 2);

        addToTable(data.entry);
    });
}

function addToTable(entry) {
    let tableBody = document.querySelector("#historyTable tbody");
    let row = document.createElement("tr");
    row.innerHTML = `
        <td>${entry.time}</td>
        <td>${entry.text}</td>
        <td>${entry.hashes.MD5}</td>
        <td>${entry.hashes.SHA1}</td>
        <td>${entry.hashes.SHA256}</td>
        <td>${entry.hashes.SHA512}</td>
    `;
    tableBody.appendChild(row);
}

function clearHistory() {
    playClick();
    fetch("/clear", { method: "POST" })
        .then(() => location.reload());
}

function copyHash() {
    playClick();
    const text = document.getElementById("hashOutput").textContent.trim();
    if (!text) {
        alert(">> NO HASHES TO COPY");
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => console.log("Copied to clipboard"));
}

function downloadJSON() {
    playClick();
    const json = document.getElementById("hashOutput").textContent.trim();
    if (!json) {
        alert(">> NO HASHES TO EXPORT");
        return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "hash_output.json";
    link.click();
}

/* === TYPING ANIMATION === */
function startTypingEffect() {
    const el = document.getElementById("typingText");
    if (!el) return;
    const fullText = el.dataset.text || "";
    let idx = 0;

    const interval = setInterval(() => {
        el.textContent = fullText.slice(0, idx);
        idx++;
        if (idx > fullText.length) {
            clearInterval(interval);
        }
    }, 40);
}

/* === MATRIX RAIN === */
function initMatrixRain() {
    const canvas = document.getElementById("matrixCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const letters = "01アカサタナハマヤラワABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        // fade effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px courier";

        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        requestAnimationFrame(draw);
    }
    draw();
}

/* === ASCII INTRO SCREEN === */
function initAsciiIntro() {
    const intro = document.getElementById("asciiIntro");
    if (!intro) return;

    const closeIntro = () => {
        intro.classList.add("hide");
        // remove listeners so they don't keep firing
        window.removeEventListener("keydown", keyHandler);
        intro.removeEventListener("click", clickHandler);
    };

    const keyHandler = (e) => {
        if (e.key === "Enter") {
            playClick();
            closeIntro();
        }
    };

    const clickHandler = () => {
        playClick();
        closeIntro();
    };

    window.addEventListener("keydown", keyHandler);
    intro.addEventListener("click", clickHandler);

    // Auto-close after a few seconds too
    setTimeout(() => {
        if (!intro.classList.contains("hide")) {
            closeIntro();
        }
    }, 8000);
}
