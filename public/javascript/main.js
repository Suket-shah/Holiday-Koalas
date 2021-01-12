// immediately called function that runs to kick off the program
(function() {
  window.shownFile = 'none';

  // If an error happens I want to know about it!
  window.onerror = function(msg, url, ln) {
    msg = msg.toString();
    // In Chrome and Firefox an error on a script form a foreign domain will cause this, see link bellow:
    // http://stackoverflow.com/questions/5913978/cryptic-script-error-reported-in-javascript-in-chrome-and-firefox
    if (msg === 'Script error.' && url === '' && ln === 0) return;
    track('OnError', "'" + msg + "' in '" + url + "' @ " + ln + " /u:'" + window.navigator.userAgent + "'");
    // Track only one error per page load
    window.onerror = function() {};
  };

  // First, make sure we can run.
  if (!koala.supportsCanvas()) {
    track('NoCanvas', window.navigator.userAgent);
    alert("Sorry, KoalsToTheMax needs HTML5 Canvas support which your browser does not have. Supported browsers include Chrome, Safari, Firefox, Opera, and Internet Explorer 9, 10");
    return;
  }

  if (!koala.supportsSVG()) {
    track('NoSVG', window.navigator.userAgent);
    alert("Sorry, KoalsToTheMax needs SVG support which your browser does not have. Supported browsers include Chrome, Safari, Firefox, Opera, and Internet Explorer 9, 10");
    return;
  }

  // This is strange, track it if it happens.
  if (!window.d3) {
    track('NoD3', window.navigator.userAgent);
    alert("Some how D3 was not loaded so the site can not start. This is bad... We are investigating. Try refreshing the page and see if that helps.");
    return;
  }

  // live image preview code (WILL BE DELETED)
//   var fileUpload = document.querySelector('#img-upload input');
//   fileUpload.addEventListener('change', function() {
//     if(this.files && this.files[0]) {
//       var img = document.getElementById('upload');
//       img.src = URL.createObjectURL(this.files[0]); 
//       img.style.display = "block";
//     }
//  }
//  );

// Try you must. If there is an error report it to me.
  try {
    // btoa and atob do not handle utf-8 as I have discovered the hard way so they need to babied
    // See: https://developer.mozilla.org/en-US/docs/DOM/window.btoa#Unicode_Strings
    function utf8_to_b64(str) {
      return window.btoa(unescape(encodeURIComponent(str)));
    }

    function b64_to_utf8(str) {
      return decodeURIComponent(escape(window.atob(str)));
    }

    // Handle the custom images 'API'
    // Supported URLs are:
    // 1. DOMAIN
    //   The just the page domain / loads one of the default files
    //
    // 2. DOMAIN?BASE64==
    //   Where BASE64== is a UTF-8 base64 encoded string of one of the following things:
    //   a. An image URL
    //      Example: http://i.imgur.com/cz1Jb.jpg
    //      Use that URL image instead of the default one.
    //
    //   b. A JSON string representing an array of URLs
    //      Example: ["http://i.imgur.com/cz1Jb.jpg","http://i.imgur.com/Q5IqH.jpg"]
    //      Pick one of the images at random and use that instead of the default one.
    //
    //   c. A JSON string representing an object with the keys 'images', 'background' and 'hideNote'
    //      Example: {"background":"#000","images":["http://i.imgur.com/cz1Jb.jpg","http://i.imgur.com/Q5IqH.jpg"]}
    //      images (required): Pick one of the images at random and use that instead of the default one.
    //      background (optional): Use the value of background as the page background.
    //      hideNote (optional): Hide the mention on the bottom.
    //
    // 3. DOMAIN?image_url
    //   Where image URL is an actual image URL that will get re-encoded into base64 (2)
    //   Example: http://i.imgur.com/cz1Jb.jpg
    //
    // Note: where DOMAIN is usually http://koalastothemax.com
    function goToHidden(location, string) {
      location.href = '//' + location.host + location.pathname + '?' + utf8_to_b64(string);
    }

    // this case is hit when you just do koalastothemax.com
    function basicLoad(location) {
      var possible = ['koalas', 'koalas1', 'koalas2', 'koalas3'];
      // ** you can change this variable to whatever image you want. This becomes the default **
      var file = 'img/' + possible[Math.floor(Math.random() * possible.length)] + '.jpg'
      return {
        file: file,
        shownFile: location.protocol + '//' + location.host + location.pathname + file
      };
    }

    // main method to parse the url
    function parseUrl(location) {
      // location.href is an object that is in the window object. It tells you what the url of the current site is
      var href = location.href;
      var idx, param, file;

      idx = href.indexOf('?');
      if (idx === -1 || idx === href.length - 1) {
        return basicLoad(location); // Case 1
      }

      // param now holds the string after the /?. This specifies which image to display usually
      param = href.substr(idx + 1);
      if (!/^[a-z0-9+\/]+=*$/i.test(param)) {
        // Does not look base64
        goToHidden(location, param);
        return null;
      }

      // Case 2
      try {
        param = b64_to_utf8(param);
      } catch (e) {
        return basicLoad(location); // Invalid base64, do a basic load
      }

      try {
        param = JSON.parse(param);
      } catch (e) {
        // Case 2a
        return {
          file: param,
          shownFile: param
        };
      }

      // At this point param is a JS object
      if (Array.isArray(param) && param.length) {
        // Case 2b
        file = param[Math.floor(Math.random() * param.length)];
        return {
          file: file,
          shownFile: file
        };
      }

      if (Array.isArray(param.images) && param.images.length) {
        // Case 2c
        file = param.images[Math.floor(Math.random() * param.images.length)];
        return {
          file: file,
          shownFile: file,
          background: param.background,
          hideNote: param.hideNote
        };
      }

      // Fall though
      return basicLoad(location);
    }

    // added method to convert from base64 to a blob
    function base64toBlob(base64Data, contentType) {
      contentType = contentType || '';
      var sliceSize = 1024;
      var byteCharacters = atob(base64Data);
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);

      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
          var begin = sliceIndex * sliceSize;
          var end = Math.min(begin + sliceSize, bytesLength);

          var bytes = new Array(end - begin);
          for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
              bytes[i] = byteCharacters[offset].charCodeAt(0);
          }
          byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
    }

    function blobToFile(theBlob, fileName){
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      theBlob.lastModifiedDate = new Date();
      theBlob.name = fileName;
      return theBlob;
    }

    // Gets the parsed version of the URL
    // this is what needs to be changed in order to get cursom images
    var parse = parseUrl(location);
    if (!parse) return;
    
    // ** this is where the file being shown is decided **
    // var imgdata = document.getElementById('img-data');
    // console.log(imgdata.getAttribute('data-img64'));
    // var file = blobToFile(base64toBlob(imgdata), 'testfile');
    var file = document.getElementById('img-data').getAttribute('data-img64');
    window.shownFile = parse.shownFile;

    if (parse.background) {
      d3.select(document.body)
        .style('background', parse.background);
    }
    if (parse.hideNote) {
      d3.select('#footer')
        .style('display', 'none');
    }

    if (/^https?:/.test(file)) {
      file = "image-server.php?url=" + file;
    }

    function onEvent(what, value) {
      track(what, value);

      if (what === 'LayerClear' && value == 0) {
        d3.select('#next')
          .style('display', null)
          .select('input')
            .on('keydown', function() {
              d3.select('div.err').remove();
              if (d3.event.keyCode !== 13) return;
              var input = d3.select(this).property('value');

              if (input.match(/^http:\/\/.+\..+/i) || input.match(/^https:\/\/.+\..+/i)) {
                track('Submit', input);
                d3.select('#next div.msg').text('Thinking...');
                d3.select(this).style('display', 'none');
                setTimeout(function() {
                  goToHidden(location, input);
                }, 750);
              } else {
                d3.select('#next').selectAll('div.err').data([0])
                  .enter().append('div')
                  .attr('class', "err")
                  .text("That doesn't appear to be a valid image URL. [Hint: it should start with 'http://']")
              }
            });
            
        // adds the completed text
        d3.select('#encourage')
          .style('display', 'none');
        d3.select('#complete')
          .style('display', null);
      }

      // adds the encouragement text 
      if (what === 'PercentClear' && value >= 50) {
        d3.select('#halfway')
          .style('display', null);
      }
      if (what === 'PercentClear' && value >= 90) {
        d3.select('#halfway')
          .style('display', 'none');
        d3.select('#encourage')
          .style('display', null);
      }
    }

    var img = new Image();
    img.onload = function() {
      var colorData;
      try {
        colorData = koala.loadImage(this);
      } catch (e) {
        colorData = null;
        track('BadLoad', "Msg: '" + e.message + "' file: '" + file + "'");
        alert("Sorry, KoalsToTheMax could not load the image '" + file + "'");
        setTimeout(function() {
          window.location.href = domian;
        }, 750);
      }
      if (colorData) {
        koala.makeCircles("#dots", colorData, onEvent);
        track('GoodLoad', 'Yay');
      }
    };
    img.src = file;
  } catch (e) {
    track('Problemo', String(e.message));
  }

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
} 
// setting the ID locally
var postId = makeid(23);
document.getElementById('codeid').setAttribute('value', postId);



