var mouse = {
    click: false,
    move: false,
    pos: {x:null, y:null},
    drag_start: null
};
var rectangle = {
    p1: null,
    p2: null,
    width: null,
    height: null
};

var canvas  = document.getElementById('canvas');
if (canvas == null) {
  // create canvas and fit it over #current-image
  canvas = document.createElement('canvas');
  var img = document.getElementById('current-image');
  canvas.id = "canvas";
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;
  canvas.style.zIndex = 2;
  canvas.style.position = "absolute";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  $("#current-image").wrap( "<div id='image-wrapper' style='position:relative;'></div>");
  var imgWrapper = document.getElementById("image-wrapper");
  imgWrapper.appendChild(canvas);
}
var context = canvas.getContext('2d');
context.fillStyle = "rgba(255,0,0,0.2)";
context.strokeStyle = 'red';
context.lineWidth = 2;

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

function normalizeRectangle(){
  if (rectangle.p1.x > rectangle.p2.x) {
    var swap = rectangle.p1.x;
    rectangle.p1.x = rectangle.p2.x;
    rectangle.p2.x = swap;
    rectangle.width = rectangle.p2.x - rectangle.p1.x;
  }
  if (rectangle.p1.y > rectangle.p2.y) {
    var swap = rectangle.p1.y;
    rectangle.p1.y = rectangle.p2.y;
    rectangle.p2.y = swap;
    rectangle.height = rectangle.p2.y - rectangle.p1.y;
  }
}

function posOnRectangle(){
  normalizeRectangle();
  if ((mouse.pos.x >= rectangle.p1.x && mouse.pos.x <= rectangle.p2.x && mouse.pos.y >= rectangle.p1.y && mouse.pos.y <= rectangle.p2.y)) {
    return true;
  } else {return false;}
}

canvas.onmousedown = function(e){
    getPosition(e);
    mouse.drag_start = {x: mouse.pos.x, y: mouse.pos.y};
    mouse.click = true;
};

canvas.onmouseup = function(e){
    mouse.click = false;
};

canvas.onmousemove = function(e) {
    getPosition(e);
    if(mouse.click) {
        rectangle.p1 = mouse.drag_start;
        mouse.move = true;
        // activate drawing rectangles
        drawRectangle();
    }
};

canvas.onclick = function(e) {
  if (mouse.move == false) {
    getPosition(e)
    if (posOnRectangle()) {
      if (confirm('Is the rectangle set correctly?')) {
        console.log(rectangle)
      }
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
      rectangle = {p1: null, p2: null, width: null, height: null};
      }
    } else {
    mouse.move = false;
  }
};
