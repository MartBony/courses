import {$_GET} from "./tools.js";
import UI from './UI.js';

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

		button.className = "groupe g"+id;
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
				app.pull("open", id);
			}
		});

		return button;
	}
	static article(app, id, titre, prix, animation = 'animateSlideIn', addClass = ''){
		let li = document.createElement('li'),
			h2 = document.createElement('h2'),
			h3 = document.createElement('h3'),
			del = document.createElement('i'),
			cancel = document.createElement('i'),
			security = document.createElement('i'),
			div = document.createElement('div'),
			childrens = [h2, h3, del, cancel, security, div],
			iTags = [ del, cancel, security ];
		li.className = `article ${animation} ${addClass}`;
		h2.innerHTML = titre;
		h3.innerHTML = prix + app.params.currency;
		del.className = "ms-Icon ms-Icon--Delete";
		cancel.className = "ms-Icon ms-Icon--Cancel noDelete";
		security.className = "ms-Icon ms-Icon--Delete Security";
		div.className = "bgCards";
		$(security).on('click', e => {
			app.deleteArticle(e, id, prix);
		});
		iTags.forEach(i => {
			i.setAttribute("aria-hidden","true");
		});
		childrens.forEach(child => {
			li.appendChild(child);
		});
		return li;
		/* return `<li class="article ${animation} ${addClass}">
			<h2>${titre}</h2><h3>${prix + app.params.currency}</h3>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel noDelete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Delete Security" aria-hidden="true" onclick="course.initDelete(${id},this,${prix})"></i>
			<div class="bgCards"></div>
		</li>`; */
	}
	static preview(app ,id, titre, couleur, animation = 'animateSlideIn', addClass = ''){
		let li = document.createElement('li'),
			h2 = document.createElement('h2'),
			del = document.createElement('i'),
			buy = document.createElement('i'),
			cancel = document.createElement('i'),
			security = document.createElement('i'),
			div = document.createElement('div'),
			childrens = [h2, buy, del, cancel, security, div],
			iTags = [ buy, del, cancel, security ];
		li.className = `preview ${animation} ${addClass}`;
		li.style = `background: hsl(${couleur}, 100%, 95%);`;
		h2.innerHTML = titre;
		buy.className = "ms-Icon ms-Icon--Shop buy";
		del.className = "ms-Icon ms-Icon--Delete";
		del.style = `background: hsl(${couleur}, 100%, 95%);`;
		cancel.className = "ms-Icon ms-Icon--Cancel noDelete";
		security.className = "ms-Icon ms-Icon--Delete Security";
		div.className = "bgCards";
		$(buy).on('click', e => {
			app.addPrice(e, id);
		});
		$(security).on('click', e => {
			app.deletePreview(e, id);
		});
		iTags.forEach(i => {
			i.setAttribute("aria-hidden","true");
		});
		childrens.forEach(child => {
			li.appendChild(child);
		});

		return li;

		/* return `<li class="preview ${animation} ${addClass}" style="background:${couleur};">
			<h2>${titre}</h2>
			<i class="ms-Icon ms-Icon--Shop buy" onclick="app.addPrice(${id},this);"></i>
			<i class="ms-Icon ms-Icon--Delete" style="background:${couleur}; aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel noDelete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Delete Security" aria-hidden="true" onclick="course.initDeletePrev(${id},this)"></i>
			<div class="bgCards"></div>
		</li>`; */
	}
	static activate(){
		let button = document.createElement('button'),
			i = document.createElement('i'),
			h4 = document.createElement('h4'),
			p = document.createElement('p'),
			childrens = [i, h4, p];

		button.className = "activate";
		i.className = "ms-Icon ms-Icon--Play";
		i.setAttribute("aria-hidden","true");
		h4.innerHTML = "Je suis dans le magasin";
		p.innerHTML = "Je lance mes courses";
		
		childrens.forEach(child => {
			button.appendChild(child);
		});

		return button;

		/* return `<button class="activate">
			<i class="ms-Icon ms-Icon--Play" aria-hidden="true"></i>
			Je suis dans le magasin<br>
			<p>Je lance mes courses</p>
		</button>`; */
	}
	static noCourse(){
		let button = document.createElement('button'),
			i = document.createElement('i'),
			h4 = document.createElement('h4'),
			p = document.createElement('p'),
			childrens = [i, h4, p];

		button.className = "noCourse";
		i.className = "ms-Icon ms-Icon--GlobalNavButton";
		i.setAttribute("aria-hidden","true");
		h4.innerHTML = "Aucune course";
		p.innerHTML = "Ouvrir le menu en tapant ici";
		
		childrens.forEach(child => {
			button.appendChild(child);
		});

		return button;
	}
	static noSelected(){
		let button = document.createElement('button'),
			i = document.createElement('i'),
			h4 = document.createElement('h4'),
			p = document.createElement('p'),
			childrens = [i, h4, p];

		button.className = "noCourse";
		i.className = "ms-Icon ms-Icon--GlobalNavButton";
		i.setAttribute("aria-hidden","true");
		h4.innerHTML = "Rien par ici";
		p.innerHTML = "Selectionnez une course";
		
		childrens.forEach(child => {
			button.appendChild(child);
		});

		return button;
	}
}