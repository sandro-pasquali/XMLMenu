function Controllers()
  {
	  this.Controllers = function() 
	    {
	    	this.selectionBackgroundColor = '#ff0000';
	    	
	    	this.defaultEventKey 	= 'document';
	    	this.keymap 					= new Array();
	      this.handlers 				= new Array();
	      this.eventList 				= new Array
	        (
	          'onabort',
					  'onblur',
					  'onchange',
					  'onclick',
					  'ondblclick',
					  'onerror',
					  'onfocus',
					  'onkeydown',
					  'onkeypress',
					  'onkeyup',
					  'onload',
					  'onmousedown',
					  'onmousemove',
					  'onmouseout',
					  'onmouseover',
					  'onmouseup',
					  'onreset',
					  'onresize',
					  'onselect',
					  'onsubmit',
					  'onunload'
					);
  	    	
		    this.eventInfo = 
			    {
			    	/*
			    	 * written to by .monitor
			    	 */
			      element: new Object(),

            elId: null,
            elClass: null,
			      x: null,
			      y: null,
			      eventType: new Object(),
			      tag: null,
		
				    /*
				     * written to by Keyboard object, if any, onkeypress
				     */
		        lastKeyCode: null,
			      keyMod: null,
			      
			      /*
			       * selected items list
			       */
			      selectedItems: new Array(),
			      lastSelectedItem: new Object(),
			      
			      /*
			       * drag/drop and select
			       */
			      dragStarted: false,
				    draggable: false,
	        	payloadType: false,
	        	ghost: false,

	        	selectable: false,
	        	delayedMouseDown: false
		      };
	    };
	    
    this.selectItem = function(evInf)
      {
      	if(!this.itemIsSelected(evInf))
      	  {
		       	var id = evInf.elId;
		       	var el = evInf.element;
		      	  
		       	if(evInf.selectable)
		       		{
		       			try
		       			  {
			        			var sOb = 
			        			  {
			        			  	elId: 							id,
			        			  	element:						el,
			        			  	draggable: 					evInf.draggable,
			        			  	payloadType: 				evInf.payloadType,
			        			  	backgroundColor: 		evInf.element.style.backgroundColor,
			        			  	left:								evInf.elLeft,
			        			  	top: 								evInf.elTop,
			        			  	width:							evInf.elWidth,
			        			  	height: 						evInf.elHeight
			        			  };
		                  
			        			this.eventInfo.selectedItems.push(sOb);	        			
			        			
			        			evInf.element.style.backgroundColor = this.selectionBackgroundColor;  
			        			this.eventInfo.lastSelectedItem = sOb; 
			        			
			        			return(sOb);
			        		}
			        	catch(e)
			        	  {
			        	  	
			        	  }
		       		}
		      }
        return(false);
      };
			        
		this.deselectItem = function(evInf)
		   {
		     try
		       {
		       	 var sel = this.itemIsSelected(evInf);

		       	 if(sel)
		       	   {
		       	   	 var ss = this.eventInfo.selectedItems[sel];
		       	   	
		       	   	 ss.element.style.backgroundColor = ss.backgroundColor;
                 this.eventInfo.selectedItems.splice(sel,1);
                 
                 /*
                  * check if this is lastSelectedItem, and snip if so.
                  */
                 if(ss.elId == this.lastSelectedItem.elId)
                   {
                     this.lastSelectedItem = new Object(); 	
                   }
		           }
		       }
		     catch(e)
		       {
		       	
		       }
		   };
		   
		this.clearSelectedItems = function()
		  {
		  	var sl = this.eventInfo.selectedItems;
		  	
		  	for(p in sl)
		  	  {
		  	  	sl[p].element.style.backgroundColor = sl[p].backgroundColor;
		  	  }
		  	
		  	this.eventInfo.selectedItems = new Array();
		  	this.eventInfo.lastSelectedItem = new Object();
		  };
		   
		this.itemIsSelected = function(evInf)
		  {
		  	var id = evInf.elId;
		  	
		  	try
		  	  {
		  	  	var s = this.eventInfo.selectedItems;
		  	    for(p in s)
		  	      {
		  	      	if(s[p].elId == id)
		  	      	  {
		  	      	  	return(p);
		  	      	  }
		  	      }
		  	  }
		  	catch(e){}
		  	
		  	return(false);
		  };
		  
		this.prepareDrag = function(dOb)
		  {
		  	this.eventInfo.pendingDragOb = dOb;
		  }  
		  
		this.startDrag = function()
		  {
		  	var evi = this.eventInfo;
		  	
        evi.dragStarted = true;

        /* 
         * create the drag object
         */
        var g = document.createElement('div');
        g.setAttribute('id','GHOST');
        g.style.position = 'absolute';
        g.style.left = '0px';
        g.style.top = '0px';
        g.style.paddingLeft = '30px';
        g.style.paddingTop = '10px';
        g.style.width = '100px';
        g.style.height = '100px';
        g.style.zIndex = 10000;

        evi.ghost = document.body.appendChild(g);
        
        /*
         * Now find all selected elements that are draggable,
         * and add that info to the drag indicator
         */
        
        var cnt = 0;
        for(x=0; x < evi.selectedItems.length; x++)
          {
          	if(evi.selectedItems[x].draggable)
          	  {
          	  	var gI = document.createElement('div');
          	  	gI.appendChild(document.createTextNode(evi.selectedItems[x].elId));
          	  	
          	  	evi.ghost.appendChild(gI);
          	  	
          	  	cnt++;
          	  }
          }
		  };
		  
		this.endDrag = function(evInf)
		  {
		  	try
		  	  {
				  	evInf.dragStarted = false;
				  	evInf.pendingDragOb = false;
		        evInf.delayedMouseDown = false;
				  	
				  	evInf.ghost.parentNode.removeChild(this.eventInfo.ghost);
		  	  }
		  	catch(e){}
		  };

	  this.monitor = function(e)
	    {
	    	var _C = $.Controllers;
	    	
	    	try
	    	  {
				    var eInf = _C.eventInfo;
			      var ns = (e);
			      var ev = (ns) ? e : window.event;
			      
			      eInf.currentTarget = this;
            
            /*
             * when the currentTarget is the document object,
             * there will be no id set; use default.  This is
             * also how you might check if the event has
             * reached the document object level...
             */
            eInf.currentTargetId = this.id || _C.defaultEventKey;
            
				    eInf.element = (ns) ? ev.target : ev.srcElement;
				    eInf.x = (ns) ? ev.pageX : ev.clientX + document.body.scrollLeft;
				    eInf.y = (ns) ? ev.pageY : ev.clientY + document.body.scrollTop;
				    eInf.elLeft = $.DOM.findPosX(eInf.element);
				    eInf.elTop = $.DOM.findPosY(eInf.element);
				    eInf.elWidth = eInf.element.offsetWidth;
				    eInf.elHeight = eInf.element.offsetHeight;

			      /*
			       * NOTE the addition of 'on' here:
			       * the .type value of an event for an
			       * onclick would be 'click'...
			       */
				    eInf.eventType = 'on' + ev.type;

            /*
             * keyboard info
             */
 	          eInf.lastKeyCode = ev.keyCode;
            eInf.keyMod = (ev.altKey) 
                        ? 1 
                        : (ev.ctrlKey) ? 2 
                                       : (ev.shiftKey) ? 3 
                                                       : null;
                                                       
            /*
             * mousewheel info.  Again, differences
             * with moz and others
             */
            if(ev.wheelDelta) 
            	{ 
                eInf.delta = ev.wheelDelta/120;
                
                /*
                 * In Opera 9, delta differs in sign as compared to IE.
                 */
                if(window.opera)
                	{
                    eInf.delta = -eInf.delta;
        					} 
        			}
        		else if(ev.detail)
        			{ 
        				/*
        				 * moz. In Mozilla, sign of delta is different than in IE.
              	 * Also, delta is multiple of 3.
        				 */
		            delta = -ev.detail/3;
        			}
            
				    eInf.elId = eInf.element.getAttribute('id');
				    eInf.elClass = eInf.element.getAttribute('class');
				    eInf.tag = eInf.element.nodeName || null;
				    
				    eInf.draggable = (eInf.element.getAttribute('draggable')) 
				                   ? true 
				                   : false;
				                   
	        	eInf.payloadType = eInf.element.getAttribute('payloadType') || '*';
	        	eInf.acceptsDropType = (eInf.element.acceptsDropType) || false;
	        	
	        	eInf.selectable = (eInf.element.getAttribute('selectable') == 'true') 
	        	                ? true 
	        	                : false;
				  }
				catch(e) {}

        /*
         * the user is able to set any number of element-level
         * handlers; all of these will eventually `bubble` to 
         * the document.  The handlers below are only to execute
         * when the event is at the document level, ignoring
         * events occurring at other levels...
         */
        if(eInf.currentTarget == document)
          {
						switch(eInf.eventType)
						  {
						  	case 'onmousemove':
		            
		            status = eInf.elId;
		            
		            /*
		             * make copies of items, on mousedown calculate distances
		             * from each element, make clones, and have them follow
		             * the mouse with proper relative spacing
		             */
						  	  if(eInf.pendingDragOb)
						  	    {
						  	    	if(eInf.dragStarted === false)
						  	    	  {
						  	    	    _C.startDrag();
						  	    	  }
						  	    	  
						  	    	var ss = _C.eventInfo.ghost.style;
						  	    	
						  	    	ss.left = (eInf.x - 10).toString() + 'px';
								  	  ss.top = (eInf.y - 10).toString() + 'px';
						  	    }
						  	
						  	break;
						  	
						  	case 'onmousedown':
						  	  
						  	  try
						  	    {
		                  document.body.setCapture();
		                }
		              catch(e){}
		              
		              /* 
						       * clicking on any non-selectable item
						       * clears all selected
						       */
                  if(eInf.selectable === false)
                    {
		          		    _C.clearSelectedItems();
		                }
		              else if(eInf.keyMod == 2)
		                {
						  	 	  	if(_C.itemIsSelected(eInf))
						  	 	  	  {
								  	  	  /* 
								  	  	   * user has clicked on a selected item
								  	  	   * using CTRL; deselect item
								  	  	   */	
								  	  	  _C.deselectItem(eInf);
								  	  	}
								  	  else
								  	  	{
								  	  		/*
								  	  		 * ctrl + new item -- select
								  	  		 */
								  	  		_C.selectItem(eInf);
								  	  	}
		                }
						  	  else if(eInf.keyMod != 3)
						  	 	  {
		                	if(_C.itemIsSelected(eInf) === false)
				             	  {
				                  /*
				                   * no CTRL, clicked on unselected item.  Clear
				                   * all others and select current.
				                   */
				                  _C.clearSelectedItems();
						            	_C.selectItem(eInf);
						            }
						          else
						           	{
						           		/*
						           		 * no CTRL, clicked on selected item.
						           		 * see below for delayed mouse down
						           		 */
						           	  _C.selectItem(eInf);
						           	}
						              	
						          /*
									   	 * NOTE that all draggable
									  	 * elements MUST also be selectable 
									  	 */
									  	if(eInf.draggable)
									  	  {
										 	  	eInf.delayedMouseDown = true;
							            _C.prepareDrag(eInf);
							          }
						  	 	  }
						  	  
						  	  /* 
						  	   * to avoid any problems with text selection and
						  	   * other event conflicts, if this is a draggable
						  	   * element we break the event chain here.
						  	   */
						  	  if(eInf.draggable === true)
						  	    {
						  	      return(false);   
						  	    }
						  	    
						  	break;
						  	
						  	case 'onmouseup':
						  	
						  	  try
					  	  	  {
					  	  	    document.body.releaseCapture();
					          }
					        catch(e){}
						  	
		              if(eInf.keyMod == 3)
		             	  {
		             	  	/*
		             	  	 * SHIFT + click.  
		             	  	 */
		             	  	if(!_C.itemIsSelected(eInf) && (eInf.selectedItems.length > 0))
		             	  	  {

		             	  	  	if(!_C.itemIsSelected(eInf) && (eInf.selectable === true))
		             	  	  	  {
		             	  	  	  	var sib = eInf.element.parentNode.childNodes;
		             	  	  	  	var lsel = eInf.lastSelectedItem;
		             	  	  	  	var pointsFound = 0;
		             	  	  	  	var pArr = new Array();
		             	  	  	  	
		             	  	  	  	_C.clearSelectedItems();
		             	  	  	  	
		             	  	  	  	/*
		             	  	  	  	 * there are two points we are selecting
		             	  	  	  	 * between; 1) the last selected item; 2) the
		             	  	  	  	 * current selection.  run children, and
		             	  	  	  	 * when you find EITHER of these, select
		             	  	  	  	 * between THAT point and the point where
		             	  	  	  	 * the OTHER is found
		             	  	  	  	 */
		             	  	  	  	for(s=0; s < sib.length; s++)
		             	  	  	  	  {
		             	  	  	  	  	/*
		             	  	  	  	  	 * valid elements to include in this group are
		             	  	  	  	  	 * selectable and with same payloadType as the last
		             	  	  	  	  	 * selected element...
		             	  	  	  	  	 */
		             	  	  	  	  	 
		             	  	  	  	  	if(sib[s].getAttribute('selectable') == 'true') 
		             	  	  	  	  	  {
				             	  	  	  	  	if((sib[s] === lsel.element) || (sib[s] === eInf.element))
				             	  	  	  	  	  {
				             	  	  	  	  	  	++pointsFound;
				             	  	  	  	  	  }
				             	  	  	  	  	  
				             	  	  	  	  	if(pointsFound > 0)
				             	  	  	  	  	  {
				             	  	  	  	  	  	var eOb = 
				             	  	  	  	  	  	  {
				             	  	  	  	  	  	  	elId: sib[s].getAttribute('id'),
				             	  	  	  	  	  	  	element: sib[s],
				             	  	  	  	  	  	  	draggable: (sib[s].getAttribute('draggable')) ? true : false,
				             	  	  	  	  	  	  	payloadType: sib[s].getAttribute('payloadType') || '*',
				             	  	  	  	  	  	  	backgroundColor: sib[s].style.backgroundColor,
				             	  	  	  	  	  	  	selectable: (sib[s].getAttribute('selectable') == 'true') ? true : false,
				             	  	  	  	  	  	  	elLeft: $.DOM.findPosX(sib[s]),
				             	  	  	  	  	  	  	elTop: $.DOM.findPosY(sib[s]),
				             	  	  	  	  	  	  	elWidth: sib[s].offsetWidth,
				             	  	  	  	  	  	  	elHeight: sib[s].offsetHeight
				             	  	  	  	  	  	  };
                                          
                                          pArr.push(eOb);
				             	  	  	  	  	  }
				             	  	  	  	  	  
				             	  	  	  	  	if(pointsFound == 2)
				             	  	  	  	  	  {
				             	  	  	  	  	  	/* 
				             	  	  	  	  	  	 * we found 2 points; select and exit
				             	  	  	  	  	  	 */
				             	  	  	  	  	  	for(p in pArr)
				             	  	  	  	  	  	  {
				             	  	  	  	  	  	    _C.selectItem(pArr[p]);
				             	  	  	  	  	  	  }
				             	  	  	  	  	  	  
				             	  	  	  	  	  	return;
				             	  	  	  	  	  }
				             	  	  	  	  }
		             	  	  	  	  }
		             	  	  	  	/*
		             	  	  	  	 * if we get here, what has happened
		             	  	  	  	 * is that the user has clicked, with shift,
		             	  	  	  	 * on a valid selectable element while there
		             	  	  	  	 * was at least one other element selected, yet
		             	  	  	  	 * that previously selected element was not
		             	  	  	  	 * a child under the same parent.  treat as a
		             	  	  	  	 * single click -- clear all selected and select current
		             	  	  	  	 */
		             	  	  	  	_C.clearSelectedItems();
										  	      _C.selectItem(eInf);
		             	  	  	  }
		             	  	  }
		             	  }
		              else if(eInf.keyMod != 2)
		                {
		                	if(eInf.delayedMouseDown)
		                	  {
		                	  	/*
		                	  	 * delayedMousedown indicates that a draggable element
		                	  	 * has been touched; if the user hasn't started dragging, 
		                	  	 * then treat this as a normal click (clear and select item).
		                	  	 *
		                	  	 * if the item has started dragging, the below will be ignored,
		                	  	 * and ultimately no change will occur to selections, which
		                	  	 * will simply be dropped.
		                	  	 */
										  	  if(!eInf.dragStarted)
										  	    {
										  	    	_C.clearSelectedItems();
										  	      _C.selectItem(eInf);
										  	    }
								  	    }
						  	    }
						  	    
		              _C.endDrag(eInf);
						  	    
						  	break;
						  	
						  	default:
						  	break;
						  }
				  }
				/*
				 * tooltips
				 */
				 
			  
				
				/*
				 * now execute custom handlers
				 */			
				_C.executeHandlers();
      };	
	    
	  this.executeHandlers = function()
	    {
	    	try
	    	  {
            this.handlers[this.eventInfo.currentTargetId][this.eventInfo.eventType](this.eventInfo);
	    	  }
	    	catch(e){}
	    };
	    
	  this.setEventHandler = function(ev,fun,evGrp)
	    {
	    	var eG = (evGrp.toString() == '') ? this.defaultEventKey : evGrp;
	    	
	    	try
	    	  {
	    	    if(!this.handlers[eG])
	    	      {
	    	      	this.handlers[eG] = new Array();
	    	      }
	    	    
	    	    this.handlers[eG][ev] = fun;
	    	  }
	    	catch(e){}
	    };  
	    
		this.bind = function(d)
	    {
	    	try
	    	  {
			    	var doc = (d.toString() == '') ? document : document.getElementById(d);

			    	for(e in this.eventList)
			    	  {
			    	  	eval("doc." + this.eventList[e] + " = $.Controllers.monitor");
			    	  }
			    	  
			    	/*
			    	 * mousewheel support is not standard for moz
			    	 */
			    	if(window.addEventListener)
			    		{
        				/*
        				 * moz
        				 */
        				doc.addEventListener('DOMMouseScroll', $.Controllers.monitor, false);
        			}
            else
            	{
								doc.onmousewheel = $.Controllers.monitor;
			    		}
			    }
			  catch(e){}
	    };
		  
		/***********************************
		 ***********************************
		 *                      ************
		 *  CUSTOM CONTROLLERS  ************
		 *                      ************
		 ***********************************
		 ***********************************/

	  this.menu = function()
	    {
	    	this.menu = function(targ)
	    	  {
      	  	this.setEventHandler('onclick',this.branchHandler,targ);
      	  	
	    	  	this.bind(targ);
	    	  };
	    	  
				/*
				 * this is the handler for all branch events
				 */
				this.branchHandler = function(ev)
          {
            try
              {
		           	/*
		           	 * this handler will fire not only on the click of
		           	 * the branch element itself, but on any control
		           	 * icons (+/-) or file icons (icon to left of text).
		           	 *
		           	 * As we must pass the ref of the branch element itself,
		           	 * find that ref if it doesn't exist (ie. if icon is clicked).
		           	 */

		           	var n = (ev.element.id.indexOf('__control__') > -1) ? ev.element 
		           	      : (ev.element.parentNode.id.indexOf('__control__') > -1) ? ev.element.parentNode 
		           	      : false;

		           	if(n)
		           	  {
		                ev.currentTarget.mRef.activate(n); 
				            ev.currentTarget.mRef.recordClick(n);
				          }
				      }
				    catch(e){}
          };
	    };
	    
	  this.documentLevel = function()
	    {
	    	this.documentLevel = function(targ)
	    	  {
	    	  	this.bind(targ);
	    	  }
	    };
  };
  
