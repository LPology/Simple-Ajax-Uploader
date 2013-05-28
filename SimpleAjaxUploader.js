/**
 * Simple Ajax Uploader
 * Version 1.4.2
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
    return window.JSON.parse(data);
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
  return function(){ return id++; };
})();

/**
* Removes white space from left and right of string
*/
ss.trim = function(text) {
  return text.toString().replace(/^\s+/, '').replace( /\s+$/, '');
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
  if (elem.jquery) {
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

  var self = this;
  
  self._settings = {
    button: '',				
    url: '',
    progressUrl: false,
    checkProgressInterval: 50,
    keyParamName: 'APC_UPLOAD_PROGRESS',    
    name: '',				
    data: {},				
    autoSubmit: true,
    multipart: false,
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
    onError: function(filename, errorType, response) {},	
    startXHR: function(filename, fileSize) {},				
    endXHR: function(filename) {},							
    startNonXHR: function(filename) {},						
    endNonXHR: function(filename) {}						
  };
  
  ss.extendObj(self._settings, options);
  self._button = ss.verifyElem(self._settings.button);	
  
  if (self._button === false) {
    throw new Error("Invalid button. Make sure the element you're passing exists."); 
  }
                            
  self._input = null;
  self._filename = null;
  self._disabled = false;		// If disabled, clicking on button won't do anything

  // True in iframe uploads if _uploadProgressKey is not null and progressUrl set
  self._doProgressUpdates = false;
  
  // References the setTimeout for non-XHR progress requests
  self._timer = null;
  
  // Unique key for tracking upload progress requests in iframe uploads
  // Is reset to a unique value returned by a call to uploadProgress.php after every upload (if enabled)
  self._uploadProgressKey = null;
  
  // Set to true at start of iframe upload, then false upon completion
  // Prevents possible loop that could result from inaccurate responses to progress requests
  self._uploadIsActive = false;
  
  if (self._isXhrUploadSupported()) {
    self._XhrIsSupported = true; 
  } else {
    self._XhrIsSupported = false; 
  }
  
  // These two calls must always come at the end
  self.enable();
  self._rerouteClicks();
};

ss.SimpleUpload.prototype = {

  /**
  * Send data to browser console if debug is set to true
  */ 
  log: function(str){
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
  * Disables upload functionality
  */
  disable: function() {
    var self = this,
        nodeName = self._button.nodeName.toUpperCase();
    
    ss.addClass(self._button, self._settings.disabledClass);
    self._disabled = true;
        
    if (nodeName == 'INPUT' || nodeName == 'BUTTON') {
      self._button.setAttribute('disabled', 'disabled');
    }            
    
    // hide input
    if (self._input) {
      if (self._input.parentNode) {
        // We use visibility instead of display to fix problem with Safari 4
        self._input.parentNode.style.visibility = 'hidden';
      }
    }
  },
	
  /**
  * Enables upload functionality
  */
  enable: function() {
    var self = this;
    ss.removeClass(self._button, self._settings.disabledClass);
    self._button.removeAttribute('disabled');
    self._disabled = false;
    
    // Get new upload progress key for non-XHR browsers
    // Doing it here ensures that every upload will have the required unique key
    if (self._XhrIsSupported === false && self._settings.progressUrl) {
      self._getUploadProgressKey();
    }
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
        input = document.createElement('input'),
        div = document.createElement('div'),
        filename;
          
    input.setAttribute('type', 'file');
    input.setAttribute('name', self._settings.name);
        
    ss.addStyles(input, {
      'position' : 'absolute',
      'right' : 0,
      'margin' : 0,
      'padding' : 0,
      'fontSize' : '480px',
      'fontFamily' : 'sans-serif',
      'cursor' : 'pointer'
    });            
            
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
    
    // Make sure that element opacity exists. Otherwise use IE filter            
    if (div.style.opacity !== '0') {
      if (typeof(div.filters) == 'undefined'){
        throw new Error('Opacity not supported by the browser');
      }
      div.style.filter = 'alpha(opacity=0)';
    }            
    
    ss.addEvent(input, 'change', function() { 
      if (!input || input.value === '') {                
        return;                
      }						
      // Get filename        
      filename = input.value.replace(/.*(\/|\\)/, '');
      self._filename = filename;
              
      if (false === self._settings.onChange.call(self, filename, ss.getExt(filename))) {
        return;
      }			
      // Submit when file selected if autoSubmit option is set
      if (self._settings.autoSubmit) {
        self.submit();
      }
    });            
    
    ss.addEvent(input, 'mouseover', function() {
      ss.addClass(self._button, self._settings.hoverClass);
    });
    
    ss.addEvent(input, 'mouseout', function() {
      ss.removeClass(self._button, self._settings.hoverClass);
      ss.removeClass(self._button, self._settings.focusClass);
      
      if (input.parentNode) {
        input.parentNode.style.visibility = 'hidden';
      }
    });   
          
    ss.addEvent(input, 'focus', function() {
      ss.addClass(self._button, self._settings.focusClass);
    });
    
    ss.addEvent(input, 'blur', function() {
      ss.removeClass(self._button, self._settings.focusClass);
    });
    
    div.appendChild(input);
    document.body.appendChild(div);
    self._input = input;
  },

  _clearInput : function() {
    var self = this;
    if (!self._input) {
      return;
    }                               
    ss.remove(self._input.parentNode);                            
    ss.removeClass(self._button, self._settings.hoverClass);
    ss.removeClass(self._button, self._settings.focusClass);
    delete self._input;
    self._createInput();		
  },

  /**
  * Makes sure that when user clicks upload button,
  * the this._input is clicked instead
  */
  _rerouteClicks: function() {
    var self = this,
        div;
  
    ss.addEvent(self._button, 'mouseover', function() {
      if (self._disabled) {
        return;
      }							
      if (!self._input) {
        self._createInput();
      }			
      div = self._input.parentNode;                            
      ss.copyLayout(self._button, div);
      div.style.visibility = 'visible';               
    });                
  },	
	
  /**
  * Creates iframe with unique name
  * @return {Element} iframe
  */
  _createIframe: function() {
    var id = ss.getUID(),
        iframe = ss.toElement('<iframe src="javascript:false;" name="' + id + '" />');           
      
    iframe.setAttribute('id', id);
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    return iframe;
  },
  
  /**
  * Creates form, that will be submitted to iframe
  * @param {Element} iframe Where to submit
  * @return {Element} form
  */
  _createForm: function(iframe) {
    var settings = this._settings,
        form = ss.toElement('<form method="post" enctype="multipart/form-data"></form>');
  
    form.setAttribute('action', settings.url);		
    form.setAttribute('target', iframe.name);                                   
    form.style.display = 'none';
    document.body.appendChild(form);		
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
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
  },
			
  /**
  * Handles server response for XHR uploads
  */		
  _handleXHRresponse: function(xhr, filename) {
    var self = this,
        settings = self._settings,
        response = ss.trim(xhr.responseText);
    
    self.log('server response received');
    self.log('responseText = ' + response);   

    if (settings.responseType.toLowerCase() == 'json') {
      response = ss.parseJSON(response);
    }
            
    if (response === false) {
      settings.onError.call(self, filename, 'parse error', xhr.responseText);
    } else {
      settings.onComplete.call(self, filename, response);
    }    
  
    self.enable();	
    self._clearInput(); // Get ready for next request
  },
	
  /**
  * Handles uploading with XHR
  */		
  _uploadXhr: function() {
    var self = this,
        settings = self._settings,
        filename = self._filename,
        fileSize = Math.round(self._input.files[0].size / 1024),			
        params = {},			
        xhr = ss.newXHR(),
        queryString,
        queryURL,
        progress_pct;						
      
      if (false === settings.startXHR.call(self, filename, fileSize)) {
        self.enable();
        return;
      }			
      
      // Reset progress bars to 0%
      settings.onProgress.call(self, 0);
  
      // Add name property to query string
      params[settings.name] = filename;
      
      // Get any extra data from user
      ss.extendObj(params, settings.data);
      
      // Build query string
      queryString = ss.obj2string(params);
      queryURL = settings.url + '?' + queryString;			
                  
      ss.addEvent(xhr.upload, 'progress', function(event) {
        if (event.lengthComputable) {
          progress_pct = Math.round( ( event.loaded / event.total ) * 100);			
          settings.onProgress.call(self, progress_pct);
        }
      });
      
      ss.addEvent(xhr.upload, 'error', function() {
        self.log('transfer error during upload');
        settings.endXHR.call(self, filename, fileSize);
        settings.onError.call(self, filename, 'transfer error', 'none');				
      });			
            
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            settings.endXHR.call(self, filename, fileSize);				
            self._handleXHRresponse(xhr, filename);          
          } else {
            self.log('Progress key error. Status: '+xhr.status+' Response: '+xhr.responseText);
            settings.onError.call(self, filename, 'server error', xhr.responseText);
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
        formData.append(settings.name, self._input.files[0]);
        self.log('commencing upload - multipart form');
        xhr.send(formData);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');                 
        self.log('commencing upload - binary stream');
        xhr.send(self._input.files[0]);
      }
  },
	
  /**
  * Handles server response for iframe uploads
  */
  _handleIframeResponse: function(iframe, file) {
    var self = this,
        settings = self._settings,
        filename = self._filename,
        doc,
        response,
        textResponse;
      
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
    textResponse = response.toString();
    self.log('response = ' + textResponse);
  
    if (settings.responseType.toLowerCase() == 'json') {
      response = ss.parseJSON(textResponse);
    }
        
    if (response === false) {
      settings.onError.call(self, filename, 'parse error', textResponse);
    } else {
      settings.onComplete.call(self, filename, response);
    }
      
    // Get ready for next request
    ss.remove(iframe);
    self.enable();		
    self._clearInput();
  },	
	
  /**
  * Handles uploading with iFrame
  */	
  _uploadIframe: function() {
    var self = this,
        settings = self._settings,
        data,
        filename = self._filename,
        iframe = self._createIframe(),
        form = self._createForm(iframe),
        prop;
      
    // Upload progress key field must come before the file field
    if (self._doProgressUpdates) {
      var keyField = self._createHiddenInput(settings.keyParamName, self._uploadProgressKey);
      form.appendChild(keyField);
    }      
      
    if (false === settings.startNonXHR.call(self, filename)) {
      self.enable();    
      return;
    }    
    
    // Reset progress bars to 0%
    settings.onProgress.call(self, 0);
    
    data = settings.data;
      
    for (prop in data) {
      if (data.hasOwnProperty(prop)) {				
        var input = self._createHiddenInput(prop, data[prop]);
        form.appendChild(input);				
      }
    }			
            
    form.appendChild(self._input);
        
    self.log('commencing upload');
    
    // Must be true for progress update request
    self._uploadIsActive = true;
    
    ss.addEvent(iframe, 'load', function() {    
      // Prevents further progress update requests
      self._uploadIsActive = false;
      
      // Clear progress update request timeout
      if (self._doProgressUpdates) {
        window.clearTimeout(self._timer);
      }
      
      settings.endNonXHR.call(self, filename);
      ss.remove(form);
      self._handleIframeResponse(iframe, filename);
    });		
    
    form.submit();
    
    if (self._doProgressUpdates) {
      self.log('Requesting first progress update');      
      // Making first call without timeout returns file size quicker
      self._getUploadProgress();
    }    
  },
  
  /**
  * Creates input field for the progress key to be sent with the uploaded file
  * (for fallback upload progress support)
  */     
  _startProgressTimer: function() {
    var self = this;
    self._timer = window.setTimeout(function() {
        self._getUploadProgress();
    }, self._settings.checkProgressInterval);    
  },

  /**
  * Retrieves upload progress updates from the server
  * (for fallback upload progress support)
  */   
  _getUploadProgress: function() {
    var self = this,
        key = self._uploadProgressKey,
        xhr = ss.newXHR(),
        time = new Date().getTime(),
        url = self._settings.progressUrl + '?progresskey=' + encodeURIComponent(key) + '&_='+time,
        response;
        
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          response = ss.parseJSON(xhr.responseText);
          if (response && response.success === true) {
            self._settings.onUpdateFileSize.call(self, response.size);
            self._settings.onProgress.call(self, response.pct);
            if (response.pct < 100 && self._uploadIsActive === true) {
              self._startProgressTimer();
            }        
          }
        } else {
          self.log('Progress error. Status: '+xhr.status+' Response: '+xhr.responseText);
        }
      }                 
    };  
    
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send();
  },

  /**
  * Gets the unique key from the server used to identify which upload we want to know about.
  * (for fallback upload progress support)
  */  
  _getUploadProgressKey: function() {
    var self = this,
        xhr = ss.newXHR(),
        time = new Date().getTime(),
        url = self._settings.progressUrl + '?getkey='+time,
        response;
        
    // Prevent a previous key from allowing progress updates for another upload
    self._uploadProgressKey = null;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          response = ss.parseJSON(xhr.responseText);
          if (response && response.key) {
            self._uploadProgressKey = response.key;
            self.log('Upload progress key received. Key: '+response.key);
          }
        } else {          
          self.log('Error retrieving progress key. Server response: '+xhr.responseText);
        }
      }          
    };        
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader('Cache-Control', 'no-cache');    
    xhr.send();        
  },  
	
  /**
  * Validates input and directs to either XHR method or iFrame method
  */
  submit: function() {
    var self = this,
        settings = self._settings;	
    
    if (self._disabled || !self._input || self._input.value === '') {
      return;                
    }
      
    // User returned false to cancel upload
    if (false === settings.onSubmit.call(self, self._filename, ss.getExt(self._filename))) {
      return;
    }
    
    self.disable();
        
    // Use XHR in browsers that support it, otherwise fall back to iframe method
    if (self._XhrIsSupported) {
      self.log('XHR upload supported');
      self._uploadXhr();		
    } else {
      self.log('XHR upload not supported, using iFrame method');    
      if (settings.progressUrl !== false && self._uploadProgressKey !== null) {
        self._doProgressUpdates = true;
      } else {
        self.log('progressUrl not defined or progress key not available - no upload progress');      
      }
      self._uploadIframe();
    }			
  }	
};
