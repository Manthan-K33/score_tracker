const STORAGE_KEYS = {
    PLAYER: 'st_player',
    SCORES: 'st_scores',
    BEST_SCORE: 'st_bestScore',
    BEST_SCORE_DATE: 'st_bestScoreDate',
    LAST_SCORE: 'st_lastScore',
    LAST_PLAYED: 'st_lastPlayed',
    GAMES_PLAYED: 'st_gamesPlayed',
    CURRENT_STREAK: 'st_currentStreak',
    BEST_STREAK: 'st_bestStreak',
    HIGHEST_RANK: 'st_highestRank',
    UNLOCKED_RANKS: 'st_unlockedRanks',
    THEME: 'st_theme'
};

const RANKS = [
    { name: 'Beginner', emoji: '🥉', min: 10 },
    { name: 'Skilled', emoji: '🥈', min: 50 },
    { name: 'Master', emoji: '🥇', min: 100 },
    { name: 'Elite', emoji: '💎', min: 250 },
    { name: 'Legend', emoji: '👑', min: 500 },
    { name: 'Champion', emoji: '🚀', min: 1000 }
];

const MAX_SCORE = 100000;

let popupQueue = [];
let popupShowing = false;

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadPlayerName();
    renderAll();
    startClock();
});

function loadTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    applyTheme(saved);
}

function applyTheme(theme) {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    if (theme === 'light') {
        body.classList.add('light-mode');
        btn.textContent = '☀️ Light Mode';
    } else {
        body.classList.remove('light-mode');
        btn.textContent = '🌙 Dark Mode';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-mode');
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
}

function loadPlayerName() {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYER);
    const input = document.getElementById('playerName');
    if (saved) {
        input.value = saved;
        updateWelcomeMessage(saved);
        document.getElementById('savedPlayer').textContent = saved;
    }
}

function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateWelcomeMessage(name) {
    const welcome = document.getElementById('welcomeMessage');
    if (name && name.trim() !== '') {
        welcome.textContent = `Welcome back, ${name} 👋`;
    } else {
        welcome.textContent = 'Welcome 👋';
    }
}

function savePlayerNameIfPresent() {
    const input = document.getElementById('playerName');
    let name = input.value.trim();
    if (name !== '') {
        name = capitalizeFirstLetter(name);
        input.value = name;
        localStorage.setItem(STORAGE_KEYS.PLAYER, name);
        document.getElementById('savedPlayer').textContent = name;
        updateWelcomeMessage(name);
    }
    return name;
}

function handleNameEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        savePlayerNameIfPresent();
        document.getElementById('scoreInput').focus();
    }
}

function handleScoreEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        saveScore();
    }
}

document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveScore();
    }
});

function sanitizeScore(rawValue) {
    let value = parseInt(rawValue, 10);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > MAX_SCORE) value = MAX_SCORE;
    return value;
}

function saveScore() {

    const playerName = savePlayerNameIfPresent();

    const scoreInput = document.getElementById('scoreInput');
    const score = sanitizeScore(scoreInput.value);
    scoreInput.value = score;

    const now = new Date();
    const nowISO = now.toISOString();

    let scores = getScores();
    let bestScore = parseInt(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || '0', 10);
    let gamesPlayed = parseInt(localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED) || '0', 10);
    let currentStreak = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_STREAK) || '0', 10);
    let bestStreak = parseInt(localStorage.getItem(STORAGE_KEYS.BEST_STREAK) || '0', 10);
    let lastScore = localStorage.getItem(STORAGE_KEYS.LAST_SCORE);
    lastScore = lastScore === null ? null : parseInt(lastScore, 10);

    if (lastScore === null) {
        currentStreak = 1;
    } else if (score >= lastScore) {
        currentStreak += 1;
    } else {
        currentStreak = 1;
    }
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
    }

    const isNewRecord = score > bestScore;
    if (isNewRecord) {
        bestScore = score;
        localStorage.setItem(STORAGE_KEYS.BEST_SCORE_DATE, nowISO);
    }

    gamesPlayed += 1;
    scores.push({ score: score, date: nowISO });

    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
    localStorage.setItem(STORAGE_KEYS.BEST_SCORE, bestScore);
    localStorage.setItem(STORAGE_KEYS.LAST_SCORE, score);
    localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, nowISO);
    localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, gamesPlayed);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, currentStreak);
    localStorage.setItem(STORAGE_KEYS.BEST_STREAK, bestStreak);

    checkAndUnlockRanks(bestScore);

    showMessage(`Score of ${score} saved!`);

    if (isNewRecord) {
        queuePopup('🏆 New Record!');
    }

    scoreInput.value = 0;

    renderAll();
}