document.getElementById('copyText').innerText = `localhost:5000/${postId}`;
document.getElementById('btnSubmit').addEventListener('click', (e) => {
  e.preventDefault();

  let fd = new FormData();
  let myFile = document.getElementById('file').files[0];
  fd.append('image', myFile);
  let idData = document.getElementById('codeid').getAttribute('value');
  fd.append('id', idData);

  let req = new Request('/upload', {
    method: 'POST',
    body: fd
  });

  fetch(req).then((response) => {
    return response.json();
  }).then((data) => {
    if(data.status === 'success') {
      updateFormUI();
    } else {
      console.log(data);
      console.log(data.status);
      let errorFile = document.querySelector('.file-name'); 
      errorFile.style.color = "red";
      errorFile.innerText = "An error occured";
    }
  });
  
  // .then(updateFormUI()).catch((err) => {
  //   console.log("ERROR" + err.message);
  // });
  
});

function updateFormUI() {
  // console.log('funciton is getting called ' + postId);
  // document.getElementById('btnSubmit').innerText = postId;
  document.querySelector(".form-area").style.display = 'none';
  document.getElementById('uploadText')
  document.querySelector('.copy-area').style.display = 'inline';
  
}

const fileElement = document.querySelector('#file');
fileElement.addEventListener('change', (e) => {
  // Get the selected file
  const [file] = e.target.files;
  // Get the file name and size
  const { name: fileName, size } = file;
  // Convert size in bytes to kilo bytes
  const fileSize = (size / 1000).toFixed(2);
  // Set the text content
  const fileNameAndSize = `${fileName.substring(0, 20)} - ${fileSize}KB`;
  document.querySelector('.file-name').textContent = fileNameAndSize;
});


