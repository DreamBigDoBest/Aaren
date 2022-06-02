/* Global Instance */
var initializeCompleted = false;
var DataBaseAccess      = 0;
var FrontSyntax         = "#@#@#";
var TimestampSyntax     = "@###@";
var BehindSyntax        = "@#@#@";

function parseStringTag(tag, timestamp)
{
    var rawData = "";
    var innerData = "";
    var outputData = [];
    var timestampOnline = new Date().getTime();
    
    /* Parsing Database Contents */
    rawData = DataBaseAccess.getHtml();
    rawData = rawData.replace(/<div>/g,'');
    rawData = rawData.replace(/<\/div>/g,'');
    rawData = rawData.replace(/<br\/>/g,'');
    
    /* Split All Line Into Array */
    rawData = rawData.split(FrontSyntax);
    for(var index = 0; index < rawData.length; index++)
    {
        if(rawData[index] != "")
        {
            innerData = rawData[index].split(BehindSyntax);
            if(innerData[0].split(TimestampSyntax)[0] == tag)
            {
                switch(tag)
                {
                    case "user":
                        /* Read User History Less Than 10-Seconds */
                        if((timestampOnline - parseFloat(innerData[0].split(TimestampSyntax)[1])) < 1000 * 10)
                        {
                            if((outputData.includes(innerData[1]) == false) &&
                               (innerData[1].includes("&nbsp") == false))
                            {
                                outputData.push(innerData[1]);
                            }
                        }
                        break;
                    case "audio":
                        /* Only Read Newer Audio Buffer */
                        if(timestamp < parseFloat(innerData[0].split(TimestampSyntax)[1]))
                        {
                            if(innerData[1].split(":AudioData:")[0] != localStorage.getItem("username"))
                            {
                                outputData.push("timestamp" + innerData[0].split(TimestampSyntax)[1]);
                                outputData.push(innerData[1].split(":AudioData:")[1]);
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
    
    return outputData;
}

function getStringTag(tag, input)
{
    var timestamp = new Date().getTime();
    
    if(tag == "user")
    {
        return "<div>" + FrontSyntax + tag + TimestampSyntax + timestamp + BehindSyntax + input + "</div>";
    }
    else if(tag == "audio")
    {
        return "<div>" + FrontSyntax + tag + TimestampSyntax + timestamp + BehindSyntax + localStorage.getItem("username") + ":AudioData:" + input + "</div>";
    }
    else
    {
        return "";
    }
}

function updateDatabase(tag, input)
{
    /* Data Insertion At Position-0 */
    DataBaseAccess.insertHtml(0 , "<div><br/></div>" + getStringTag(tag, input) + "<div><br/></div>");
}


function onlineStatusInform()
{
    updateDatabase("user", localStorage.getItem("username"));
}

function updateParticipantsTable()
{
    var userOnline = parseStringTag("user", 0);
    
    /* Clear Table */
    for (var index = 0; index < document.getElementsByTagName("table")[0].children[0].rows.length - 1; index++)
    {
        document.getElementsByTagName("table")[0].children[0].rows[index+1].children[0].innerText = ' ';
    }
    
    /* Update Table */
    for (var index = 0; index < userOnline.length ; index++)
    {
        if(index < document.getElementsByTagName("table")[0].children[0].rows.length - 1)
        {
            document.getElementsByTagName("table")[0].children[0].rows[index+1].children[0].innerText = userOnline[index];
        }
    }
}

/* Audio Input Instance */
var mediaRecorder = null;
var audioInputProgress = false;

function internalAudioInputProcess()
{
    mediaRecorder = new MediaRecorder(window.localStream, {mimeType: 'audio/webm; codecs=opus'});
    mediaRecorder.start();
            
    mediaRecorder.ondataavailable = function(e) {
                var blob = e.data;
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function() {
                    var data = reader.result.split(";base64,")[1];
                    audioDataPackaging(encodeURIComponent(data));
                }
            }
}

function startInputAudioProcess()
{
    /* Query User Permission For Audio Input */
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    {
        console.log('getUserMedia Supported');
        navigator.mediaDevices.getUserMedia ({audio: true, video: false})
        .then(function(stream){
        
            /* Store the input stream */
            window.localStream = stream;
            
            /* Perform Internal Audio Handling */
            internalAudioInputProcess();
        })
        .catch(function(err) {
            console.log('The Following getUserMedia error occurred: ' + err);
        });
    }
    else
    {
        console.log('getUserMedia Not Supported On Your Browser !!!');
    }
    
    /* Update Input Progress State */
    audioInputProgress = true;
}

function audioDataPackaging(data)
{
    updateDatabase("audio", data);
}

function stopBothVideoAndAudio(stream)
{
    stream.getTracks().forEach(function(track)
    {
        if(track.readyState == 'live')
        {
            track.stop();
        }
    });
}

function stopVideoOnly(stream)
{
    stream.getTracks().forEach(function(track)
    {
        if(track.readyState == 'live' && track.kind == 'video')
        {
            track.stop();
        }
    });
}

function stopAudioOnly(stream)
{
    stream.getTracks().forEach(function(track)
    {
        if(track.readyState == 'live' && track.kind == 'audio')
        {
            track.stop();
        }
    });
}

function stopInputAudioProcess()
{
    /* Update Input Progress State */
    audioInputProgress = false;
    mediaRecorder.stop();
    stopAudioOnly(window.localStream);
}


/* Audio Player Instance */
var audioPlayerTimestamp = 0;
var tempAudioDataPlaceholder = [];
var objectPlayer = new Audio();

/* Keep Continue Playing Until All Audio Within Placeholder Finished */
objectPlayer.addEventListener("ended", function(){
    if(tempAudioDataPlaceholder.length > 0)
    {
        objectPlayer.src = "data:audio/wav;base64," + tempAudioDataPlaceholder.shift();
        objectPlayer.load();
        objectPlayer.play();
    }
});

function audioPlayer()
{
    var audioData = parseStringTag("audio", audioPlayerTimestamp);
    
    /* Audio Data Sequence Shall Follow Line Order */
    for(var index = 0; index < audioData.length; index++)
    {
        /* Query Timestamp Data */
        if(audioData[index].includes("timestamp") == true)
        {
            if(audioPlayerTimestamp < parseFloat(audioData[index].split("timestamp")[1]))
            {
                /* Stored Latest Audio Buffer Timestamp */
                audioPlayerTimestamp = parseFloat(audioData[index].split("timestamp")[1]);
            }
        }
    }
    
    for(var index = 0; index < audioData.length; index++)
    {
        /* Query Audio data */
        if(audioData[index].includes("timestamp") == false)
        {
            /* Push Audio Data To Temporary Placeholder */
            tempAudioDataPlaceholder.push(audioData[index]);
        }
    }
    
    /* Initiate Audio Playback */
    if(tempAudioDataPlaceholder.length > 0)
    {
        if(objectPlayer.paused == true)
        {
            objectPlayer.src = "data:audio/wav;base64," + tempAudioDataPlaceholder.shift();
            objectPlayer.load();
            objectPlayer.play();
        }
    }
}

var effectStartInput = new Audio('https://cdn.jsdelivr.net/gh/DreamBigDoBest/Aaren/Asset/audio/effectStartInput.mp3');
var effectEndInput = new Audio('https://cdn.jsdelivr.net/gh/DreamBigDoBest/Aaren/Asset/audio/effectEndInput.mp3');
var inputDetectionCount = 0;
function inputContinousDetectionProcess()
{
    inputDetectionCount = inputDetectionCount - 1;
                                                            
    /* Every 1-Sec Verify Input Status */
    if(inputDetectionCount <= 0)
    {
        inputDetectionCount = 0;
        voiceControlUpdate("END");
    }
    else
    {
        setTimeout(inputContinousDetectionProcess, 1000);
    }
}

function voiceControlUpdate(param)
{
    if(initializeCompleted == true)
    {
        /* Input Key Continuous Detection */
        if(param == "START")
        {
            inputDetectionCount = 3;
        }
        else if(param == "END")
        {
            inputDetectionCount = 0;
        }
        
        /* Trigger Audio Process Base On Input */
        if((param == "START") && (audioInputProgress == false))
        {
            /* Start Audio Input Effect */
            effectStartInput.play();
            
            startInputAudioProcess();
            console.log("Start Input Audio Process...");
            
            /* Start Detect Continous Input */
            inputContinousDetectionProcess();
        }
        else if((param == "END") && (audioInputProgress == true))
        {
            /* End Audio Input Effect */
            effectEndInput.play();
            
            stopInputAudioProcess();
            console.log("Stop Input Audio Process...");
        }
    }
}

function clearObsoletedHistory()
{
    DataBaseAccess.richTextCodeMirror_.historicalDataCleanup();
    console.log("clearObsoletedHistory Triggered");
}

var clearObsoletedHistory_TimerTick = 30;  /* Default 30-Sec , Required 30-Sec */
var onlineStatusInform_TimerTick = 0;      /* Default  0-Sec , Required 3-Sec  */
var playReceiverAudio_TimerTick = 1;       /* Default  1-Sec , Required 1-Sec  */
function mainProcess()
{
    /*================TimerTick Updates===================*/
    --onlineStatusInform_TimerTick;
    --clearObsoletedHistory_TimerTick;
    --playReceiverAudio_TimerTick;
    /*====================================================*/
    
    /*===================Main Process=====================*/
    if(onlineStatusInform_TimerTick <= 0)
    {
        onlineStatusInform_TimerTick = 3;
        onlineStatusInform();
    }
    
    if(clearObsoletedHistory_TimerTick <= 0)
    {
        clearObsoletedHistory_TimerTick = 30;
        clearObsoletedHistory();
    }
    
    if(playReceiverAudio_TimerTick <= 0)
    {
        playReceiverAudio_TimerTick = 1;
        audioPlayer();
    }
    
    updateParticipantsTable();
    /*====================================================*/
}

var backgroundMusic = new Audio("https://archive.org/download/backgroundmusic_202205/backgroundMusic.webm");
function backGroundProcess()
{
    if(localStorage.getItem("login-token") == "28021990")
    {
        localStorage.setItem("login-token", "");
    }
    else
    {
        window.location.replace("index.html");
        return;
    }
    
    
    /* Run When Page Finished Loaded */
    backgroundMusic.loop = true;
    backgroundMusic.play();
    
    initDatabase();
    initInputKey();
    document.getElementById("ButtonControl").textContent = "Connecting...";
    document.getElementsByClassName("firepad-toolbar")[0].innerHTML = null;
}


function initDatabase() 
{
    //// Initialize Firebase
    var config = {
      apiKey: '<API_KEY>',
      authDomain: "firepad-gh-tests.firebaseapp.com",
      databaseURL: "https://firepad-gh-tests.firebaseio.com"
    };
    firebase.initializeApp(config);

    //// Get Firebase Database reference.
    var firepadRef = getDatabaseRef();

    //// Create CodeMirror (with lineWrapping on).
    var codeMirror = CodeMirror(document.getElementById('firepad-container'), { lineWrapping: true });

    //// Create Firepad (with rich text toolbar and shortcuts enabled).
    var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true });

    //// Share Access Ownership
    DataBaseAccess = firepad;
    
    //// Create Ad-Hoc Function For Database Cleanup
    DataBaseAccess.richTextCodeMirror_.historicalDataCleanup = function(){
        var t = this.codeMirror,
            e = t.getCursor(),
            r = t.getLine(e.line),
            n = this.areLineSentinelCharacters_(r),
            i = t.getLine(t.lineCount() - 1);
        
        /* Reached 50 Historical Data Line */
        if(t.lineCount() > 50)
        {
            /* Clear Bottom Old Data */
            t.replaceRange("", {line: t.lineCount() - 20, ch: 0}, {line: t.lineCount(), ch: 0}, "+input");
        }
    }
      
    //// Initialize Contents When Database Ready To Access
    firepad.on('ready', function() {
        if (firepad.isHistoryEmpty()) {  
            /* Database Empty */
        }
        else
        {
            /* Database Not Empty */
        }

        /* Initialize All Global State */
        audioPlayerTimestamp = new Date().getTime(); // Only Play Newly Received Audio
        initializeCompleted = true; // Set Database Ready To Access State
        
        /* Initiate Main Process */
        setInterval(mainProcess, 1000);
        document.getElementById("ButtonControl").textContent = "Connected ";
    });
}

function getDatabaseRef()
{
    // Helper to get hash from end of URL or generate a random one.
    var ref = firebase.database().ref();
    //var hash = window.location.hash.replace(/#/g, '');
    var hash = "-N2kk6d7vxxThsGc8-sM";
    
    if (hash) {
        ref = ref.child(hash);
    } else {
        ref = ref.push(); // generate unique location.
        window.location = window.location + '#' + ref.key; // add it as a hash to the URL.
    }
    
    if (typeof console !== 'undefined') {
        console.log('Firebase data: ', ref.toString());
    }
    
    return ref;
}


function initInputKey()
{
    window.onkeydown = function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
            
        switch(code)
        {
            case 32: /* Space */
                voiceControlUpdate("START");
                break;
            default:
                break;
        }
    }

    window.onkeyup = function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
            
        switch(code)
        {
            case 32: /* Space */
                voiceControlUpdate("END");
                break;
            default:
                break;
        }
    }
}
