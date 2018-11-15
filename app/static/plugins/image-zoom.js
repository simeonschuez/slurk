var img, imgWidth, imgHeight, offset;
offset = {x:null, y:null};

function initBgImg() {
  img = document.getElementById("current-image");

  img.style.border="1px solid black";

  img.style.backgroundImage="url("+img.src;+")";
  img.style.backgroundRepeat="no-repeat";
  img.style.backgroundSize=img.width.toString()+"px "+img.height.toString()+"px";
  img.src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\n";
}

function zoomBgImg(zoom, position) {
  imgWidth = img.width*zoom;
  imgHeight = img.height*zoom;
  offset.x = (position.x * zoom)-(img.width / 2);
  offset.y = (position.y * zoom)-(img.height / 2);

  if (offset.x < 0) {offset.x = 0}
  else if (offset.x > (imgWidth - img.width)) {offset.x = imgWidth - img.width};
  if (offset.y < 0) {offset.y = 0}
  else if (offset.y > (imgHeight - img.height)) {offset.y = imgHeight - img.height};

  offset.x = offset.x * -1;
  offset.y = offset.y * -1;

  img.style.backgroundSize=imgWidth.toString()+"px "+imgHeight.toString()+"px";
  img.style.backgroundPosition = offset.x.toString()+"px "+offset.y.toString()+"px";
  console.log(
    "zoom:", zoom, "width:", img.width, "height:",img.height,
    "imgWidth:", imgWidth, "imgHeight:", imgHeight,
    "position:", position, "offset.x:",offset.x, "offset.y:", offset.y
  );
}

initBgImg();

$("#current-image").mousemove(function(e){
  var pos = $("#current-image").offset();
  var x = e.clientX - pos.left;
  var y = e.clientY - pos.top;
  console.log(x,y);
    zoomBgImg(3, {x:x, y:y});
});

$("#current-image").mouseleave(function(){
  zoomBgImg(1,{x:1, y:1});
});
