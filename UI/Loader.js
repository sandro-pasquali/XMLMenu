function Loader() 
  {
    this.Loader = function()
      {
        this.controllerLocation = 'http://www.unifiedapplications.com/searches/controller.php';
		   	/*
		   	 * all requests will go into activeRequests until a locked request.
		   	 * at the point of a lock request, until that lock is removed,
		   	 * all requests go into queuedRequests
		   	 */
		   	this.activeRequests = new Array();
		   	this.queuedRequests = new Array();
		   			   	
		   	this.loadingPanel = document.body;

		   	this._isLocked = false;
		   	
		    this.createLoadingPanel();
      };

		this.isLocked = function()
		  {
		  	return(this._isLocked);
		  };

   	this.load = function(callArguments,callback,_caller,callId,locked)
   	  {
   	  	if(!this.isLocked() && this.notDuplicateCall(callId))
   	  	  {
   	  	  	var callTarget = this.controllerLocation + '?' + callArguments;
   	  	  	var requestHandler = 
   	  	  	  {
   	  	  	    callTarget: callTarget,
   	  	  	    callback: callback,
   	  	  	    _caller: _caller || new Object(),
   	  	  	    callId: callId
   	  	  	  };
   	  	  	
   	  	  	try
   	  	  	  {
   	  	  	    this.activeRequests.push(requestHandler);  
   	            $.Queue.add(Ajax.loadHTTP(callTarget,'handleCallback',this,callId));
   	            this.updateLoadingPanel(callId,'loading...');
   	          }
   	        catch(e) 
   	          { 
   	          	$.handleException(e,arguments); 
   	          }
   	      }
   	  };
	    	  
   	this.notDuplicateCall = function(callId)
   	  {
   	  	var aR = this.activeRequests;
   	  	for(p in aR)
   	  	  {
   	  	  	if(aR[p].callId == callId)
   	  	  	  {
   	  	  	  	return(false);
   	  	  	  }
   	  	  }
   	  	return(true);
   	  };
	    	  
   	this.handleCallback = function(retOb)
   	  {
   	  	var aR = this.activeRequests;
   	  	for(p in aR)
   	  	  {
   	  	  	if(aR[p].callId == retOb.callId)
   	  	  	  {
   	  	  	  	eval('aR[p]._caller.' + aR[p].callback + '(retOb)'); 
                this.clearLoadingPanelItem(retOb.callId);
   	  	  	  	aR.splice(p,1);
   	  	  	  }
   	  	  }
   	  };
   	  
		this.createLoadingPanel = function()
		  {
		  	try
		  	  {
				  	var lP = document.createElement('div');
				  	lP.setAttribute('id','loading_panel');
				  	lP.style.position = 'absolute';
				  	lP.style.top = '0px';
				  	lP.style.left = '0px';
				  	lP.style.visibility = 'hidden';
				  	this.loadingPanel = document.body.appendChild(lP);
				  }
				catch(e){}
		  };
		  
		this.updateLoadingPanel = function(id,t)
		  {
		  	try
		  	  {
				  	var txt = t || id;
				  	var el = document.createElement('div');
				  	el.setAttribute('id',id);
				  	el.appendChild(document.createTextNode(txt));
				  	
				  	this.loadingPanel.style.visibility = 'visible';
		  	    this.loadingPanel.appendChild(el);
		  	  }
		  	catch(e){}
		  };
		  
		this.clearLoadingPanelItem = function(id)
		  {
		  	try
		  	  {
		  	  	var z = document.getElementById(id);
		  	  	var pn = z.parentNode;
		  	  	pn.removeChild(z);

		  	  	if(pn.childNodes.length == 0)
		  	  	  {
		  	  	  	this.loadingPanel.style.visibility = 'hidden';
		  	  	  }
		  	  }
		  	catch(e){}
		  };
  };