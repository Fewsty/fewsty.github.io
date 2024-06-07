(function () {
  var width = 320;
  var height = 0;

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

  var items = [];

  var tg = window.Telegram.WebApp;
  var mb = tg.MainButton;
  tg.ready();
  tg.expand();
  //mb.textColor = "#FFFFFF";
  mb.setText("Отправить");
  mb.hide();

  function startup() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
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
        height = video.videoHeight / (video.videoWidth / width);

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute("width", width);
        video.setAttribute("height", height);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
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
      before = newImg;
      photo = newImg;

      takepicture();
      ev.preventDefault();
    },
    false
  );
  tg.onEvent("mainButtonClicked", function () {
    //chat_id = tg.initDataUnsafe.chat.id;
    //alert(chat_id);
    let r = new FormData();
    r.append(
      "json",
      JSON.stringify({
        chat_id: 1,
        action: "camera_photo",
        frames: items,
      })
    );
    fetch("https://bitrix.abguard.ru/local/gbr_bot_webhook.php", {
      method: "POST",
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
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
      items.push(data);
      mb.show();
    } else {
      clearphoto();
    }
  }

  //window.Telegram.WebView.receiveEvent("web_app_ready", startup);
  window.addEventListener("load", startup, false);
})();
