const STORAGE_KEYS = {
    SCORES: "scores",
    BEST_SCORE: "bestScore",
    LAST_SCORE: "lastScore",
    PLAYER_NAME: "playerName",
    GAMES_PLAYED: "gamesPlayed",
    STREAK: "streak",
    BEST_STREAK: "bestStreak",
    ACHIEVEMENTS: "achievements",
    THEME: "theme",
    RECORD_DATE: "recordDate",
    LAST_PLAYED: "lastPlayed",
    ACHIEVEMENT_HISTORY: "achievementHistory"
};

const RANKS = [
    { name: "🥉 Beginner", min: 10 },
    { name: "🥈 Skilled", min: 50 },
    { name: "🥇 Master", min: 100 },
    { name: "💎 Elite", min: 250 },
    { name: "👑 Legend", min: 500 },
    { name: "🚀 Champion", min: 1000 }
];

const MAX_SCORE = 100000;

let scores = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES)) || [];
let achievements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) || [];
let achievementHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_HISTORY)) || [];
let bestScore = Number(localStorage.getItem(STORAGE_KEYS.BEST_SCORE)) || 0;
let lastScore = Number(localStorage.getItem(STORAGE_KEYS.LAST_SCORE)) || 0;
let gamesPlayed = Number(localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED)) || 0;
let streak = Number(localStorage.getItem(STORAGE_KEYS.STREAK)) || 0;
let bestStreak = Number(localStorage.getItem(STORAGE_KEYS.BEST_STREAK)) || 0;

function handleNameEnter(event) {
    if (event.key === "Enter") {
        document.getElementById("scoreInput").focus();
    }
}

function handleScoreEnter(event) {
    if (event.key === "Enter") {
        saveScore();
    }
}

document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveScore();
    }
});

function sanitizeScore(rawValue) {
    let score = Number(rawValue);
    if (isNaN(score)) score = 0;
    if (score < 0) score = 0;
    if (score > MAX_SCORE) score = MAX_SCORE;
    return score;
}

function saveScore() {
    const playerInput = document.getElementById("playerName");
    const scoreInput = document.getElementById("scoreInput");

    let player = playerInput.value.trim();
    if (player.length > 0) {
        player = player.charAt(0).toUpperCase() + player.slice(1);
    }

    const score = sanitizeScore(scoreInput.value);
    const now = new Date();

    scores.push({ player, score, date: now.toLocaleString() });
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, player);
    localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, now.toLocaleString());

    gamesPlayed++;
    localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, gamesPlayed);

    if (score > lastScore) {
        streak++;
    } else {
        streak = 0;
    }

    if (streak > bestStreak) {
        bestStreak = streak;
        localStorage.setItem(STORAGE_KEYS.BEST_STREAK, bestStreak);
    }
    localStorage.setItem(STORAGE_KEYS.STREAK, streak);

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(STORAGE_KEYS.BEST_SCORE, bestScore);
        localStorage.setItem(STORAGE_KEYS.RECORD_DATE, now.toLocaleString());
        showMessage("🎉 New Record!");
    }

    localStorage.setItem(STORAGE_KEYS.LAST_SCORE, score);
    lastScore = score;

    checkAchievements(score);
    refreshUI();
    scoreInput.value = "0";
}

function checkAchievements(score) {
    RANKS.forEach(rank => {
        if (score >= rank.min && !achievements.includes(rank.name)) {
            achievements.push(rank.name);
            achievementHistory.push({ achievement: rank.name, date: new Date().toLocaleString() });

            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_HISTORY, JSON.stringify(achievementHistory));

            showPopup(rank.name);
        }
    });
}

function showPopup(text) {
    const popup = document.getElementById("popup");
    popup.textContent = "🏆 Unlocked: " + text;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
}

function showMessage(text) {
    const message = document.getElementById("message");
    message.textContent = text;
    setTimeout(() => { message.textContent = ""; }, 3000);
}

function calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
}

function calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return ((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1);
    }
    return sorted[middle];
}

function updateStatistics() {
    const values = scores.map(item => item.score);
    document.getElementById("statHighest").textContent = values.length ? Math.max(...values) : 0;
    document.getElementById("statLowest").textContent = values.length ? Math.min(...values) : 0;
    document.getElementById("statAverage").textContent = calculateAverage(values);
    document.getElementById("statMedian").textContent = calculateMedian(values);
    document.getElementById("statLastFive").textContent = calculateAverage(values.slice(-5));
    document.getElementById("statTotal").textContent = values.length;
}

function updateAchievementCount() {
    const count = document.getElementById("achievementCount");
    if (!count) return;
    count.textContent = `Total Unlocked: ${achievements.length}`;
}

