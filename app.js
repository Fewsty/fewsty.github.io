(function () {
  var streaming = false;

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;

  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  output = document.getElementById("output");
  before = document.getElementById("before");
  startbutton = document.getElementById("startbutton");
  clearbutton = document.getElementById("clearbutton");

  var items = [];
  var imgs = [];

  var tg = window.Telegram.WebApp;
  var mb = tg.MainButton;
  tg.ready();
  tg.expand();
  //mb.textColor = "#FFFFFF";
  mb.hide();

  function startup() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
            width: { min: 576, ideal: 720, max: 1080 },
            height: { min: 1024, ideal: 1280, max: 1920 },
          },
        })
        .then(function success(stream) {
          if ("srcObject" in video) {
            video.srcObject = stream;
          } else {
            video.src = window.URL.createObjectURL(stream);
          }
          video.addEventListener("loadedmetadata", (event) => video.play());
        })
        .catch(function (err) {
          console.log("An error occurred: " + err);
        });
    }
  }
  video.addEventListener(
    "play",
    function (ev) {
      if (!streaming) {
        canvas.setAttribute("width", video.videoWidth);
        canvas.setAttribute("height", video.videoHeight);
        streaming = true;
      }
    },
    false
  );
  startbutton.addEventListener(
    "click",
    function (ev) {
      const newImg = document.createElement("img");
      output.insertBefore(newImg, before);
      newImg.classList.add("photo");
      imgs.push(newImg);
      before = newImg;
      photo = newImg;

      takepicture();
      ev.preventDefault();
    },
    false
  );
  clearbutton.addEventListener(
    "click",
    function (ev) {
      before = document.getElementById("before");
      imgs.forEach((element) => {
        element.remove();
      });
      clearbutton.style.display = "none";
      mb.hide();
    },
    false
  );
  video.addEventListener(
    "resize",
    (ev) => {
      let w = video.videoWidth;
      let h = video.videoHeight;

      if (w && h) {
        video.style.width = w;
        video.style.height = h;
      }
    },
    false
  );
  tg.onEvent("mainButtonClicked", function () {
    mb.color = "#808080";
    mb.setText("Идёт отправка фото");
    if (tg.initDataUnsafe?.chat) chat_id = tg.initDataUnsafe.chat.id;
    else chat_id = tg.initDataUnsafe.user.id;
    r = new FormData();
    r.append(
      "json",
      JSON.stringify({
        chat_id: chat_id,
        action: "camera_photo",
        frames: items,
      })
    );
    fetch("https://bitrix.abguard.ru/local/gbr_bot_webhook.php", {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
      },
      body: r,
    })
      .then((data) => {
        console.log("Успешно:", data);
        mb.color = "#00FF00";
        mb.setText("УСПЕШНО");
        tg.close();
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        alert(error.message);
        mb.color = "#ff2400";
        mb.setText("ОШИБКА");
      });
  });
  // setInterval(function () {
  //   if (!streaming) startup();
  // }, 10000);
  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  function takepicture() {
    var context = canvas.getContext("2d");
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      alert(video.videoWidth);

      var data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
      items.push(data);
      clearbutton.style.display = "block";
      mb.setText("Отправить " + items.length + " фото");
      mb.show();
    } else {
      clearphoto();
    }
  }

  //window.Telegram.WebView.receiveEvent("web_app_ready", startup);
  window.addEventListener("load", startup, false);
})();
