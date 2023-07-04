
let exp
let expressions = ["neutral", "happy","sad","angry","fearful","disgusted","surprised"]
let ready = false
let emoji = []
let canvas = document.querySelector("#canvas");
let img = 0
let time = 3

let startBtn = document.querySelector(".play-btn")
let video = document.querySelector("#video") 
let webCam = document.querySelector(".webcam")
let emojiCam = document.querySelector("#emoji-capture")
let randomBtn = document.querySelector("#random-btn")
let timerCam = document.querySelector("#timer")
let imgRes = document.querySelector("#result-img")
let yourExpression = document.querySelector("#exp")

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(
    // kalau sudah ready
    console.log("ready")
)


function startVideo() {
    navigator.getUserMedia(
      { video: {width: 500, height: 500} },
      stream => {
        window.localStream = stream;
        video.srcObject = stream
    },
      err => console.error(err)
    )
}

function getMaxValueKey(obj){
    return Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b });
}

video.addEventListener('play', () => {
    const canvasVideo = faceapi.createCanvasFromMedia(video)
    document.body.append(canvasVideo)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvasVideo, displaySize)
    setInterval(async () => {
        if(ready){
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvasVideo.getContext('2d').clearRect(0, 0, canvasVideo.width, canvasVideo.height)
            // faceapi.draw.drawDetections(canvasVideo, resizedDetections)
            // faceapi.draw.drawFaceLandmarks(canvasVideo, resizedDetections)
            // faceapi.draw.drawFaceExpressions(canvasVideo, resizedDetections)
            if(resizedDetections[0]){
                exp = getMaxValueKey(resizedDetections[0]["expressions"])
            }
            if(exp && ready){
                yourExpression.innerHTML = exp 
                if(exp == emoji[img]){
                    if(img < 3){
                        if(time == 0){
                            timerCam.innerHTML = ""
                            capture()
                        }else if(time > 0){
                            time -= 1
                        }         
                        timerCam.innerHTML = time + 1
                    }
                    // if(img >= 3){
                    //     ready = false
                    //     timerCam.innerHTML = ""
                    // }
                }else{
                    time = 3
                    timerCam.innerHTML = ""
                }
            }
        }
    }, 1000)
})


function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
  
function setEmojiCamera(){
    // Set emoji on camera
    if(img < 3){
        emojiCam.setAttribute("src", "src/svg/"+emoji[img]+".svg")
    }
}

// add background
var background = new Image();
background.src = "src/assets/bg.svg";
background.onload = function(){
    canvas.getContext('2d').drawImage(background, 0, 0, canvas.width, canvas.height);
}

function capture(){
    if(img < 3){
        var emojiPic = new Image();
        emojiPic.src = "src/svg/"+emoji[img]+".svg";
        var position = (400*img+100)+700*img
        // Add photo to canvas
        canvas.getContext('2d').drawImage(video, 100, position, 1000, 1000);
        // Add emoji to canvas
        canvas.getContext('2d').drawImage(emojiPic, 150, position+750, 200, 200);
        
        // Url hasil
        image_data_url = canvas.toDataURL('image/jpeg',3);

        // Add photo to result img
        var imgCap = document.createElement("canvas")
        imgCap.width = video.width*5
        imgCap.height = video.height*5
        imgCap.getContext('2d').drawImage(video, 0, 0, video.width*5, video.height*5);
        var imgEl = document.createElement("img")
        imgEl.style.width = "30%"
        imgEl.style.margin = "0 10px"
        imgEl.src = imgCap.toDataURL('image/jpeg')
        imgRes.appendChild(imgEl)
    }
    img += 1
    setEmojiCamera()
    if(img >= 3) {
        // Stop 
        ready = false
        localStream.getVideoTracks()[0].stop();
        video.src = '';
        yourExpression.parentElement.style.display = "none"
        video.style.display = "none"
        emojiCam.style.display = "none"
        startBtn.firstChild.src = "src/assets/Restart.svg"
        startBtn.style.display = "block"
        randomBtn.style.display = "block"
    }
}

let image_data_url

document.querySelector("#capture-btn").addEventListener('click', function() {
    capture()
});

document.querySelector("#download-btn").addEventListener('click', function() {
    var anchor = document.createElement("a");
    anchor.href = image_data_url
    anchor.download = "facemoji.png";
    anchor.click();
});



startBtn.addEventListener("click", function(){
    yourExpression.parentElement.style.display = "block"
    imgRes.innerHTML = ""
    ready = true
    img = 0
    setEmojiCamera()
    randomBtn.style.display = "none"
    emojiCam.style.display = "block"
    this.style.display = "none"
    video.style.display = "block"
    startVideo()
})

// Start random
randomBtn.addEventListener("click", function(){
    emoji = getRandom(expressions, 3)
    document.querySelector("#first").setAttribute("src", "src/svg/"+emoji[0]+".svg")
    document.querySelector("#first-text").innerHTML = emoji[0]
    setTimeout(() => {
        document.querySelector("#second").setAttribute("src", "src/svg/"+emoji[1]+".svg")
        document.querySelector("#second-text").innerHTML = emoji[1]
    }, 500);
    setTimeout(() => { 
        document.querySelector("#third").setAttribute("src", "src/svg/"+emoji[2]+".svg")
        document.querySelector("#third-text").innerHTML = emoji[2]
        startBtn.style.display = "block"
    }, 1000);
})
  

