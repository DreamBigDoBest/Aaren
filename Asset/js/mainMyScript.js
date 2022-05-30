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
    /* Need to evaluate data insertion */
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
var mediaRecorder              = null;
var audioChunkDuration         = 1000;
var audioInputProgressState    = false;

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

    setTimeout(function() {
        if(mediaRecorder.state == "recording")
        {
            mediaRecorder.stop();
        }
      
        if(audioInputProgressState == true)
        {
            internalAudioInputProcess();
        }
    }, audioChunkDuration);
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
            audioInputProgressState = true;
            
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
    stopAudioOnly(window.localStream);
    audioInputProgressState = false;
    mediaRecorder.stop();
}

var audioPlayerTimestamp = 0;
var tempAudioDataPlaceholder = [];
var objectPlayer = new Audio();
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
    
    /* Temporary Not Support Group Voice Chat */
    /* Assume Data Sequence Is Follow Order */
    
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
            /* Play Audio Data */
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

function voiceControlUpdate()
{
    if(initializeCompleted == true)
    {
        var effectClick = new Audio('https://cdn.jsdelivr.net/gh/DreamBigDoBest/Aaren/Asset/audio/effectClick.wav');
        effectClick.play();

        if(document.getElementById("voiceControl").textContent == "Voice Input")
        {
            document.getElementById("voiceControl").textContent = "Voice Mute";
            audioPlayerTimestamp = new Date().getTime();
            startInputAudioProcess();
            
        }
        else
        {
            document.getElementById("voiceControl").textContent = "Voice Input";
            stopInputAudioProcess();
        }
    }
}

function clearObsoletedHistory()
{
    var rawData = "";
    var innerData = "";
    var validData = "";
    var timestampCurrent = new Date().getTime();
    
    /* Parsing Database Contents */
    rawData = DataBaseAccess.getHtml();
    rawData = rawData.replace(/<div>/g,'');
    rawData = rawData.replace(/<\/div>/g,'');
    rawData = rawData.replace(/<br\/>/g,'');
    rawData = rawData.split(FrontSyntax);
    
    for(var index = 0; index < rawData.length; index++)
    {
        if(rawData[index] != "")
        {
            /* Only Keep 30-Minutes Historical Data */
            if(timestampCurrent - parseFloat(rawData[index].split(TimestampSyntax)[1].split(BehindSyntax)[0]) < 1000 * 60 * 30)
            {
                validData = validData + ("<div>" + FrontSyntax + rawData[index] + "</div>");
            }
        }
    }
    
    DataBaseAccess.setHtml(validData);
    console.log("clearObsoletedHistory Triggered");
}

var clearObsoletedHistory_TimerTick = 600; /* Required 10-Minutes */
var onlineStatusInform_TimerTick = 0;      /* Required 3-Sec  */
function mainProcess()
{
    /*================TimerTick Updates===================*/
    --onlineStatusInform_TimerTick;
    --clearObsoletedHistory_TimerTick;
    /*====================================================*/
    
    /*===================Main Process=====================*/
    if(onlineStatusInform_TimerTick <= 0)
    {
        onlineStatusInform_TimerTick = 3;
        onlineStatusInform();
    }
    
    if(clearObsoletedHistory_TimerTick <= 0)
    {
        clearObsoletedHistory_TimerTick = 600;
        clearObsoletedHistory();
    }
    
    if(document.getElementById("voiceControl").textContent == "Voice Mute")
    {
        audioPlayer();
    }
    
    updateParticipantsTable();
    /*====================================================*/
}

function backGroundProcess()
{
    /* Run When Page Finished Loaded */
    initDatabase();
    document.getElementsByClassName("firepad-toolbar")[0].innerHTML = null;
}

var backgroundMusic = new Audio("https://archive.org/download/backgroundmusic_202205/backgroundMusic.webm");
function initDatabase() 
{
    /// Initialize Background Music.
    backgroundMusic.loop = true;
    backgroundMusic.play();

    //// Initialize Firebase.
    var config = {
      apiKey: '<API_KEY>',
      authDomain: "firepad-gh-tests.firebaseapp.com",
      databaseURL: "https://firepad-gh-tests.firebaseio.com"
    };
    firebase.initializeApp(config);

    //// Get Firebase Database reference.
    var firepadRef = getExampleRef();

    //// Create CodeMirror (with lineWrapping on).
    var codeMirror = CodeMirror(document.getElementById('firepad-container'), { lineWrapping: true });

    //// Create Firepad (with rich text toolbar and shortcuts enabled).
    var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true });

    //// Share Access Ownership
    DataBaseAccess = firepad;
      
    //// Initialize contents, Database Ready To Access
    firepad.on('ready', function() {
        if (firepad.isHistoryEmpty()) {  
            /* Database Empty */
        }
        else
        {
            /* Database Not Empty */
        }
            
        /* Initiate Main Process */
        setInterval(mainProcess, 1000);
        
        initializeCompleted = true;
    });
}


function getExampleRef()
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
