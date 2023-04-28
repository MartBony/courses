import { IndexedDbStorage } from './storage.js';
import Animations from "./animations.js";

const app = document.querySelector("app-window");

class CourseItem extends HTMLLIElement{
	itemContent = {
		type: 'article',
		id: null,
		titre: "",
		prix: 0,
		prixSTR: "",
		couleur: "",
		id_domaine: 0,
		animation: null
	};
	constructor(content){
		super();
		const { type = this.itemContent.type, id, titre, prix, hue, animation, message, id_domaine } = content;
		this.itemContent = { type, id, titre, prix, hue, animation, message, id_domaine };
	}
	connectedCallback(){
		Array.from(this.children).forEach(child => child.remove());
		let div = document.createElement('div'),
			h2 = document.createElement('h2'),
			h3 = document.createElement('h3'),
			i = document.createElement('i');

		i.classList.add('ms-Icon', 'ms-Icon--StatusCircleSync');
		i.setAttribute('aria-hidden', 'true');
		this.className = this.itemContent.type;
		//li.style.background = `hsl(${couleur}, var(--previewS), var(--previewL))`;
		//li.setAttribute("idItem", id);
		//h2.innerHTML = titre;
		//h3.innerHTML = (Number(prix)*(1+app.course.taxes)).toFixed(2) + app.params.currency;
		div.appendChild(h2);
		div.appendChild(h3);
		[div, i].forEach(child => {
			this.appendChild(child);
		});

		this.content = this.itemContent;
		
	}
	save(id_course){
		if(id_course => 0){
			IndexedDbStorage.put("items", {...this.content, course: id_course});
		}
	}
	get content(){
		return this.itemContent;
	}
	set content(item){
		if(this.isConnected){
			const { 
				id = this.itemContent.id, 
				titre = this.itemContent.titre, 
				prix = this.itemContent.prix,
				id_domaine = this.itemContent.id_domaine,
				hue = this.itemContent.hue, 
				animation = null,
				message = this.itemContent.message, 
			} = item;
			let prixSTR = this.itemContent.prixSTR;
			if(id){
				if(id < 0) this.classList.add('sync');
				else this.classList.remove('sync')
				this.setAttribute("idItem", id);
			}
			if(titre) this.firstChild.firstChild.innerHTML = titre;
			if(prix && this.firstChild.children.length){
				const app = document.querySelector("app-window");
				prixSTR = app.parseUnit(app.course.applyTaxes(prix));
				this.firstChild.lastChild.innerHTML = prixSTR;
			}
			if(id_domaine >= 0) {
				const hue = document.querySelector("app-window").domainesHues[id_domaine];
				this.style.background = `hsl(${hue}, var(--previewS), var(--previewL))`;
			} else this.style.background = "white";
			if(animation) Animations[animation](this)

			this.itemContent = { type: this.itemContent.type, id, titre, prix, prixSTR, hue, message, id_domaine };
		}
	}
}

customElements.define('course-item', CourseItem, { extends: 'li' });

export default class Course{
	id;
	nom;
	maxPrice;
	totalCost;
	splittedCost = [0,0,0,0];
	dateCreation;
	groupe;
	taxes = 0;
	isold;
	items = {
		articles: new Array,
		previews: new Array
	};
	
