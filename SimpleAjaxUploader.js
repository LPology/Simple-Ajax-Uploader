/**
 * Simple Ajax Uploader
 * Version 1.8.2
 * https://github.com/LPology/Simple-Ajax-Uploader
 *
 * Copyright 2012-2013 LPology, LLC
 * Released under the MIT license
 */

;(function( window, document, undefined ) {

  var ss = window.ss || {},

  // Pre-compile and cache our regular expressions
  // Except for JSON regex. Only IE6 and IE7 use it. Screw them.
  // ss.trim()
  rLWhitespace = /^\s+/,
  rTWhitespace = /\s+$/,

  // ss.getUID
  uidReplace = /[xy]/g,

  // ss.getFilename()
  rPath = /.*(\/|\\)/,

  // ss.getExt()
  rExt = /.*[.]/,

  // ss.hasClass()
  rHasClass = /[\t\r\n]/g,

  // Check for Safari -- it doesn't like multi file uploading. At all.
  // We do it up here so it only needs to be done once, no matter the # of uploaders
  // http://stackoverflow.com/a/9851769/1091949
  isSafari = Object.prototype.toString.call( window.HTMLElement ).indexOf( 'Constructor' ) > 0,

  // Check whether XHR uploads are supported
  // This also is done here so it only occurs once
  input = document.createElement( 'input' ),
  XhrOk;
  input.type = 'file';
  XhrOk = (
    'multiple' in input &&
    typeof File !== 'undefined' &&
    typeof ( new XMLHttpRequest() ).upload !== 'undefined' );

/**
 * Converts object to query string
 */
ss.obj2string = function( obj, prefix ) {
  "use strict";

  var str = [];
  for ( var prop in obj ) {
    if ( obj.hasOwnProperty( prop ) ) {
      var k = prefix ? prefix + '[' + prop + ']' : prop, v = obj[prop];
      str.push( typeof v === 'object' ?
        ss.obj2string( v, k ) :
        encodeURIComponent( k ) + '=' + encodeURIComponent( v ) );
    }
  }
  return str.join( '&' );
};

/**
 * Copies all missing properties from second object to first object
 */
ss.extendObj = function( first, second ) {
  "use strict";

  for ( var prop in second ) {
    if ( second.hasOwnProperty( prop ) ) {
      first[prop] = second[prop];
    }
  }
};

/**
 * Returns true if item is found in array
 */
ss.contains = function( array, item ) {
  "use strict";

  var i = array.length;
  while ( i-- ) {
    if ( array[i] === item ) {
      return true;
    }
  }
  return false;
};

/**
 * Remove an item from an array
 */
ss.removeItem = function( array, item ) {
  "use strict";

  var i = array.length;
  while ( i-- ) {
    if ( array[i] === item ) {
      array.splice( i, 1 );
      break;
    }
  }
};

ss.addEvent = function( elem, type, fn ) {
  "use strict";

  if ( elem.addEventListener ) {
    elem.addEventListener( type, fn, false );
  } else {
    elem.attachEvent( 'on' + type, fn );
  }
  return function() {
    ss.removeEvent( elem, type, fn );
  };
};

ss.removeEvent = function( elem, type, fn ) {
  "use strict";

 if ( elem.removeEventListener ) {
    elem.removeEventListener( type, fn, false );
  } else {
    elem.detachEvent( 'on' + type, fn );
  }
};

ss.newXHR = function() {
  "use strict";

  if ( typeof XMLHttpRequest !== 'undefined' ) {
    return new window.XMLHttpRequest();
  } else if ( window.ActiveXObject ) {
    try {
      return new window.ActiveXObject( 'Microsoft.XMLHTTP' );
    } catch ( err ) {
      return false;
    }
  }
};

/**
 * Parses a JSON string and returns a Javascript object
 * Parts borrowed from www.jquery.com
 */
 ss.parseJSON = function( data ) {
   "use strict";

  if ( !data ) {
    return false;
  }
  data = ss.trim( data );
  if ( window.JSON && window.JSON.parse ) {
    try {
      return window.JSON.parse( data );
    } catch ( err ) {
      return false;
    }
  }
  if ( data ) {
      if (/^[\],:{}\s]*$/.test( data.replace(/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, "@" )
        .replace(/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g, "]" )
        .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {
        return ( new Function( "return " + data ) )();
      }
  }
  return false;
};

ss.getBox = function( elem ) {
  "use strict";

  var box,
      docElem,
      top = 0,
      left = 0;

  if ( elem.getBoundingClientRect ) {
    box = elem.getBoundingClientRect();
    docElem = document.documentElement;
    top = box.top  + ( window.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 );
    left = box.left + ( window.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 );
  } else {
    do {
      left += elem.offsetLeft;
      top += elem.offsetTop;
    } while ( ( elem = elem.offsetParent ) );
  }
  return {
    top: Math.round( top ),
    left: Math.round( left )
  };
};

/**
* Helper that takes object literal
* and add all properties to element.style
* @param {Element} el
* @param {Object} styles
*/
ss.addStyles = function( elem, styles ) {
  "use strict";

  for ( var name in styles ) {
    if ( styles.hasOwnProperty( name ) ) {
      elem.style[name] = styles[name];
    }
  }
};

/**
* Function places an absolutely positioned
* element on top of the specified element
* copying position and dimensions.
*/
ss.copyLayout = function( from, to ) {
  "use strict";

  var box = ss.getBox( from );

  ss.addStyles( to, {
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
ss.toElement = ( function() {
  "use strict";

  var div = document.createElement( 'div' );

  return function( html ) {
    div.innerHTML = html;
    var element = div.firstChild;
    div.removeChild( element );
    return element;
  };
})();

/**
* Generates unique ID
* Complies with RFC 4122 version 4
* http://stackoverflow.com/a/2117523/1091949
*/
ss.getUID = function() {
  "use strict";

  /*jslint bitwise: true*/
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(uidReplace, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
};

/**
* Removes white space from left and right of string
*/
ss.trim = function( text ) {
  "use strict";
  return text.toString().replace(rLWhitespace, '').replace(rTWhitespace, '');
};

/**
* Extract file name from path
*/
ss.getFilename = function( path ) {
  "use strict";
  return path.replace(rPath, '');
};

/**
* Get file extension
*/
ss.getExt = function( file ) {
  "use strict";
  return (-1 !== file.indexOf('.')) ? file.replace(rExt, '') : '';
};

/**
* Check whether element has a particular CSS class
* Parts borrowed from www.jquery.com
*/
ss.hasClass = function( elem, name ) {
  "use strict";
  return (' ' + elem.className + ' ').replace(rHasClass, ' ').indexOf(' ' + name + ' ') >= 0;
};

/**
* Adds CSS class to an element
*/
ss.addClass = function( elem, name ) {
  "use strict";

  if ( !name || name === '' ) {
    return false;
  }
  if ( !ss.hasClass( elem, name ) ) {
    elem.className += ' ' + name;
  }
};

/**
* Removes CSS class from an element
*/
ss.removeClass = (function() {
  "use strict";

  var c = {}; //cache regexps for performance

  return function( e, name ) {
    if ( !c[name] ) {
      c[name] = new RegExp('(?:^|\\s)' + name + '(?!\\S)');
    }
    e.className = e.className.replace( c[name], '' );
  };
})();

/**
* Nulls out event handlers to prevent memory leaks in IE6/IE7
* http://javascript.crockford.com/memory/leak.html
* @param {Element} d
* @return void
*/
ss.purge = function( d ) {
  "use strict";

  var a = d.attributes, i, l, n;
  if ( a ) {
    for ( i = a.length - 1; i >= 0; i -= 1 ) {
      n = a[i].name;
      if ( typeof d[n] === 'function' ) {
        d[n] = null;
      }
    }
  }
  a = d.childNodes;
  if ( a ) {
    l = a.length;
    for ( i = 0; i < l; i += 1 ) {
      ss.purge( d.childNodes[i] );
    }
  }
};

/**
* Removes element from the DOM
*/
ss.remove = function( elem ) {
  "use strict";

  if ( elem.parentNode ) {
    // null out event handlers for IE
    ss.purge( elem );
    elem.parentNode.removeChild( elem );
  }
  elem = null;
};

/**
 * Accepts either a jQuery object, a string containing an element ID, or an element,
 * verifies that it exists, and returns the element.
 * @param {Mixed} elem
 * @return {Element}
 */
ss.verifyElem = function( elem ) {
  "use strict";

  if ( typeof jQuery !== 'undefined' && elem instanceof jQuery ) {
    elem = elem[0];

  } else if ( typeof elem === 'string' ) {
    if ( elem.charAt( 0 ) == '#' ) {
      elem = elem.substr( 1 );
    }
    elem = document.getElementById( elem );
  }

  if ( !elem || elem.nodeType !== 1 ) {
    return false;
  }

  if ( elem.nodeName.toUpperCase() == 'A' ) {
    elem.style.cursor = 'pointer';
    ss.addEvent( elem, 'click', function( e ) {
        if ( e && e.preventDefault ) {
          e.preventDefault();
        } else if ( window.event ) {
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
ss.SimpleUpload = function( options ) {
  "use strict";

  var i,
      len,
      btn;

  this._opts = {
    button: '',
    url: '',
    progressUrl: false,
    nginxProgressUrl: false,
    multiple: false,
    maxUploads: 3,
    queue: true,
    checkProgressInterval: 50,
    keyParamName: 'APC_UPLOAD_PROGRESS',
    nginxProgressHeader: 'X-Progress-ID',
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
    onAbort: function( filename, uploadBtn ) {},
    onChange: function( filename, extension, uploadBtn ) {},
    onSubmit: function( filename, extension, uploadBtn ) {},
    onProgress: function( pct ) {},
    onUpdateFileSize: function( filesize ) {},
    onComplete: function( filename, response, uploadBtn ) {},
    onExtError: function( filename, extension ) {},
    onSizeError: function( filename, fileSize ) {},
    onError: function( filename, type, status, statusText, uploadBtn ) {},
    startXHR: function( filename, fileSize, uploadBtn ) {},
    endXHR: function( filename, fileSize, uploadBtn ) {},
    startNonXHR: function( filename, uploadBtn ) {},
    endNonXHR: function( filename, uploadBtn ) {}
  };

  ss.extendObj( this._opts, options );
  options = null; // Null to avoid leaks in IE
  this._btns = [];

  // An array of buttons
  if ( this._opts.button instanceof Array ) {
    len = this._opts.button.length;

    for ( i = 0; i < len; i++ ) {
      btn = ss.verifyElem( this._opts.button[i] );
      if ( btn !== false ) {
        this._btns.push( this.rerouteClicks( btn ) );
      } else {
        this.log( 'Button with array index ' + i + ' is invalid' );
      }
    }

  // A single button
  } else {
    btn = ss.verifyElem( this._opts.button );
    if ( btn !== false ) {
      this._btns.push( this.rerouteClicks( btn ) );
    }
  }

  delete this._opts.button;

  // No valid elements were passed to button option
  if ( this._btns.length < 1 || this._btns[0] === false ) {
    throw new Error( "Invalid button. Make sure the element you're passing exists." );
  }

  if ( this._opts.multiple === false ) {
    this._opts.maxUploads = 1;
  }

  // An array of objects, each containing two items, a file and a reference
  // to the button which triggered the upload: { file: uploadFile, btn: button }
  this._queue = [];
  
  this._active = 0;
  this._disabled = false; // if disabled, clicking on button won't do anything
  this._progKeys = []; // contains the currently active upload ID progress keys
  this._maxFails = 10; // max allowed failed progress updates requests in iframe mode

  if ( !XhrOk ) {
    // Generate upload ID progress key
    this._progKey = ss.getUID();
    // Store progress keys in _sizeFlags after the first time we set sizeBox
    // and call UpdateFileSize(). No need to do it > 1 time
    this._sizeFlags = {};
  }

  // Calls below this line must always be last
  this._createInput();
  this.enable();
};

ss.SimpleUpload.prototype = {

  /**
  * Completely removes uploader functionality
  */
  destroy: function() {
    "use strict";

    // # of upload buttons
    var i = this._btns.length;

    // Put upload buttons back to the way we found them
    while ( i-- ) {
      // Remove event listener
      if ( this._btns[i].off ) {
        this._btns[i].off();
      }

      // Remove any lingering classes
      ss.removeClass( this._btns[i], this._opts.hoverClass );
      ss.removeClass( this._btns[i], this._opts.focusClass );
      ss.removeClass( this._btns[i], this._opts.disabledClass );

      // In case we disabled it
      this._btns[i].disabled = false;
    }

    // Remove div/file input combos from the DOM
    ss.remove( this._input.parentNode );

    // Now burn it all down
    for ( var prop in this ) {
      if ( this.hasOwnProperty( prop ) ) {
        delete this.prop;
      }
    }
  },

  /**
  * Send data to browser console if debug is set to true
  */
  log: function( str ) {
    "use strict";

    if ( this._opts.debug && window.console ) {
      console.log( '[uploader] ' + str );
    }
  },

  /**
  * Replaces user data
  * Note that all previously set data is entirely removed and replaced
  */
  setData: function( data ) {
    "use strict";
    this._opts.data = data;
  },

  /**
  * Designate an element as a progress bar
  * The CSS width % of the element will be updated as the upload progresses
  */
  setProgressBar: function( elem ) {
    "use strict";
    this._progBar = ss.verifyElem( elem );
  },

  /**
  * Designate an element to receive a string containing progress % during upload
  * Note: Uses innerHTML, so any existing child elements will be wiped out
  */
  setPctBox: function( elem ) {
    "use strict";
    this._pctBox = ss.verifyElem( elem );
  },

  /**
  * Designate an element to receive a string containing file size at start of upload
  * Note: Uses innerHTML, so any existing child elements will be wiped out
  */
  setFileSizeBox: function( elem ) {
    "use strict";
    this._sizeBox = ss.verifyElem( elem );
  },

  /**
  * Designate an element to be removed from DOM when upload is completed
  * Useful for removing progress bar, file size, etc. after upload
  */
  setProgressContainer: function( elem ) {
    "use strict";
    this._progBox = ss.verifyElem( elem );
  },

  /**
  * Designate an element to serve as the upload abort button
  */
  setAbortBtn: function( elem, remove ) {
    "use strict";

    this._abortBtn = ss.verifyElem( elem );
    this._removeAbort = false;

    if ( remove ) {
      this._removeAbort = true;
    }
  },

  /**
  * Returns number of files currently in queue
  */
  getQueueSize: function() {
    "use strict";
    return this._queue.length;
  },

  /**
  * Enables uploader and submits next file for upload
  */
  _cycleQueue: function() {
    "use strict";

    if ( this._queue.length > 0 && this._opts.autoSubmit ) {
      this.submit();
    }
  },

  /**
  * Remove current file from upload queue, reset props, cycle to next upload
  */
  removeCurrent: function() {
    "use strict";
    
    var i = this._queue.length;
    
    while ( i-- ) {
      if ( this._queue[i].file === this._file ) {
        this._queue.splice( i, 1 );
        break;
      }
    }    

    delete this._file;
    this._cycleQueue();
  },

  /**
  * Disables upload functionality
  */
  disable: function() {
    "use strict";

    var i = this._btns.length,
        nodeName;

    this._disabled = true;

    while ( i-- ) {
      nodeName = this._btns[i].nodeName.toUpperCase();
      ss.addClass( this._btns[i], this._opts.disabledClass );

      if ( nodeName == 'INPUT' || nodeName == 'BUTTON' ) {
        this._btns[i].disabled = true;
      }
    }

    // Hide file input
    // Use visibility instead of display to fix problem with Safari 4
    if ( this._input && this._input.parentNode ) {
      this._input.parentNode.style.visibility = 'hidden';
    }
  },

  /**
  * Enables upload functionality
  */
  enable: function() {
    "use strict";

    var i = this._btns.length;

    this._disabled = false;

    while ( i-- ) {
      ss.removeClass( this._btns[i], this._opts.disabledClass );
      this._btns[i].disabled = false;
    }
  },

  /**
  * Creates invisible file input
  * that will hover above the button
  * <div><input type='file' /></div>
  */
  _createInput: function() {
    "use strict";

    var self = this,
        div = document.createElement( 'div' );

    this._input = document.createElement( 'input' );
    this._input.type = 'file';
    this._input.name = this._opts.name;

    // Don't allow multiple file selection in Safari -- it has a nasty bug
    // http://stackoverflow.com/q/7231054/1091949
    if ( XhrOk && !isSafari ) {
      this._input.multiple = true;
    }

    // Check support for file input accept attribute
    if ( 'accept' in this._input && this._opts.accept !== '' ) {
      this._input.accept = this._opts.accept;
    }

    ss.addStyles( div, {
      'display' : 'block',
      'position' : 'absolute',
      'overflow' : 'hidden',
      'margin' : 0,
      'padding' : 0,
      'opacity' : 0,
      'direction' : 'ltr',
      'zIndex': 2147483583
    });

    ss.addStyles( this._input, {
      'position' : 'absolute',
      'right' : 0,
      'margin' : 0,
      'padding' : 0,
      'fontSize' : '480px',
      'fontFamily' : 'sans-serif',
      'cursor' : 'pointer'
    });

    // Make sure that element opacity exists. Otherwise use IE filter
    if ( div.style.opacity !== '0' ) {
      div.style.filter = 'alpha(opacity=0)';
    }

    ss.addEvent( this._input, 'change', function() {
      var uploadBtn = self._overBtn,
          filename,
          ext,
          total,
          i;

      if ( !self._input || self._input.value === '' ) {
        return;
      }      

      if ( !XhrOk ) {
        filename = ss.getFilename( self._input.value );
        ext = ss.getExt( filename );

        if ( false === self._opts.onChange.call( self, filename, ext, uploadBtn ) ) {
          return;
        }
        
        self._queue.push( { file: self._input, btn: uploadBtn } );

      } else {
        filename = ss.getFilename( self._input.files[0].name );
        ext = ss.getExt( filename );

        if ( false === self._opts.onChange.call( self, filename, ext, uploadBtn ) ) {
          return;
        }

        total = self._input.files.length;

        // Only add first file if multiple uploads aren't allowed
        if ( !self._opts.multiple ) {
          total = 1;
        }

        for ( i = 0; i < total; i++ ) {
          self._queue.push( { file: self._input.files[i], btn: uploadBtn } );
        }
      }

      ss.removeClass( self._overBtn, self._opts.hoverClass );
      ss.removeClass( self._overBtn, self._opts.focusClass );

      // Now that file is in upload queue, remove the file input            
      ss.remove( self._input.parentNode );
      delete self._input;

      // Then create a new file input
      self._createInput();

      // Submit if autoSubmit option is true
      if ( self._opts.autoSubmit ) {
        self.submit();
      }
    });

    ss.addEvent( this._input, 'mouseover', function() {
      ss.addClass( self._overBtn, self._opts.hoverClass );
    });

    ss.addEvent( this._input, 'mouseout', function() {
      ss.removeClass( self._overBtn, self._opts.hoverClass );
      ss.removeClass( self._overBtn, self._opts.focusClass );
      self._input.parentNode.style.visibility = 'hidden';
    });

    ss.addEvent( this._input, 'focus', function() {
      ss.addClass( self._overBtn, self._opts.focusClass );
    });

    ss.addEvent( this._input, 'blur', function() {
      ss.removeClass( self._overBtn, self._opts.focusClass );
    });

    document.body.appendChild( div );
    div.appendChild( this._input );
  },

  /**
  * Makes sure that when user clicks upload button,
  * the this._input is clicked instead
  */
  rerouteClicks: function( elem ) {
    "use strict";

    var self = this;

    // ss.addEvent() returns a function to detach, which
    // allows us to call elem.off() to remove mouseover listener
    elem.off = ss.addEvent( elem, 'mouseover', function() {
      if ( self._disabled ) {
        return;
      }

      if ( !self._input ) {
        self._createInput();
      }

      self._overBtn = elem;
      ss.copyLayout( elem, self._input.parentNode );
      self._input.parentNode.style.visibility = 'visible';
    });

    return elem;
  },

  /**
  * Creates iframe with unique name
  * @return {Element} iframe
  */
  _getFrame: function() {
    "use strict";

    var id = ss.getUID(),
        iframe = ss.toElement( '<iframe src="javascript:false;" name="' + id + '" />' );

    document.body.appendChild( iframe );
    iframe.style.display = 'none';
    iframe.id = id;
    return iframe;
  },

  /**
  * Creates form, that will be submitted to iframe
  * @param {Element} iframe Where to submit
  * @return {Element} form
  */
  _getForm: function( iframe ) {
    "use strict";

    var form = ss.toElement( '<form method="post" enctype="multipart/form-data"></form>' );

    document.body.appendChild( form );
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
  _getHidden: function( name, value ) {
    "use strict";

    var input = document.createElement( 'input' );

    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
  },

  /**
  * Final cleanup function after upload ends
  */
  _last: function( sizeBox, progBox, pctBox, abortBtn, removeAbort ) {
    "use strict";

    if ( sizeBox ) {
      sizeBox.innerHTML = '';
    }
    if ( progBox ) {
      ss.remove( progBox );
    }
    if ( pctBox ) {
      pctBox.innerHTML = '';
    }
    if ( abortBtn && removeAbort ) {
      ss.remove( abortBtn );
    }

    // Decrement the active upload counter
    this._active--;

    // Null to avoid leaks in IE
    sizeBox = progBox = pctBox = abortBtn = removeAbort = null;

    if ( this._disabled ) {
      this.enable();
    }

    this._cycleQueue();
  },

  /**
  * Completes upload request if an error is detected
  */
  _errorFinish: function( status, statusText, errorType, filename, sizeBox, progBox, pctBox, abortBtn, removeAbort, uploadBtn ) {
    "use strict";

    this.log( 'Upload failed: '+status+' '+statusText );
    this._opts.onError.call( this, filename, errorType, status, statusText, uploadBtn );
    this._last( sizeBox, progBox, pctBox, abortBtn, removeAbort );

    // Null to avoid leaks in IE
    status = statusText = errorType = filename = sizeBox = progBox = pctBox = abortBtn = removeAbort = uploadBtn = null;
  },

  /**
  * Completes upload request if the transfer was successful
  */
  _finish: function( status, statusText, response, filename, sizeBox, progBox, pctBox, abortBtn, removeAbort, uploadBtn ) {
    "use strict";

    this.log( 'Server response: ' + response );

    if ( this._opts.responseType.toLowerCase() == 'json' ) {
      response = ss.parseJSON( response );
      if ( response === false ) {
        this._errorFinish( status, statusText, 'parseerror', filename, sizeBox, progBox, abortBtn, removeAbort, uploadBtn );
        return;
      }
    }

    this._opts.onComplete.call( this, filename, response, uploadBtn );
    this._last( sizeBox, progBox, pctBox, abortBtn, removeAbort );

    // Null to avoid leaks in IE
    status = statusText = response = filename = sizeBox = progBox = pctBox = abortBtn = removeAbort = uploadBtn = null;
  },

  /**
  * Handles uploading with XHR
  */
  _uploadXhr: function( filename, size, sizeBox, progBar, progBox, pctBox, abortBtn, removeAbort, uploadBtn ) {
    "use strict";

    var self = this,
        settings = this._opts,
        xhr = ss.newXHR(),
        params = {},
        queryURL,
        callback,
        cancel;

    // Add name property to query string
    params[settings.name] = filename;

    // We get the any additional data here after startXHR()
    // in case the data was changed with setData() prior to submitting
    ss.extendObj( params, settings.data );

    // Build query string
    queryURL = settings.url + '?' + ss.obj2string( params );

    // Inject file size into size box
    if ( sizeBox ) {
      sizeBox.innerHTML = size + 'K';
    }

    // Begin progress bars at 0%
    if ( pctBox ) {
      pctBox.innerHTML = '0%';
    }

    if ( progBar ) {
      progBar.style.width = '0%';
    }

    settings.onProgress.call( this, 0 );

    // Borrows heavily from jQuery ajax transport
    callback = function( _, isAbort ) {
      var status,
          statusText;

      // Firefox throws exceptions when accessing properties
      // of an xhr when a network error occurred
      try {
        // Was never called and is aborted or complete
        if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

          xhr.onreadystatechange = function() {};
          callback = undefined;

          // If it's an abort
          if ( isAbort ) {

            // Abort it manually if needed
            if ( xhr.readyState !== 4 ) {
              xhr.abort();
            }

            self._last( sizeBox, progBox, pctBox, abortBtn, removeAbort );
            settings.onAbort.call( self, filename, uploadBtn );

          } else {
            status = xhr.status;

            // Firefox throws an exception when accessing
            // statusText for faulty cross-domain requests
            try {
              statusText = xhr.statusText;
            } catch(  e  ) {
              // We normalize with Webkit giving an empty statusText
              statusText = '';
            }

            if ( status >= 200 && status < 300 ) {
              settings.endXHR.call( self, filename, size, uploadBtn );
              self._finish( status, statusText, xhr.responseText, filename, sizeBox, progBox, pctBox, abortBtn, removeAbort, uploadBtn );

              // We didn't get a 2xx status so throw an error
            } else {
              self._errorFinish( status, statusText, 'error', filename, sizeBox, progBox, pctBox, abortBtn, removeAbort, uploadBtn );
            }
          }
        }
      }
      catch ( e ) {
        if ( !isAbort ) {
          self._errorFinish( -1, e.message, 'error', filename, sizeBox, progBox, pctBox, abortBtn, removeAbort, uploadBtn );
        }
      }
    };

    cancel = function() {
      ss.removeEvent( abortBtn, 'click', cancel );
      if ( callback ) {
        callback( undefined, true );
      }
    };

    if ( abortBtn ) {
      ss.addEvent( abortBtn, 'click', cancel );
    }

    xhr.onreadystatechange = callback;
    xhr.open( settings.method.toUpperCase(), queryURL, true );

    ss.addEvent( xhr.upload, 'progress', function( event ) {
      if ( event.lengthComputable ) {
        var pct = Math.round( ( event.loaded / event.total ) * 100 );

        settings.onProgress.call( self, pct );

        if ( pctBox ) {
          pctBox.innerHTML = pct + '%';
        }

        if ( progBar ) {
          progBar.style.width = pct + '%';
        }
      }
    });

    xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
    xhr.setRequestHeader( 'X-File-Name', encodeURIComponent( filename ) );

    if ( settings.responseType.toLowerCase() == 'json' ) {
      xhr.setRequestHeader( 'Accept', 'application/json, text/javascript, */*; q=0.01' );
    }

    if ( settings.multipart === true ) {
      var formData = new FormData();

      for ( var prop in settings.data ) {
        if ( settings.data.hasOwnProperty( prop ) ) {
          formData.append( prop, settings.data[prop] );
        }
      }

      formData.append( settings.name, this._file );
      this.log( 'Commencing upload using multipart form' );
      xhr.send( formData );

    } else {
      xhr.setRequestHeader( 'Content-Type', 'application/octet-stream' );
      this.log( 'Commencing upload using binary stream' );
      xhr.send( this._file );
    }

    // Remove file from upload queue and begin next upload
    this.removeCurrent();
  },

  /**
  * Handles uploading with iFrame
  */
  _uploadIframe: function( filename, sizeBox, progBar, progBox, pctBox, uploadBtn ) {
    "use strict";

    var self = this,
        settings = this._opts,
        key = this._progKey,
        iframe = this._getFrame(),
        form = this._getForm( iframe ),
        callback,
        input;

    // If we're using Nginx Upload Progress Module, append upload key to the URL
    if ( this._opts.nginxProgressUrl ) {
      form.action = this._opts.url + '?' + this._opts.nginxProgressHeader + '=' + key;
    }

    // PHP APC upload progress key field must come before the file field
    if ( settings.progressUrl !== false ) {
      var keyField = this._getHidden( settings.keyParamName, key );
      form.appendChild( keyField );
      keyField = null;
    }

    // We get any additional data here after startNonXHR()
    // in case the data was changed with setData() prior to submitting
    for ( var prop in settings.data ) {
      if ( settings.data.hasOwnProperty( prop ) ) {
        input = this._getHidden( prop, settings.data[prop] );
        form.appendChild( input );
      }
    }

    form.appendChild( this._file );

    // Begin progress bars at 0%
    settings.onProgress.call( this, 0 );

    if ( pctBox ) {
      pctBox.innerHTML = '0%';
    }

    if ( progBar ) {
      progBar.style.width = '0%';
    }

    callback = ss.addEvent( iframe, 'load', function() {
      try {
        var doc = iframe.contentDocument ?
              iframe.contentDocument :
              iframe.contentWindow.document,
            response = doc.body.innerHTML;

        // Remove key from active progress keys array
        ss.removeItem( self._progKeys, key );
        settings.endNonXHR.call( self, filename, uploadBtn );

        // No way to get status and statusText for an iframe so return empty strings
        self._finish( '', '', response, filename, sizeBox, progBox, pctBox, undefined, undefined, uploadBtn );
      } catch ( e ) {
        self._errorFinish( '', e.message, 'error', filename, sizeBox, progBox, pctBox, undefined, undefined, uploadBtn );
      }

      // Delete upload key from size update flags
      if (self._sizeFlags && self._sizeFlags[key]) {
        delete self._sizeFlags.key;
      }

      // Removes event listener from iframe
      callback();
      ss.remove( iframe );

      // Null to avoid leaks in IE
      settings = key = iframe = sizeBox = progBox = pctBox = uploadBtn = null;
    });

    self.log( 'Commencing upload using iframe' );
    form.submit();
    ss.remove( form );
    form = input = null;

    if ( this._opts.progressUrl || this._opts.nginxProgressUrl ) {
      // Add progress key to active key array
      this._progKeys.push( key );

      // Start timer for first progress update
      window.setTimeout( function() {
          self._getProg( key, progBar, sizeBox, pctBox, 1 );
          progBar = sizeBox = pctBox = null;
      }, self._opts.checkProgressInterval );

      // Get new upload progress key
      this._progKey = ss.getUID();
    }

    // Remove this file from the queue and begin next upload
    this.removeCurrent();
  },

  /**
  * Retrieves upload progress updates from the server
  * (for fallback upload progress support)
  */
  _getProg: function( key, progBar, sizeBox, pctBox, counter ) {
    "use strict";

    var self = this,
        xhr = ss.newXHR(),
        time = new Date().getTime(),
        url,
        callback;

    if ( !key ) {
      return;
    }

    // Nginx Upload Progress Module
    if ( this._opts.nginxProgressUrl ) {
      url = self._opts.nginxProgressUrl + '?_=' + time;

    // PHP APC upload progress
    } else if ( this._opts.progressUrl ) {
      url = self._opts.progressUrl + '?progresskey=' + encodeURIComponent( key ) + '&_=' + time;
    }

    callback = function() {
      var response,
          size,
          pct,
          status,
          statusText;

      try {
        if ( callback && xhr.readyState === 4 ) {

          xhr.onreadystatechange = function() {};
          callback = undefined;
          status = xhr.status;

          try {
            statusText = xhr.statusText;
          } catch(  e  ) {
            // We normalize with Webkit giving an empty statusText
            statusText = '';
          }

          if ( status >= 200 && status < 300 ) {
            response = ss.parseJSON( xhr.responseText );
            counter++;

            if ( response === false ) {
              self.log( 'Error parsing progress response (expecting JSON)' );
              return;
            }

            // Handle response if using Nginx Upload Progress Module
            if ( self._opts.nginxProgressUrl ) {

              if ( response.state == 'uploading' ) {
                size = response.size;
                if ( size > 0 ) {
                  pct = Math.round( ( response.received / size ) * 100 );
                  size = Math.round( size / 1024 ); // convert to kilobytes
                }

              } else if ( response.state == 'done' ) {
                pct = 100;

              } else if ( response.state == 'error' ) {
                self.log( 'Error requesting upload progress: ' + response.status );
                return;
              }
            }

            // Handle response if using PHP APC
            else if ( self._opts.progressUrl ) {
              if ( response.success === true ) {
                size = response.size;
                pct = response.pct;
              }
            }

            // Update progress bar width
            if ( pct ) {
              if ( pctBox ) {
                pctBox.innerHTML = pct + '%';
              }
              if ( progBar ) {
                progBar.style.width = pct + '%';
              }
              self._opts.onProgress.call( self, pct );
            }

            // Update file size box if we haven't yet done so
            if ( size && !self._sizeFlags[key] ) {
              // Set a flag so we don't do it again -- file size doesn't
              // change, so no need to mess with the DOM more than once
              self._sizeFlags[key] = 1;

              if ( sizeBox ) {
                sizeBox.innerHTML = size + 'K';
              }
              self._opts.onUpdateFileSize.call( self, size );
            }

            // Stop attempting progress checks if we keep failing
            if ( !pct &&
                 !size &&
                 counter >= self._maxFails )
            {
              self.log( 'Failed progress request limit reached' );
              return;
            }

            // Begin countdown until next progress update check
            if ( pct < 100 && ss.contains( self._progKeys, key ) ) {
              window.setTimeout( function() {
                  self._getProg( key, progBar, sizeBox, pctBox, counter );
                  // Null to avoid leaks in IE
                  key = progBar = sizeBox = pctBox = counter = null;
              }, self._opts.checkProgressInterval );
            }

            // We didn't get a 2xx status so don't continue sending requests
          } else {
            ss.removeItem( self._progKeys, key );
            self.log( 'Error requesting upload progress: ' + status + ' ' + statusText );
          }

          // Null to avoid leaks in IE
          xhr = size = pct = status = statusText = response = null;
        }
      } catch( e ) {
        self.log( 'Error requesting upload progress: ' + e.message );
      }
    };

    xhr.onreadystatechange = callback;
    xhr.open( 'GET', url, true );

    // Set the upload progress header for Nginx
    if ( self._opts.nginxProgressUrl ) {
      xhr.setRequestHeader( self._opts.nginxProgressHeader, key );
    }

    xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
    xhr.setRequestHeader( 'Accept', 'application/json, text/javascript, */*; q=0.01' );
    xhr.send();
  },

  /**
  * Verifies that file is allowed
  * Checks file extension and file size if limits are set
  */
  _checkFile: function( filename, ext, size ) {
    "use strict";

    var allowed = this._opts.allowedExtensions,
        i = allowed.length,
        extOk = false;

    // Only file extension if allowedExtensions is set
    if ( i > 0 ) {
      ext = ext.toLowerCase();

      while ( i-- ) {
        if ( allowed[i].toLowerCase() == ext ) {
          extOk = true;
          break;
        }
      }

      if ( !extOk ) {
        this.removeCurrent();
        this.log( 'File extension not permitted' );
        this._opts.onExtError.call( this, filename, ext );
        return false;
      }
    }

    if ( size &&
        this._opts.maxSize !== false &&
        size > this._opts.maxSize )
    {
      this.removeCurrent();
      this.log( filename + ' exceeds ' + this._opts.maxSize + 'K limit' );
      this._opts.onSizeError.call( this, filename, size );
      return false;
    }

    return true;
  },

  /**
  * Validates input and directs to either XHR method or iFrame method
  */
  submit: function() {
    "use strict";

    var filename,
        uploadBtn,
        ext,
        size;

    if ( this._disabled ||
         this._active >= this._opts.maxUploads ||
         this._queue.length < 1 )
    {
      return;
    }

    // The next file in the queue will always be in the front of the array
    this._file = this._queue[0].file;
    
    // Button that triggered the upload
    uploadBtn = this._queue[0].btn;

    if ( XhrOk ) {
      filename = ss.getFilename( this._file.name );
      // Convert from bytes to kilobytes
      size = Math.round( this._file.size / 1024 );
    } else {
      filename = ss.getFilename( this._file.value );
    }

    ext = ss.getExt( filename );

    if ( !this._checkFile( filename, ext, size ) ) {
      return;
    }

    // User returned false to cancel upload
    if ( false === this._opts.onSubmit.call( this, filename, ext, uploadBtn ) ) {
      return;
    }

    // Increment the active upload counter
    this._active++;

    // Disable uploading if multiple file uploads are not enabled
    // or if queue is disabled and we've reached max uploads
    if ( this._opts.multiple === false ||
         this._opts.queue === false && this._active >= this._opts.maxUploads )
    {
      this.disable();
    }

    // Use XHR if supported by browser
    if ( XhrOk ) {
      // Call the startXHR() callback and stop upload if it returns false
      // We call it before _uploadXhr() in case setProgressBar, setPctBox, etc., is called
      if ( false === this._opts.startXHR.call( this, filename, size, uploadBtn ) ) {
        if ( this._disabled ) {
          this.enable();
        }
        this._active--;
        return;
      }

      this._uploadXhr( filename, size, this._sizeBox, this._progBar, this._progBox, this._pctBox, this._abortBtn, this._removeAbort, uploadBtn );

    // Otherwise use iframe method
    } else {
      // Call the startNonXHR() callback and stop upload if it returns false
      if ( false === this._opts.startNonXHR.call( this, filename, uploadBtn ) ) {
        if ( this._disabled ) {
          this.enable();
        }
        this._active--;
        return;
      }

      this._uploadIframe( filename, this._sizeBox, this._progBar, this._progBox, this._pctBox, uploadBtn );
    }

    // Null to avoid leaks in IE
    this._sizeBox = this._progBar = this._progBox = this._pctBox = this._abortBtn = this._removeAbort = uploadBtn = null;
  }
};

// Expose to the global window object
window.ss = ss;

})( window, document );