// // copy button code TODO NOT WORKING
// var copyButton = document.getElementById('copy-button');
// copyButton.addEventListener('click', copyToClipboard("copyText"));
// function copyToClipboard(elementId) {
//   console.log('called');
//   // Create a "hidden" input
//   var aux = document.createElement("input");

//   // Assign it the value of the specified element
//   aux.setAttribute("value", document.getElementById(elementId).innerHTML);

//   // Append it to the body
//   document.body.appendChild(aux);

//   // Highlight its content
//   aux.select();

//   // Copy the highlighted text
//   document.execCommand("copy");

//   // Remove it from the body
//   document.body.removeChild(aux);

// }

  // Local download functionality
  var saveNumber = 0;
  d3.select('#love').on('click', function() {
    saveNumber++;
    track('SaveSVG', saveNumber);
    svgData = d3.select('#dots').html();
    if (svgData.indexOf('<svg') !== -1) {
      prefix = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<!-- Generator: KoalasToTheMax.com -->',
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
      ];
      saveAs(new Blob(
        [svgData.replace('<svg', prefix.join(' ') + '<svg')],
        {type: "text/plain;charset=utf-8"}
      ), "KoalasToTheMax.svg");
    } else {
      track('SaveSVG', 'Fail');
    }
  });

})();
