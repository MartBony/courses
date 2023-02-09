import Animations from "./animations.js";

export default class Generate{
	static course(id, nom){
		let button = document.createElement('button'),
			controls = document.createElement('div'),
			idel = document.createElement('i'),
			iparams = document.createElement('i');
		button.classList.add("course");
		button.setAttribute("dbIndex", id);
		button.innerHTML = nom;
		iparams.className = "ms-Icon ms-Icon--EditNote cedit";
		iparams.setAttribute("aria-hidden","true");
		controls.appendChild(iparams);
		idel.className = "ms-Icon ms-Icon--Delete cdelete";
		idel.setAttribute("aria-hidden","true");
		controls.appendChild(idel);
		button.appendChild(controls);

		return button;
	}
	static groupe(id, nom, membres){
		let button = document.createElement('button'),
			h4 = document.createElement('h4'),
			ul = document.createElement('ul'),
			remv = document.createElement('i'),
			invite = document.createElement('i'),
			childrens = [h4, ul, invite, remv];

		button.className = "groupe";
		button.setAttribute("idGroupe", id);
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

		return button;
	}
	static article(app, id, titre, couleur, prix, animation = 'animateSlideIn', addClass = ''){
		let li = document.createElement('li'),
			div = document.createElement('div'),
			h2 = document.createElement('h2'),
			h3 = document.createElement('h3'),
			i = document.createElement('i'),
			childrens = [div, i];

		i.classList.add('ms-Icon', 'ms-Icon--StatusCircleSync');
		i.setAttribute('aria-hidden', 'true');
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

		if(animation) Animations[animation](li)
		
		return li;
	}
	static preview(id, titre, couleur, animation = 'animateSlideIn', addClass = ''){
		let li = document.createElement('li'),
			div = document.createElement('div'),
			h2 = document.createElement('h2'),
			i = document.createElement('i'),
			childrens = [div, i];

		i.classList.add('ms-Icon', 'ms-Icon--StatusCircleSync');
		i.setAttribute('aria-hidden', 'true');
		li.className = `preview ${animation} ${addClass}`;
		li.style.background = `hsl(${couleur}, var(--previewS), var(--previewL))`;
		li.setAttribute("idItem", id);
		h2.innerHTML = titre;
		div.appendChild(h2)
		childrens.forEach(child => {
			li.appendChild(child);
		});

		if(animation) Animations[animation](li)

		return li;
	
	}
}