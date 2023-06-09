function detectFace(){
    // Countdown
    let timer = time
    setInterval(() => { 
        if(img < 3){
            if(timer == 0){
                capture()
                timer = time
            }else if(timer > 0){
                timer -= 1
            }         
            timerCam.innerHTML = timer
            if(img >= 3){
                timerCam.innerHTML = ""
            }
        }
    }, 1000);
}

function startVideo() {
    navigator.getUserMedia(
      { video: {width: 500, height: 500} },
      stream => {
        window.localStream = stream;
        video.srcObject = stream
        // detectFace()
    },
      err => console.error(err)
    )
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
  
let expressions = ["neutral", "happy","sad","angry","fearful","disgusted","surprised"]

let emoji = []
let canvas = document.querySelector("#canvas");
let img = 0
let time = 5

let startBtn = document.querySelector("#start-btn")
let webCam = document.querySelector("#video") 
let emojiCam = document.querySelector("#emoji")
let randomBtn = document.querySelector("#random-btn")
let timerCam = document.querySelector("#timer")
function setEmojiCamera(){
    // Set emoji on camera
    if(img < 3){
        emojiCam.setAttribute("src", "src/svg/"+emoji[img]+".svg")
    }
}

// add background
var background = new Image();
background.src = "bg.jpg";
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
        
    }
    img += 1
    setEmojiCamera()
    if(img >= 3) {
        canvas.style.display = "block"
        // Stop 
        localStream.getVideoTracks()[0].stop();
        video.src = '';
        webCam.style.display = "none"
        emojiCam.style.display = "none"
        startBtn.innerHTML = "restart"
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
    img = 0
    setEmojiCamera()
    randomBtn.style.display = "none"
    emojiCam.style.display = "block"
    this.style.display = "none"
    webCam.style.display = "block"
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
  

