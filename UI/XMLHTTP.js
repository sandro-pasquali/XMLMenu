function XMLHTTP()
  {
	  this.XMLHTTP = function()
      {
      };
	        
    this.build = function()
      {
       	var xob = new Object();
				// mozilla
		    if(window.XMLHttpRequest) 
				  {
					  xob.httpHandle = new XMLHttpRequest();
						xob.xmlHandle = new XMLHttpRequest();
					}
				else
				  {
			      // create the Microsoft handle
		        var prefixes = ["MSXML4","MSXML3","MSXML2","MSXML","Microsoft"];
		        var http, xml;
		        for (var i = 0; i < prefixes.length; i++) 
				      {
		            try 
						      {
		                http = new ActiveXObject(prefixes[i] + ".XmlHttp");
		                xml = new ActiveXObject(prefixes[i] + ".XmlDom");
		                xob.httpHandle = http;
							      xob.xmlHandle = xml;
									}
		            catch(ex) {};
		          }
		      }
		    return(xob);
      };
		      
	  this.loadXML = function(callTarget,callback,_caller,callId)
		  {
		  	var callObject = this.build();
		  	
		  	callObject.callTarget = callTarget || null;
        callObject.callback = callback || null;
        callObject._caller = _caller || new Object();
        callObject.callid = callId || '';
						
			  callObject.main = function()
			    {
					  if(this.xmlHandle.readyState == 4)
					    {
					    	this.xml = (window.XMLHttpRequest) ? this.xmlHandle.responseXML.documentElement 
					    	                                   : this.xmlHandle.documentElement,
							  this.serialize = function() 
							  	{ 
							   		if(this.xml.nodeType == 9)
								   	  {
								   	  	this.xml = this.xml.childNodes[0];
								   	  }
							   		return($.XMLHTTP._serialize(this.xml)); 
							   	};
							   	
							  eval('this._caller.' + this.callback + '(this)'); 
							} 
						else
							{
								return(true);
							}
					};
							
				if(window.XMLHttpRequest)
				  { 
            callObject.xmlHandle.open("GET",callObject.callTarget,true);
            callObject.xmlHandle.send(null);
					}
				else
				  {
  		      callObject.xmlHandle.async = true;
            callObject.xmlHandle.load(callObject.callTarget);
					}					
        return(callObject);
			};
					
	  this.loadHTTP = function(callTarget,callback,_caller,callId)
		  {
		  	var callObject = this.build();
		  	
		  	callObject.callTarget = callTarget || null;
        callObject.callback = callback || null;
        callObject._caller = _caller || new Object();
        callObject.callId = callId || '';
						
			  callObject.main = function()
			    {
					  if(this.httpHandle.readyState == 4)
					    {
					    	this.responseData = this.httpHandle.responseText;
					    	eval('this._caller.' + this.callback + '(this)'); 
							} 
						else
							{
								return(true);
							}
					};
							
				callObject.httpHandle.open('POST',callObject.callTarget,true);
        callObject.httpHandle.send(null);			
						
				return(callObject);
			};					
			 
	  this._serialize = function(obj)
	    {
			  try
				  {
					  var s = new XMLSerializer();
						var ser = s.serializeToString(obj);
					}
				catch(e)
					{
						var ser = obj.xml;
					}					
			  return(ser);	
			};
	};