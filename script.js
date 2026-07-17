let best =
    Number(
        localStorage.getItem("bestScore")
    ) || 0;

let player =
    localStorage.getItem("playerName")
    || "None";

document.getElementById(
    "bestScore"
).innerText = best;

document.getElementById(
    "savedPlayer"
).innerText = player;

updateProgress(best);

function saveScore() {

    const name =
        document.getElementById(
            "playerName"
        ).value.trim();

    const score =
        Number(
            document.getElementById(
                "scoreInput"
            ).value
        );

    if (!score && score !== 0) {
        return;
    }

    if (name) {

        localStorage.setItem(
            "playerName",
            name
        );

        document.getElementById(
            "savedPlayer"
        ).innerText = name;
    }

    let message = "";

    if (score > best) {

        best = score;

        localStorage.setItem(
            "bestScore",
            best
        );

        document.getElementById(
            "bestScore"
        ).innerText = best;

        message =
            "🎉 New Personal Best!";
    }

    const achievements = [];

    if (score >= 10)
        achievements.push(
            "🥉 Beginner"
        );

    if (score >= 50)
        achievements.push(
            "🥈 Skilled"
        );

    if (score >= 100)
        achievements.push(
            "🥇 Master"
        );

    document.getElementById(
        "achievementList"
    ).innerHTML =
        achievements
        .map(
            a => `<li>${a}</li>`
        )
        .join("");

    updateProgress(score);

    document.getElementById(
        "message"
    ).innerText =
        message || "Score Saved";
}

function updateProgress(score) {

    let maxScore = 10;
    let nextRank = "🥉 Beginner";

    if (
        score >= 10 &&
        score < 50
    ) {

        maxScore = 50;
        nextRank = "🥈 Skilled";
    }

    else if (
        score >= 50 &&
        score < 100
    ) {

        maxScore = 100;
        nextRank = "🥇 Master";
    }

    else if (
        score >= 100
    ) {

        maxScore = 100;
        nextRank = "🏆 Max Rank";
    }

    const progress =
        Math.min(
            (score / maxScore) * 100,
            100
        );

    document.getElementById(
        "progressBar"
    ).style.width =
        progress + "%";

    document.getElementById(
        "nextRankText"
    ).innerText =
        "Next Rank: " +
        nextRank;
}

function resetData() {

    const confirmed =
        confirm(
            "Are you sure you want to reset all data?"
        );

    if (confirmed) {

        localStorage.clear();

        location.reload();
    }
}