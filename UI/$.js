var $ = 
  {
		_interfaceStarted: false,
		_dockRef: null,
		
		PROFILE_HISTORY_STATE: null,
		LOADER_LOCKED: false,
		
    start: function()
	    {
	    	if($.validateKeyHash())
	    	  {
		        $.Queue.start();
		      }
	    },
	    
	  setAccessKey: function(key)
	    {
	    	$._keyHash = key || null;
	    },
	    
	  validateKeyHash: function()
	    {
	    	// add in server validation
	    	return($._keyHash != null);
	    },
  
	  register: function(scr)
	    {
	      try
		      {
	          // set prototype of new object to $
			      eval(scr + ".prototype = this");
								
           	// add new object to System collection
			      eval("this." + scr + " = new " + scr);

			      // remove original 
			      eval(scr + " = new Object()");

			      // try to call constructor, if any
			      try
			        {
			          eval("this." + scr + "." + scr + "()");
			        } 
			      catch(e) {}
		      }
		    catch(e)
		      {
		        this.handleException(e,arguments);
		      }
	    },
	
	  build: function()
	    {
        var args = new Array();
		    for(a=0; a < arguments.length; a++)
		      {
	          args[a] = arguments[a];
		      }	  
	  
        // establish name of constructor
        var constr = args[0];

		    // now lose constructor name, preserving remaining arguments
		    args.shift();
			
		    // We want every constructed object to have its collection
		    // accessible as a prototype. Establish connection.
		    var resolvedConstr = eval("this." + constr);
		    resolvedConstr.prototype = this;
			           
        // instantiate
		    var inst = new resolvedConstr;
			
		    // call the constructor function, passing it remaining arg list
		    eval("inst." + constr + "(args)");

        // remove INSTANCE constructor function to minimize memory use
        eval("inst." + constr + " = function(){;}");

		    // return the constructed object
		    return(inst);	  
	    },
	
	  handleException: function(er,ar,comment)
	    {
	  	  var err ='Comment >>\n' + (comment || 'unspecified') + '\n\n';
	  	  
	  	  err += '--------------------\n';
	  	  err += 'Error >> ' + (er || 'unspecified') + '\n';
	  	  err += '--------------------\n\n';
	  	  
		    try
		      {
	          for(p in er)
		          {
	              err += '>> ' + p + ': ' + eval('er.'+p) + '\n';
		          }
		      }
		    catch(e) {}
		    
	  	  err += '--------------------\n';
	  	  err += 'Arguments >> ' + (ar || 'unspecified') + '\n';
	  	  err += '--------------------\n\n';
	  	  
		    try
		      {
	          for(p in ar)
		          {
	              err += '>> ' + p + ': ' + eval('ar.'+p) + '\n';
		          }
		      }
		    catch(e) {}
		    
	      alert(err);
	    },
	
	  /**************************************
	   *  QUEUE  ****************************
	   **************************************/

	  Queue:
	    {			
	      queueTimer: null,
		
	      queue: new Array(),
		
		    add: function(ob,failsafeOb)
	        {
		        var sOb = ob || new Object();
		        sOb.main = sOb.main || function() { return(false); };
			
		        this.queue.push(sOb);
		        return(sOb);
	        },
	
	      walk: function()
          {	 
		        var instance = false;
				
		        // because the queue will probably be appended to during this routine, the 
		        // terminal instruction of the start set is needed to terminate the run
		        var terminal = this.queue[this.queue.length-1];
				
		        while(instance = this.queue.shift())
		          {
		            try
		              {
			              // execute main routine of object and
                    // reintroduce to queue if main() returns true
      		          instance.main() && this.queue.push(instance);
		              }
			          catch(e)
			            {
			              // note that if an error occurs in instance.main() the instance
				            // is removed from the queue by force: ie. it will never get pushed
			              $.handleException(e,arguments);
			            }
			          // die if we've reached the end of the ORIGINAL queue
			          if(instance == terminal) 
			            { 
			              break; 
			            }
			        }
          },
		  
	      start: function()
	        {
	          this.queueTimer = setInterval('$.Queue.walk()',1);
	        },
		  
		    stop: function()
		      {
		        clearInterval(this.queueTimer);
		      }
	    },
	    
	  Client:
	    {
	    	isMoz: function()
	    	  {
	    	  	
	    	  }
	    },
	    
			
	  /**************************************
	   *  INTERFACE  ************************
	   **************************************/
		
		setProfileHistoryState: function(st)
		  {
		  	if(st)
		  	  {
		  	  	this.PROFILE_HISTORY_STATE = ((st == 'closed') || (st == 'open') || (st == 'hidden')) ? st : this.PROFILE_HISTORY_STATE;
		  	  }
		  },
		  
    getProfileHistoryState: function()
		  {
		  	return(this.PROFILE_HISTORY_STATE);
		  }, 
		  
		interfaceStarted: function()
		  {
		  	return(this._interfaceStarted);
		  }
  };

