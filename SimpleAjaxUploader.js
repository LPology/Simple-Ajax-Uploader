/**
 * Simple Ajax Uploader
 * Version 1.7
 * https://github.com/LPology/Simple-Ajax-Uploader
 *
 * Copyright 2012-2013 LPology, LLC
 * Released under the MIT license
 */

;(function(window, document, undefined) {

"use strict";

var ss = window.ss || {};

/**
 * Converts object to query string
 */
ss.obj2string = function(obj, prefix) {
  var str = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var k = prefix ? prefix + '[' + prop + ']' : prop, v = obj[prop];
      str.push(typeof v === 'object' ?
        ss.obj2string(v, k) :
        encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  }
  return str.join('&');
};

/**
 * Copies all missing properties from second object to first object
 */
ss.extendObj = function(first, second) {
  for (var prop in second) {
    if (second.hasOwnProperty(prop)) {
      first[prop] = second[prop];
    }
  }
};

/**
 * Returns true if item is found in array
 */
ss.contains = function(array, item) {
  var i = array.length;
  while (i--) {
    if (array[i] == item) {
      return true;
    }
  }
  return false;
};

/**
 * Remove all instances of an item from an array
 */
ss.removeItem = function(array, item) {
  var i = array.length;
  while (i--) {
    if (array[i] == item) {
      array.splice(i, 1);
    }
  }
};

ss.addEvent = function(elem, type, fn) {
  if (elem.attachEvent) {
    elem.attachEvent('on' + type, fn);
  } else {
    elem.addEventListener(type, fn, false);
  }
};

ss.newXHR = function() {
  if (typeof XMLHttpRequest !== 'undefined') {
    return new window.XMLHttpRequest();
  } else if (window.ActiveXObject) {
    try {
      return new window.ActiveXObject('Microsoft.XMLHTTP');
    } catch (err) {
      return false;
    }
  }
};

/**
 * Parses a JSON string and returns a Javascript object
 * Parts borrowed from www.jquery.com
 */
 ss.parseJSON = function(data) {
  if (!data) {
    return false;
  }
  data = ss.trim(data);
  if (window.JSON && window.JSON.parse) {
    try {
      return window.JSON.parse(data);
    } catch (err) {
      return false;
    }
  }
  if (data) {
    if (/^[\],:{}\s]*$/.test( data.replace(/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, "@" )
      .replace(/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g, "]" )
      .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {
      return ( new Function( "return " + data ) )();
    }
  }
  return false;
};

ss.getBox = function(elem) {
  var box,
      docElem,
      top = 0,
      left = 0;
  if (elem.getBoundingClientRect) {
    box = elem.getBoundingClientRect();
    docElem = document.documentElement;
    top = box.top  + ( window.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 );
    left = box.left + ( window.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 );
  } else {
    do {
      left += elem.offsetLeft;
      top += elem.offsetTop;
    } while ( (elem = elem.offsetParent) );
  }
  return {
    top: Math.round(top),
    left: Math.round(left)
  };
};

/**
* Helper that takes object literal
* and add all properties to element.style
* @param {Element} el
* @param {Object} styles
*/
ss.addStyles = function(elem, styles) {
  for (var name in styles) {
    if (styles.hasOwnProperty(name)) {
      elem.style[name] = styles[name];
    }
  }
};

/**
* Function places an absolutely positioned
* element on top of the specified element
* copying position and dimensions.
*/
ss.copyLayout = function(from, to) {
  var box = ss.getBox(from);
  ss.addStyles(to, {
    position: 'absolute',
    left : box.left + 'px',
    top : box.top + 'px',
    width : from.offsetWidth + 'px',
    height : from.offsetHeight + 'px'
  });
};

/**
* Creates and returns element from html chunk
*/
ss.toElement = (function() {
  var div = document.createElement('div');
  return function(html) {
    div.innerHTML = html;
    var element = div.firstChild;
    div.removeChild(element);
    return element;
  };
})();

/**
* Generates unique id
*/
ss.getUID = (function() {
  var id = 0;
  return function(){
    return id++;
  };
})();

/**
* Removes white space from left and right of string
*/
ss.trim = function(text) {
  return text.toString().replace(/^\s+/, '').replace(/\s+$/, '');
};

/**
* Extract file name from path
*/
ss.getFilename = function(path) {
  return path.replace(/.*(\/|\\)/, '');
};

/**
* Get file extension
*/
ss.getExt = function(file) {
  return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
};

/**
* Check whether element has a particular CSS class
* Parts borrowed from www.jquery.com
*/
ss.hasClass = function(elem, name) {
  return ( (' ' + elem.className + ' ').replace(/[\t\r\n]/g, ' ').indexOf(' ' + name + ' ') >= 0 );
};

/**
* Adds CSS class to an element
*/
ss.addClass = function(elem, name) {
  if (!name || name === '') {
    return false;
  }
  if (!ss.hasClass(elem, name)) {
    elem.className += ' ' + name;
  }
};

/**
* Removes CSS class from an element
*/
ss.removeClass = function(e, name) {
  e.className = e.className.replace( new RegExp('(?:^|\\s)' + name + '(?!\\S)') ,'');
};

/**
* Nulls out event handlers to prevent memory leaks in IE6/IE7
* Credit: http://javascript.crockford.com/memory/leak.html
* @param {Element} d
* @return void
*/
ss.purge = function(d) {
  var a = d.attributes, i, l, n;
  if (a) {
    for (i = a.length - 1; i >= 0; i -= 1) {
      n = a[i].name;
      if (typeof d[n] === 'function') {
        d[n] = null;
      }
    }
  }
  a = d.childNodes;
  if (a) {
    l = a.length;
    for (i = 0; i < l; i += 1) {
      ss.purge(d.childNodes[i]);
    }
  }
};

/**
* Removes element from the DOM
*/
ss.remove = function(elem) {
  ss.purge(elem); // null out event handlers
  if (elem.parentNode) {
    elem.parentNode.removeChild(elem);
  }
};

/**
 * Accepts either a jQuery object, a string containing an element ID, or an element,
 * verifies that it exists, and returns the element.
 * @param {Mixed} elem
 * @return {Element}
 */
ss.verifyElem = function(elem) {
  if (typeof jQuery !== 'undefined' && elem instanceof jQuery) {
    elem = elem[0];
  } else if (typeof elem === 'string') {
    if (elem.charAt(0) == '#') {
      elem = elem.substr(1);
    }
    elem = document.getElementById(elem);
  }
  if (!elem || elem.nodeType !== 1) {
    return false;
  }
  if (elem.nodeName.toUpperCase() == 'A') {
    ss.addEvent(elem, 'click', function(e) {
        if (e && e.preventDefault) {
          e.preventDefault();
        } else if (window.event) {
          window.event.returnValue = false;
        }
    });
  }
  return elem;
};

/**
* @constructor
* @param {Object} options

  View README.md for documentation
*/
ss.SimpleUpload = function(options) {

  this._opts = {
    button: '',
    url: '',
    progressUrl: false,
    multiple: false,
    maxUploads: 3,
    queue: true,
    checkProgressInterval: 50,
    keyParamName: 'APC_UPLOAD_PROGRESS',
    allowedExtensions: [],
    accept: '',
    maxSize: false,
    name: '',
    data: {},
    autoSubmit: true,
    multipart: false,
    method: 'POST',
    responseType: '',
    debug: false,
    hoverClass: '',
    focusClass: '',
    disabledClass: '',
    onChange: function(filename, extension) {},
    onSubmit: function(filename, extension) {},
    onProgress: function(pct) {},
    onUpdateFileSize: function(filesize) {},
    onComplete: function(filename, response) {},
    onExtError: function(filename, extension) {},
    onSizeError: function(filename, fileSize) {},
    onError: function(filename, errorType, response) {},
    startXHR: function(filename, fileSize) {},
    endXHR: function(filename, fileSize) {},
    startNonXHR: function(filename) {},
    endNonXHR: function(filename) {}
  };

  ss.extendObj(this._opts, options);

  this._button = ss.verifyElem(this._opts.button);

  if (this._button === false) {
    throw new Error("Invalid button. Make sure the element you're passing exists.");
  }

  if (this._opts.multiple === false) {
    this._opts.maxUploads = 1;
  }

  this._overButton = false;
  this._queue = [];
  this._active = 0;
  this._disabled = false;		// If disabled, clicking on button won't do anything

  // True in iframe uploads if _progKey is not null and progressUrl set
  this._doProg = false;

  // Contains the currently active upload progress server keys
  this._progKeys = [];

  // Max # of failed progress updates requests in iframe mode
  // Safeguards against potential infinite loop which could result from server error
  this._maxFails = 10;

  if (this._isXhrOk()) {
    this._XhrOk = true;
  } else {
    this._XhrOk = false;
    // Retrieve first upload progress key
    if (this._opts.progressUrl) {
      this._getKey();
    }
  }

  // Check for Safari so we don't allow it to use multiple file selection
  // Credit: http://stackoverflow.com/a/9851769/1091949
  this._isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

  // These calls must always be last
  this._createInput();
  this.enable();
  this.rerouteClicks(this._button);
};

ss.SimpleUpload.prototype = {

  /**
  * Send data to browser console if debug is set to true
  */
  log: function(str) {
    if (this._opts.debug && window.console) {
      console.log('[uploader] ' + str);
    }
  },

  /**
  * Replaces user data
  * Note that all previously set data is entirely removed and replaced
  */
  setData: function(data) {
    this._opts.data = data;
  },

  /**
  * Designate an element as a progress bar
  * The CSS width % of the element will be updated as the upload progresses
  */
  setProgressBar: function(elem) {
    this._progBar = ss.verifyElem(elem);
  },

  /**
  * Designate an element to receive a string containing file size at start of upload
  * Note: Uses innerHTML so any existing child elements will be wiped out
  */
  setFileSizeBox: function(elem) {
    this._sizeBox = ss.verifyElem(elem);
  },

  /**
  * Designate an element to be removed from DOM when upload is completed
  * Useful for removing progress bar, file size, etc. after upload
  */
  setProgressContainer: function(elem) {
    this._progBox = ss.verifyElem(elem);
  },

  /**
  * Returns number of files currently in queue
  */
  getQueueSize: function() {
    return this._queue.length;
  },

  /**
  * Enables uploader and submits next file for upload
  */
  _cycleQueue: function() {
    if (this._disabled) {
      this.enable();
    }
    if (this._queue.length > 0 && this._opts.autoSubmit) {
      this.submit();
    }
  },

  /**
  * Remove current file from upload queue, reset props, cycle to next upload
  */
  removeCurrent: function() {
    ss.removeItem(this._queue, this._file);
    this._file = null;
    this._cycleQueue();
  },

  /**
  * Disables upload functionality
  */
  disable: function() {
    var nodeName = this._button.nodeName.toUpperCase();

    ss.addClass(this._button, this._opts.disabledClass);
    this._disabled = true;

    if (nodeName == 'INPUT' || nodeName == 'BUTTON') {
      this._button.disabled = true;
    }

    // Hide input
    if (this._input && this._input.parentNode) {
      // We use visibility instead of display to fix problem with Safari 4
      this._input.parentNode.style.visibility = 'hidden';
    }
  },

  /**
  * Enables upload functionality
  */
  enable: function() {
    ss.removeClass(this._button, this._opts.disabledClass);
    this._button.disabled = false;
    this._disabled = false;
  },

  /**
  * Checks whether browser supports XHR uploads
  */
  _isXhrOk: function() {
    var input = document.createElement('input');

    input.type = 'file';
    return (
      'multiple' in input &&
      typeof File != 'undefined' &&
      typeof (new XMLHttpRequest()).upload != 'undefined');
  },

  /**
  * Creates invisible file input
  * that will hover above the button
  * <div><input type='file' /></div>
  */
  _createInput: function() {
    var self = this,
        div = document.createElement('div');

    this._input = document.createElement('input');
    this._input.type = 'file';
    this._input.name = this._opts.name;

    // Don't allow multiple file selection in Safari -- it has a nasty bug
    // See: http://stackoverflow.com/q/7231054/1091949
    if (this._XhrOk && !this._isSafari) {
      this._input.multiple = true;
    }

    // Check support for file input accept attr and set if defined
    if ('accept' in this._input && this._opts.accept !== '') {
      this._input.accept = this._opts.accept;
    }

    ss.addStyles(div, {
      'display' : 'block',
      'position' : 'absolute',
      'overflow' : 'hidden',
      'margin' : 0,
      'padding' : 0,
      'opacity' : 0,
      'direction' : 'ltr',
      'zIndex': 2147483583
    });

    ss.addStyles(this._input, {
      'position' : 'absolute',
      'right' : 0,
      'margin' : 0,
      'padding' : 0,
      'fontSize' : '480px',
      'fontFamily' : 'sans-serif',
      'cursor' : 'pointer'
    });

    // Make sure that element opacity exists. Otherwise use IE filter
    if (div.style.opacity !== '0') {
      div.style.filter = 'alpha(opacity=0)';
    }

    ss.addEvent(this._input, 'change', function() {
      var filename,
          ext,
          total,
          i;

      if (!self._input || self._input.value === '') {
        return;
      }

      if (!self._XhrOk) {
        filename = ss.getFilename(self._input.value);
        ext = ss.getExt(filename);
        if (false === self._opts.onChange.call(self, filename, ext)) {
          return;
        }
        self._queue.push(self._input);
      } else {
        filename = ss.getFilename(self._input.files[0].name);
        ext = ss.getExt(filename);
        if (false === self._opts.onChange.call(self, filename, ext)) {
          return;
        }
        total = self._input.files.length;
        // Only add first file if multiple uploads aren't allowed
        if (!self._opts.multiple) {
          total = 1;
        }
        for (i = 0; i < total; i++) {
          self._queue.push(self._input.files[i]);
        }
      }

      // Now that file is in upload queue, remove the file input
      ss.removeClass(self._button, self._opts.hoverClass);
      ss.removeClass(self._button, self._opts.focusClass);
      ss.remove(self._input.parentNode);
      self._input = null;

      // Then create a new file input
      self._createInput();

      // Submit if autoSubmit option is true
      if (self._opts.autoSubmit) {
        self.submit();
      }
    });

    ss.addEvent(this._input, 'mouseover', function() {
      if (self._overButton !== true) {
        return;
      }
      ss.addClass(self._button, self._opts.hoverClass);
    });

    ss.addEvent(this._input, 'mouseout', function() {
      if (self._overButton !== true) {
        return;
      }
      ss.removeClass(self._button, self._opts.hoverClass);
      ss.removeClass(self._button, self._opts.focusClass);
      self._input.parentNode.style.visibility = 'hidden';
    });

    ss.addEvent(this._input, 'focus', function() {
      if (self._overButton !== true) {
        return;
      }
      ss.addClass(self._button, self._opts.focusClass);
    });

    ss.addEvent(this._input, 'blur', function() {
      if (self._overButton !== true) {
        return;
      }
      ss.removeClass(self._button, self._opts.focusClass);
    });

    document.body.appendChild(div);
    div.appendChild(this._input);
  },

  /**
  * Makes sure that when user clicks upload button,
  * the this._input is clicked instead
  */
  rerouteClicks: function(elem) {
    var self = this;

    elem = ss.verifyElem(elem);

    ss.addEvent(elem, 'mouseover', function() {
      if (self._disabled) {
        return;
      }
      if (!self._input) {
        self._createInput();
      }
      if (elem == self._button) {
        self._overButton = true;
      } else {
        self._overButton = false;
      }
      ss.copyLayout(elem, self._input.parentNode);
      self._input.parentNode.style.visibility = 'visible';
    });
  },

  /**
  * Creates iframe with unique name
  * @return {Element} iframe
  */
  _getFrame: function() {
    var id = ss.getUID(),
        iframe = ss.toElement('<iframe src="javascript:false;" name="' + id + '" />');

    document.body.appendChild(iframe);
    iframe.style.display = 'none';
    iframe.id = id;
    return iframe;
  },

  /**
  * Creates form, that will be submitted to iframe
  * @param {Element} iframe Where to submit
  * @return {Element} form
  */
  _getForm: function(iframe) {
    var form = ss.toElement('<form method="post" enctype="multipart/form-data"></form>');

    document.body.appendChild(form);
    form.style.display = 'none';
    form.action = this._opts.url;
    form.target = iframe.name;
    return form;
  },

  /**
  * Creates hidden input fields for the form in iframe method
  * @param {String} name Input field name
  * @param {String} value Value assigned to the input
  * @return {Element} input
  */
  _getHidden: function(name, value) {
    var input = document.createElement('input');

    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
  },

  /**
  * Completes upload request if an error is detected
  */
  _errorFinish: function(errorType, filename, response, progBar, sizeBox, progBox) {
    this._active--;
    this.log('Error. Server response :'+response);

    if (sizeBox) {
      sizeBox.innerHTML = '';
    }
    if (progBox) {
      ss.remove(progBox);
    }

    this._opts.onError.call(this, filename, errorType, response);

    // Set to null to prevent memory leaks
    response = null;
    filename = null;
    progBar = null;
    sizeBox = null;
    progBox = null;

    this._cycleQueue();
  },

  /**
  * Completes upload request if the transfer was successful
  */
  _finish: function(response, filename, progBar, sizeBox, progBox) {
    // Save response text in case it can't be parsed as JSON
    var responseText = response;

    if (this._opts.responseType.toLowerCase() == 'json') {
      response = ss.parseJSON(response);
      if (response === false) {
        this._errorFinish('parseerror', filename, responseText, progBar, sizeBox, progBox);
        return;
      }
    }

    // Note: errorFinish() also decrements _active, so
    // only do it after errorFinish() can no longer be called
    this._active--;
    this.log('server response: '+responseText);

    if (sizeBox) {
      sizeBox.innerHTML = '';
    }
    if (progBox) {
      ss.remove(progBox);
    }

    this._opts.onComplete.call(this, filename, response);

    // Set to null to prevent memory leaks
    response = null;
    responseText = null;
    filename = null;
    progBar = null;
    sizeBox = null;
    progBox = null;

    // Begin uploading next file in the queue
    this._cycleQueue();
  },

  /**
  * Handles uploading with XHR
  */
  _uploadXhr: function(filename, size, sizeBox, progBar, progBox) {
    var self = this,
        settings = this._opts,
        xhr = ss.newXHR(),
        params = {},
        queryURL;

    if (false === settings.startXHR.call(this, filename, size)) {
      if (this._disabled) {
        this.enable();
      }
      this._active--;
      return;
    }

    if (sizeBox) {
      sizeBox.innerHTML = size + 'K';
    }

    // Add name property to query string
    params[settings.name] = filename;

    // We get the any additional data here after startXHR()
    // in case the data was changed with setData() prior to submitting
    ss.extendObj(params, settings.data);

    // Build query string
    queryURL = settings.url + '?' + ss.obj2string(params);

    // Reset progress bars to 0%
    settings.onProgress.call(this, 0);

    if (progBar) {
      progBar.style.width = '0%';
    }

    ss.addEvent(xhr.upload, 'progress', function(event) {
      if (event.lengthComputable) {
        var progress_pct = Math.round( ( event.loaded / event.total ) * 100);
        settings.onProgress.call(self, progress_pct);

        // Update progress bar width
        if (progBar) {
          progBar.style.width = progress_pct + '%';
        }
        progress_pct = null;
      }
    });

    ss.addEvent(xhr.upload, 'error', function() {
      self._errorFinish('transfererror', filename, 'None', progBar, sizeBox, progBox);
    });

    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200 || this.status === 201) {
          settings.endXHR.call(self, filename, size);
          self._finish(this.responseText, filename, progBar, sizeBox, progBox);
        } else {
          self._errorFinish('servererror', filename, this.responseText, progBar, sizeBox, progBox);
        }
      }
    };

    xhr.open(settings.method.toUpperCase(), queryURL, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(filename));

    if (settings.responseType.toLowerCase() == 'json') {
      xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    }

    if (settings.multipart === true) {
      var formData = new FormData();
      for (var prop in settings.data) {
        if (settings.data.hasOwnProperty(prop)) {
          formData.append(prop, settings.data[prop]);
        }
      }
      formData.append(settings.name, this._file);
      this.log('uploading - using multipart form');
      xhr.send(formData);
    } else {
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      this.log('uploading - using binary stream');
      xhr.send(this._file);
    }

    // Remove file from upload queue and begin next upload
    this.removeCurrent();
  },

  /**
  * Handles uploading with iFrame
  */
  _uploadIframe: function(filename, sizeBox, progBar, progBox) {
    var self = this,
        settings = this._opts,
        key = this._progKey,
        iframe = this._getFrame(),
        form = this._getForm(iframe);

    if (false === settings.startNonXHR.call(this, filename)) {
      if (this._disabled) {
        this.enable();
      }
      this._active--;
      return;
    }

    // Upload progress key field must come before the file field
    if (this._doProg) {
      var keyField = this._getHidden(settings.keyParamName, key);
      form.appendChild(keyField);
    }

    // We get the any additional data here after startNonXHR()
    // in case the data was changed with setData() prior to submitting
    for (var prop in settings.data) {
      if (settings.data.hasOwnProperty(prop)) {
        var input = this._getHidden(prop, settings.data[prop]);
        form.appendChild(input);
      }
    }

    form.appendChild(this._file);

    // Reset progress bars to 0%
    settings.onProgress.call(this, 0);

    if (progBar) {
      progBar.style.width = '0%';
    }

    ss.addEvent(iframe, 'load', function() {
      var doc = iframe.contentDocument ?
            iframe.contentDocument :
            iframe.contentWindow.document,
          response = doc.body.innerHTML;

      // Remove key from active progress keys array
      ss.removeItem(self._progKeys, key);
      ss.remove(iframe);
      iframe = null;
      key = null;
      settings.endNonXHR.call(self, filename);
      self._finish(response, filename, progBar, sizeBox, progBox);
    });

    self.log('commencing upload using iframe');
    form.submit();
    ss.remove(form);
    form = null;

    if (self._doProg) {
      // Add progress key to active key array
      this._progKeys.push(key);

      // Start timer for first progress update
      window.setTimeout(function() {
          self.log('requesting first progress update');
          self._getProg(key, progBar, sizeBox, 1);
      }, self._opts.checkProgressInterval);

      // Get new upload progress key
      this._progKey = this._progKey + ss.getUID();
      // Max key length allowed by PHP is 57 characters
      if (this._progKey.length >= 57) {
        this._progKey = ss.getUID() + this._progKey.substring(0, 15);
      }
    }

    // Remove this file from the queue and begin next upload
    this.removeCurrent();
  },

  /**
  * Retrieves upload progress updates from the server
  * (for fallback upload progress support)
  */
  _getProg: function(key, progressBar, sizeBox, counter) {
    if (!key) {
      return;
    }

    var self = this,
        settings = this._opts,
        xhr = ss.newXHR(),
        time = new Date().getTime(),
        url = settings.progressUrl +
              '?progresskey=' +
              encodeURIComponent(key) + '&_=' + time;

    xhr.onreadystatechange = function() {
      var response,
          checkInterval = settings.checkProgressInterval;
      if (this.readyState === 4) {
        if (this.status === 200) {
          response = ss.parseJSON(this.responseText);
          if (response && response.success === true) {
            counter++;
            settings.onUpdateFileSize.call(self, response.size);
            settings.onProgress.call(self, response.pct);

            // Update progress bar width
            if (progressBar) {
              progressBar.style.width = response.pct + '%';
            }
            if (sizeBox && response.size) {
              sizeBox.innerHTML = response.size + 'K';
            }

            if (response.pct < 100 && ss.contains(self._progKeys, key)) {

              if (response.pct === 0 &&
                  response.size === 0 &&
                  counter >= self._maxFails)
              {
                self.log('reached limit of failed progress requests');
                return;
              }

              window.setTimeout(function() {
                  self._getProg(key, progressBar, sizeBox, counter);
                  key = null;
                  counter = null;
              }, checkInterval);
            }
            checkInterval = null;
          }
        } else {
          key = null;
          self._doProg = false;
          self._progKey = null;
          ss.removeItem(self._progKeys, key);
          self.log('Progress error. Status: '+this.status+' Response: '+this.responseText);
        }
      }
      response = null;
    };

    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.send();
    xhr = null;
  },

  /**
  * Gets the unique key from the server used to identify which upload we want to know about.
  * (for fallback upload progress support)
  */
  _getKey: function() {
    var self = this,
        xhr = ss.newXHR(),
        time = new Date().getTime(),
        url = self._opts.progressUrl +
              '?getkey=' +
              time;

    // Prevent a previous server key from allowing progress
    // updates for another upload
    self._progKey = null;

    xhr.onreadystatechange = function() {
      var response;
      if (this.readyState === 4) {
        if (this.status === 200) {
          response = ss.parseJSON(this.responseText);
          if (response && response.key) {
            self._progKey = response.key;
            self.log('upload progress key received. Key: '+response.key);
          }
        } else {
          self.log('Progress key error. Status: '+this.status+' Response: '+this.responseText);
        }
      }
    };
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.send();
    xhr = null;
  },

  /**
  * Verifies that file is allowed
  * Checks file extension and file size if limits are set
  */
  _checkFile: function(filename, ext, size) {
    var allowed = this._opts.allowedExtensions,
        i = allowed.length,
        extOk = false;

    // Only file extension if allowedExtensions is set
    if (i > 0) {
      ext = ext.toLowerCase();
      while (i--) {
        if (allowed[i].toLowerCase() == ext) {
          extOk = true;
          break;
        }
      }
      if (!extOk) {
        this.removeCurrent();
        this.log('file extension not permitted');
        this._opts.onExtError.call(this, filename, ext);
        return false;
      }
    }

    if (size &&
        this._opts.maxSize !== false &&
        size > this._opts.maxSize)
    {
      this.removeCurrent();
      this.log(filename + ' exceeds ' + this._opts.maxSize + 'K limit');
      this._opts.onSizeError.call(this, filename, size);
      return false;
    }

    return true;
  },

  /**
  * Validates input and directs to either XHR method or iFrame method
  */
  submit: function() {
    var filename,
        ext,
        size;

    if (this._disabled ||
        this._active >= this._opts.maxUploads ||
        this._queue.length < 1)
    {
      return;
    }

    // The next file in the queue will always be in the front of the array
    this._file = this._queue[0];

    if (this._XhrOk) {
      filename = ss.getFilename(this._file.name);
      size = Math.round( this._file.size / 1024 );
    } else {
      filename = ss.getFilename(this._file.value);
    }

    ext = ss.getExt(filename);

    if (!this._checkFile(filename, ext, size)) {
      return;
    }

    // User returned false to cancel upload
    if (false === this._opts.onSubmit.call(this, filename, ext)) {
      return;
    }

    // Disable uploading if multiple file uploads are not enabled
    // or if queue is disabled and we've reached max uploads
    if (this._opts.multiple === false ||
        this._opts.queue === false && this._active >= this._opts.maxUploads)
    {
      this.disable();
    }

    // Increment the active upload counter
    this._active++;

    // Use XHR if supported by browser, otherwise use iframe method
    if (this._XhrOk) {
      this._uploadXhr(filename, size, this._sizeBox, this._progBar, this._progBox);
    } else {
      // Determine whether incremental progress updates will be retrieved from server
      if (this._opts.progressUrl !== false && this._progKey) {
        this._doProg = true;
      } else {
        this._doProg = false;
        this.log('no upload progress - progressUrl not defined or progress key not available');
      }
      this._uploadIframe(filename, this._sizeBox, this._progBar, this._progBox);
    }

    this._sizeBox = null;
    this._progBar = null;
    this._progBox = null;
  }
};

// Expose to the global window object
window.ss = ss;

})(window, document);
