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

let scores =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES)) || [];

let achievements =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) || [];

let achievementHistory =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_HISTORY)) || [];

let bestScore =
    Number(localStorage.getItem(STORAGE_KEYS.BEST_SCORE)) || 0;

let lastScore =
    Number(localStorage.getItem(STORAGE_KEYS.LAST_SCORE)) || 0;

let gamesPlayed =
    Number(localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED)) || 0;

let streak =
    Number(localStorage.getItem(STORAGE_KEYS.STREAK)) || 0;

let bestStreak =
    Number(localStorage.getItem(STORAGE_KEYS.BEST_STREAK)) || 0;

function handleNameEnter(event) {

    if (event.key === "Enter") {

        document
            .getElementById("scoreInput")
            .focus();
    }
}

function handleScoreEnter(event) {

    if (event.key === "Enter") {

        saveScore();
    }
}

function saveScore() {

    const playerInput =
        document.getElementById("playerName");

    const scoreInput =
        document.getElementById("scoreInput");

    let player =
        playerInput.value.trim();

    if (player.length > 0) {

        player =
            player.charAt(0).toUpperCase() +
            player.slice(1);
    }

    let score =
        Number(scoreInput.value);

    if (isNaN(score)) {

        score = 0;
    }

    const now =
        new Date();

    scores.push({
        player,
        score,
        date: now.toLocaleString()
    });

    localStorage.setItem(
        STORAGE_KEYS.SCORES,
        JSON.stringify(scores)
    );

    localStorage.setItem(
        STORAGE_KEYS.PLAYER_NAME,
        player
    );

    localStorage.setItem(
        STORAGE_KEYS.LAST_SCORE,
        score
    );

    localStorage.setItem(
        STORAGE_KEYS.LAST_PLAYED,
        now.toLocaleString()
    );

    gamesPlayed++;

    localStorage.setItem(
        STORAGE_KEYS.GAMES_PLAYED,
        gamesPlayed
    );

    if (score > lastScore) {

        streak++;

    } else {

        streak = 0;
    }

    if (streak > bestStreak) {

        bestStreak = streak;

        localStorage.setItem(
            STORAGE_KEYS.BEST_STREAK,
            bestStreak
        );
    }

    localStorage.setItem(
        STORAGE_KEYS.STREAK,
        streak
    );

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            STORAGE_KEYS.BEST_SCORE,
            bestScore
        );

        localStorage.setItem(
            STORAGE_KEYS.RECORD_DATE,
            now.toLocaleString()
        );

        showMessage(
            "🎉 New Record!"
        );
    }

    localStorage.setItem(
        STORAGE_KEYS.LAST_SCORE,
        score
    );

    lastScore = score;

    checkAchievements(score);

    refreshUI();

    scoreInput.value = "0";
}

function checkAchievements(score) {

    RANKS.forEach(rank => {

        if (
            score >= rank.min &&
            !achievements.includes(rank.name)
        ) {

            achievements.push(rank.name);

            achievementHistory.push({
                achievement: rank.name,
                date: new Date().toLocaleString()
            });

            localStorage.setItem(
                STORAGE_KEYS.ACHIEVEMENTS,
                JSON.stringify(achievements)
            );

            localStorage.setItem(
                STORAGE_KEYS.ACHIEVEMENT_HISTORY,
                JSON.stringify(achievementHistory)
            );

            showPopup(
                rank.name
            );
        }
    });
}

function showPopup(text) {

    const popup =
        document.getElementById("popup");

    popup.textContent =
        "🏆 Unlocked: " + text;

    popup.classList.add("show");

    setTimeout(() => {

        popup.classList.remove("show");

    }, 3000);
}

function showMessage(text) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    setTimeout(() => {

        message.textContent = "";

    }, 3000);
}
function calculateAverage(arr) {

    if (arr.length === 0) {
        return 0;
    }

    return (
        arr.reduce((a, b) => a + b, 0) /
        arr.length
    ).toFixed(1);
}

function calculateMedian(arr) {

    if (arr.length === 0) {
        return 0;
    }

    const sorted =
        [...arr].sort((a, b) => a - b);

    const middle =
        Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {

        return (
            (sorted[middle - 1] +
                sorted[middle]) / 2
        ).toFixed(1);
    }

    return sorted[middle];
}

function updateStatistics() {

    const values =
        scores.map(item => item.score);

    document.getElementById(
        "statHighest"
    ).textContent =
        values.length ?
        Math.max(...values) :
        0;

    document.getElementById(
        "statLowest"
    ).textContent =
        values.length ?
        Math.min(...values) :
        0;

    document.getElementById(
        "statAverage"
    ).textContent =
        calculateAverage(values);

    document.getElementById(
        "statMedian"
    ).textContent =
        calculateMedian(values);

    document.getElementById(
        "statLastFive"
    ).textContent =
        calculateAverage(
            values.slice(-5)
        );

    document.getElementById(
        "statTotal"
    ).textContent =
        values.length;
}

function updateAchievementCount() {

    const el =
        document.getElementById(
            "achievementCount"
        );

    if (el) {

        el.textContent =
            `Total Unlocked: ${achievements.length}`;
    }
}

