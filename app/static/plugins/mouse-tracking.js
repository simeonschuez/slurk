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

trackMovement("#current-image", 50);
