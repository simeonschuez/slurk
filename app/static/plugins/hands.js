const img = document.getElementById('img');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Size of Image and Canvas
width = document.getElementById('img').naturalWidth;
height = document.getElementById('img').naturalHeight;
wrapper = document.getElementById('outsideWrapper')
wrapper.style.height = String(height) + "px";
wrapper.style.width = String(width) + "px";

const modelParams = {
    flipHorizontal: false, // flip e.g for video
    imageScaleFactor: 0.7, // reduce input image size for (maybe) gains in speed.
    maxNumBoxes: 20, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.79, // confidence threshold for predictions
}

handTrack.load().then(model => {
    model.setModelParameters(modelParams)
    model.detect(img).then(preds => {
        console.log(preds)
        model.renderPredictions(preds, canvas, context, img);
    });
});
