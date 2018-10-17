let gameStarted = false;
let trackingArea = "#current-image"
let mouse = {
    click: false,
    move: false,
    pos: {x:false, y:false},
    pos_prev: false,
};

function getPosition (evt, area) {
    position = $(area).offset();
    mouse.pos.x = evt.clientX - position.left;
    mouse.pos.y = evt.clientY - position.top;
}

function emitPosition(a, intrvl) {
    if (mouse.move && mouse.pos_prev) {
        socket.emit('mouseMove', {coordinates: [ mouse.pos, mouse.pos_prev ],element:a, room: self_room, user: users});
        socket.emit('log', {type: "mouse_move",coordinates:{pos:mouse.pos,pos_prev:mouse.pos_prev},element:a,room:self_room});
        mouse.move = false;
        // console.log('mouseMove: ' + mouse.pos.x + ',' + mouse.pos.y)
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
        if (data.msg.includes("Game started!")) {
            gameStarted = true;
            console.log("game started:", gameStarted);
        } else if (data.msg.includes("No images left")) {
            gameStarted = false;
            console.log("game started:", gameStarted);
        }
    }
});

socket.on('new_image', function(data) {
    console.log("New image:", data);
    set_image(data['url']);
    console.log("new image. game started:",gameStarted)
    if (gameStarted==true) {
        /* show overlay and hide replayButton if new image is recieved */
        $(".overlay").show();
        $("#replayButton").hide();
    }
  });

socket.on('file_path', function(data) {
    if (data.type == 'audio') {
        $("#audio").attr("src", data.file);
    }
});

// activate mouse tracking
trackMovement("#current-image", 50);

/* send coordinates on click */
$(trackingArea).click(function(e){
    getPosition(e, trackingArea);
    // console.log('mouseClick: ' + mouse.pos.x + ',' + mouse.pos.y);
    socket.emit('mouseClick', {coordinates: mouse.pos,element:trackingArea, room: self_room});
    socket.emit('log', {type: "mouse_click", coordinates:mouse.pos,element:trackingArea, room: self_room});
});

/* if overlay button is clicked: hide overlay and play audio file */
$('#overlay-button').click(function(e){
    getPosition(e);
    socket.emit('mouseClick', {coordinates: mouse.pos,element:"#overlay-button", room: self_room});
    socket.emit('log', {type: "mouse_click", coordinates:mouse.pos,element:"#overlay-button", room: self_room});

    $(".overlay").hide();
    $("#replayButton").show();
    /* play transmitted audio file after 500 ms */
    setTimeout(function(){document.getElementById("audio").play(); }, 500);
});

/* play audio if replay button is clicked */
$("#replayButton").click(function(){
    document.getElementById('audio').play();
})
