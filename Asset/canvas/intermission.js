var intermissions = [
    [],
    /*  L1 */["SCANNING", "DESTINATION"],
    /*  L2 */["SCANNING", "NEXT DESTINATION"],
    /*  L3 */["SCANNING", "NEXT DESTINATION"],
    /*  L4 */["SCANNING", "NEXT DESTINATION"],
    /*  L5 */["SCANNING", "NEXT DESTINATION"],
    /*  L6 */["SCANNING", "NEXT DESTINATION"],
    /*  L7 */["SCANNING", "NEXT DESTINATION"],
    /*  L8 */["SCANNING", "NEXT DESTINATION"],
    /*  L9 */["SCANNING", "NEXT DESTINATION"],
    /* L10 */["SCANNING", "NEXT DESTINATION"],
    /* L11 */["SCANNING", "NEXT DESTINATION"],
    /* L12 */["SCANNING", "NEXT DESTINATION"],
    /* L13 */["SCANNING", "NEXT DESTINATION"],
    /* L14 */["SCANNING", "NEXT DESTINATION"],
    /* L15 */["SCANNING", "NEXT DESTINATION"],
    /* L16 */["SCANNING", "NEXT DESTINATION"],
    /* L17 */["SCANNING", "NEXT DESTINATION"],
    /* L18 */["SCANNING", "NEXT DESTINATION"],
    /* L19 */["SCANNING", "NEXT DESTINATION"],
    /* L20 */["SCANNING", "NEXT DESTINATION"],
    /* L21 */["SCANNING", "NEXT DESTINATION"],
    /* L22 */["SCANNING", "NEXT DESTINATION"],
    /* L23 */["SCANNING", "NEXT DESTINATION"],
    /* L24 */["SCANNING", "NEXT DESTINATION"],
    /* L25 */["SCANNING", "NEXT DESTINATION"],
    /* L26 */["SCANNING", "NEXT DESTINATION"],
    /* L27 */["SCANNING", "NEXT DESTINATION"],
    /* L28 */["SCANNING", "NEXT DESTINATION"],
    /* L29 */["SCANNING", "NEXT DESTINATION"],
    /* L30 */["FINAL DESTINATION", "EARTH"]
];

function initIntermission() {
    state = "intermission";
    intermissionTimer = INTERMISSION_TIMER_TOT;
    finishInstructions();
}

function updateIntermission() {
    if (state == "intermission") {
        if (intermissionTimer > 0) {
            intermissionTimer--;
        } else {
            state = "game";
            resetPlayer();
            resetEnemies(level);
            playerAtCheck(true);
    		initInstructions();
            justLoaded = false;
        }
    }
}

function drawIntermission() {
    drawPlainBg();
    
    // text
    const TEXT_SIZE = 50;
    canvas.fillStyle = "black";
    canvas.font = "bold " + cwh(TEXT_SIZE) + "px Arial";
    canvas.textAlign = "center";
    if (intermissions[level].length == 1) {
        canvas.fillText(intermissions[level][0], cwh(CANVAS_WIDTH / 2) + os.x, cwh(CANVAS_HEIGHT / 2 + INTERMISSION_Y_FIX) + os.y);
    } else if (intermissions[level].length == 2) {
        canvas.fillText(intermissions[level][0], cwh(CANVAS_WIDTH / 2) + os.x, cwh(CANVAS_HEIGHT / 2 - TEXT_SIZE / 2 - INTERMISSION_TEXT_SPACE + INTERMISSION_Y_FIX) + os.y);
        canvas.fillText(intermissions[level][1], cwh(CANVAS_WIDTH / 2) + os.x, cwh(CANVAS_HEIGHT / 2 + TEXT_SIZE / 2 + INTERMISSION_TEXT_SPACE + INTERMISSION_Y_FIX) + os.y);
    } else if (intermissions[level].length == 3) {
        canvas.fillText(intermissions[level][0], cwh(CANVAS_WIDTH / 2) + os.x, cwh(CANVAS_HEIGHT / 2 - (TEXT_SIZE + INTERMISSION_TEXT_SPACE * 2) + INTERMISSION_Y_FIX) + os.y);
        canvas.fillText(intermissions[level][1], cwh(CANVAS_WIDTH / 2) + os.x, cwh(CANVAS_HEIGHT / 2 + INTERMISSION_Y_FIX) + os.y);
        canvas.fillText(intermissions[level][2], cwh(CANVAS_WIDTH / 2) + os.x, cwh(CANVAS_HEIGHT / 2 + (TEXT_SIZE + INTERMISSION_TEXT_SPACE * 2) + INTERMISSION_Y_FIX) + os.y);
    }
}

function drawPlainBg() {
	var color0, color1;
	if (level >= WALLS_RED) {
		color0 = INTERMISSION_COLOR_2_0;
		color1 = INTERMISSION_COLOR_2_1;
	} else if (level >= WALLS_PURPLE) {
		color0 = INTERMISSION_COLOR_1_0;
		color1 = INTERMISSION_COLOR_1_1;
	} else {
		color0 = INTERMISSION_COLOR_0_0;
		color1 = INTERMISSION_COLOR_0_1;
	}
	
    var grad = canvas.createLinearGradient(os.x, os.y, os.x, cwh(CANVAS_HEIGHT - BAR_HEIGHT * 2) + os.y);
    canvas.beginPath();
    canvas.rect(os.x, cwh(BAR_HEIGHT) + os.y, cwh(CANVAS_WIDTH), cwh(CANVAS_HEIGHT - BAR_HEIGHT * 2));
    grad.addColorStop(0, color0);
    grad.addColorStop(1, color1);
    canvas.fillStyle = grad;
    canvas.fill();
}