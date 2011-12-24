function rndEl(x){return x[Math.floor(Math.random()*x.length)];}

	function isArray(obj){
		return (obj instanceof Array);
 		if(typeof obj=='object'){
  		var test = obj.constructor.toString().match(/array/i); 
  		return (test != null);
  		}
 		return false;
	}
var scrambler = {
	scramblers: [],
	current: undefined,	

	add: function(s) {
		scrambler.scramblers.push(s);
	},

	set: function(index) {
		scrambler.current = scrambler.scramblers[index][1];
	},

	generic: function(turns, suffixes, length) {
 return function(){
var donemoves=[];
 var lastaxis;
 var i,j,k;
  var s="";
  lastaxis=-1;
  for(j=0;j<length;j++){
   var done=0;
   do{
    var first=Math.floor(Math.random()*turns.length);
    var second=Math.floor(Math.random()*turns[first].length);
    if(first!=lastaxis||donemoves[second]==0){
     if(first==lastaxis){
      donemoves[second]=1;
      if(isArray(turns[first][second])){
       s+=rndEl(turns[first][second])+rndEl(suffixes)+" ";
      }else{
       s+=turns[first][second]+rndEl(suffixes)+" ";
      }
     }else{
      for(k=0;k<turns[first].length;k++){donemoves[k]=0;}
      lastaxis=first;
      donemoves[second]=1;
      if(isArray(turns[first][second])){
       s+=rndEl(turns[first][second])+rndEl(suffixes)+" ";
      }else{
       s+=turns[first][second]+rndEl(suffixes)+" ";
      }
     }
     done=1;
    }
   }while(done==0);
  }
  return s;

	};
}
};
