function swipedetect(el, callback){

	var touchsurface = el,
	swipedir,
	startX,
	startY,
	distX,
	distY,
	threshold = 150, //required min distance traveled to be considered swipe
	restraint = 100, // maximum distance allowed at the same time in perpendicular direction
	allowedTime = 400, // maximum time allowed to travel that distance
	elapsedTime,
	startTime,
	handleswipe = callback || function(swipedir){};

	touchsurface.addEventListener('touchstart', function(e){
		var touchobj = e.changedTouches[0]
			swipedir = 'none'
			dist = 0
			startX = touchobj.pageX
			startY = touchobj.pageY
			startTime = new Date().getTime(); // record time when finger first makes contact with surface
		e.preventDefault();
	}, false);

	touchsurface.addEventListener('touchmove', function(e){
		e.preventDefault(); // prevent scrolling when inside DIV
		var touchobj = e.changedTouches[0]
		distX = touchobj.pageX - startX;


		
		$('header h1').css({'transform':'translateX('+ distX/20 +'px)'});
		$('.add').css({'transform':'translateX('+ distX/20 +'px)', 'transition':'none'});
		$('.refresh').css({'transform':'translateX('+ distX/40 +'px)', 'transition':'none'});
		if($('body').hasClass('bodyPreview')){
			if (distX > 0) {
				$('.prevList').css({'transform':'translateX('+ distX/2 +'px)'});
			}
			else{
				$('.prevList').css({'transform':'translateX('+ distX/15 +'px)'});
			}
		}
		else{
			if (distX > 0) {
				$('.list').css({'transform':'translateX('+ distX/15 +'px)'});
			}
			else{
				$('.list').css({'transform':'translateX('+ distX/2 +'px)'});
				$('.calcul').css({'height': 80+Math.min(0,distX) +'px', 'transition':'none'});
			}
		}
		
	}, false);

	touchsurface.addEventListener('touchend', function(e){
		var touchobj = e.changedTouches[0]
			distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
			distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
			elapsedTime = new Date().getTime() - startTime; // get time elapsed
		if (Math.abs(distX)/elapsedTime >= threshold/allowedTime || Math.abs(distX) > window.innerWidth*0.6){ // first condition for awipe met, compare speeds
			if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
				swipedir = (distX < 0)? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
			}
		}
		handleswipe(swipedir);
		e.preventDefault();
	}, false);
}

function SwipeBtPanel(el, callback){

	var touchsurface = el,
	startY,
	distY,
	threshold = 150, //required min distance traveled to be considered swipe
	allowedTime = 400, // maximum time allowed to travel that distance
	elapsedTime,
	startTime,
	handleswipe = callback || function(swipedir){};

	touchsurface.addEventListener('touchstart', function(e){
		touchobj = e.changedTouches[0];
		startY = touchobj.pageY;
		startTime = new Date().getTime(); // record time when finger first makes contact with surface
		e.preventDefault();
		$('.calcul').css({'transition': 'none'});
	}, false);

	touchsurface.addEventListener('touchmove', function(e){
		e.preventDefault(); // prevent scrolling when inside DIV
		touchobj = e.changedTouches[0];
		distY = touchobj.pageY - startY;

		$('.calcul').css({'height': Math.min(80+Math.max(0, -distY), $(window).height()+20) +'px'});
		
	}, false);

	touchsurface.addEventListener('touchend', function(e){
		touchobj = e.changedTouches[0]; // get horizontal dist traveled by finger while in contact with surface
		distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
		elapsedTime = new Date().getTime() - startTime; // get time elapsed
		if (-distY/elapsedTime >= threshold/allowedTime || 80+Math.abs(distY) > $(window).height()/2 || Math.abs(distY) < 3){ // first condition for awipe met, compare speeds	
			handleswipe('top');
		}
		else{
			handleswipe('bottom');
		}
	
		e.preventDefault();
	}, false);
}

function SwipeBackPanel(el, callback){

	var touchsurface = el,
	startY,
	distY,
	threshold = 150, //required min distance traveled to be considered swipe
	allowedTime = 400, // maximum time allowed to travel that distance
	elapsedTime,
	startTime,
	handleswipe = callback || function(swipedir){};

	touchsurface.addEventListener('touchstart', function(e){
		touchobj = e.changedTouches[0];
		startY = touchobj.pageY;
		startTime = new Date().getTime(); // record time when finger first makes contact with surface
		e.preventDefault();
		$('.calcul').css({'transition': 'none'});
	}, false);

	touchsurface.addEventListener('touchmove', function(e){
		e.preventDefault(); // prevent scrolling when inside DIV
		touchobj = e.changedTouches[0];
		distY = touchobj.pageY - startY;

		$('.calcul').css({'height': Math.min(80+Math.max(0, $(window).height()+20-distY), $(window).height()+20) +'px'});
		
	}, false);

	touchsurface.addEventListener('touchend', function(e){
		touchobj = e.changedTouches[0]; // get horizontal dist traveled by finger while in contact with surface
		distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
		elapsedTime = new Date().getTime() - startTime; // get time elapsed
		if (distY/elapsedTime >= threshold/allowedTime || Math.abs(distY) > $(window).height()/1.5){ // first condition for awipe met, compare speeds	
			handleswipe('bottom');
		}
		else{
			handleswipe('top');
		}
	
		e.preventDefault();
	}, false);
}