function getRankForScore(score) {
    let current = null;
    for (const rank of RANKS) {
        if (score >= rank.min) {
            current = rank;
        }
    }
    return current;
}

function getNextRank(score) {
    for (const rank of RANKS) {
        if (score < rank.min) {
            return rank;
        }
    }
    return null;
}

function checkAndUnlockRanks(bestScore) {
    const unlocked = getUnlockedRanks();
    let highestRank = localStorage.getItem(STORAGE_KEYS.HIGHEST_RANK) || '';

    for (const rank of RANKS) {
        if (bestScore >= rank.min && !unlocked.includes(rank.name)) {
            unlocked.push(rank.name);
            queuePopup(`${rank.emoji} Achievement Unlocked: ${rank.name}!`);
        }
    }

    const current = getRankForScore(bestScore);
    if (current) {
        highestRank = current.name;
    }

    localStorage.setItem(STORAGE_KEYS.UNLOCKED_RANKS, JSON.stringify(unlocked));
    localStorage.setItem(STORAGE_KEYS.HIGHEST_RANK, highestRank);
}

function getUnlockedRanks() {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_RANKS);
    return raw ? JSON.parse(raw) : [];
}

function getScores() {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORES);
    return raw ? JSON.parse(raw) : [];
}

function renderAll() {
    renderStatsCards();
    renderStatistics();
    renderProgress();
    renderAchievements();
    renderLeaderboard();
    renderHistory();
}

function renderStatsCards() {
    const bestScore = localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || '0';
    const bestScoreDate = localStorage.getItem(STORAGE_KEYS.BEST_SCORE_DATE);
    const lastScore = localStorage.getItem(STORAGE_KEYS.LAST_SCORE) || '0';
    const lastPlayed = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
    const gamesPlayed = localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED) || '0';
    const currentStreak = localStorage.getItem(STORAGE_KEYS.CURRENT_STREAK) || '0';
    const bestStreak = localStorage.getItem(STORAGE_KEYS.BEST_STREAK) || '0';
    const highestRank = localStorage.getItem(STORAGE_KEYS.HIGHEST_RANK);

    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('recordDate').textContent =
        `Record Date: ${bestScoreDate ? formatDateTime(bestScoreDate) : 'Never'}`;

    document.getElementById('lastScore').textContent = lastScore;
    document.getElementById('lastPlayed').textContent =
        lastPlayed ? formatDateTime(lastPlayed) : 'Never';

    document.getElementById('gamesPlayed').textContent = gamesPlayed;
    document.getElementById('streak').textContent = currentStreak;
    document.getElementById('bestStreak').textContent = bestStreak;

    if (highestRank) {
        const rankData = RANKS.find(r => r.name === highestRank);
        document.getElementById('highestRank').textContent =
            rankData ? `${rankData.emoji} ${rankData.name}` : highestRank;
    } else {
        document.getElementById('highestRank').textContent = 'None';
    }
}

function renderStatistics() {
    const scores = getScores().map(s => s.score);

    const total = scores.length;
    const highest = total ? Math.max(...scores) : 0;
    const lowest = total ? Math.min(...scores) : 0;
    const average = total ? (scores.reduce((a, b) => a + b, 0) / total) : 0;
    const median = total ? calculateMedian(scores) : 0;

    const lastFiveEntries = getScores().slice(-5).map(s => s.score);
    const lastFiveAvg = lastFiveEntries.length
        ? (lastFiveEntries.reduce((a, b) => a + b, 0) / lastFiveEntries.length)
        : 0;

    document.getElementById('statHighest').textContent = highest;
    document.getElementById('statLowest').textContent = lowest;
    document.getElementById('statAverage').textContent = average.toFixed(1);
    document.getElementById('statMedian').textContent = median.toFixed(1);
    document.getElementById('statLastFive').textContent = lastFiveAvg.toFixed(1);
    document.getElementById('statTotal').textContent = total;
}

function calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

function renderProgress() {
    const bestScore = parseInt(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || '0', 10);
    const nextRank = getNextRank(bestScore);
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const nextRankText = document.getElementById('nextRankText');

    if (!nextRank) {

        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';
        nextRankText.textContent = '🚀 Maximum rank achieved!';
        return;
    }

    const currentRankIndex = RANKS.indexOf(nextRank);
    const previousThreshold = currentRankIndex > 0 ? RANKS[currentRankIndex - 1].min : 0;

    const range = nextRank.min - previousThreshold;
    const progressInRange = bestScore - previousThreshold;
    let percent = range > 0 ? (progressInRange / range) * 100 : 0;
    percent = Math.max(0, Math.min(100, percent));

    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${Math.round(percent)}%`;
    nextRankText.textContent =
        `Reach ${nextRank.min} points for ${nextRank.emoji} ${nextRank.name}`;
}

function renderAchievements() {
    const unlocked = getUnlockedRanks();
    const list = document.getElementById('achievementList');
    list.innerHTML = '';

    if (unlocked.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No achievements unlocked yet.';
        list.appendChild(li);
        return;
    }

    unlocked.forEach(rankName => {
        const rankData = RANKS.find(r => r.name === rankName);
        const li = document.createElement('li');
        li.textContent = rankData ? `${rankData.emoji} ${rankData.name} Rank Unlocked` : rankName;
        list.appendChild(li);
    });
}

function renderLeaderboard() {
    const scores = getScores();
    const list = document.getElementById('leaderboard');
    list.innerHTML = '';

    if (scores.length === 0) {
        const li = document.createElement('li');
        li.id = 'emptyLeaderboard';
        li.textContent = 'No scores yet. Play your first game!';
        list.appendChild(li);
        return;
    }

    const topTen = [...scores]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];

    topTen.forEach((entry, index) => {
        const li = document.createElement('li');
        const medal = medals[index] ? `${medals[index]} ` : '';
        li.textContent = `${medal}${entry.score} pts — ${formatDateTime(entry.date)}`;
        list.appendChild(li);
    });
}

function renderHistory() {
    const scores = getScores();
    const list = document.getElementById('historyList');
    list.innerHTML = '';

    if (scores.length === 0) {
        const li = document.createElement('li');
        li.id = 'emptyHistory';
        li.textContent = 'No score history available.';
        list.appendChild(li);
        return;
    }

    const newestFirst = [...scores].reverse();

    newestFirst.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.score} pts — ${formatDateTime(entry.date)}`;
        list.appendChild(li);
    });
}

function clearHistory() {
    const confirmed = confirm('Clear all score history? This cannot be undone.');
    if (!confirmed) return;

    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify([]));
    renderAll();
    showMessage('Score history cleared.');
}

function resetData() {
    const confirmed = confirm('Reset ALL data? This will erase your player name, scores, achievements, and settings.');
    if (!confirmed) return;

    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

    document.getElementById('playerName').value = '';
    document.getElementById('scoreInput').value = 0;
    document.getElementById('savedPlayer').textContent = 'None';
    updateWelcomeMessage('');

    applyTheme('dark');
    renderAll();
    showMessage('All data has been reset.');
}

function exportScores() {
    const data = {
        player: localStorage.getItem(STORAGE_KEYS.PLAYER) || 'None',
        bestScore: parseInt(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || '0', 10),
        highestRank: localStorage.getItem(STORAGE_KEYS.HIGHEST_RANK) || 'None',
        gamesPlayed: parseInt(localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED) || '0', 10),
        history: getScores()
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'score-tracker-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage('Scores exported as JSON!');
}

function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent = formatDateTime(now.toISOString());
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function showMessage(text) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    setTimeout(() => {
        if (messageEl.textContent === text) {
            messageEl.textContent = '';
        }
    }, 3000);
}

function queuePopup(text) {
    popupQueue.push(text);
    if (!popupShowing) {
        showNextPopup();
    }
}

function showNextPopup() {
    if (popupQueue.length === 0) {
        popupShowing = false;
        return;
    }

    popupShowing = true;
    const text = popupQueue.shift();
    const popup = document.getElementById('popup');
    popup.textContent = text;
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(showNextPopup, 400);
    }, 2500);
}