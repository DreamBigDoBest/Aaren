function hotkeys() {
//All Hotkey Handling Being Removed
}

function directLevelSelection(level_selection) {
            playSFX(sfx_intermission);
            player.dying = false;
            paused = false;
            level = level_selection;
            gameTimer = 0;
            deaths = 0;
            coinsSave = [-99];
            localStorage.setItem("whg_level", level);
            localStorage.setItem("whg_deaths", deaths);
            localStorage.setItem("whg_gameTimer", gameTimer);
            localStorage.setItem("whg_curCheck", 0);
            localStorage.setItem("whg_coins", "[-99]");
            justLoaded = false;
            initIntermission();
}