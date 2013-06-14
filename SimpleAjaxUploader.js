/**  
 * Simple Ajax Uploader
 * Version 1.5.2
 * https://github.com/LPology/Simple-Ajax-Uploader
 *
 * Copyright 2012-2013 LPology, LLC  
 * Released under the MIT license 
 */ 

var ss = ss || {};

/**
 * Converts object to query string
 */ 
ss.obj2string = function(obj, prefix) {
  var str = [],
      prop;
  if (typeof obj !== 'object') {
    return '';
  }
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var k = prefix ? prefix + "[" + prop + "]" : prop, v = obj[prop];
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
  var prop;
  if (typeof first !== 'object' || typeof second !== 'object') {
    return false;
  }
  for (prop in second) {
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
    if (array[i] === item) {
      return true;
    }
  }
  return false;
};

/**
 * Remove all instances of an item from an array
 */
ss.removeItem = function(array, item) {
  for (var i in array) {
    if (array[i] == item) {
      array.splice(i,1);
      break;
    }
  }
};

ss.addEvent = function(elem, type, fn) {
  if (typeof elem === 'string') {
    elem = document.getElementById(elem);
  }	
  if (elem.attachEvent) {
    elem.attachEvent('on'+type, fn);
  } else {
    elem.addEventListener(type, fn, false);
  }
};

ss.removeEvent = function(elem, type, fn) {
  if (typeof elem === 'string') {
    elem = document.getElementById(elem);
  }
  if (elem.attachEvent) {
    elem.detachEvent('on' + type, fn);
  } else {
    elem.removeEventListener(type, fn, false);
  }
};

