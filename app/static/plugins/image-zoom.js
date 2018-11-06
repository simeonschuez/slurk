var img, imgWidth, imgHeight, xpos, ypos;

function initBgImg() {
  img = document.getElementById("current-image");
  img.style.backgroundImage="url("+img.src;+")";
  img.style.backgroundRepeat="no-repeat";
  img.style.backgroundSize=img.width.toString()+"px "+img.height.toString()+"px";
  img.src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\n";
}

function updateBgImg(zoom, position) {
  imgWidth = img.width*zoom;
  imgHeight = img.height*zoom;
  xpos = position.x * zoom;
  ypos = position.y * zoom;
  img.style.backgroundSize=imgWidth.toString()+"px "+imgHeight.toString()+"px";
  img.style.backgroundPosition = xpos.toString()+"px "+ypos.toString()+"px";
}

initBgImg();

updateBgImg(2, {x:100, y:200});
