let exp 
let expressions = ["neutral", "happy","sad","angry","fearful","disgusted","surprised"]
let ready = false
let emoji = []
let canvas = document.querySelector("#canvas");
let theme = "Emoji"
let img = 0
let time = 3

let content = document.querySelector("#content")
let loading = document.querySelector("#loading")
let startBtn = document.querySelector(".play-btn")
let video = document.querySelector("#video") 
let webCam = document.querySelector(".webcam")
let emojiCam = document.querySelector("#emoji-capture")
let randomBtn = document.querySelector("#random-btn")
let downloadBtn = document.querySelector("#download-btn")
let timerCam = document.querySelector("#timer")
let imgRes = document.querySelector("#result-img")
let yourExpression = document.querySelector("#exp")

let first = document.querySelector("#first")
let second = document.querySelector("#second")
let third = document.querySelector("#third")
let retakeImg = new Image;
retakeImg.src = "src/assets/Restart.svg"

// Load all expression image 
var expList = {}
for(i of expressions){
    var newImg = new Image;
    newImg.src = `src/svg/${i}.svg`
    expList[i] = newImg
}

// add background
var background = new Image();
background.src = `src/assets/${theme}.svg`;
background.onload = function(){
    canvas.getContext('2d').drawImage(background, 0, 0, canvas.width, canvas.height);
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(() => {
    // kalau sudah ready
    loading.style.display = "none"
    content.style.display = "block"
    video.addEventListener('play', () => {
        const canvasVideo = faceapi.createCanvasFromMedia(video)
        document.body.append(canvasVideo)
        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvasVideo, displaySize)
        let detections, resizedDetections
        setInterval(async () => {
            if(ready){
                detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
                resizedDetections = faceapi.resizeResults(detections, displaySize)
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
                                timerCam.innerHTML = time + 1
                            }         
                        }
                    }else{
                        time = 3
                        timerCam.innerHTML = ""
                    }
                }
            }
        }, 1000)
    })   
})


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
        emojiCam.src = expList[emoji[img]].src
    }
}

function capture(){
    if(img < 3){
        var emojiPic = new Image();
        emojiPic.src = expList[emoji[img]].src
        var position = (400*img+100)+700*img
        // Add photo to canvas
        canvas.getContext('2d').drawImage(video, 100, position, 1000, 1000);
        // Add emoji to canvas
        canvas.getContext('2d').drawImage(emojiPic, 150, position+750, 200, 200);
        
        // Url hasil
        image_data_url = canvas.toDataURL('image/jpeg',3);

        // Add photo and emoji to result img
        var imgCap = document.createElement("canvas")
        imgCap.width = video.width*5
        imgCap.height = video.height*5
        imgCap.getContext('2d').drawImage(video, 0, 0, video.width*5, video.height*5);
        imgCap.getContext('2d').drawImage(emojiPic, 20, 375, 100, 100);
        var imgEl = document.createElement("img")
        imgEl.style.width = "30%"
        imgEl.style.margin = "0 10px"
        imgEl.style.cursor = "pointer"
        imgEl.onclick = downloadImg
        imgEl.src = imgCap.toDataURL('image/jpeg')
        imgRes.appendChild(imgEl)
    }
    img += 1
    setEmojiCamera()
    if(img >= 3) {
        // Stop 
        exp = "undefined"
        ready = false
        localStream.getVideoTracks()[0].stop();
        video.src = '';
        randomBtn.removeAttribute('disabled')
        yourExpression.parentElement.style.display = "none"
        video.style.display = "none"
        emojiCam.style.display = "none"
        startBtn.firstChild.src = retakeImg.src
        startBtn.style.display = "block"
        randomBtn.style.display = "block"
        downloadBtn.style.display = "block"
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
    randomBtn.disabled = "true"
    downloadBtn.style.display = "none"
    randomBtn.style.display = "none"
    this.style.display = "none"
    emojiCam.style.display = "block"
    video.style.display = "block"
    startVideo()
})

// Start random
var firstRand, secondRand, thirdRand, randomInt
randomBtn.addEventListener("click", function(){
    startBtn.disabled = "true"
    randomBtn.disabled = "true"
    emoji = getRandom(expressions, 3)
    // Random untuk emoji pertama setiap 0.1 detik
    firstRand = setInterval(() => {
        randomInt = Math.floor(Math.random() * 7)
        first.src = expList[expressions[randomInt]].src
        document.querySelector("#first-text").innerHTML = expressions[randomInt]
    },100)
    setTimeout(() => {
        // dalam waktu 0.5 detik sudahi random dan pilih emoji 
        clearInterval(firstRand)
        first.setAttribute("src", expList[emoji[0]].src)
        document.querySelector("#first-text").innerHTML = emoji[0]
        // Random untuk emoji kedua setiap 0.1 detik
        secondRand = setInterval(() => {
            randomInt = Math.floor(Math.random() * 7)
            second.src = expList[expressions[randomInt]].src
            document.querySelector("#second-text").innerHTML = expressions[randomInt]
        },100)
    }, 500);
    setTimeout(() => {
        // dalam waktu 1 detik sudahi random dan pilih emoji 
        clearInterval(secondRand)
        second.setAttribute("src", expList[emoji[1]].src)
        document.querySelector("#second-text").innerHTML = emoji[1]
        // Random untuk emoji pertama setiap 0.1 detik
        thirdRand = setInterval(() => {
            randomInt = Math.floor(Math.random() * 7)
            third.src = expList[expressions[randomInt]].src
            document.querySelector("#third-text").innerHTML = expressions[randomInt]
        },100)
    }, 1000);
    setTimeout(() => { 
        // dalam waktu 1.5 detik sudahi random dan pilih emoji 
        clearInterval(thirdRand)
        third.setAttribute("src", expList[emoji[2]].src)
        document.querySelector("#third-text").innerHTML = emoji[2]
        randomBtn.removeAttribute('disabled')
        startBtn.removeAttribute('disabled')
    }, 1500);
})
  
// Download every image
function downloadImg(){
    var anchor = document.createElement("a");
    anchor.href = this.src
    anchor.download = "expression.png";
    anchor.click();
}

// Fungsi untuk mendapatkan sibling
function getSiblings(n, skipMe){
    var parent = n.parentElement
    var children = parent.children
    var sibling = []
    for(c of children){
        if(c != n){
            sibling.push(c)
        }
    }
    return sibling
};


// Select theme
function select(n){
    // Jika sudah ready take tidak bisa ganti background
    if(ready){
        return false
    }
    var sibiling = getSiblings(n)
    for(s of sibiling){
        s.removeAttribute("class")
    }
    n.setAttribute("class","selected")
    theme = n.getAttribute("alt")
    var themeColor = {"Emoji":"#2051CF","Animal":"#F52E12","Food":"#008E39","Sport":"#1C1919"}
    for(let key in themeColor){
        if(theme == key){
            document.querySelector("#theme-text").style.color = themeColor[theme]
        }
    }
    background.src = `src/assets/${theme}.svg`;
    background.onload = function(){
        canvas.getContext('2d').drawImage(background, 0, 0, canvas.width, canvas.height);
    }
}