function renderAchievements() {
    const list = document.getElementById("achievementList");
    if (!list) return;

    if (achievements.length === 0) {
        list.innerHTML = "<li>No achievements unlocked yet.</li>";
        return;
    }

    list.innerHTML = achievements.map(item => `<li>${item}</li>`).join("");
}

function renderAchievementHistory() {
    const list = document.getElementById("achievementHistory");
    if (!list) return;

    if (achievementHistory.length === 0) {
        list.innerHTML = "<li>No achievements unlocked yet.</li>";
        return;
    }

    list.innerHTML = achievementHistory
        .slice()
        .reverse()
        .map(item => `<li>${item.achievement}<br><small>${item.date}</small></li>`)
        .join("");
}

function renderLeaderboard() {
    const board = document.getElementById("leaderboard");
    if (!board) return;

    if (scores.length === 0) {
        board.innerHTML = `<li>No scores yet. Play your first game!</li>`;
        return;
    }

    const topScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);
    board.innerHTML = topScores.map(item => `<li>${item.player} — ${item.score}</li>`).join("");
}

function renderHistory() {
    const history = document.getElementById("historyList");
    if (!history) return;

    if (scores.length === 0) {
        history.innerHTML = `<li>No score history available.</li>`;
        return;
    }

    history.innerHTML = scores
        .slice()
        .reverse()
        .map(item => `<li><strong>${item.player}</strong> - ${item.score}<br><small>${item.date}</small></li>`)
        .join("");
}

function updatePerformanceRating() {
    const rating = document.getElementById("performanceRating");
    if (!rating) return;

    const average = Number(calculateAverage(scores.map(item => item.score)));

    if (average >= 1000) {
        rating.textContent = "🚀 Champion Player";
    } else if (average >= 500) {
        rating.textContent = "👑 Legendary Player";
    } else if (average >= 250) {
        rating.textContent = "💎 Elite Player";
    } else if (average >= 100) {
        rating.textContent = "🥇 Master Player";
    } else if (average >= 50) {
        rating.textContent = "🥈 Skilled Player";
    } else {
        rating.textContent = "🌱 Beginner Player";
    }
}

function updateTrendIndicator() {
    const trend = document.getElementById("trendIndicator");
    if (!trend) return;

    if (scores.length < 6) {
        trend.textContent = "➡️ Not enough data yet";
        return;
    }

    const recent = scores.slice(-5).map(item => item.score);
    const previous = scores.slice(-10, -5).map(item => item.score);

    const recentAvg = Number(calculateAverage(recent));
    const previousAvg = previous.length ? Number(calculateAverage(previous)) : recentAvg;

    if (recentAvg > previousAvg) {
        trend.textContent = "📈 Improving";
    } else if (recentAvg < previousAvg) {
        trend.textContent = "📉 Declining";
    } else {
        trend.textContent = "➡️ Stable";
    }
}

function updateGoalTracker() {
    const el = document.getElementById("goalTracker");
    if (!el) return;

    const nextRank = RANKS.find(rank => bestScore < rank.min);

    if (!nextRank) {
        el.textContent = "🚀 You've unlocked every rank!";
        return;
    }

    const pointsRemaining = nextRank.min - bestScore;
    el.textContent = `Reach ${nextRank.min} points to unlock ${nextRank.name} (${pointsRemaining} to go).`;
}

function updateHighestRank() {
    const el = document.getElementById("highestRank");
    if (!el) return;
    el.textContent = achievements.length ? achievements[achievements.length - 1] : "None";
}

function updatePersonalBestChallenge() {
    const valueEl = document.getElementById("personalBestValue");
    const challengeEl = document.getElementById("personalBestChallenge");
    if (!valueEl || !challengeEl) return;

    valueEl.textContent = bestScore;

    if (scores.length === 0) {
        challengeEl.textContent = "Play to set your first record!";
        return;
    }

    if (lastScore >= bestScore) {
        challengeEl.textContent = "🎉 You're holding the record right now!";
        return;
    }

    const gap = bestScore - lastScore;
    challengeEl.textContent = `Score ${gap} more point${gap === 1 ? "" : "s"} to beat your record of ${bestScore}!`;
}

function updateAchievementProgress() {
    const totalAchievements = RANKS.length;
    const unlocked = achievements.length;
    const percent = Math.round((unlocked / totalAchievements) * 100);

    const text = document.getElementById("achievementProgressText");
    const progressBar = document.getElementById("achievementProgressBar");
    const progressPercent = document.getElementById("achievementProgressPercent");

    if (text) text.textContent = `${unlocked} / ${totalAchievements} Unlocked`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;
}