function renderAchievementHistory() {

    const list =
        document.getElementById(
            "achievementHistory"
        );

    if (!list) return;

    if (
        achievementHistory.length === 0
    ) {

        list.innerHTML =
            "<li>No achievements unlocked yet.</li>";

        return;
    }

    list.innerHTML =
        achievementHistory
        .slice()
        .reverse()
        .map(item => `
            <li>
                ${item.achievement}
                <br>
                <small>${item.date}</small>
            </li>
        `)
        .join("");
}

function updatePerformanceRating() {

    const rating =
        document.getElementById(
            "performanceRating"
        );

    if (!rating) return;

    const average =
        Number(
            calculateAverage(
                scores.map(
                    item => item.score
                )
            )
        );

    if (average >= 1000) {

        rating.textContent =
            "🚀 Champion Player";

    } else if (average >= 500) {

        rating.textContent =
            "👑 Legendary Player";

    } else if (average >= 250) {

        rating.textContent =
            "💎 Elite Player";

    } else if (average >= 100) {

        rating.textContent =
            "🥇 Master Player";

    } else if (average >= 50) {

        rating.textContent =
            "🥈 Skilled Player";

    } else {

        rating.textContent =
            "🌱 Beginner Player";
    }
}

function updateTrendIndicator() {

    const trend =
        document.getElementById(
            "trendIndicator"
        );

    if (!trend) return;

    if (scores.length < 6) {

        trend.textContent =
            "➡️ Not enough data yet";

        return;
    }

    const recent =
        scores
        .slice(-5)
        .map(item => item.score);

    const previous =
        scores
        .slice(-10, -5)
        .map(item => item.score);

    const recentAvg =
        Number(
            calculateAverage(recent)
        );

    const previousAvg =
        previous.length
            ? Number(
                calculateAverage(
                    previous
                )
            )
            : recentAvg;

    if (recentAvg > previousAvg) {

        trend.textContent =
            "📈 Improving";

    } else if (
        recentAvg < previousAvg
    ) {

        trend.textContent =
            "📉 Declining";

    } else {

        trend.textContent =
            "➡️ Stable";
    }
}

function updateGoalTracker() {

    const goal =
        document.getElementById(
            "goalTracker"
        );

    if (!goal) return;

    const nextRank =
        RANKS.find(
            rank =>
                bestScore < rank.min
        );

    if (!nextRank) {

        goal.textContent =
            "🏆 Maximum Rank Reached!";

        return;
    }

    goal.textContent =
        `Need ${nextRank.min - bestScore} more points for ${nextRank.name}`;
}

function drawChart() {

    const canvas =
        document.getElementById(
            "scoreChart"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    canvas.width =
        canvas.offsetWidth;

    canvas.height = 250;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (scores.length < 2) {
        return;
    }

    const values =
        scores.map(
            item => item.score
        );

    const max =
        Math.max(...values);

    const stepX =
        canvas.width /
        (values.length - 1);

    ctx.beginPath();

    values.forEach(
        (value, index) => {

            const x =
                index * stepX;

            const y =
                canvas.height -
                (
                    value / max
                ) *
                (
                    canvas.height - 30
                );

            if (index === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);
            }
        }
    );

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#38bdf8";
    ctx.stroke();
}

function refreshUI() {

    document.getElementById(
        "bestScore"
    ).textContent = bestScore;

    document.getElementById(
        "lastScore"
    ).textContent = lastScore;

    document.getElementById(
        "gamesPlayed"
    ).textContent = gamesPlayed;

    document.getElementById(
        "streak"
    ).textContent = streak;

    document.getElementById(
        "bestStreak"
    ).textContent = bestStreak;

    document.getElementById(
        "savedPlayer"
    ).textContent =
        localStorage.getItem(
            STORAGE_KEYS.PLAYER_NAME
        ) || "None";

    document.getElementById(
        "recordDate"
    ).textContent =
        "Record Date: " +
        (
            localStorage.getItem(
                STORAGE_KEYS.RECORD_DATE
            ) || "Never"
        );

    document.getElementById(
        "lastPlayed"
    ).textContent =
        localStorage.getItem(
            STORAGE_KEYS.LAST_PLAYED
        ) || "Never";

    updateStatistics();
    updateAchievementCount();
    renderAchievementHistory();
    updatePerformanceRating();
    updateTrendIndicator();
    updateGoalTracker();
    drawChart();
}

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );

    localStorage.setItem(
        STORAGE_KEYS.THEME,
        document.body.classList.contains(
            "light-mode"
        )
    );
}

function resetData() {

    if (
        !confirm(
            "Reset all saved data?"
        )
    ) {
        return;
    }

    localStorage.clear();
    location.reload();
}

function exportScores() {

    const data =
        JSON.stringify(
            scores,
            null,
            2
        );

    const blob =
        new Blob(
            [data],
            {
                type:
                "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "score-tracker-data.json";

    a.click();

    URL.revokeObjectURL(url);
}

function clearHistory() {

    scores = [];

    localStorage.setItem(
        STORAGE_KEYS.SCORES,
        JSON.stringify([])
    );

    refreshUI();
}

function updateClock() {

    const clock =
        document.getElementById(
            "currentTime"
        );

    if (clock) {

        clock.textContent =
            new Date()
            .toLocaleString();
    }
}

if (
    localStorage.getItem(
        STORAGE_KEYS.THEME
    ) === "true"
) {

    document.body.classList.add(
        "light-mode"
    );
}

setInterval(
    updateClock,
    1000
);

updateClock();
refreshUI();