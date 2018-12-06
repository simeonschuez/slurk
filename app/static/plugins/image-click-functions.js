let gameStarted = false;
let trackingArea = "#current-image"
let mouse = {
    click: false,
    move: false,
    pos: {x:false, y:false}
};
let mousePositions = [];
var audioDescription = document.getElementById('audio-description');
var audioCorrect = document.getElementById('audio-correct');
var audioFalse = document.getElementById('audio-false');
let image = document.getElementById("current-image")
var imgWrapper = document.getElementById('image-wrapper');
var sidebar = document.getElementById('sidebar');

/* Event listener */

document.addEventListener("fullscreenchange", fullscreenChange );
// cross browser compatibility for Firefox; Chrome/Safari/Opera; IE/Edge
document.addEventListener("mozfullscreenchange", fullscreenChange );
document.addEventListener("webkitfullscreenchange", fullscreenChange );
document.addEventListener("msfullscreenchange", fullscreenChange );

/* Function definitions */

function getPosition (evt, area) {
    position = $(area).offset();
    mouse.pos.x = evt.clientX - position.left;
    mouse.pos.y = evt.clientY - position.top;
}

function emitPosition(a, intrvl) {
  if (mouse.move) {
      mousePositions.push({
          timestamp:Date.now(),
          x:mouse.pos.x,
          y:mouse.pos.y
        });
      mouse.move = false;
  }
}

function trackMovement(area,interval) {
    $(area).mousemove(function(e){
        getPosition(e, area);
        mouse.move = true;
    });
    setInterval(emitPosition,interval,area)
}

function centerImage() {
    imgWrapper.style.left = ((sidebar.offsetWidth/2)-(imgWrapper.offsetWidth/2));
}

function enterFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
    // cross browser compatibility for Firefox; Chrome/Safari/Opera; IE/Edge
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
    // cross browser compatibility for Firefox; Chrome/Safari/Opera; IE/Edge
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function fullscreenChange () {
    if (gameStarted == true) {
        console.log("fullscreen change, game still running")
    }
}

function logMouseData() {
    $("#image-overlay").fadeIn(200);
    $(".img-button").fadeOut(200);
    console.log("logging tracking data");
    socket.emit('log', {type: "mouse_positions", data:mousePositions, room: self_room});
    mousePositions = [];
}

/* Socket events */

socket.on('message', function(data) {
    if (data.user.name == "Image_Click_Bot") {
        console.log("message from image click bot")
        if (data.msg.includes("Correct!")) {
            // play audio, log tracking data, show overlay
            audioCorrect.play();
            logMouseData();
        } else if (data.msg.includes("Try again!")) {
            audioFalse.play();
        } else if (data.msg.includes("Game started!")) {
            gameStarted = true;
            audioCorrect.src="/static/audio/correct.wav";
            audioFalse.src="/static/audio/tryagain.wav";
            console.log("game started:", gameStarted);
        } else if (data.msg.includes("No images left")) {
            closeFullscreen(); /* Exit fullscreen */
            gameStarted = false;
            $(".overlay").hide();
            console.log("game started:", gameStarted);
        }
    }

    // display / hide messages
    if (self_user.id == data.user.id) return;
    if (data["image"] !== undefined) {
        display_image(data.user, data.timestamp, data.image, data.width, data.height, data.privateMessage);
    } else {
        if (!((data.user.name == "Image_Click_Bot")&&data.msg.startsWith("#nodisplay#"))) {
        display_message(data.user, data.timestamp, data.msg, data.privateMessage);
        }
    }
});

socket.on('new_image', function(data) {
    //set_image(data['url']);
    console.log("new image:",data,"Game started:",gameStarted)
    if (gameStarted==true) {
        /* show overlay and hide replayButton if new image is recieved */
        $(".overlay").show();
        $(".img-button").hide();
    }
  });

socket.on('file_path', function(data) {
    if (data.type == 'audio') {
        audioDescription.src = data.file;
    }
});

// activate mouse tracking
trackMovement(trackingArea, 10);

// center image if new image is loaded or window is resized
image.onload = function () {
    centerImage();
}
window.onresize = function () {
    centerImage();
};

/* add preload and type attributes to audio elements */
$(".audio").attr({
    preload:"auto",
    type:"audio/wav"
});

/* send coordinates on click */
$("#current-image").click(function(e){
    getPosition(e, "#current-image");
    socket.emit('mousePosition', {
        type:'click',
        element:"#current-image",
        coordinates:mouse.pos,
        room: self_room
    });
    socket.emit('log', {
        type: "mouse_click",
        coordinates:mouse.pos,
        element:"#current-image",
        room: self_room});
});

/* if button is clicked: emit event and log */
$('.button').click(function(e){
    /* assign coordinates of the button's center point to mouse.pos and emit events*/
    mouse.pos.x = e.target.offsetLeft + (e.target.offsetWidth / 2);
    mouse.pos.y = e.target.offsetTop + (e.target.offsetHeight / 2);
    socket.emit('mousePosition', {
        type:'click',
        element:"#"+e.target.id,
        coordinates:mouse.pos,
        room: self_room
    });
    socket.emit('log', {
        type: "mouse_click",
        coordinates:mouse.pos,
        element:"#"+e.target.id,
        room: self_room
    });
    /* if overlay button is clicked: hide overlay and play audio file */
    if (e.target.id == "overlayButton") {
        $(".overlay").fadeOut(200);
        $(".img-button").fadeIn(200);
        /* play transmitted audio file after 500 ms */
        setTimeout(function(){
            audioDescription.play();}, 500);
    }
    /* play audio if replay button is clicked */
    else if (e.target.id == "replayButton") {
        audioDescription.play();
    }
    /* emit log if report button is clicked */
    else if (e.target.id == "reportButton") {
        logMouseData();
    }
});

$("header").click(function(){
    enterFullscreen(document.documentElement);
});
