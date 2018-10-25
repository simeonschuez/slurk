let gameStarted = false;
let trackingArea = "#current-image"
let mouse = {
    click: false,
    move: false,
    pos: {x:false, y:false},
    pos_prev: false,
};
let mousePositions = [];
var audioDescription = document.getElementById('audio-description');
var audioCorrect = document.getElementById('audio-correct');
var audioFalse = document.getElementById('audio-false');

function getPosition (evt, area) {
    position = $(area).offset();
    mouse.pos.x = evt.clientX - position.left;
    mouse.pos.y = evt.clientY - position.top;
}

function emitPosition(a, intrvl) {
    if (mouse.move && mouse.pos_prev) {
        console.log('mouseMove: ' + mouse.pos.x + ',' + mouse.pos.y);
        mousePositions.push({timestamp:Date.now(), x:mouse.pos.x, y:mouse.pos.y});
        mouse.move = false;
    }
    mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
    setTimeout(emitPosition, intrvl);
}

function trackMovement(area,interval) {
    $(area).mousemove(function(e){
        getPosition(e, area);
        mouse.move = true;
    });
    emitPosition(area, interval);
}

socket.on('message', function(data) {
    if (data.user.name == "Image_Click_Bot") {
        console.log("message from image click bot")
        if (data.msg.includes("Correct!")) {
            // play audio, log tracking data, show overlay
            audioCorrect.play();
            $("#image-overlay").show();
            console.log("logging tracking data");
            socket.emit('log', {type: "mouse_positions", data:mousePositions, room: self_room});
            mousePositions = [];
        } else if (data.msg.includes("Try again!")) {
            audioFalse.play();
        } else if (data.msg.includes("Game started!")) {
            gameStarted = true;
            audioCorrect.src="/static/audio/correct.wav";
            audioFalse.src="/static/audio/tryagain.wav";
            console.log("game started:", gameStarted);
        } else if (data.msg.includes("No images left")) {
            gameStarted = false;
            $(".overlay").hide();
            console.log("game started:", gameStarted);
        }
    }
});

socket.on('new_image', function(data) {
    //set_image(data['url']);
    console.log("new image:",data,"Game started:",gameStarted)
    if (gameStarted==true) {
        /* show overlay and hide replayButton if new image is recieved */
        $(".overlay").show();
        $("#replayButton").hide();
    }
  });

socket.on('file_path', function(data) {
    if (data.type == 'audio') {
        audioDescription.src = data.file;
    }
});

// activate mouse tracking
trackMovement(trackingArea, 50);

/* add preload and type attributes to audio elements */
$(".audio").attr({
    preload:"auto",
    type:"audio/wav"
});

/* send coordinates on click */
$(trackingArea).click(function(e){
    getPosition(e, trackingArea);
    console.log('mouseClick: ' + mouse.pos.x + ',' + mouse.pos.y);
    socket.emit('mousePosition', {
        type:'click',
        element:trackingArea,
        coordinates:mouse.pos,
        room: self_room
    });
    socket.emit('log', {type: "mouse_click", coordinates:mouse.pos,element:trackingArea, room: self_room}); //
});

/* if overlay button is clicked: hide overlay and play audio file */
$('#overlay-button').click(function(e){
    getPosition(e, "#overlay-button");
    socket.emit('mousePosition', {
        type:'click',
        element:"#overlay-button",
        coordinates:mouse.pos,
        room: self_room
    })
    socket.emit('log', {type: "mouse_click", coordinates:mouse.pos,element:"#overlay-button", room: self_room});
    $(".overlay").hide();
    $("#replayButton").show();
    /* play transmitted audio file after 500 ms */
    setTimeout(function(){
        audioDescription.play();}, 500);
});

/* play audio if replay button is clicked */
$("#replayButton").click(function(){
    audioDescription.play();
})