function updateProgressBar() {
    const progressBar = document.getElementById("progressBar");
    const progressPercent = document.getElementById("progressPercent");
    const nextRankText = document.getElementById("nextRankText");
    if (!progressBar || !progressPercent || !nextRankText) return;

    const nextRank = RANKS.find(rank => bestScore < rank.min);

    if (!nextRank) {
        progressBar.style.width = "100%";
        progressPercent.textContent = "100%";
        nextRankText.textContent = "🏆 Maximum Rank Reached";
        return;
    }

    const previousRank = [...RANKS].reverse().find(rank => bestScore >= rank.min);
    const previousValue = previousRank ? previousRank.min : 0;

    const progress = ((bestScore - previousValue) / (nextRank.min - previousValue)) * 100;
    const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));

    progressBar.style.width = `${safeProgress}%`;
    progressPercent.textContent = `${safeProgress}%`;
    nextRankText.textContent = `Reach ${nextRank.min} for ${nextRank.name}`;
}

function drawChart() {
    const canvas = document.getElementById("scoreChart");
    const statusEl = document.getElementById("chartStatus");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect
        ? canvas.getBoundingClientRect()
        : { width: canvas.clientWidth || 750, height: canvas.clientHeight || 250 };
    const width = rect.width || 750;
    const height = rect.height || 250;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (ctx.setTransform) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.clearRect(0, 0, width, height);

    if (statusEl) {
        if (scores.length === 0) {
            statusEl.textContent = "Add scores to generate chart data.";
        } else if (scores.length === 1) {
            statusEl.textContent = "Add one more score to see your trend line.";
        } else if (scores.length <= 20) {
            statusEl.textContent = `Showing all ${scores.length} recorded scores.`;
        } else {
            statusEl.textContent = "Showing your most recent 20 scores.";
        }
    }

    const recentScores = scores.slice(-20).map(item => item.score);

    if (recentScores.length < 2) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Not enough data to draw a chart yet.", width / 2, height / 2);
        return;
    }

    const padding = 30;
    const max = Math.max(...recentScores);
    const min = Math.min(...recentScores);
    const range = max - min || 1;
    const stepX = (width - padding * 2) / (recentScores.length - 1);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + ((height - padding * 2) / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    recentScores.forEach((score, index) => {
        const x = padding + stepX * index;
        const y = height - padding - ((score - min) / range) * (height - padding * 2);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    ctx.fillStyle = "#22c55e";
    recentScores.forEach((score, index) => {
        const x = padding + stepX * index;
        const y = height - padding - ((score - min) / range) * (height - padding * 2);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function refreshUI() {
    document.getElementById("bestScore").textContent = bestScore;
    document.getElementById("lastScore").textContent = lastScore;
    document.getElementById("gamesPlayed").textContent = gamesPlayed;
    document.getElementById("streak").textContent = streak;
    document.getElementById("bestStreak").textContent = bestStreak;
    document.getElementById("savedPlayer").textContent = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || "None";
    document.getElementById("recordDate").textContent =
        "Record Date: " + (localStorage.getItem(STORAGE_KEYS.RECORD_DATE) || "Never");
    document.getElementById("lastPlayed").textContent = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED) || "Never";

    updateStatistics();
    updatePerformanceRating();
    updateTrendIndicator();
    updateGoalTracker();
    updateHighestRank();
    updateAchievementCount();
    renderAchievements();
    renderAchievementHistory();
    renderLeaderboard();
    renderHistory();
    updatePersonalBestChallenge();
    updateProgressBar();
    updateAchievementProgress();
    drawChart();
}

function applyThemeFromStorage() {
    const isLight = localStorage.getItem(STORAGE_KEYS.THEME) === "true";
    const btn = document.getElementById("themeToggle");

    if (isLight) {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }

    if (btn) {
        btn.textContent = isLight ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem(STORAGE_KEYS.THEME, isLight);

    const btn = document.getElementById("themeToggle");
    if (btn) {
        btn.textContent = isLight ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
}

function resetData() {
    if (!confirm("Reset all saved data?")) return;
    localStorage.clear();
    location.reload();
}

function exportScores() {
    const data = {
        player: localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || "None",
        bestScore: bestScore,
        highestRank: achievements.length ? achievements[achievements.length - 1] : "None",
        gamesPlayed: gamesPlayed,
        history: scores
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "score-tracker-data.json";
    a.click();

    URL.revokeObjectURL(url);
}

function clearHistory() {
    if (!confirm("Clear score history?")) return;
    scores = [];
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify([]));
    refreshUI();
}

function updateClock() {
    const clock = document.getElementById("currentTime");
    if (clock) {
        clock.textContent = new Date().toLocaleString();
    }
}

function loadPlayerName() {
    const savedName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
    if (savedName) {
        document.getElementById("playerName").value = savedName;
        const welcome = document.getElementById("welcomeMessage");
        if (welcome) {
            welcome.textContent = `Welcome back, ${savedName} 👋`;
        }
    }
}

let resizeTimeout = null;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(drawChart, 150);
});

applyThemeFromStorage();
setInterval(updateClock, 1000);
updateClock();
loadPlayerName();
refreshUI();