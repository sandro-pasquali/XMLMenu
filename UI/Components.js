
function Components()
  {
    this.Components = function() 
      {
      }
      

/*******************************************************
 *      ************************************************
 * MENU ************************************************
 *      ************************************************
 *******************************************************/
 
 
		this.menu = function() 
		  {
		    this.menu = function(argOb)
		      {
		      	/*
		      	 * the xml file to build into a menu
		      	 */
		      	this.baseMenuFile = argOb[0];
		      	
		      	/*
		      	 * Set to the DOM element that this menu will attach to
		      	 */
		      	this.DOMContainer = argOb[1];
		      	
						/*
						 * Set to the id of the root element of this menu's XML representation
						 */
						this.containerID = argOb[2];

						/*
						 * Set to the document where the menu should be rendered (note default)
						 */
						this.targetDocument = argOb[3] || document;
						
						/*
						 * locking functions.  Employed when menu is being loaded,
						 * reloaded, written to, and so forth
						 */
						this._menuLocked = false;
						
						this.lock = function()
						  {
						  	this._menuLocked = false;
						  };
						  
						this.unlock = function()
						  {
						  	this._menuLocked = false;
						  };
						  
						this.isLocked = function()
						  {
						  	return(this._menuLocked);
						  };
						
						/*
						 * The id of the link anchor which contains this menu's style sheet
						 * This link is dynamically created whenever a stylesheet load is tried.
						 */
						this.styleID = 'menuStyle';
						
						/*
						 * This will contain a reference to the menu tree upon successful menu load
						 */
						this.container = null;
						
						/* 
						 * Set to the maximum number of milliseconds any queued load 
						 * requests will wait before failing
						 */
						this.timeout = 20000;
						
						/*
						 * as used in this.writeDOMElement:
						 *
						 * this is the id prefix for created elements, used to track
						 * parents for children as they are attached. in final form,
						 * the attribute will resemble :: id = "nodeIDprefix_int"
						 *
						 * note that the root node does not follow this id scheme, 
						 * having its id set to whatever this.containerID is.
						 *
						 * as used in this.mapToDom:
						 *
						 * this is the actual attribute name added to original xml nodes.
						 * ie. <xmlnode ___treePos___= "2">
						 */
						this.nodeIDprefix = '___treePos___'; 
						
						/*
						 * as above, used to write title for node
						 */
						this.nodeTITLEprefix = '___title___'; 
						
						/*
						 * used by .recordClick() and replayClicks()
						 */ 
						this.replaying = false;
						
						/*
						 * used by .recordClick() and replayClicks()
						 */
						this.clicks = new Array();
						
						/*
						 * stack of instructions for displaying/hiding elements
						 */
					  this.instructionStack = new Array();
					  
					  /* 
					   * attach a reference to this instance in the DOMContainer
					   */
					  document.getElementById(this.DOMContainer).mRef = this;
					  
					  /*
					   * bind custom controller to this menu view
					   */
					  this.controller = $.Controllers.build('menu',this.DOMContainer);  
					}; 
				
				this.toggleBranchState = function(ins)
					{
				    var obs = ins.style;
				
				    // toggle its state
				    if(obs.visibility=='inherit')
				      {
				        obs.position='absolute';
				        obs.visibility='hidden';
				      } 
						else 
						  {
				        obs.position='static';
				        obs.visibility='inherit';
				      }		
					};
				
				/*
				 * this will be attached to the queue 
				 */
				this.main = function()
				  {
					  try
						  {
						    // fifo
					      var ob = this.instructionStack.shift();
				        this.toggleBranchState(ob.ob);
							}
						catch(e) {;} 
						return(true);
					};
					
				this.addInstruction = function(el)
				  {
					  this.instructionStack.push({ob: el});
					};	
			  
			  this.setSelectedElement = function(el)
			    {
			    	if(this.lastSelectedElement) 
			    	  {
                this.clearSelectedElement(this.lastSelectedElement);
              }

	    	  	el.className = 'selectedBranchElement';
	    	  	this.lastSelectedElement = el;
					};
					
				this.clearSelectedElement = function(el)
				  {
				  	try
				  	  {
				  	  	el.className = 'nullClass';
				  	  	this.lastSelectedElement = false;
				  	  }
				  	catch(e){}
				  }	
					
				this.activate = function(el,state,recur)
				  {
						/* when passed an element reference, will recursively
						 * seek children and open them.
						 */ 
					  if(el)
					    {
				    	  if(el.style && !recur)
					   	    {
                    this.setSelectedElement(el);
					   	    }
					   	  
						    /*
						     * Change open/closed icon. Will only fire on originally 
						     * clicked control item (which sends no state argument).
						     */
						    if(!state)
							    {
								    try
									    {
									      var st = el.getAttribute("iconState");

									      /*
									       * icons aren't always present
									       */
									      var iconInfo = (st == 'open') ? this.getIcon('closed') : (st == 'closed') ? this.getIcon('open') : null;
											  
											  el.setAttribute("state",(st == 'open') ? 'closed' : 'open');
											  
											  if(iconInfo)
											    {
											      el.setAttribute("iconState",(st == 'open') ? 'closed' : 'open');
											      el.childNodes.item(0).src = iconInfo.path;
											    }
										  }
									  catch(e) {}
								  }
								 
					      tempEl=el.nextSibling;;
				        if(tempEl)
						      {
				    	      if(tempEl.nodeType==1)
								      {
										    /*
										     * add (open/close) animation to the stack if this 
										     * activate command is the result of a user request.
										     * if this is a function of replayClicks(), just open
										     * the subelements instantaneously.
										     */
										    if(this.replaying)
										      {
										        this.toggleBranchState(tempEl);	
										      }
										    else
										   	  {
				                    this.addInstruction(tempEl);
				                  }
				        	    } 
										this.activate(tempEl,1,1);
				    	    }
				    	}
				  };
					
				this.serialize = function(obj)
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
				
				this.load = function(waitTime)
					{
						/*
						 * Since we cannot load another menu until previous loads are complete,
						 * load() will wait until a previous load is finished.
						 */
            var wt = waitTime || 0;
            
            /*
             * as we'll need a global ref to this menu instance for the
             * timeOut to call, let's make one in the .targetDocument.  As
             * there might be more than one menu instance in .targetDocument,
             * let's identify the ref using containerID (which is unique)
             */
            eval("this.targetDocument." + this.containerID + " = this");
            
					  if(this.isLocked() === false)
						  {
						    // Announce that the menu is loading
						    this.lock(); 
						
						    // the dom element that the menu will be attached to
					      this.container = this.targetDocument.getElementById(this.DOMContainer) || this.targetDocument.body;
					      
					      /*
					       * clear that container (this may be a reload)
					       */
						  	while(this.container.firstChild)
						  	  {
						  	  	this.container.removeChild(this.container.firstChild);
						  	  }
					      
				        // Since the menu will arrive unformatted, lets hide it for now
				        this.hideMenu();

				        $.Queue.add($.XMLHTTP.loadXML(this.baseMenuFile,'buildMenus',this,'MENU_LOAD'));	        
							}
						else if(wt < this.timeout)
						  {
							  setTimeout("this.targetDocument." + this.containerID +  ".load(" + (wt + 50) + ")",50);
							}
						else // timeout
						  {
							  $.handleException('','','The menu has not loaded properly and may behave strangely.');
							}		
				  };
					
				this.reload = function()
				  {
			  	
				  	/*
				  	 * we're now going to reload the menu, so we need
				  	 * to remove the 
				  	 */
				  	this.load();
				  }	
					
				this.hideMenu = function()
				  {
					  this.container.style.visibility = 'hidden';
					};
					
				this.showMenu = function()
				  {
					  this.container.style.visibility = 'visible';
					};
				
				this.buildMenus = function(re)
				  {
						/* the callback function which fires when this menu's XML
						 * description has been loaded (via this.load).  passes the xml doc ref.
						 */
		  
						this.XML = re.xml;
						
						// write the DOM representation of the menu
						
						this.translateToDomTree(this.XML);
				
						// Make sure the menu insertion was successful and can be referenced 
					  try
						  {
							  /* containerID is the menu's containing xml tag (the id of the root
								 * element of this menu's XML representation.  Icon set and
								 * style sheet properties may be stored here.
								 */
						    var doc = this.targetDocument.getElementById(this.containerID);
							}
						catch(e)
						  {
							  $.handleException(e,arguments,'The menu has not loaded properly and may behave strangely, or not at all.');
							}
								
						// Announce that the menu has loaded properly
						this.unlock(); 
						
						// First, see if there is a stylesheet to apply 
					  try
						  {
						    // load the style sheet definition, if any
						    this.loadStyleSheet(doc.attributes.getNamedItem('styleSheet').value);
							}
						catch(e){} // no default style sheet
						
						// Try for a default icon set
						try
						  {
						    // load the icon set definition, if any
						    this.loadIconSet(doc.attributes.getNamedItem('iconSet').value);
							}
						catch(e){} // no default iconset for menu
						
						this.showMenu();
				  };
					
				this.loadStyleSheet = function(file)
				  {
						try
						  {
							  var style = this.targetDocument.getElementById(this.styleID);
								style.href = file;
							}
						catch(e)
						  {
				        // style object doesn't exist.  create it.
								var head = this.targetDocument.createElement("link");
				        head.setAttribute("id",this.styleID);
				        head.setAttribute("rel","stylesheet");
				        head.setAttribute("type","text/css");
				        head.setAttribute("href",file);
				        this.targetDocument.getElementsByTagName("head").item(0).appendChild(head);
							}
					};
					
				this.loadIconSet = function(file,waitTime)
				  {
						/*
						 * Load an icon set.  Because the icons cannot be attached until the menu
						 * structure exists, we need to continuously call this function until
						 * the menu is fully loaded.  
						 *
						 */
					  var wt = waitTime || 0;
					  if(this.isLocked() === false)
						  {
							  this.lock();

				        $.Queue.add($.XMLHTTP.loadXML(file,'parseIconSet',this,'ICON_SET_LOAD'));	
							}
						else if(wt < this.timeout)
						  {
						  	setTimeout("this.targetDocument." + this.containerID +  ".loadIconSet('" + file + "'," + (wt + 50) + ")",50);
							}
						else // timeout
						  {
							  $.handleException('','','The icon set for this menu has not loaded properly.');
							}
					};
					
				this.getIcon = function(id)
				  {
					  var iconInf = new Object();
					  for(i=0; i<this.iconSet.length; i++)
						  {
							  el = this.iconSet;
								if(el[i].id == id)
									{
										iconInf.path = el[i].location;
										iconInf.path += el[i].fileName;
										iconInf.path += '.' + el[i].extension;
										
										iconInf.className = el[i].className;
										break;
									}
							}
						return(iconInf);
				  };
					
				this.parseIconSet = function(re)
				  {
						/*
						 * Callback from loadIconSet(). Take the icon set that has been loaded and 
						 * create a local representation used by getIcon() to fetch icon definitions
						 */
					  var els = re.xml.getElementsByTagName('icon');
						this.iconSet = new Array();
						for(q=0; q<els.length; q++)
							{
							  this.iconSet[this.iconSet.length] = 
								  {
									  id: els.item(q).attributes.getNamedItem('id').value,
										location: els.item(q).attributes.getNamedItem('location').value,
										fileName: els.item(q).attributes.getNamedItem('fileName').value,
										extension: els.item(q).attributes.getNamedItem('extension').value,
										className: els.item(q).attributes.getNamedItem('className').value
									};
							}
				    this.attachIcons();
						
						// ok now to continue building menus
						this.unlock();
				  };
				  
				this.attachIcons = function()
				  {
						var d = this.container.getElementsByTagName('div');
						
						for(x=0; x<d.length; x++)
						  {
							  try
								  {
								  	/*
								  	 * note that if there is no 'icon' attribute of the element
								  	 * then this next instruction will fail, and those which
								  	 * follow will not execute
								  	 */
								    var ic = d.item(x).attributes.getNamedItem('icon').value;
								    
								  	var iconInfo = this.getIcon(ic);
								  	
								  	var icon = this.targetDocument.createElement('img');
								  	icon.setAttribute('class',iconInfo.className);
								  	icon.setAttribute('src',iconInfo.path);
								  	icon.setAttribute('id','i' + parseInt(Math.random() * 9999999999).toString());
								  	
								  	d[x].insertBefore(icon, d[x].firstChild);
									}
								catch(e) {}
								
								/*
								 * now attach control icons (usu. + / -) if applicable
								 */
							  try
								  {
								  	/*
								  	 * note that if there is no 'iconState' attribute of the 
								  	 * element then this next instruction will fail, and those 
								  	 * which follow will not execute
								  	 */
							      var st = d.item(x).attributes.getNamedItem('iconState').value;
							      
								  	var iconInfo = this.getIcon(st);
										
										var control = this.targetDocument.createElement('img');
										control.setAttribute('class',iconInfo.className);
										control.setAttribute('src',iconInfo.path);
										control.setAttribute('id','i' + parseInt(Math.random() * 9999999999).toString());
										
										d[x].insertBefore(control, d[x].firstChild);
									}
								catch(e) {}
								
				        /*
				         * this is a hack I'd like some info on.
				         *
				         * remove this absurd statement and IE fails (style defs disappear)
				         * am i missing something? that it works in OPERA and MOZ makes 
				         * me think the code above is standard, correct, etc.
				         */
				        d[x].innerHTML = d[x].innerHTML;
				      }
				  };
		
		  	this.setBranch = function(node,nClass)
		  	  {
		  	  	var elem = this.targetDocument.createElement('div');
		  	  	var nTitle = node.getAttribute('title');
		
		 	  	  elem.setAttribute(this.nodeTITLEprefix,nTitle);
		  	  	elem.setAttribute("class", nClass);
		  	    elem.setAttribute('id',node.getAttribute('id'));
				  	  	    
		  	    /*
		  	     * at this point we are taking an xml node (the original xml data
		  	     * we loaded via xmlhttp), and translating that into a 
		  	     * DOM element, creating a menu element in the browser.  So, the nodes 
		  	     * being passed to this function are xml nodes, and if we want to
		  	     * attach them to their parents, we will need to find the DOM element
		  	     * which was built from the xml node the current node is a child of. We
		  	     * use a lookup table to do that.  this is where we store those pointers.
		  	     *
		  	     * see this.mapToDom()
		  	     */
		  	    this.nodeLookup[node.getAttribute(this.nodeIDprefix)] = elem;
		  	  	  	
		  	  	return(elem);
		  	  };
				  	  	  
		  	this.setBranchControl = function(node,nClass)
		  	  {
		  	  	var elem = this.targetDocument.createElement('div');
		  	  	elem.setAttribute("class","nullClass");
				  	  	  	
		  	  	/*
		  	  	 * note the suffix appended to node id in order
		  	  	 * to create dynamic id for branch control
		  	  	 */
		  	  	elem.setAttribute('id',node.getAttribute('id') + '__control__');
				  	  	  		
		  	    try
		  	  	  {
		  	  	   	if(node.getAttribute('iconState'))
		  	  	  	  {
		  	  	        elem.setAttribute("iconState", node.getAttribute('iconState'));
		  	  	        elem.setAttribute("state", node.getAttribute('state'));
		  	  	      }
		  	  	   	else
		  	  	   		{
		  	  	   			elem.setAttribute("state", "closed");
		  	  	   		}
		  	  	  	    		
		  	  	   	if(node.getAttribute('icon'))
		  	  	   	  {
		  	  	   	    elem.setAttribute("icon", node.getAttribute('icon'));
		  	  	   	  }
		  	  	  } 
		  	    catch(e){}  	
				  	  	    
		  	    return(elem);  	  	
		  	  };
		
		  	/*
		  	 * every node in the original xml doc is sent to this function.
		  	 * function will translate valid nodes (nodes with class attribute
		  	 * of 'r_' || 's_' || 'e_') into a corresponding
		  	 * DOM element.  nodes without any of the above class attributes will
		  	 * be ignored.
		  	 */		
				
		  	this.writeDOMElement = function(node,elParent)
		  	  {
		  	  	/*
		  	  	 * track parent node id for 's_' and 'e_'
		  	  	 * nodes.  'r_' nodes always attach to this.menuRoot
		  	  	 */
		  	  	try
		  	  	  {
		  	  	  	var parentN = this.nodeLookup[elParent.getAttribute(this.nodeIDprefix)];
		  	  	  } 
		  	  	catch(e) {}
		  	  	  	
		  	  	var nClass = node.getAttribute('class');
			
		  	  	switch(nClass)
		  	  	  {
		  	  	  	case this.containerID:
		  	  	  	  var nStyle = node.getAttribute('styleSheet');
		  	  	  	  var nIcons = node.getAttribute('iconSet');
				  	  	  	    	  	  	  
		  	  	  	  // '<div id="' + this.containerID + '" styleSheet="' + nStyle + '" iconSet="' + nIcons + '">'
				  	  	  	  
		  	  	  	  var d = this.targetDocument.createElement('div');
		  	  	  	  d.setAttribute("id", this.containerID);
		  	  	  	  d.setAttribute("styleSheet", nStyle);
		  	  	  	  d.setAttribute("iconSet", nIcons);
				  	  	  	  
		  	  	  	  this.menuRoot = this.container.appendChild(d);
		  	  	  	break;
				  	  	  	
			 	  	  	case 'r_':
			            var d = this.setBranch(node,nClass);
				  	  	  var rE = this.menuRoot.appendChild(d);
				          var dc = this.setBranchControl(node,nClass);
				   	  	  var dt = this.targetDocument.createTextNode(node.getAttribute('title'));
				  	  	  	  
				  	  	  dc.appendChild(dt);
				   	  	  rE.appendChild(dc);
				  	  	break;
				  	  	  	
				  	  	case 's_':
		              var d = this.setBranch(node,nClass);
		  	  	  	  var sE = parentN.appendChild(d);
		              var dc = this.setBranchControl(node,nClass);
		  	  	  	  var dt = this.targetDocument.createTextNode(node.getAttribute('title'));
				  	  	  	  
		  	  	  	  dc.appendChild(dt);
		  	  	  	  sE.appendChild(dc);
				
		   	  	  	break;
				  	  	  	
		  	  	  	case 'e_':
		  	  	  	  /*
		  	  	  	   * this is CDATA, which may have comments, which may have
		  	  	  	   * whitespace, etc. etc. and so may have several children.
		  	  	  	   * We therefore loop through all children, and concatenate
		  	  	  	   */
				  	  	  	  
		  	  	  	  var fData = '';
				  	  
		  	  	  	  for(d=0; d<node.childNodes.length; d++)
		  	  	  	    {
				              fData += node.childNodes[d].data;
		  	  	  	    }
				  	  	  	  
		  	  	  	  var data = fData.replace(/[\t\n\r ]+/g, " ");
				  	  	  	  
				          if(data.charAt(0) == " ")
				            {
				              data = data.substring(1, data.length);
				            }
				          if(data.charAt(data.length - 1) == " ")
				            {
				              data = data.substring(0, data.length - 1);
				            }
				              
		              // '<div class="' + nClass + '">' + data + '</div>'
				  	  	  	  
		  	  	  	  var d = this.targetDocument.createElement('div');
		  	  	  	  d.setAttribute("class", nClass);
				  	  	  	  
				  	  	  /*
				  	  	   * we want every element to have an id
				  	  	   */
				  	  	  var nId = node.getAttribute('id') || ('e_' + (parseInt(Math.random()*999999999)).toString());
				  	  	  	  
			  	  	  	d.setAttribute('id',nId);
				  	  	      
		  	  	  	  try
		  	  	  	    {
		  	  	  	    	if(node.getAttribute('icon'))
		  	  	  	    	  {
		  	  	  	    	    d.setAttribute("icon", node.getAttribute('icon'));
		  	  	  	    	  }
		  	  	  	    } 
		  	  	  	  catch(e){}

				          d.setAttribute("selectable","true");
				          d.setAttribute("draggable","true");
				          d.setAttribute("payloadType","menuElement");
				          
		  	  	  	  var el = parentN.appendChild(d);
				  	  	  	  
		  	  	  	  if(data != '')
		  	  	  	    {
		  	  	  	      el.innerHTML = data;
		  	  	  	    }
				
		  	  	  	break;
				  	  	  	
		  	  	  	default:
		  	  	  	break;
		  	  	  }
		  	  };		
				
				
				this.mapToDom = function(node)
				   {
				     if(node.nodeType == 1)
				       {
					 	  	/*
					 	  	 * give nodes an reference, so that we find it
					 	  	 * and attach children to it later.
					 	  	 * see this.writeDOMElement()
					 	  	 * see this.setBranch()
					 	  	 */
					 	  	node.setAttribute(this.nodeIDprefix,++this.counter);    
						  	  	  
					       /*
					        * build out the dom node
					        */
					     	this.writeDOMElement(node,node.parentNode);
								  
						    /*
						     * now handle the chil'un
						     */
							  if(node.hasChildNodes()) 
							    {
						        var cN = node.childNodes;
								     
									  for(var i=0; i<cN.length; i++)
										  {
										   	if(cN[i].nodeType == 1)
										   	  {
										        this.mapToDom(cN[i]);
										      }
									    }
							    }
				  		}
				  };
				
				this.translateToDomTree = function(nde)
				  {
				    this.counter = 0; // see this.mapToDom
				  	this.menuRoot = null; // init on creation of menu containerID
				  	this.nodeLookup = new Array();
			  	
			  	  /*
			  	   * write the DOM representation
			  	   */
				    this.mapToDom(nde);
				
				    /*
				     * run clicks
				     */
				    this.replayClicks();
				  };
				  
				this.clickRefExists = function(el)
				  {
				    for(c=0; c < this.clicks.length; c++)
				      {
				  	    if(this.clicks[c] == el.id)
				  	  	  {
				  	  	  	return(c);
				  	  	  }
				  	  }
				  	return(false);
				  };
				
				this.recordClick = function(el)
				  {
				  	if(this.replaying == false)
				  	  {
				  	  	/*
				  	  	 * obviously, a set of actions may include
				  	  	 * an open followed by a close. we don't want
				  	  	 * to replay both.  This duality allows us
				  	  	 * to assume that if a second action is performed
				  	  	 * on an element, we can simply delete that
				  	  	 * element from the click list: + & - == 0
				  	  	 */

				        var cR = this.clickRefExists(el);
				  	  	if(cR !== false) 
				  	  	  { 
				  	  	  	this.clicks.splice(cR,1);
				  	  	  	
				  	  	  	/*
				  	  	  	 * since we've changed the clicks stack, we 
				  	  	  	 * need to update the cookies.  this
				  	  	  	 * involves erasing all existing cookies and 
				  	  	  	 * rebuilding them (which is the most bullet proof
				  	  	  	 * way to ensure integrity). so we use an arbitrarily high
				  	  	  	 * number to find possible cookies (most
				  	  	  	 * browsers won't allow more than 30)
				  	  	  	 */
						  	    for(cc=0; cc < 50; cc++)
						  	      {
						  	      	var cRef = this.containerID + (cc).toString();
						  	      	var cook = $.Cookies.read(cRef);
						  	      	if(cook)
						  	      	  {
						  	      	  	$.Cookies.erase(cRef);
						  	      	  }
						  	      }
						  	      
						  	    for(p in this.clicks)
						  	      {
						  	      	$.Cookies.create(this.containerID + (p).toString(),this.clicks[p]);
						  	      }
				  	  	  }
				        else
				          {
				  	  	    this.clicks.push(el.id);
				  	  	    $.Cookies.create(this.containerID + (this.clicks.length-1).toString(),el.id);
				  	  	  }				  	  	  
				  	  }
				  };
				  
				this.replayClicks = function()
				  { 
				  	/*
				  	 * while this is running, tell .recordClick
				  	 * to stop recording
				  	 */
				  	this.replaying = true; 
				  	
				  	/*
				  	 * if no clicks stored, check if there is
				  	 * a cookie map to reflect
				  	 */
				  	var cL = this.clicks.length;
				  	if(cL == 0)
				  	  {
				  	  	/*
				  	  	 * .clicks is empty; try to find cookies.
				  	  	 * Arbitrarily long loop to encompass
				  	  	 * all possible clicks; most browsers will
				  	  	 * not let you have more than 30 or so cookies
				  	  	 * per domain -- and it is doubtful that the
				  	  	 * menu will have that many folders open
				  	  	 */
				  	    for(cc=0; cc < 50; cc++)
				  	      {
				  	      	var cookN = this.containerID + (cc).toString();
				  	      	
				  	      	var cook = $.Cookies.read(cookN);
				  	      	if(cook)
				  	      	  {
				  	      	  	/*
				  	      	  	 * as cookies can be around for a while, they may 
				  	      	  	 * lose their reference (stored id may no longer exist).
				  	      	  	 * Check for existence of element, garbage collect if necessary.
				  	      	  	 */

								  	  	if(document.getElementById(cook)) 
								  	  	  {
								  	  	  	/*
								  	  	  	 * ok; push onto click stack
								  	  	  	 */
						  	      	  	this.clicks.push(cook);
								  	      }
								  	    else
								  	    	{
  							  	    		/* 
								  	    		 * ref is gone; lose cookie
								  	    		 */
								  	    		$.Cookies.erase(cookN);
								  	    	}
								  	  }
				          }
				      }

				  	for(a=0; a < this.clicks.length; a++)
				  	  {
				  	  	/*
				  	  	 * the original menu xml doc will have every folder set
				  	  	 * to 'closed' by default.  When we reload that menu xml document,
				  	  	 * it of course is unaware of what is in the clicks stack; it will
				  	  	 * have every folder 'closed'. so when we are replaying clicks 
				  	  	 * (ie. when we are opening folders) we need to change that to 'open'.
				  	  	 *
				  	  	 * NOTE that if there is no iconState value, of course we don't provide
				  	  	 * an open/close icon...
				  	  	 */
				  	  	
				  	  	var tEl = this.targetDocument.getElementById(this.clicks[a]);
				  	  	if(tEl.getAttribute('iconState'))
				  	  	  {
				  	  	    tEl.setAttribute('iconState','open');
				  	  	  }
				  	  	this.activate(tEl,1);
				  	  	
				  	  	this.clearSelectedElement(tEl);
				  	  }
				  	this.replaying = false;
				  };
			};
  };






