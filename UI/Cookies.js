function Cookies()
  {
    this.Cookies = function()
      {
      };
    
    this.create = function(name,value,days) 
      {
        if(days) 
          {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
          } 
        else 
          {
            var expires = "";
          }
        
        try
          {
            document.cookie = name+"="+value+expires+"; path=/";
            return(true);
          }
        catch(e)
          {
            return(false);
          }
      };
      
    this.update = function(name,value,days) 
      {
      	/*
      	 * bridge function to allow more accurate
      	 * description of script flow
      	 */
      	var n = name || null;
      	var v = value || null;
      	var d = days || null;
      	
      	return(this.create(n,v,d));
      };
      
    this.read = function(name) 
      {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) 
          {
            var c = ca[i];
            while(c.charAt(0)==' ')
              {
                c = c.substring(1,c.length);
              }
            
            if(c.indexOf(nameEQ) == 0) 
              {
                return(c.substring(nameEQ.length,c.length));
              }
          }
        return(false);
      };
      
     this.erase = function(name) 
       {
         return(this.create(name,"",-1));
       };
  };