ss.newXHR = function() {
  if (typeof(XMLHttpRequest) !== undefined) {
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
  if (!data || typeof data !== 'string') {
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

/**
 * Calculates offsetTop/offsetLeft coordinates of parent 
 * element if getBoundingClientRect is not supported
 */
ss.getOffsetSum = function(elem) {
  var top = 0, 
      left = 0;
  while (elem) {
    top = top + parseInt(elem.offsetTop, 10);
    left = left + parseInt(elem.offsetLeft, 10);
    elem = elem.offsetParent;
  }
  return {top: top, left: left};
};

/**
 * Calculates offsetTop/offsetLeft coordinates of parent 
 * element with getBoundingClientRect
 */
ss.getOffsetRect = function(elem) {
  var box = elem.getBoundingClientRect(),
      body = document.body,
      docElem = document.documentElement,
      scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
      scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
      clientTop = docElem.clientTop || body.clientTop || 0,
      clientLeft = docElem.clientLeft || body.clientLeft || 0,
      top  = box.top +  scrollTop - clientTop,
      left = box.left + scrollLeft - clientLeft;
  return { top: Math.round(top), left: Math.round(left) };
};

/**
 * Get offset with best available method
 * Not sure where I came across this function. Thanks to whoever wrote it, though.
 */
ss.getOffset = function(elem) {
  if (elem.getBoundingClientRect) {
    return ss.getOffsetRect(elem);
    } else {
    return ss.getOffsetSum(elem);
  }
};

/**
* Returns left, top, right and bottom properties describing the border-box,
* in pixels, with the top-left relative to the body
*/
ss.getBox = function(el) {
  var left,
      right, 
      top, 
      bottom,
      offset = ss.getOffset(el);
  left = offset.left;
  top = offset.top;
  right = left + el.offsetWidth;
  bottom = top + el.offsetHeight;
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom
  };
};

/**
* Helper that takes object literal
* and add all properties to element.style
* @param {Element} el
* @param {Object} styles
*/
ss.addStyles = function(el, styles) {
  for (var name in styles) {
    if (styles.hasOwnProperty(name)) {
      el.style[name] = styles[name];
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
  return function(html){
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
  return text.toString().replace(/^\s+/, '').replace( /\s+$/, '');
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
*/   
ss.hasClass = function(element, name) {
  var re = new RegExp('(^| )' + name + '( |$)');
  return re.test(element.className);
};

/**
* Adds CSS class to an element
*/  
ss.addClass = function(element, name) {
  if (!name || name === '') {
    return false;
  }
  if (!ss.hasClass(element, name)) {
    element.className += ' ' + name;
  }
};

/**
* Removes CSS class from an element
*/  
ss.removeClass = function(element, name) {
  var re = new RegExp('(^| )' + name + '( |$)');
  element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, '');
};

/**
* Removes element from the DOM
*/  
ss.remove = function(elem) {
  if (elem.parentNode) {
    elem.parentNode.removeChild(elem);
  }
};

/**
 * Accepts a jquery object, a string containing an element ID, or an element, 
 * verifies that it exists, and returns the element.
 * @param {Mixed} elem
 * @return {Element} 
 */
ss.verifyElem = function(elem) {
  if (typeof jQuery !== 'undefined' && elem instanceof jQuery) {
      elem = elem[0];
  } else if (typeof elem === 'string') {
      if (/^#.*/.test(elem)) {				
          elem = elem.slice(1);                
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
  
  this._settings = {
    button: '',				
    url: '',
    progressUrl: false,
    multiple: false,
    maxUploads: 3,
    queue: true,
    checkProgressInterval: 50,
    keyParamName: 'APC_UPLOAD_PROGRESS',
    allowedExtensions: [],
    maxSize: false,
    name: '',				
    data: {},				
    autoSubmit: true,
    multipart: false,
    responseType: '',	
    debug: false,			
    hoverClass: '',			
    focusClass: '',			
    disabledClass: '',
    messages: {
      extError: '{name} is not a valid file type.'+"\n\n"+'Only {ext} files are permitted.',
      sizeError: '{name} is larger than the {size} size limit.'
    },
    onChange: function(filename, extension) {},				
    onSubmit: function(filename, extension) {},				
    onProgress: function(pct) {},			
    onUpdateFileSize: function(filesize) {},		
    onComplete: function(filename, response) {},			
    onError: function(filename, errorType, response) {},	
    startXHR: function(filename, fileSize) {},				
    endXHR: function(filename) {},							
    startNonXHR: function(filename) {},						
    endNonXHR: function(filename) {}					
  };
  
  ss.extendObj(this._settings, options);
  
  this._button = ss.verifyElem(this._settings.button);	
  
  if (this._button === false) {
    throw new Error("Invalid button. Make sure the element you're passing exists."); 
  }
  
  if (this._settings.multiple === false) {
    this._settings.maxUploads = 1;
  }
                            
  this._input = null;
  this._filename = null;
  this._ext = null; // file extension
  this._size = null; // file size
  this._file = null; // file record 
  this._queue = [];  
  this._progressBar = null;
  this._progressContainer = null;  
  this._fileSizeBox = null;
  this._activeUploads = 0;
  this._disabled = false;		// If disabled, clicking on button won't do anything

  // True in iframe uploads if _uploadProgressKey is not null and progressUrl set
  this._doProgressUpdates = false;

  // Contains the currently active upload progress server keys
  this._activeProgressKeys = [];
  
  // Unique key for tracking upload progress requests in iframe uploads
  // Is reset to a unique value returned by a call to uploadProgress.php after every upload (if enabled)
  this._uploadProgressKey = null;

  // Max # of failed progress updates requests in iframe mode
  // Safeguards against potential infinite loop which could result from server error
  this._maxUpdateFails = 10;
  
  if (this._isXhrUploadSupported()) {
    this._XhrIsSupported = true;
    this.log('XHR upload supported');
  } else {
    this._XhrIsSupported = false;
    this.log('XHR upload not supported, using iFrame method');    
    // Retrieve first upload progress key
    if (this._settings.progressUrl) {
      this._getUploadProgressKey();
    }
  }
  
  // These calls must always be last
  this._createInput();    
  this.enable();
  this._rerouteClicks();
};

ss.SimpleUpload.prototype = {

  /**
  * Send data to browser console if debug is set to true
  */ 
  log: function(str) {
    if (this._settings.debug && window.console) { 
      console.log('[uploader] ' + str);        
    }
  },	
	
  /**
  * Replaces user data
  * Note that all previously set data is entirely removed and replaced
  */
  setData: function(data) {
    if (typeof data === 'object') {
      this._settings.data = data;		
    } else {
      this._settings.data = {};
    }
  },
  
  /**
  * Designate an element as a progress bar
  * The CSS width % of the element will be updated as the upload progresses
  */
  setProgressBar: function(elem) {
    this._progressBar = ss.verifyElem(elem); 
  },  

  /**
  * Designate an element to receive a string containing file size at start of upload
  * Note: Uses innerHTML so any existing child elements will be wiped out
  */    
  setFileSizeBox: function(elem) {
    this._fileSizeBox = ss.verifyElem(elem); 
  },  
	
  /**
  * Designate an element to be removed from DOM when upload is completed
  * Useful for removing progress bar, file size, etc. after upload
  */  
  setProgressContainer: function(elem) {
    this._progressContainer = ss.verifyElem(elem); 
  },
  
  /**
  * Returns number of files currently in queue
  */    
  getQueueSize: function() {
    return this._queue.length;
  },
  
  /**
  * Remove the current file from the queue and cycle to the next
  */  
  removeCurrent: function() {
    this._queue.splice(0, 1); // remove the offending file
    this._cycleQueue();  
  },
  
  /**
  * Disables upload functionality
  */
  disable: function() {
    var nodeName = this._button.nodeName.toUpperCase();
    
    ss.addClass(this._button, this._settings.disabledClass);
    this._disabled = true;
        
    if (nodeName == 'INPUT' || nodeName == 'BUTTON') {
      this._button.setAttribute('disabled', 'disabled');
    }            
    
    // hide input
    if (this._input) {
      if (this._input.parentNode) {
        // We use visibility instead of display to fix problem with Safari 4
        this._input.parentNode.style.visibility = 'hidden';
      }
    }
  },
	
  /**
  * Enables upload functionality
  */
  enable: function() {
    ss.removeClass(this._button, this._settings.disabledClass);
    this._button.removeAttribute('disabled');
    this._disabled = false;    
  },
	
  /**
  * Checks whether browser supports XHR uploads
  */		
  _isXhrUploadSupported: function() {
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
        div = document.createElement('div'),
        input = document.createElement('input');                  
          
    input.setAttribute('type', 'file');
    input.setAttribute('name', self._settings.name);
    
    if (this._XhrIsSupported) {
      input.setAttribute('multiple', true);
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
        
    ss.addStyles(input, {
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
      if (typeof(div.filters) == 'undefined'){
        throw new Error('Opacity not supported by the browser');
      }
      div.style.filter = 'alpha(opacity=0)';
    }      
    
    ss.addEvent(input, 'change', function() {
      var filename,
          ext,
          total,
          i;
          
      if (!input || input.value === '') {
        return;                
      }
      
      if (!self._XhrIsSupported) {
        filename = ss.getFilename(input.value);
        ext = ss.getExt(filename);        
        if (false === self._settings.onChange.call(self, filename, ext)) {
          return;
        }      
        self._queue.push(input);            
      } else {
        filename = (input.files[0].fileName !== null && input.files[0].fileName !== undefined) ? input.files[0].fileName : input.files[0].name;
        filename = ss.getFilename(filename);
        ext = ss.getExt(filename);       
        if (false === self._settings.onChange.call(self, filename, ext)) {
          return;
        }
        total = input.files.length;
        // Only add first file if multiple uploads aren't allowed
        if (!self._settings.multiple) {
          total = 1;
        }        
        for (i = 0; i < total; i++) {
          self._queue.push(input.files[i]);               
        }         
      }
      
      self._clearInput();
     
      // Submit when file selected if autoSubmit option is set
      if (self._settings.autoSubmit) {
        self.submit();
      } 
      
      filename = null;
      ext = null;
    });                
    
    ss.addEvent(input, 'mouseover', function() {
      var button = self._button,
          hoverClass = self._settings.hoverClass;
      ss.addClass(button, hoverClass);
      button = null;
      hoverClass = null;
    });
    
    ss.addEvent(input, 'mouseout', function() {
      var button = self._button,
          fileinput = input,
          hoverClass = self._settings.hoverClass,
          focusClass = self._settings.focusClass;
      ss.removeClass(button, hoverClass);
      ss.removeClass(button, focusClass);
      
      if (fileinput.parentNode) {
        fileinput.parentNode.style.visibility = 'hidden';
      }
      button = null;
      hoverClass = null;
      focusClass = null;
      fileinput = null;
    });   
          
    ss.addEvent(input, 'focus', function() {
      var button = self._button,
          focusClass = self._settings.focusClass;      
      ss.addClass(button, focusClass);
      button = null;
      focusClass = null;
    });
    
    ss.addEvent(input, 'blur', function() {
      var button = self._button,
          focusClass = self._settings.focusClass;    
      ss.removeClass(button, focusClass);
      button = null;
      focusClass = null;
    });
    
    document.body.appendChild(div);        
    div.appendChild(input);
    self._input = input; 
  },  
  
  _clearInput: function() {
    if (!this._input) {
      return;
    } 
    ss.removeClass(this._button, this._settings.hoverClass);
    ss.removeClass(this._button, this._settings.focusClass);
    ss.remove(this._input.parentNode);                            
    this._input = null;
    this._createInput();		
  },

  /**
  * Makes sure that when user clicks upload button,
  * the this._input is clicked instead
  */
  _rerouteClicks: function() {
    var self = this;
  
    ss.addEvent(self._button, 'mouseover', function() {
      if (self._disabled) {
        return;
      }							
      if (!self._input) {
        self._createInput();
      }			
      var div = self._input.parentNode,
          button = self._button;
      ss.copyLayout(button, div);
      div.style.visibility = 'visible';
      div = null;
      button = null;
    });                
  },
	
  /**
  * Creates iframe with unique name
  * @return {Element} iframe
  */
  _createIframe: function() {
    var id = ss.getUID(),
        iframe = ss.toElement('<iframe src="javascript:false;" name="' + id + '" />');           

    document.body.appendChild(iframe);        
    iframe.style.display = 'none';
    iframe.setAttribute('id', id);
    return iframe;
  },
  
  /**
  * Creates form, that will be submitted to iframe
  * @param {Element} iframe Where to submit
  * @return {Element} form
  */
  _createForm: function(iframe) {
    var form = ss.toElement('<form method="post" enctype="multipart/form-data"></form>');

    document.body.appendChild(form);
    form.style.display = 'none';
    form.setAttribute('action', this._settings.url);		
    form.setAttribute('target', iframe.name);                                   
    return form;
  },
  
  /**
  * Creates hidden input fields for the form in iframe method
  * @param {String} name Input field name
  * @param {String} value Value assigned to the input
  * @return {Element} input
  */  
  _createHiddenInput: function(name, value) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');    
    input.setAttribute('name', name);
    input.setAttribute('value', value);
    return input;
  },
  
  _finish: function(response, filename, progressBar, fileSizeBox, progressContainer) {
    this.log('server response: '+response);        
    this._activeUploads--;
    
    if (this._settings.responseType.toLowerCase() == 'json') {
      response = ss.parseJSON(response);
    }
    
    if (response === false) {
      this.log('bad server response'); 
      this._settings.onError.call(this, filename, 'parseerror', response);
    } else {
      this._settings.onComplete.call(this, filename, response);
    }
    
    if (fileSizeBox) {
      fileSizeBox.innerHTML = '';
    }
    
    if (progressContainer) {
      ss.remove(progressContainer);
    }
    
    // Set to null to prevent memory leaks from circular reference
    response = null;
    filename = null;
    progressBar = null;
    fileSizeBox = null;
    progressContainer = null;    

    if (this._disabled) {
      this.enable();
    }
    
    // Begin uploading next file in the queue   
    this._cycleQueue();
  },  

  _cycleQueue: function() {   
    this._size = null;
    this._file = null;  
    this._filename = null;
    this._ext = null;
    this._fileSizeBox = null;
    this._progressBar = null;   
    this._progressContainer = null;
    
    if (this._queue.length > 0) {
      this.submit();
    }
  },	 
	
  /**
  * Handles uploading with XHR
  */		
  _uploadXhr: function(id) {
    var self = this,
        settings = self._settings,
        filename = self._filename,
        fileSize = Math.round(self._size / 1024),
        fileSizeBox = self._fileSizeBox,
        progressBar = self._progressBar,
        progressContainer = self._progressContainer,
        xhr = ss.newXHR(),
        params = {},			
        queryURL;
        
    if (false === settings.startXHR.call(self, filename, fileSize)) {
      if (self._disabled) {
        self.enable();
      }
      this._activeUploads--;
      return;
    }
    
    if (fileSizeBox) {
      fileSizeBox.innerHTML = fileSize + 'K';
    }
    
    // Reset progress bars to 0%
    settings.onProgress.call(self, 0);   
    
    if (progressBar) {
      progressBar.style.width = '0%';
    }     
    
    // Add name property to query string
    params[settings.name] = filename;
    
    // We get the any additional data here after startXHR()
    // in case the data was changed using setData() prior to submitting 
    ss.extendObj(params, settings.data);
    
    // Build query string
    queryURL = settings.url + '?' + ss.obj2string(params);
                
    ss.addEvent(xhr.upload, 'progress', function(event) {
      if (event.lengthComputable) {
        var progress_pct = Math.round( ( event.loaded / event.total ) * 100);			
        settings.onProgress.call(self, progress_pct);
        
        // Update progress bar width
        if (progressBar) {
          progressBar.style.width = progress_pct + '%';
        }
        progress_pct = null;
      }
    });
    
    ss.addEvent(xhr.upload, 'error', function() {
      self.log('transfer error during upload');
      settings.endXHR.call(self, filename, fileSize);
      settings.onError.call(self, filename, 'transfer error', 'none');				
    });			
          
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          settings.endXHR.call(self, filename, fileSize);
          self._finish(this.responseText, filename, progressBar, fileSizeBox, progressContainer);
        } else {
          self.log('Progress key error. Status: '+this.status+' Response: '+this.responseText);
          settings.onError.call(self, filename, 'server error', this.responseText);
        }
      }
    };			
    
    xhr.open('POST', queryURL, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(filename));      
    
    if (settings.responseType.toLowerCase() == 'json') {
      xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    }      
          
    if (settings.multipart === true) {
      var formData = new FormData();
      formData.append(settings.name, self._file);
      self.log('commencing upload using multipart form');
      xhr.send(formData);
    } else {
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');                 
      self.log('commencing upload using binary stream');
      xhr.send(self._file);
    }
    
    // Remove this file from the queue and begin next upload
    self.removeCurrent();   
  },
	
  /**
  * Handles server response for iframe uploads
  */
  _handleIframeResponse: function(iframe, filename, progressBar, fileSizeBox, progressContainer) {
    var doc,
        response;
        
    if (!iframe.parentNode) {
      return;
    }
  
    if (iframe.contentWindow) {
      doc = iframe.contentWindow.document;
    } else {
      if (iframe.contentDocument && iframe.contentDocument.document) {
        doc = iframe.contentDocument.document;
      } else {
        doc = iframe.contentDocument;
      }
    }
    
    if (doc.body && doc.body.innerHTML === false) {
      return;
    }
        
    response = doc.body.innerHTML;    
    ss.remove(iframe);
    iframe = null;    
    this._finish(response, filename, progressBar, fileSizeBox, progressContainer);
  },
	
  /**
  * Handles uploading with iFrame
  */	
  _uploadIframe: function() {
    var self = this,
        settings = self._settings,
        checkInterval = settings.checkProgressInterval,
        key = self._uploadProgressKey,
        progressBar = self._progressBar,
        progressContainer = self._progressContainer,
        fileSizeBox = self._fileSizeBox,
        filename = self._filename,
        iframe = self._createIframe(),
        form = self._createForm(iframe),
        data;
      
    // Upload progress key field must come before the file field
    if (self._doProgressUpdates) {
      var keyField = self._createHiddenInput(settings.keyParamName, key);
      form.appendChild(keyField);
    }      
      
    if (false === settings.startNonXHR.call(self, filename)) {
      if (self._disabled) {
        self.enable();    
      }
      this._activeUploads--;
      return;
    }

    // We get the any additional data here after startNonXHR()
    // in case the data was changed using setData() prior to submitting  
    data = settings.data;
    
    // Reset progress bars to 0%
    settings.onProgress.call(self, 0);   
    
    if (progressBar) {
      progressBar.style.width = '0%';
    }    
          
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {				
        var input = self._createHiddenInput(prop, data[prop]);
        form.appendChild(input);				
      }
    }			
            
    form.appendChild(self._file);
            
    ss.addEvent(iframe, 'load', function() {
      // Remove key from active progress keys array
      if (ss.contains(self._activeProgressKeys, key)) {
        ss.removeItem(self._activeProgressKeys, key);
      }
      ss.removeEvent(iframe, 'load', arguments.callee); 
      settings.endNonXHR.call(self, filename);
      self._handleIframeResponse(iframe, filename, progressBar, fileSizeBox, progressContainer);
      key = null;
    });		
    
    self.log('commencing upload using iframe');    
    form.submit();
    ss.remove(form);  
    form = null;
    
    if (self._doProgressUpdates) {    
      // Add progress key to active key array
      self._activeProgressKeys.push(key);
      
      // Start timer for first progress update
      window.setTimeout(function() {
          self.log('requesting first progress update');
          self._getUploadProgress(key, progressBar, fileSizeBox, 1);
      }, checkInterval);

      // Get new upload progress key          
      self._alterProgressKey();             
    }    
    
    // Remove this file from the queue
    self.removeCurrent();       
  },  

  /**
  * Retrieves upload progress updates from the server
  * (for fallback upload progress support)
  */   
  _getUploadProgress: function(key, progressBar, sizeBox, counter) {
    if (!key) {
      return;
    } 
    
    var self = this,
        settings = self._settings,
        xhr = ss.newXHR(),
        time = new Date().getTime(),
        url = settings.progressUrl + '?progresskey=' + encodeURIComponent(key) + '&_='+time;        
        
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
            
            if (response.pct < 100 && ss.contains(self._activeProgressKeys, key)) {          
              
              if (response.pct === 0 && response.size === 0 && counter >= self._maxUpdateFails) {
                self.log('reached limit of failed progress requests');
                return;
              }
              
              window.setTimeout(function() {
                  self._getUploadProgress(key, progressBar, sizeBox, counter);
                  key = null;
                  counter = null;
              }, checkInterval);                                     
            }
            checkInterval = null;
          }
        } else {
          key = null;
          self._doProgressUpdates = false;
          self._uploadProgressKey = null;
          ss.removeItem(self._activeProgressKeys, key);
          self.log('Progress error. Status: '+this.status+' Response: '+this.responseText);
        }
      }                 
      response = null;
    };  
    
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send();
    xhr = null;
  },
  
  _alterProgressKey: function() {
    this._uploadProgressKey = this._uploadProgressKey + ss.getUID();
  },

  /**
  * Gets the unique key from the server used to identify which upload we want to know about.
  * (for fallback upload progress support)
  */  
  _getUploadProgressKey: function() {
    var self = this,
        xhr = ss.newXHR(),
        time = new Date().getTime(),
        url = self._settings.progressUrl + '?getkey='+time;
        
    // Prevent a previous server key from allowing progress 
    // updates for another upload
    self._uploadProgressKey = null;
    
    xhr.onreadystatechange = function() {
      var response;
      if (this.readyState === 4) {
        if (this.status === 200) {
          response = ss.parseJSON(this.responseText);
          if (response && response.key) {
            self._uploadProgressKey = response.key;
            self.log('upload progress key received. Key: '+response.key);
          }
        } else {          
          self.log('error retrieving progress key. Status: '+this.status+' Server response: '+this.responseText);
        }
      }
    };        
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader('Cache-Control', 'no-cache');    
    xhr.send();
    xhr = null;
  },
  
  _errorMsg: function(type) {
    var messages = this._settings.messages,
        nameRegex = new RegExp('{name}', 'g'),    
        msg,
        regex,
        replace = '';
        
    if (type == 'ext') {
      var extensions = this._settings.allowedExtensions,
          num = extensions.length,
          item,
          i;          
      regex = new RegExp('{ext}', 'g');
      for (i = 0; i < num; i++) {
        item = extensions[i].toUpperCase();        
        if (i + 2 === num) {
          item = item + ' and ';
        } else if (num > 2 && i + 2 < num) {
          item = item + ', ';
        }        
        replace += item;
      }
      msg = messages.extError.replace(regex, replace);
    }
    
    if (type == 'size') {
      replace = this._settings.maxSize + 'K';
      regex = new RegExp('{size}', 'g');   
      msg = messages.sizeError.replace(regex, replace);
    }
    
    msg = msg.replace(nameRegex, this._filename);
    alert(msg);    
  },

  _checkFile: function() {
    if (!this._file || this._file.value === '') {
      this.log('no file to upload');
      return false;         
    }        
    
    // Only check file type if allowedExtensions is set
    if (this._settings.allowedExtensions.length > 0) {
      if (!this._checkExtension(this._ext)) {
        this.log('File extension not permitted');
        this._errorMsg('ext');
        return false;
      }
    }   
    
    if (this._size !== null && this._settings.maxSize !== false && this._size / 1024 > this._settings.maxSize) {
      this.log('file exceeds ' + this._settings.maxSize + 'K limit');
      this._errorMsg('size');
      return false;
    }
    
    this.log('pre-upload file check is successful');
    return true;
  },  
  
  _checkExtension: function(ext) {
    var allowed = this._settings.allowedExtensions,
        i = allowed.length;
    ext = ext.toLowerCase();
    while (i--) {
      if (allowed[i].toLowerCase() == ext) {
        return true;
      }    
    }    
    return false;
  },
	
  /**
  * Validates input and directs to either XHR method or iFrame method
  */
  submit: function() {    
    if (this._disabled || this._activeUploads >= this._settings.maxUploads) {
      return;
    }    
    
    // The next file in the queue will always be in the front of the array
    this._file = this._queue[0];    
    
    if (this._XhrIsSupported) {
      this._filename = (this._queue[0].fileName !== null && this._queue[0].fileName !== undefined) ? this._queue[0].fileName : this._queue[0].name;
      this._filename = ss.getFilename(this._filename);
      this._size = this._queue[0].size;
    } else {
      this._filename = ss.getFilename(this._queue[0].value);
    }
    
    this._ext = ss.getExt(this._filename);   

    if (!this._checkFile()) {
      this.removeCurrent();
      return;
    }
      
    // User returned false to cancel upload
    if (false === this._settings.onSubmit.call(this, this._filename, this._ext)) {
      return;
    }
    
    // Increment the active upload counter
    this._activeUploads++;
    
    // Disable uploading if multiple file uploads are not enabled
    // or if queue is disabled and we've reached max uploads
    if (this._settings.multiple === false || this._settings.queue === false && this._activeUploads >= this._settings.maxUploads) {
      this.disable();
    }
            
    // Use XHR if supported by browser, otherwise use iframe method
    if (this._XhrIsSupported) {
      this._uploadXhr();		
    } else {
      // Determine whether incremental progress updates will be retrieved from server
      if (this._settings.progressUrl !== false && this._uploadProgressKey !== null) {
        this._doProgressUpdates = true;
      } else {
        this._doProgressUpdates = false;
        this.log('no upload progress - progressUrl not defined or progress key not available');      
      }            
      this._uploadIframe();
    }			
  }	
};
