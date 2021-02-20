export default class Touch{
	static handleFormOpenning(origin, targetId, action, refPointer = {x: 0, y: 0}){
		// const ball = document.getElementById("ball");
		const transitionner = document.getElementById("modernTransitionner"),
			target =  document.getElementById(targetId);
		let w = {x: null, y: null},
		position = {x: null, y: null, width: null},
		trajectory = [[origin, Date.now() / 1000]],
		speed = null,
		animKey = null,
		acceleration = {x: null, y: null},
		k = 70,
		mass = 0.7,
		f = 10,
		finalPosition = () => {
			let width = 300;
			return {
				x: w.x/2,
				y: 100,
				width: 300
			}
		};

		function resize() {
			w = {x: window.innerWidth, y: window.innerHeight};
		}

		function getState(){
			return 1-(finalPosition().y - position.y)/(finalPosition().y - origin.y);
		}

		function setPos(x = origin.x, y = origin.y, width = origin.width){
			width = Math.min(finalPosition().width, Math.max(origin.width, width))
			position = {x, y, width};
			transitionner.style.setProperty("--px", `${x - width/2}px`);
			transitionner.style.setProperty("--py", `${y - 10}px`);
			transitionner.style.setProperty("--titlewidth", `${width}px`);

			target.style.setProperty("--px", `${x - width/2}px`);
			target.style.setProperty("--py", `${y - 10}px`);
		}

		function move(e){
			setPos(e.clientX+refPointer.x, e.clientY+refPointer.y, getState()*finalPosition().width);
			trajectory.push([{x: e.clientX+refPointer.x, y: e.clientY+refPointer.y}, Date.now() / 1000]);
			if(trajectory.length > 40) auto()
		}

		function auto(e) {
			let precision = 5;
			if(trajectory.length > precision+1){
				speed = {
					x: (position.x - trajectory[trajectory.length - 1 - precision][0].x) / (trajectory[trajectory.length - 1][1] - trajectory[trajectory.length - 1 - precision][1]) || 0,
					y: (position.y - trajectory[trajectory.length - 1 - precision][0].y) / (trajectory[trajectory.length - 1][1] - trajectory[trajectory.length - 1 - precision][1]) || 0
				}
			} else {
				speed = {
					x: 0,
					y: 0
				}
			}
			
			removeEventListener("pointermove", move);
			removeEventListener("pointerup", auto);
			animKey = window.requestAnimationFrame(animation);
		}

		function animation(){
			let now = Date.now() / 1000,
			timeInterval = (now - trajectory[trajectory.length - 1][1]),
			force = getForceToOrigin(position.x - finalPosition().x, position.y - finalPosition().y),
			frottements = {x: -f*speed.x, y: -f*speed.y};

			acceleration = {x: force.x/mass, y: force.y/mass};
			speed.x += acceleration.x*timeInterval + frottements.x*timeInterval;
			speed.y += acceleration.y*timeInterval + frottements.y*timeInterval;
			setPos((position.x + speed.x * timeInterval), (position.y + speed.y * timeInterval), getState()*finalPosition().width);
			trajectory.push([{x: (position.x + speed.x * timeInterval), y: (position.y + speed.y * timeInterval)}, now]);


			if((Math.sqrt(speed.x**2 + speed.y**2) < 1 && Math.sqrt(acceleration.x**2 + acceleration.y**2) < 1) || !document.getElementById("modernForms").classList.contains("opened")){ 
				window.cancelAnimationFrame(animKey);
				removeEventListener("resize", resize);

				transitionner.style.setProperty("--px", "");
				transitionner.style.setProperty("--py", "");
				transitionner.style.setProperty("--titlewidth", "");
	
				target.style.setProperty("--px", "");
				target.style.setProperty("--py", "");


				return;
			}

			if(
				document.getElementById("modernForms").classList.contains("opened") 
				&& !document.getElementById("modernForms").classList.contains(action) 
				&& Math.sqrt(speed.x**2 + speed.y**2) < 700 
				&& Math.sqrt(acceleration.x**2 + acceleration.y**2) < 700
				
			) {
				document.getElementById("modernForms").classList.add(action);
				document.querySelector(`#${targetId} input`).focus();
			}

			animKey = window.requestAnimationFrame(animation);
		}

		function getForceToOrigin(x, y, type = "ressort"){
			switch(type){
				case "ressort":
					return {
						x: -k*(x),
						y: -k*(y)
					}
				default:
					return {x: 0, y: 0}
			}
		}


		resize();
		setPos();
		


		addEventListener("resize", resize);
		addEventListener("pointermove", move);
		addEventListener("pointerup", auto);
	}
}