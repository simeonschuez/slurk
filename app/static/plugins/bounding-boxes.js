var mouse = {
    click: false,
    move: false,
    pos: {x:0, y:0},
    drag_start: null
};
var rectangle = {
    p1: {x:null, y:null},
    p2: {x:null, y:null},
    width: null,
    height: null
};
var canvas  = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.fillStyle = "rgba(255,0,0,0.2)";
context.strokeStyle = 'red';
context.lineWidth = 2;

// Functions for tracking + rectangle
function getPosition (evt) {
    var canvas_position = $('#canvas').offset();
    mouse.pos.x = evt.clientX - canvas_position.left;
    mouse.pos.y = evt.clientY - canvas_position.top;
}

function drawRectangle(){
    rectangle.p2 = {x: mouse.pos.x, y: mouse.pos.y};
    rectangle.width = mouse.pos.x-rectangle.p1.x;
    rectangle.height = mouse.pos.y-rectangle.p1.y;
    context.clearRect(0,0,canvas.width,canvas.height); //clear canvas
    context.beginPath();
    context.fillRect(rectangle.p1.x, rectangle.p1.y, rectangle.width, rectangle.height);
    context.rect(rectangle.p1.x, rectangle.p1.y, rectangle.width, rectangle.height);
    context.stroke();
}

canvas.onmousedown = function(e){
    getPosition(e)
    rectangle.p1 = {x: mouse.pos.x, y: mouse.pos.y};
    mouse.click = true;
    //$("#confirm_rect").attr("disabled", true);
};

canvas.onmouseup = function(e){
    mouse.click = false;
    //$("#confirm_rect").attr("disabled", false);
    console.log(rectangle);
};

canvas.onmousemove = function(e) {
    getPosition(e);
    mouse.move = true;
    if(mouse.click) {
        // activate drawing rectangles
        drawRectangle();
    };
};
