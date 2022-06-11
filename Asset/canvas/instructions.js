var instructions = [
	[-1, "", CANVAS_WIDTH / 2],
	[2, "Required To Collect All Signal Data...", CANVAS_WIDTH / 2],
	[3, "Sometimes there's extra checkpoints to help out.", CANVAS_WIDTH / 2],
	[4, "", CANVAS_WIDTH / 4],
	[6, "", CANVAS_WIDTH / 2]
];

var speechLevel1 = new Audio('https://cdn.jsdelivr.net/gh/DreamBigDoBest/Aaren/Asset/audio/speechLevel1.mp3');
speechLevel1.addEventListener("ended", function(){
    setTimeout(function(){backgroundMusic.play();},1000);
});
var speechLevel2 = new Audio('https://cdn.jsdelivr.net/gh/DreamBigDoBest/Aaren/Asset/audio/speechLevel2.mp3');
speechLevel2.addEventListener("ended", function(){
    setTimeout(function(){backgroundMusic.play();},1000);
});

function initInstructions() {
	instrForLevel = null;
	for (var i = 0; i < instructions.length; i++) {
		if (instructions[i][0] == level) {
			instrForLevel = i;
			break;
		}
	}
	if (instrForLevel != null) {
		instructionsOn = true;
		instructionsWaiting = true;
		instructionsFadingIn = false;
		instructionsFadingOut = false;
		instructionsTimer = 0;
		instructionsAlpha = 0;
	}
    
    
    if(level == 1)
    {
       backgroundMusic.pause();
       speechLevel1.play();
    }
    else if(level == 2)
    {
       backgroundMusic.pause();
       speechLevel2.play();
    }
}

function updateInstructions() {
	if (instructionsOn && instrForLevel != null) {
		if (instructionsWaiting) {
			if (instructionsTimer < INSTRUCTIONS_WAIT_TIME_TOT) {
				instructionsTimer++;
			} else {
				instructionsTimer = 0;
				instructionsAlpha = 0;
				instructionsFadingIn = true;
				instructionsFadingOut = false;
				instructionsWaiting = false;
			}
		}
		else if (instructionsFadingIn) {
			if (instructionsAlpha < 1) {
				instructionsAlpha += INSTRUCTIONS_FADE_IN_SPEED;
			} else {
				instructionsAlpha = 1;
				instructionsTimer = 0;
				instructionsFadingIn = false;
				instructionsFadingOut = false;
				instructionsWaiting = false;
			}
		} else if (!instructionsFadingIn &&
				   !instructionsFadingOut &&
				   !instructionsWaiting) {
			if (instructionsTimer < INSTRUCTIONS_TIMER_TOT) {
				instructionsTimer++;
			} else {
				instructionsFadingIn = false;
				instructionsFadingOut = true;
				instructionsWaiting = false;
				instructionsTimer = 0;
				instructionsAlpha = 1;
			}
		} else if (instructionsFadingOut) {
			if (instructionsAlpha > 0) {
				instructionsAlpha -= INSTRUCTIONS_FADE_OUT_SPEED;
				if(instructionsAlpha<0){
					instructionsAlpha = 0;
				}
			} else {
				finishInstructions();
			}
		}
	}
}

function drawInstructions() {
	if (instrForLevel != null) {
		canvas.fillStyle = INSTRUCTIONS_COLOR + instructionsAlpha + ")";
		canvas.font = "Bold " + cwh(INSTRUCTIONS_TEXT_SIZE) + "px Arial";
		canvas.textAlign = "center";
		if (instructions[instrForLevel].length == 3) {
			canvas.fillText(instructions[instrForLevel][1], cwh(instructions[instrForLevel][2]) + os.x, cwh(INSTRUCTIONS_Y_0) + os.y);
		} else if (instructions[instrForLevel].length == 4) {
			canvas.fillText(instructions[instrForLevel][1], cwh(instructions[instrForLevel][3]) + os.x, cwh(INSTRUCTIONS_Y_0) + os.y);
			canvas.fillText(instructions[instrForLevel][2], cwh(instructions[instrForLevel][3]) + os.x, cwh(INSTRUCTIONS_Y_1) + os.y);
		}
	}
}

function finishInstructions() {
	instructionsOn = false;
	instructionsFadingIn = false;
	instructionsFadingOut = false;
	instructionsWaiting = false;
	instructionsTimer = 0;
	instructionsAlpha = 0;
	instrForLevel = null;
}