/* Input Key Event Initialization */
var keyLEFT     = new KeyboardEvent("keydown", {keyCode: 37});
var keyLEFTEND  = new KeyboardEvent("keyup",   {keyCode: 37});
var keyUP       = new KeyboardEvent("keydown", {keyCode: 38});
var keyUPEND    = new KeyboardEvent("keyup",   {keyCode: 38});
var keyRIGHT    = new KeyboardEvent("keydown", {keyCode: 39});
var keyRIGHTEND = new KeyboardEvent("keyup",   {keyCode: 39});
var keyDOWN     = new KeyboardEvent("keydown", {keyCode: 40});
var keyDOWNEND  = new KeyboardEvent("keyup",   {keyCode: 40});

var keyLEFTEventTimer  = 0;
var keyLEFTCounter     = 0;
var keyUPEventTimer    = 0;
var keyUPCounter       = 0;
var keyRIGHTEventTimer = 0;
var keyRIGHTCounter    = 0;
var keyDOWNEventTimer  = 0;
var keyDOWNCounter     = 0;

function clearTrigger()
{
    keyLEFTCounter     = 0;
    keyUPCounter       = 0;
    keyRIGHTCounter    = 0;
    keyDOWNCounter     = 0;
    clearTimeout(keyLEFTEventTimer);  // Clear Previous Timer
    clearTimeout(keyUPEventTimer);    // Clear Previous Timer
    clearTimeout(keyRIGHTEventTimer); // Clear Previous Timer
    clearTimeout(keyDOWNEventTimer);  // Clear Previous Timer
    document.dispatchEvent(keyLEFTEND);
    document.dispatchEvent(keyUPEND);
    document.dispatchEvent(keyRIGHTEND);
    document.dispatchEvent(keyDOWNEND);
}

function trigger(direction)
{
    document.dispatchEvent(direction);
    switch(direction)
    {
        case keyLEFT:
            clearTimeout(keyLEFTEventTimer); // Clear Previous Timer
            keyLEFTCounter = keyLEFTCounter + 50;
            keyLEFTEventTimer  = setTimeout(function(){trigger(keyLEFTEND);keyLEFTCounter=0;},keyLEFTCounter);
            break;
        case keyUP:
            clearTimeout(keyUPEventTimer);    // Clear Previous Timer
            keyUPCounter = keyUPCounter + 50;
            keyUPEventTimer    = setTimeout(function(){trigger(keyUPEND);keyUPCounter=0;},keyUPCounter);
            break;
        case keyRIGHT:
            clearTimeout(keyRIGHTEventTimer); // Clear Previous Timer
            keyRIGHTCounter = keyRIGHTCounter + 50;
            keyRIGHTEventTimer = setTimeout(function(){trigger(keyRIGHTEND);keyRIGHTCounter=0;},keyRIGHTCounter);
            break;
        case keyDOWN:
            clearTimeout(keyDOWNEventTimer);  // Clear Previous Timer
            keyDOWNCounter = keyDOWNCounter + 50;
            keyDOWNEventTimer  = setTimeout(function(){trigger(keyDOWNEND);keyDOWNCounter=0;},keyDOWNCounter);
            break;
        default:
            break;
    }
    
}

function moveLEFT()
{
    trigger(keyLEFT);
}

function moveUP()
{
    trigger(keyUP);
}

function moveRIGHT()
{
    trigger(keyRIGHT);
}

function moveDOWN()
{
    trigger(keyDOWN);
}

function moveSTOP()
{
    clearTrigger();
}

function moveBOOST()
{
    /* Warning: Don't Attempt To Cheat Hack This, You Will Get Banned !!! */
    const INIT_SPEED = 6;var PLAYER_TRACE = 5;PLAYER_SPEED = 6;var PLAY_SPEED = 3;const SPEED_PLAYER = 3;setTimeout(function(){const INIT_SPEED = 3;var PLAYER_TRACE = 4;PLAYER_SPEED = 3;var PLAY_SPEED = 6;const SPEED_PLAYER = 6;}, 500);
}

function radarDETECT(target)
{
    var detection_result = [];
    switch(target)
    {
        case "SPACESHIP":
            var object = {x:0,y:0};
            object.x = player.x;      //Accurate, No Offset Needed
            object.y = player.y - 14; //Offset(14)
            detection_result.push(object);
            break;
        case "METEOROID":
            for (var i = 0; i < enemies[level].length; i++) {
                var object = {x:0,y:0};
                object.x = enemies[level][i].x;
                object.y = enemies[level][i].y;
                detection_result.push(object);
            }
            break;
        case "SIGNAL":
            for (var i = 0; i < coins[level].length; i++) {
                if(coins[level][i].gathered == false)
                {
                    var object = {x:0,y:0};
                    object.x = coins[level][i].x;
                    object.y = coins[level][i].y;
                    detection_result.push(object);
                }
            }
            break;
        case "CHECKPOINT":
            for (var i = 0; i < checkpoints[level].length; i++) {
                var object = {x:0,y:0};
                object.x = (checkpoints[level][i][0] * cwh(TILE_SIZE) + os.x) + (((checkpoints[level][i][2] * cwh(TILE_SIZE)) - 1) / 2);
                object.y = (checkpoints[level][i][1] * cwh(TILE_SIZE) + os.y) + (((checkpoints[level][i][3] * cwh(TILE_SIZE)) - 1) / 2);
                detection_result.push(object);
            }
            break;
        case "DESTINATION":
            for (var i = 0; i < checkpoints[level].length; i++) {
                if (checkpoints[level][i][4] == true)
                {
                    var object = {x:0,y:0};
                    object.x = (checkpoints[level][i][0] * cwh(TILE_SIZE) + os.x) + (((checkpoints[level][i][2] * cwh(TILE_SIZE)) - 1) / 2);
                    object.y = (checkpoints[level][i][1] * cwh(TILE_SIZE) + os.y) + (((checkpoints[level][i][3] * cwh(TILE_SIZE)) - 1) / 2);
                    detection_result.push(object);
                }
            }
            break;
        default:
            console.log("Invalid Detection Target !!!");
            break;
    }
    
    return detection_result;
}