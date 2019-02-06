var img, bgWidth, bgHeight, offset, focus, zoomLevel;
offset = {x:null, y:null};
zoomLevel = 1;

function initBgImage() {
  /*
    set up image for zoom functionality:
        1) initial image source as background image
        2) transparent gif as new image source
  */

  img = document.getElementById("current-image");

  // image source as background image, css properties
  img.style.backgroundImage="url("+img.src;+")";
  img.style.backgroundRepeat="no-repeat";
  img.style.backgroundSize=img.width.toString()+"px "+img.height.toString()+"px";

  // set transition for zooming in/out and moving the viewport
  img.style.transition="background-size 0.5s ease, background-position 0.5s";

  // transparent gif as image source
  img.src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\n";
}

function zoomImage(zoom, position) {
  /*
    modify background image according to zoom level and focus position
  */

  // calculate background image size
  bgWidth = img.width*zoom;
  bgHeight = img.height*zoom;

  // calculate viewport position
  offset.x = (position.x * zoom)-(img.width / 2);
  offset.y = (position.y * zoom)-(img.height / 2);

  // prevent viewport position outside the image
  if (offset.x < 0) {offset.x = 0}
  else if (offset.x > (bgWidth - img.width)) {offset.x = bgWidth - img.width};
  if (offset.y < 0) {offset.y = 0}
  else if (offset.y > (bgHeight - img.height)) {offset.y = bgHeight - img.height};

  // apply zoom level + viewport position
  img.style.backgroundSize=bgWidth.toString()+"px "+bgHeight.toString()+"px";
  img.style.backgroundPosition = "-"+offset.x.toString()+"px -"+offset.y.toString()+"px";

  // log into console
  //console.log("zoom:", zoom, "width:", img.width, "height:",img.height,"bgWidth:", bgWidth, "bgHeight:", bgHeight,"position:", position, "offset.x:",offset.x, "offset.y:", offset.y);
}

function calcPos(evt, zoom, offset) {
  /*
    calculate the current mouse position, given a click event, a zoom level and the image offset
  */
  var pos = $("#current-image").offset();
  var y = ((offset.y + (evt.clientY - pos.top))/zoom);
  var x = ((offset.x + (evt.clientX - pos.left))/zoom);
  return ({x:x,y:y})
}

initBgImage();

// call zoomImage on image_modification event of type 'zoom' with event data
socket.on('image_modification', function(data) {
    //console.log(data);
    if (data['type'] == 'zoom'){
        zoomLevel = data['parameters']['zoom_level'];
        focus = data['parameters']['focus'];

        zoomImage(zoomLevel, {x:focus.x, y:focus.y});

        alert("zoom level: "+zoomLevel+"\nposition: "+focus.x+","+focus.y);
    }
});

// allow shifting the viewport with the mouse cursor
$("#current-image").mousemove(function(e){
  var pos = $("#current-image").offset();
  var x = e.clientX - pos.left;
  var y = e.clientY - pos.top;
  //console.log(x,y);
  //zoomImage(zoomLevel, {x:x, y:y});
});

$("#current-image").click(function(e){
  console.log(calcPos(e,zoomLevel,offset), offset, zoomLevel);
  socket.emit('mousePosition', {
    type:'click',
    element:"#current-image",
    coordinates:calcPos(e,zoomLevel,offset),
    room:self_room
  });
});

// nutzer verschiebt viewport -> daten an bot
// smoothe bewegung an zielort
