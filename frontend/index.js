if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
  alert('Please refresh the page and continue');
  window.location.reload();
}

var textWrapper = document.querySelector('.ml2');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({ loop: true })
  .add({
    targets: '.ml2 .letter',
    scale: [4, 1],
    opacity: [0, 1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 950,
    delay: (el, i) => 70 * i
  }).add({
    targets: '.ml2',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000
  });

// ---------------Landing Page Animation------------------------------------
var TxtRotate = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = "";
  this.tick();
  this.isDeleting = false;
};

TxtRotate.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

  var that = this;
  var delta = 300 - Math.random() * 100;

  if (this.isDeleting) {
    delta /= 2;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === "") {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta);
};

window.onload = function () {
  var elements = document.getElementsByClassName("txt-rotate");
  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute("data-rotate");
    var period = elements[i].getAttribute("data-period");
    if (toRotate) {
      new TxtRotate(elements[i], JSON.parse(toRotate), period);
    }
  }
  // INJECT CSS
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
  document.body.appendChild(css);
};

// ------------------------------- Drag Drop------------------------------------------------------------

$(document).ready(() => {
  $("#convert_one").click(() => {
    $("#font").show("slide", { direction: "left" }, 1000);
  });
  $("#finalbtn").click(() => {
    $("#download").show();
    $("#font").hide();
    $("#success_container").hide();
  });
});

var file_name = document.getElementById("file_name");
var myfile = document.getElementById("myfile");
let file = ''

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      updateThumbnail(dropZoneElement, inputElement.files[0]);

      // file to be loaded
      file = inputElement.files[0]
      console.log(inputElement.files[0]);
      console.log(inputElement.files[0].size);
      console.log(inputElement.files[0].name);

      let size_of_file = inputElement.files[0].size;

      var check = inputElement.files[0].name;
      file_name.innerHTML = inputElement.files[0].name.trim().replace(/\s/g, "");


      // var regxtwo = /^([A-Za-z0-9_./()]{2,500}).doc$/;
      var regxthree = /^([A-Za-z0-9_./\-()]{2,500}).docx$/;
      var regxfour = /^([A-Za-z0-9_./\-()]{2,500}).txt$/;

      if (regxthree.test(check) || regxfour.test(check)) {
        if (size_of_file > 25000) {
          document.getElementById("upload").style.display = "none";
          document.getElementById("error_container").style.display = "block";
          alert("file size should be less than 25KB.  Please refresh and upload again");
        } else {
          document.getElementById("upload").style.display = "none";
          document.getElementById("success_container").style.display = "block";
        }
      }
      else {
        document.getElementById("upload").style.display = "none";
        document.getElementById("error_container").style.display = "block";
        alert("File type should be .docx or .txt.  Please refresh and upload again");
      }
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;

      // file to be loaded
      file = e.dataTransfer.files[0]
      console.log(e.dataTransfer.files[0]);
      console.log(e.dataTransfer.files[0].size);
      console.log(e.dataTransfer.files[0].name);

      var check = e.dataTransfer.files[0].name.trim().replace(/\s/g, "");
      file_name.innerHTML = e.dataTransfer.files[0].name;
      // var regx = /.+\.pdf$/;
      // var regxtwo = /^([A-Za-z0-9_./()]{2,500}).doc$/;
      var regxthree = /^([A-Za-z0-9_./\-()]{2,500}).docx$/;
      var regxfour = /^([A-Za-z0-9_./\-()]{2,500}).txt$/;
      if (regxthree.test(check) || regxfour.test(check)) {
        if (inputElement.files[0].size > 25000) {
          document.getElementById("upload").style.display = "none";
          document.getElementById("error_container").style.display = "block";
          alert("file size should be less than 25KB. Please refresh and upload again");
        } else {
          document.getElementById("upload").style.display = "none";
          document.getElementById("success_container").style.display = "block";
        }
      }
      else {
        document.getElementById("upload").style.display = "none";
        document.getElementById("error_container").style.display = "block";
        alert("File type should be .docx or .txt. Please refresh and upload again");
      }

      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

}


//font selected by the user
var font_select = document.getElementById("finalbtn");

font_select.addEventListener("click", async () => {
  let selected = document.querySelector('input[type="radio"]:checked');
  // console.log(selected.value);


  const formData = new FormData();
  formData.append("file", file);
  formData.append("font", selected.value);

  let url = 'https://stc-handwriter.azurewebsites.net/';

  // let url = 'http://localhost:3000/'
  fetch(url + 'handwriter/convert', {
    method: 'POST',
    body: formData
  })
    .then((response) => response.json())
    .then((result) => {

      if (result.pdfFilename) {
        window.location.href = (url + result.pdfFilename)
        $("#download").hide();
        $("#downloaded").show();
      }
      else {
        alert(result.err)
      }
    })
    .catch(error => {
      console.error(error)
      alert("There was some error connecting to server. Please try again !");
    })

});