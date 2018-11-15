var img, bgWidth, bgHeight, offset;
offset = {x:null, y:null};

function initBgImage() {
  img = document.getElementById("current-image");
  // image source as background image
  img.style.backgroundImage="url("+img.src;+")";
  img.style.backgroundRepeat="no-repeat";
  img.style.backgroundSize=img.width.toString()+"px "+img.height.toString()+"px";
  // transparent gif as image source
  img.src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\n";
}

function zoomImage(zoom, position) {
  /*
    modify background image according to zoom level and focus position
  */
  // background image size
  bgWidth = img.width*zoom;
  bgHeight = img.height*zoom;
  // viewport position
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

  console.log("zoom:", zoom, "width:", img.width, "height:",img.height,"bgWidth:", bgWidth, "bgHeight:", bgHeight,"position:", position, "offset.x:",offset.x, "offset.y:", offset.y);
}

initBgImage();

$("#current-image").mousemove(function(e){
  var pos = $("#current-image").offset();
  var x = e.clientX - pos.left;
  var y = e.clientY - pos.top;
  console.log(x,y);
    zoomImage(3, {x:x, y:y});
});

$("#current-image").mouseleave(function(){
  zoomImage(1,{x:1, y:1});
});
