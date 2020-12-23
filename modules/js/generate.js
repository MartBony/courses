export default class Generate{
	static course(app, id, nom){
		let button = document.createElement('button'),
			i = document.createElement('i');
		button.classList.add("course");
		button.setAttribute("dbIndex", id);
		button.innerHTML = nom;
		i.className = "ms-Icon ms-Icon--Delete";
		i.setAttribute("aria-hidden","true");
		button.appendChild(i);

		return button;
	}
	static groupe(app, id, nom, membres){
		let button = document.createElement('button'),
			h4 = document.createElement('h4'),
			ul = document.createElement('ul'),
			remv = document.createElement('i'),
			invite = document.createElement('i'),
			childrens = [h4, ul, invite, remv];

		button.className = "groupe";
		button.setAttribute("key", id);
		h4.innerHTML = nom;
		remv.className = "ms-Icon ms-Icon--Leave";
		remv.setAttribute("aria-hidden","true");
		invite.className = "ms-Icon ms-Icon--AddFriend";
		invite.setAttribute("aria-hidden","true");
		membres.forEach(membre => {
			let li = document.createElement('li');
			li.innerHTML = membre;
			ul.appendChild(li);
		});

		childrens.forEach(child => {
			button.appendChild(child);
		});

		$(button).on('click', e => {
			if(e.target.tagName !== "I"){
				document.querySelector('.loader').classList.add('opened');
				if(!app.pending){
					app.pull("open", id);
				} else {
					let loop = setInterval(() => {
						if(!app.pending){
							document.querySelector('.loader').classList.add('opened');
							app.pull("open", id);
							clearInterval(loop);
						}
					}, 1000);
				}
			}
		});

		return button;
	}
	static article(app, id, titre, couleur, prix, animation = 'animateSlideIn', addClass = ''){
		let li = document.createElement('li'),
			div = document.createElement('div'),
			h2 = document.createElement('h2'),
			h3 = document.createElement('h3'),
			childrens = [div];
		li.className = `article ${animation} ${addClass}`;
		li.style.background = `hsl(${couleur}, var(--previewS), var(--previewL))`;
		li.setAttribute("idItem", id);
		h2.innerHTML = titre;
		h3.innerHTML = (Number(prix)*(1+app.course.taxes)).toFixed(2) + app.params.currency;
		div.appendChild(h2);
		div.appendChild(h3);
		childrens.forEach(child => {
			li.appendChild(child);
		});
		
		return li;
	}
	static preview(app, id, titre, couleur, animation = 'animateSlideIn', addClass = ''){
		let li = document.createElement('li'),
			div = document.createElement('div'),
			h2 = document.createElement('h2'),
			childrens = [div];
		li.className = `preview ${animation} ${addClass}`;
		li.style.background = `hsl(${couleur}, var(--previewS), var(--previewL))`;
		li.setAttribute("idItem", id);
		h2.innerHTML = titre;
		div.appendChild(h2)
		childrens.forEach(child => {
			li.appendChild(child);
		});

		return li;
	
	}
	static activate(){
		let div = document.createElement("div"),
		i = document.createElement('i'),
		h4 = document.createElement('h4'),
		h5 = document.createElement('h5'),
		p = document.createElement('p'),
		button = document.createElement('button');

		div.classList.add("promptActivation");
		i.className = "ms-Icon ms-Icon--ShoppingCart";
		i.setAttribute("aria-hidden","true");
		h4.appendChild(i);
		h4.innerHTML += "Vous êtes prêts à faire vos achats?";
		h5.innerHTML = "Si vous êtes satisfaits de votre liste de course, commencez vos achats ci dessous.";
		p.innerHTML = "La date actuelle sera associée à votre course. Vous pouvez toujours ajouter des articles à votre liste si besoin, ou acheter directement un article depuis cette page. La course s'active automatiquement lors de l'achat d'un article.";
		button.className = "activate";
		button.innerHTML = "Activer";

		div.appendChild(h4);
		div.appendChild(h5);
		div.appendChild(p);
		div.appendChild(button);

		return div;

	}
	static noCourse(){
		let div = document.createElement("div"),
			h4 = document.createElement('h4'),
			h5 = document.createElement('h5'),
			button = document.createElement('button');

		div.classList.add("promptEmpty");
		h4.innerHTML += "Bienvenue";
		h5.innerHTML = "Pour creer la première course de ce groupe, ouvrez le menu et cliquez sur nouvelle course.";
		button.className = "noCourse";
		button.innerHTML = "Menu";
		
		div.appendChild(h4);
		div.appendChild(h5);
		div.appendChild(button);

		return div;
	}
}