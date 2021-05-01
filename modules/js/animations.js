const easeSortir = "cubic-bezier(0.7 , 0 , 1 , 0.5)",
ease =  "cubic-bezier(0.8 , 0 , 0.2 , 1)";

class Animations {
	static ease = {
		out: "cubic-bezier(0.7 , 0 , 1 , 0.5)",
		move: "cubic-bezier(0.8 , 0 , 0.2 , 1)",
		in: "cubic-bezier(0.1 , 0.9 , 0.2 , 1)"
	}

	static animateScaleIn(node){
		const anim = node.animate([
			{ transform: "scale(1.05)" },
			{ transform: "scale(1)" }
		],{
			duration: 500,
			fill: 'forwards',
			easing: 'cubic-bezier(0.1, 0.9, 0, 1)'
		});
		
		anim.addEventListener('finish', () => {
			if("commitStyles" in anim) anim.commitStyles();
			anim.cancel();
		});
	}
	static animateSlideIn(node){
		const anim = node.animate([
			{ transform: "scale(0)" },
			{ transform: "scale(1)" }
		],{
			duration: 500,
			fill: 'forwards',
			easing: 'cubic-bezier(0.1, 0.9, 0, 1)'
		});
		
		anim.addEventListener('finish', () => {
			if("commitStyles" in anim) anim.commitStyles();
			anim.cancel();
		});
	}
	static async removeItem(el){
		await Animations.createAnimation(el, [
				{ transform: "scale(1)", opacity: 1 },
				{ transform: "scale(0.7)", opacity: 0.1 }
			],{
				duration: 100,
				fill: 'forwards',
				easing: easeSortir
			});
		return null;
	}

	static createAnimation(el, animationArray, animationData){
		return new Promise((resolve, reject) => {
			const anim = el.animate(animationArray, animationData);
			
			anim.addEventListener('finish', () => {
				try{
					if("commitStyles" in anim) anim.commitStyles();
				} catch(err) {
					console.log("Animation error", err);
				}
				anim.cancel();
				resolve(el);
			});

		})
	}
}


export default Animations;