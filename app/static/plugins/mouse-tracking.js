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

function emitPosition(a,intrvl) {
    if (mouse.move) {
        socket.emit('mousePosition', {
            type:'move',
            coordinates:mouse.pos,
            element:a,
            room:self_room
        });
        mouse.move = false;
    }
    setTimeout(emitPosition, intrvl, a, intrvl);
}

function trackMovement(area,interval) {
    $(area).mousemove(function(e){
        // console.log(new Date());
        getPosition(e, area);
        mouse.move = true;
    });
    emitPosition(area,interval)
}

// get position within trackingArea every 100 ms
trackMovement(trackingArea, 100);
