let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#2cab37';



Telegram.WebApp.onEvent("mainButtonClicked", function(){
	tg.sendData(item);
});


let usercard = document.getElementById("usercard");

let p = document.createElement("p");

p.innerText = `${tg.initDataUnsafe.user.first_name}
${tg.initDataUnsafe.user.last_name}`;

usercard.appendChild(p);

var videoElement = document.querySelector('video');
getStream().then(getDevices).then(gotDevices);

function getDevices() {
    // AFAICT in Safari this only gets default devices until gUM is called :/
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos; // make available to console
    console.log('Available input and output devices:', deviceInfos);
}
window.setTimeout(getStream, 10);
}

function getStream() {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const videoSource = videoSelect.value;
    const constraints = {
        video: {
            deviceId: videoSource ? {
                exact: videoSource
            } : undefined
        }
    };
    return navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    if ('srcObject' in videoElement) {
        videoElement.srcObject = stream;
    } else {
        videoElement.src = URL.createObjectURL(stream);
    }
}

function handleError(error) {
    console.error('Error: ', error);
}

function getImgUrl() {
    let el = videoElement;
    let canvas = document.createElement('canvas');
    canvas.width = el.videoWidth;
    canvas.height = el.videoHeight;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(el, 0, 0, canvas.width, canvas.height);
    let cu = canvas.toDataURL();
    document.body.removeChild(canvas);
    return cu;
}
getImgUrl();






