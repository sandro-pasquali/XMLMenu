
/*
 * requires XMLHTTP.js
 * requires $Error.js
 */
function Menu()
  {
		this.Menu = function(spd) 
		  {
			  // Animation of the menu runs on a cycle(speed = spd), with each show/hide instruction 
				// placed on a stack.  Every tick of this clock causes one instruction to be executed.
			  this.startClock(spd || 25);
			  
				// Flagged when the callback function for load() has executed.
				// initialized to true so that the first load call is immediately accepted
				this.menuLoaded = true;
				
				// The id of the link anchor which contains this menu's style sheet
				// This link is dynamically created whenever a stylesheet load is tried.
				this.styleID = 'menuStyle';
				
				// This will contain a reference to the menu tree upon successful menu load
				this.container = null;
				
				// Set to the id of the root element of this menu's XML representation
				this.containerID = 'menuContainer';
				
				// Set to the maximum number of milliseconds any queued load 
				// requests will wait before failing
				this.timeout = 20000;
				
				// last clicked item
				this.lastSelectedItem = new Object();
				this.lastSelectedItem.style = true;
				
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
			}; 
		
		this.startClock = function(spd)
		  {
			  this.instructionStack = new Array();
			  this.timer = setInterval('$.cycle()',spd);
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
			
		this.cycle = function()
		  {
			  try
				  {
				    // fifo
			      var ob = this.instructionStack.shift();
		        this.toggleBranchState(ob.ob);
					}
				catch(e) {;} 
			};
			
		this.addInstruction = function(el)
		  {
			  this.instructionStack.push({ob: el});
			};	
			
		this.activate = function(el,state,recur)
		  {
				/* when passed an element reference, will recursively
				 * seek children and open them.
				 */ 
			  if(el)
			    {
		    	  if(el.style && !recur)
			   	    {
		    	   	  /*
			   	   	   * reset selection when last selected branch
			   	   	   * element loses its focus
			   	   	   */
		            this.lastSelectedItem.className = '';
		        
		            this.lastSelectedItem = el;
		
		            /*
		             * stylize current selection
		             */
		            el.className = 'selectedBranchElement';
			   	    }
			   	  
				    /*
				     * Change open/closed icon. Will only fire on originally 
				     * clicked control item (which sends the state argument).
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
									  
									  if(iconInfo)
									    {
									      el.childNodes.item(0).src = iconInfo.path;
									      el.setAttribute("iconState",(st == 'open') ? 'closed' : 'open');
									      el.setAttribute("state",(st == 'open') ? 'closed' : 'open');
									    }
								  }
							  catch(e) {}
						  }
						 
			      tempEl=el.nextSibling;
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
		
		this.load = function(dataFile,container,waitTime)
			{
				/*
				 * loads the menu's data from dataFile
				 * NOTE: assumes dataFile is an XML file.
				 * NOTE: container is a string representing an element id
				 *
				 * Since we cannot load another menu until previous loads are complete,
				 * load() will wait until a previous load is finished.
				 */
			  var wt = waitTime || 0;
			  if(this.menuLoaded)
				  {
				    // Announce that the menu is loading
				    this.menuLoaded = false; 
				
			      this.container = document.getElementById(container) || document.body;
		        // Since the menu will arrive unformatted, lets hide it for now
		        this.hideMenu();
				
		        this.connection = new XMLHTTP();
		        this.connection.loadXML(dataFile,this.buildMenus);
					}
				else if(wt < this.timeout)
				  {
					  setTimeout('this.load("' + dataFile + '","' + container + '",' + (wt+25) + ')',25);
					}
				else // timeout
				  {
					  $Error.alert(new Object(),'The menu has not loaded properly and may behave strangely.');
					}		
		  };
			
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

				this.XML = re;
				
				// write the DOM representation of the menu
				this.translateToDomTree(this.XML);
		
				// Make sure the menu insertion was successful and can be referenced 
			  try
				  {
					  /* containerID is the menu's containing xml tag (the id of the root
						 * element of this menu's XML representation.  Icon set and
						 * style sheet properties may be stored here.
						 */
				    var doc = document.getElementById(this.containerID);
					}
				catch(e)
				  {
					  $Error.alert(e,'The menu has not loaded properly and may behave strangely, or not at all.');
						return;
					}
						
				// Announce that the menu has loaded properly
				this.menuLoaded = true; 
				
				// First, see if there is a stylesheet to apply 
			  try
				  {
				    // load the style sheet definition, if any
				    this.loadStyleSheet(doc.attributes.getNamedItem('styleSheet').value);
					}
				catch(e) { ; } // no default style sheet
				
				// Try for a default icon set
				try
				  {
				    // load the icon set definition, if any
				    this.loadIconSet(doc.attributes.getNamedItem('iconSet').value);
					}
				catch(e) { ; } // no default iconset for menu
				
				// show the menu
		    this.showMenu();
		  };
			
		this.loadStyleSheet = function(file)
		  {
				try
				  {
					  var style = document.getElementById(this.styleID);
						style.href = file;
					}
				catch(e)
				  {
		        // style object doesn't exist.  create it.
						var head = document.createElement("link");
		        head.setAttribute("id",this.styleID);
		        head.setAttribute("rel","stylesheet");
		        head.setAttribute("type","text/css");
		        head.setAttribute("href",file);
		        document.getElementsByTagName("head").item(0).appendChild(head);
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
			  if(this.menuLoaded)
				  {
					  // hold further menu actions until icon set is loaded
					  this.menuLoaded = false;
						
		        this.connection = new XMLHTTP();
		        this.connection.loadXML(file,this.parseIconSet);
					}
				else if(wt < this.timeout)
				  {
					  setTimeout('this.loadIconSet("' + file + '",' + (wt+25) + ')',25);
					}
				else // timeout
				  {
					  $Error.alert(new Object(),'The menu has not loaded properly and may behave strangely.');
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
			  var els = re.getElementsByTagName('icon');
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
				this.menuLoaded = true;
		  };
		  
		this.setParentHandlers = function(el)
		  {
			  /*
			   * check to see if we're on a subElement or rootElement. 
			   * if so, give it the click handlers to 
			   * allow opening/closing branches
			   */
			  if((el.className == 'rootElement') || (el.className == 'subElement'))
			    {
			   	  /*
			   	   * moz (surprisingly) sees childNodes.firstChild as nodeType 3, 
			   	   * while IE sees it (as expected) as nodeType 1.
			   	   * so we handle the referencing slightly differently
			   	   */
			   	  var theRef = (el.firstChild.nodeType == 3) 
			   	             ? el.childNodes.item(1) 
			   	             : el.childNodes.item(0);
		
			      theRef.onclick = function() 
			        { 
			        	 MenuRef.activate(this); 
			       	  MenuRef.recordClick(this);
			        };
			    }  	
		  };
		
		this.attachIcons = function()
		  {
				var d = this.container.getElementsByTagName('div');
				
				for(x=0; x<d.length; x++)
				  {
					  try
						  {
						    var ic = d.item(x).attributes.getNamedItem('icon').value;
						  	var iconInfo = this.getIcon(ic);
						  	
						  	var icon = document.createElement('img');
						  	icon.setAttribute('class',iconInfo.className);
						  	icon.setAttribute('src',iconInfo.path);
						  	
						  	d[x].insertBefore(icon, d[x].firstChild);
							}
						catch(e) {}
						
					  try
						  {
					      var st = d.item(x).attributes.getNamedItem('iconState').value;
						  	var iconInfo = this.getIcon(st);
								
								var control = document.createElement('img');
								control.setAttribute('class',iconInfo.className);
								control.setAttribute('src',iconInfo.path);
								
								d[x].insertBefore(control, d[x].firstChild);
							}
						catch(e) {}
						
		        /*
		         * this is a hack I'd like some info on.
		         *
		         * remove this absurd statement and IE fails (style defs disappear)
		         * is it just IE? that it works in OPERA and MOZ makes 
		         * me think my code (above) is standard, correct, etc.
		         */
		        d[x].innerHTML = d[x].innerHTML;
		        
		        // add onclick event to parent nodes
		        this.setParentHandlers(d[x]);
		      }
		  };

  	this.setBranch = function(node,nClass)
  	  {
  	  	var elem = document.createElement('div');
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
  	  	var elem = document.createElement('div');
  	  	elem.setAttribute("class",nClass + "Control");
		  	  	  	
  	  	/*
  	  	 * note the suffix appended to node id in order
  	  	 * to create dynamic id for branch control
  	  	 */
  	  	elem.setAttribute('id',node.getAttribute('id') + '_control');
		  	  	  	
  	  	//elem.onclick = 'menuActivate(this)';
		  	  	  		
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
  	 * of 'rootElement' || 'subElement' || 'element') into a corresponding
  	 * DOM element.  nodes without any of the above class attributes will
  	 * be ignored.
  	 */		
		
  	this.writeDOMElement = function(node,elParent)
  	  {
  	  	/*
  	  	 * track parent node id for 'subElement' and 'element'
  	  	 * nodes.  'rootElement' nodes always attach to this.menuRoot
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
		  	  	  	  
  	  	  	  var d = document.createElement('div');
  	  	  	  d.setAttribute("id", this.containerID);
  	  	  	  d.setAttribute("styleSheet", nStyle);
  	  	  	  d.setAttribute("iconSet", nIcons);
		  	  	  	  
  	  	  	  this.menuRoot = this.container.appendChild(d);
  	  	  	break;
		  	  	  	
	 	  	  	case 'rootElement':
	            var d = this.setBranch(node,nClass);
		  	  	  var rE = this.menuRoot.appendChild(d);
		          var dc = this.setBranchControl(node,nClass);
		   	  	  var dt = document.createTextNode(node.getAttribute('title'));
		  	  	  	  
		  	  	  dc.appendChild(dt);
		   	  	  rE.appendChild(dc);
		  	  	break;
		  	  	  	
		  	  	case 'subElement':
              var d = this.setBranch(node,nClass);
  	  	  	  var sE = parentN.appendChild(d);
              var dc = this.setBranchControl(node,nClass);
  	  	  	  var dt = document.createTextNode(node.getAttribute('title'));
		  	  	  	  
  	  	  	  dc.appendChild(dt);
  	  	  	  sE.appendChild(dc);
		
   	  	  	break;
		  	  	  	
  	  	  	case 'element':
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
		  	  	  	  
  	  	  	  var d = document.createElement('div');
  	  	  	  d.setAttribute("class", nClass);
		  	  	  	  
	  	  	  	d.setAttribute('id',node.getAttribute('id'));
		  	  	      
  	  	  	  try
  	  	  	    {
  	  	  	    	if(node.getAttribute('icon'))
  	  	  	    	  {
  	  	  	    	    d.setAttribute("icon", node.getAttribute('icon'));
  	  	  	    	  }
  	  	  	    } 
  	  	  	  catch(e){}
		
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
			 	  	 * ann attach children to it later.
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
		
		    /*
		     * uncomment to see the tree as rendered in the DOM
		     */
		    this.showMenuSchema.write(this.containerID);
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
		  	  	  }
		        else
		          {
		  	  	    this.clicks.push(el.id);
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
		
		  	for(a=0; a < this.clicks.length; a++)
		  	  {
		  	  	this.activate(document.getElementById(this.clicks[a]));
		  	  }
		  	  
		  	this.replaying = false;  
		  };
		  
		
		
		
		
		
		
		
		
		
		
		
		
		
		this.showMenuSchema = 
		  {
		  	attributeList: new Array
		  	  (
		  	    'class',
		  	    'id',
		  	    'iconState',
		  	    'state',
		  	    'icon',
		  	    this.nodeTITLEprefix,
		  	    'onclick'
		  	  ),
		  	  
		    showChildren: function(el, ind)
		      {
		      	var node = '';
		      	var ret = '';
		        for(var c = 0;c < el.childNodes.length;++c)
		          {
		            node = el.childNodes[c];
		            if(node.nodeType == 1)
		              {
		                ret += ind+this.nodeStart(node);
		                ret += this.showChildren(node, (ind+'\t'));
		                ret += this.nodeEnd(node, ind);
		              }
		          }
		        
		        if(ret == '')
		          {
		          	ret = ind + '<a style="background-color: yellow; padding: 2px;">' + el.innerHTML + '</a>\n';
		          }  
		          
		        return(ret);
		      },
		
		    nodeStart: function(el)
		      { 
		      	var ret = '';
			      ret += '&lt;' + el.nodeName;
			      ret += ((el.type)?(' type=\"' + el.type+'\"'):'');
			      ret += this.getAttributeString(el);
		        ret += (el.childNodes.length ? '&gt\n' : ' /&gt\n');
		        
		        return(ret);
		      },
		
		    nodeEnd: function(el, ind)
		      {
		        return (el.childNodes.length ? (ind+'&lt;/' + el.nodeName +'&gt\n') : '');
		      },
		  	
		    getAttributeString: function(el)
				  {
				  	atts = ' ';
				  	var aL = this.attributeList;
				  	
				  	for(a=0; a < aL.length; a++)
				  	  {
						  	if(el.getAttribute(aL[a]))
						  	  {
						  	    atts += aL[a] +'="' + el.getAttribute(aL[a]) + '" ';
						  	  }
				  	  }
		
				  	return(atts);
				  },
		  	
		  	write: function(cID)
		  	  {
				    var div = document.getElementById(cID);
				    
				    var sc = '<pre>';
				    sc += this.nodeStart(div);
				    sc += this.showChildren(div, '\t');
				    sc += this.nodeEnd(div, '');
				    sc += '<\/pre>';
				    
				    var schema = document.createElement('div');
				    schema.setAttribute('class','schema');
				    
				    document.body.appendChild(schema).innerHTML = sc;
		      }
		  };
  };






