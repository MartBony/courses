const easeSortir = "cubic-bezier(0.7 , 0 , 1 , 0.5)";

class Animations {
	static animateScaleIn(node){
		const anim = node.animate([
			{ transform: "scale(1.05)" },
			{ transform: "scale(1)" }
		],{
			duration: 500,
			fill: 'forwards',
			easing: 'cubic-bezier(0.1, 0.9, 0, 1)'
		});
		
		anim.finished.then(() => {
			anim.commitStyles();
			anim.cancel();
		});
		return node;
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
		
		anim.finished.then(() => {
			anim.commitStyles();
			anim.cancel();
		});
		return node;
	}
	static async removeItem(el){
		const anim = el.animate([
			{ transform: "scale(1)", opacity: 1 },
			{ transform: "scale(0.7)", opacity: 0 }
		],{
			duration: 100,
			fill: 'forwards',
			easing: easeSortir
		});
		
		await anim.finished
		anim.commitStyles();
		anim.cancel();
		
		return;
	}
}


export default Animations;