	constructor(){
		Array.from(document.querySelectorAll('.main ul'))
		.forEach(container => Array.from(container.childNodes).forEach(itemNode => itemNode.remove()));
	}
	updateSelf(data){
		
		this.id = parseInt(data.id);
		this.nom = data.nom;
		this.maxPrice = Number(data.maxPrice);
		this.total = Number(data.total);
		this.dateCreation = new Date(data.dateCreation*1000);
		this.groupe = Number(data.groupe);
		this.taxes = Number(data.taxes) || 0;
		this.isold = data.isold;

		document.getElementById('objectif').innerHTML = this.maxPrice;

		document.querySelector("state-card").state = this.isold+1;

		this.updateCalculs();

		this.updateEditForm();

	}
	updateItemsModern(articles, previews, options = {save: false, forceUpdate: false}){
		this.splittedCost.fill(0);

		// Articles
		articles.forEach((article, index) => {
			const articleNode = document.querySelector(`.article[idItem="${article.id}"]`),
				articleNodeIndex = this.articleIndexOf(article);

			if(articleNodeIndex > -1){
				if(articleNodeIndex != index) articleNode.parentNode.insertBefore(articleNode, articleNode.parentNode.childNodes[index])
				if(options.forceUpdate) articleNode.content = article;
			} else {
				if(articleNode) articleNode.remove();
				this.insertArticle(index, article, false);
			}


			this.splittedCost[article.id_domaine] += this.applyTaxes(article.prix);
		});

		this.articlesNodeList.slice(articles.length).forEach(articleNode => {
			articleNode.remove();
		});

		this.items.articles = articles;

		// Previews
		previews.forEach((preview, index) => {
			const previewNode = document.querySelector(`.preview[idItem="${preview.id}"]`),
				previewNodeIndex = this.previewIndexOf(preview);

			if(previewNodeIndex > -1){
				if(previewNodeIndex != index) previewNode.parentNode.insertBefore(previewNode, previewNode.parentNode.childNodes[index])
				if(options.forceUpdate) previewNode.content = preview;
			} else {
				if(previewNode) previewNode.remove();
				this.insertPreview(index, preview, false);
			}
		});

		this.previewsNodeList.slice(previews.length).forEach(previewNode => {
			previewNode.remove();
		});

		this.items.previews = previews;

		if(options.save){
			IndexedDbStorage.filterCursorwise("items", "id", null, (item) => {
				switch(item.type){
					case "article":
						if(item.course == this.id){
							if(this.articleIndexOf(item) == -1) return false
						}
						break;
					case "preview":
						if(item.course == this.id){
							if(this.previewIndexOf(item) == -1) return false
						}
						break;
				}
				return true;
			});

			articles.forEach(item => {
				if(item.id >= 0) IndexedDbStorage.put("items", {...item, type: "article", course: this.id})
			});
			previews.forEach(item => {
				if(item.id >= 0) IndexedDbStorage.put("items", {...item, type: "preview", course: this.id})
			});
		}



	}
	pushArticle(item, animate){ // Appens an article in the logic
		if(item){
			this.insertArticle(0, item, animate)

			// Necessaire ?
			this.items.articles.unshift(item);
			// Necessaire ?

			this.total += item.prix;
			this.ajouterPrix(item.prix, item.id_domaine);
		} else console.log("No item provided")
	}
	insertArticle(index, item, animate = true){ // Inserts an article in the UI
		if(item){

			const animation = animate ? 'animateSlideIn' : 'animateScaleIn',
			article = new CourseItem({
				type: 'article',
				id: item.id,
				titre: item.titre,
				prix: item.prix,
				id_domaine: parseInt(item.id_domaine),
				animation: animation,
				message: item.message
			});

			if(index) document.querySelector('#panier ul').insertBefore(article, this.articlesNodeList[index]);
			else document.querySelector('#panier ul').prepend(article);
			
			this.updateCalculs();

		} else console.log("No item provided")
	}
	pushPreview(item, animate){
		if(item){
			this.insertPreview(0, item, animate)
			this.items.previews.unshift({id: item.id, titre: item.titre, message: item.message});
		} else console.log("No item provided")
	}
	insertPreview(index, item, animate = true){ // Inserts a preview in the UI
		if(item){
			
			const animation = animate ? 'animateSlideIn' : 'animateScaleIn',
			/* preview = item.id < 0 ? 
				Generate.preview(item.id, item.titre, item.color, animation, 'sync') :
				Generate.preview(item.id, item.titre, item.color, animation); */
			preview = new CourseItem({
				type: 'preview',
				id: item.id,
				titre: item.titre,
				animation: animation,
				id_domaine: parseInt(item.id_domaine),
				message: item.message
			});
		
			if(index) document.querySelector('#liste ul').insertBefore(preview, this.previewsNodeList[index]);
			else document.querySelector('#liste ul').prepend(preview);


		} else console.log("No item provided")
	}
	updateCalculs(){
		document.getElementById("nbrarticles").innerHTML = this.articlesNodeList.length;
		document.getElementById("average").innerHTML = (this.total / this.articlesNodeList.length | 0).toFixed(2);
	}
	updateEditForm(){
		const form = document.querySelector("#courseEditor form");
		
		form.titre.value = this.nom;
		form.prixMax.value = this.maxPrice;
		form.date.value = this.dateCreation.toISOString().substring(0,10);
		form.taxes.value = this.taxes;
	}
	deleteArticle(item, rank = 0){
		this.updateCalculs();
		this.items.articles = this.items.articles.filter(el => el.id != item.id);
		this.total -= item.prix;
		this.ajouterPrix(-item.prix, item.id_domaine);

		const selectedElement = document.querySelector(`li[idItem="${item.id}"]`),
		positions = this.articlesNodeList.map(el => [el, el.getBoundingClientRect()]),
		anim = Animations.removeItem(selectedElement).then(() => {
			selectedElement.remove();
			positions.forEach((elData, index) => {
				const el = elData[0],
				oldPos = elData[1],
				newPos = el.getBoundingClientRect();

				Animations.createAnimation(el, [
					{
						width: `${oldPos.width}px`,
						height: `${oldPos.height}px`,
						transform: `translate(${-(newPos.left - oldPos.left)}px, ${-(newPos.top - oldPos.top)}px)`
					},
					{
						width: `${newPos.width}px`,
						height: `${newPos.height}px`,
						transform: `translate(0,0)`
					}
				], {
					duration: 200 + (index-rank)*20,
					fill: 'forwards',
					easing: Animations.ease.move
				}).then(el => {
					el.style.width = "";
					el.style.height = "";
					el.style.transform = "";
				});
			});
		});
	}
	deletePreview(index, rank = 0, lightAnimations = false){
		return new Promise((resolve, reject) => {
			const selectedElement = document.querySelector(`li[idItem="${index}"]`);
			if(!lightAnimations){
				var positions = app.course.previewsNodeList.map(el => [el, el.getBoundingClientRect()]);
			}
			this.items.previews = this.items.previews.filter(el => el.id != index);
			Animations.removeItem(selectedElement).then(() => {
				selectedElement.remove();
				if(!lightAnimations){
					positions.forEach((elData, index) => {
						const el = elData[0],
						oldPos = elData[1],
						newPos = el.getBoundingClientRect();
		
						Animations.createAnimation(el, [
							{
								width: `${oldPos.width}px`,
								height: `${oldPos.height}px`,
								transform: `translate(${-(newPos.left - oldPos.left)}px, ${-(newPos.top - oldPos.top)}px)`
							},
							{
								width: `${newPos.width}px`,
								height: `${newPos.height}px`,
								transform: `translate(0,0)`
							}
						], {
							duration: 200 + (index-rank)*20,
							fill: 'forwards',
							easing: Animations.ease.move
						}).then(el => {
							el.style.width = "";
							el.style.height = "";
							el.style.transform = "";
							resolve();
						});
					});
				} else resolve();
			});

		})
	}
	articleIndexOf(article){
		return this.articlesNodeList.findIndex((articleNode, index) => {
			const titre = articleNode.firstChild.firstChild.innerHTML,
				prix = parseFloat(articleNode.firstChild.lastChild.innerHTML.slice(0, -1));
		
			if(parseInt(articleNode.getAttribute("idItem")) == article.id
			&& titre == article.titre
			&& prix == article.prix) return true

			return false;
		});
	}
	previewIndexOf(preview){
		return this.previewsNodeList.findIndex((previewNode, index) => {
			const titre = previewNode.firstChild.firstChild.innerHTML;
		
			if(parseInt(previewNode.getAttribute("idItem")) == preview.id
			&& titre == preview.titre) return true

			return false;
		});
	}
	applyTaxes(prix){
		return Number((Number(prix)*(1+this.taxes)).toFixed(2));
	}
	ajouterPrix(prix, domaine){
		this.splittedCost[domaine] += this.applyTaxes(prix);
		document.querySelector("app-window").groupe.editCourseCosts(this.id, this.splittedCost);
	}
	get articlesNodeList(){
		return Array.from(document.getElementsByClassName("article"));
	}
	get previewsNodeList(){
		return Array.from(document.getElementsByClassName("preview"));
	}
	get total(){
		return this.totalCost;
	}
	set total(val){
		val = Number(val);
		let total = Number(val.toFixed(2)),
			totalTax = this.applyTaxes(total),
			index = Math.floor(Date.now()/(60*60*24*30*1000)) - Math.floor(this.dateCreation/(60*60*24*30));

		document.getElementById("total").innerHTML = totalTax;

		document.querySelector("state-card").setValue(totalTax/this.maxPrice);
		this.totalCost = total;
	}
}