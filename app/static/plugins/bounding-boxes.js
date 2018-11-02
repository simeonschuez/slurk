var mouse = {
    click: false,
    move: false,
    pos: {x:0, y:0},
    pos_prev: false,
    drag_start: false
};
var rectangle = {
    pos1: {x:0, y:0},
    pos2: {x:0, y:0}
};
var canvas  = document.getElementById('canvas');
var context = canvas.getContext('2d');
//var position = $('#canvas').offset();
// variables for rectangle
context.fillStyle = "rgba(255,0,0,0.2)"
context.strokeStyle = 'red';
context.lineWidth = 2;

// Functions for tracking + rectangle
function getPosition (evt) {
    mouse.pos.x = evt.clientX - canvas.offset().left;
    mouse.pos.y = evt.clientY - canvas.offset().top;
}
function drawLine (mpos,mpos_prev) {
    context.beginPath();
    context.moveTo(mpos.x, mpos.y);
    context.lineTo(mpos_prev.x, mpos_prev.y);
    context.stroke();
}
function drawRectangle(){
    rectangle.pos2 = {x: mouse.pos.x, y: mouse.pos.y};
    context.clearRect(0,0,canvas.width,canvas.height); //clear canvas
    context.beginPath();
    var width = mouse.pos.x-mouse.drag_start.x;
    var height = mouse.pos.y-mouse.drag_start.y;
    context.fillRect(mouse.drag_start.x, mouse.drag_start.y, width,height);
    context.rect(mouse.drag_start.x, mouse.drag_start.y, width, height);
    context.stroke();
}
function trackMouse() {
    /* if user is moving mouse */
    if (/*mouse.click && */mouse.move && mouse.pos_prev) {
        socket.emit('mouseMove', {coordinates: [ mouse.pos, mouse.pos_prev ],element:"#canvas", room: self_room, user: users});
        socket.emit('log', {type: "mouse_move", coordinates:mouse.pos,element:"#canvas", room: self_room});
        mouse.move = false;
        console.log('mouseMove: ' + mouse.pos.x + ',' + mouse.pos.y)
    }
    mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
    setTimeout(trackMouse, 100); /*25*/
}
canvas.onmousedown = function(e){
    getPosition(e)
    mouse.drag_start = rectangle.pos1 = {x: mouse.pos.x, y: mouse.pos.y};
    mouse.click = true;
    //$("#confirm_rect").attr("disabled", true);
};
canvas.onmouseup = function(e){
    mouse.click = false;
    //$("#confirm_rect").attr("disabled", false);
};
canvas.onmousemove = function(e) {
    getPosition(e);
    mouse.move = true;
    if(mouse.click) {
        // activate drawing rectangles
        drawRectangle();
    };
};
// activate mouse tracking
trackMouse();
