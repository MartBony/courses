import Generate from './generate.js';
import { IndexedDbStorage, LocalStorage } from './storage.js';
import Animations from "./animations.js";

class CourseItem extends HTMLLIElement{
	itemContent = {
		type: 'article',
		id: null,
		titre: "",
		prix: 0,
		couleur: "",
		animation: null
	};
	constructor(content){
		super();
		const { type = this.itemContent.type, id, titre, prix, couleur, animation, message } = content;
		this.itemContent = { type, id, titre, prix, couleur, animation, message };
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
	get content(){
		return this.itemContent;
	}
	set content(item){
		if(this.isConnected){
			const { 
				id = this.itemContent.id, 
				titre = this.itemContent.titre, 
				prix = this.itemContent.prix, 
				couleur = this.itemContent.couleur, 
				animation = null,
				message = null
			} = item;

			if(id){
				if(id < 0) this.classList.add('sync');
				else this.classList.remove('sync')
				this.setAttribute("idItem", id);
			}
			if(titre) this.firstChild.firstChild.innerHTML = titre;
			if(prix && this.firstChild.children.length) this.firstChild.lastChild.innerHTML = prix;
			if(couleur) this.style.background = `hsl(${couleur}, var(--previewS), var(--previewL))`;
			if(animation) Animations[animation](this)

			this.itemContent = { type: this.itemContent.type, id, titre, prix, couleur, message };
		}
	}
}

customElements.define('course-item', CourseItem, { extends: 'li' });

export default class Course{
	constructor(){
		this.id;
		this.nom;
		this.maxPrice;
		this.totalCost;
		this.dateStart;
		this.groupe;
		this.taxes = 0;
		this.items = {
			articles: new Array,
			previews: new Array
		};
		this.cardTotal = document.querySelector("card-total");

		this.started;
		this.old;

		Array.from(document.querySelectorAll('.main ul'))
		.forEach(container => Array.from(container.childNodes).forEach(itemNode => itemNode.remove()));
	}
	updateSelf(app, data){
		
		this.id = parseInt(data.id);
		this.nom = data.nom;
		this.maxPrice = Number(data.maxPrice);
		app.total = Number(data.total);
		this.dateStart = data.dateStart;
		this.groupe = Number(data.groupe);
		this.taxes = Number(data.taxes) || 0;

		this.old = data.id != app.groupe.courses[0].id;

		$('#maxprice').html(this.maxPrice + app.params.currency);
	
		// this.updateItems(app, data.items.articles, data.items.previews, save)

		this.started = data.dateStart != 0;
		this.cardTotal.style.display = this.started ? "block" : "none";

	}
	/* updateItems(app, articles, previews, save = false){
		let attribute = this.old ? "disabled" : "",
			pendings = {
				put: new Array(),
				delete: new Array()
			};

		let iter = 0;
		while(iter < articles.length){
			let article = articles[iter];
			if (this.items.articles[iter]) { // Si un article de même rand existe déja
				if (article.id != this.items.articles[iter].id){ // Si les articles sont différents
					if(articles.filter(el => el.id == this.items.articles[iter].id).length > 0){ // Si l'article séléctionné existe plus loin
						
						this.items.articles.splice(iter, 0, article);
						document.querySelector('#panier ul').insertBefore(
							Generate.article(app, article.id, article.titre, article.color, article.prix, 'animateSlideTop', attribute),
							document.querySelectorAll('#panier ul .article')[iter]
						);
						pendings.put.push({...article, type: "article", course: this.id });

						iter++;
					} else { // Supprimer l'article séléctionné

						pendings.delete.push(this.items.articles[iter].id);
						this.items.articles.splice(iter, 1);
						document.querySelectorAll('#panier ul .article')[iter].remove();

					}
				} else iter++
			} else { // Ajouter l'article en fin de tableau

				this.items.articles.splice(iter, 0, article);
				document.querySelector('#panier ul').append(Generate.article(app, article.id, article.titre, article.color, article.prix, 'animateSlideTop', attribute));
				pendings.put.push({...article, type: "article", course: this.id})

				iter++;

			}

		}
		Array.from(document.querySelectorAll('#panier ul .article')).slice(articles.length).forEach(item => item.remove()); // delete the articles left
		this.items.articles.slice(articles.length).forEach(item => pendings.delete(item.id));
		this.items.articles = this.items.articles.slice(0, articles.length);
		



		iter = 0;
		while(iter < previews.length){
			let preview = previews[iter];
			if (this.items.previews[iter]) {
				if (preview.id != this.items.previews[iter].id){
					if(previews.filter(el => el.id == this.items.previews[iter].id).length > 0){

						this.items.previews.splice(iter, 0, preview);
						document.querySelector('#liste ul').insertBefore(
							Generate.preview(preview.id, preview.titre, preview.color, 'animateSlideTop', attribute),
							document.querySelectorAll('#liste ul .preview')[iter]
						);
						pendings.put.push({...preview, type: "preview", course: this.id});
						iter++;
						
					} else {

						pendings.delete.push(this.items.previews[iter].id);
						this.items.previews.splice(iter, 1);
						document.querySelectorAll('#liste ul .preview')[iter].remove();

					}
				} else iter++
			} else {

				this.items.previews.splice(iter, 0, preview);
				document.querySelector('#liste ul').append(Generate.preview(preview.id, preview.titre, preview.color, 'animateSlideTop', attribute));
				pendings.put.push({...preview, type: "preview", course: this.id});
				iter++;

			}

		}

		this.items.previews.slice(previews.length).forEach(item => pendings.delete(item.id));
		Array.from(document.querySelectorAll('#liste ul .preview')).slice(previews.length).forEach(item => item.remove());
		this.items.previews = this.items.previews.slice(0, previews.length);


		if(save){
			pendings.put.forEach(item => IndexedDbStorage.put("items", item));
			pendings.delete.forEach(id => IndexedDbStorage.delete("items", id));
		}

		setTimeout(function(){
			$('.article, .preview').removeClass('animateSlideTop');
		},600);
	} */
	updateItemsModern(app, articles, previews, save = false){

		// Articles
		articles.forEach((article, index) => {
			const articleNode = document.querySelector(`.article[idItem="${article.id}"]`),
				articleNodeIndex = this.articleIndexOf(article);

			if(articleNodeIndex > -1){
				if(articleNodeIndex != index) articleNode.parentNode.insertBefore(articleNode, articleNode.parentNode.childNodes[index])
			} else {
				if(articleNode) articleNode.remove();
				this.insertArticle(app, index, article, false);
			}
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
			} else {
				if(previewNode) previewNode.remove();
				this.insertPreview(index, preview, false);
			}
		});

		this.previewsNodeList.slice(previews.length).forEach(previewNode => {
			previewNode.remove();
		});

		this.items.previews = previews;

		if(save){
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
	export(){
		return {
			'id': this.id,
			'nom': this.nom,
			'maxPrice': this.maxPrice,
			'total': this.totalCost,
			'dateStart': this.dateStart,
			'groupe': this.groupe,
			'taxes': this.taxes,
			'items': this.items
		};
	}
	pushArticle(app, item, animate){ // Appens an article in the logic
		if(item && item.id && item.titre && item.color && item.prix){
			this.insertArticle(app, 0, item, animate)
			this.items.articles.unshift({id: item.id, titre: item.titre, color: item.color, prix: item.prix, message: item.message});
			app.total += item.prix;
		} else console.log("Article requirements not fullfilled", item);
	}
	insertArticle(app, index, item, animate = true){ // Inserts an article in the UI
		if(item && item.id && item.titre && item.color && item.prix){
			const animation = animate ? 'animateSlideIn' : 'animateScaleIn',
			/* article = item.id < 0 ? 
				Generate.article(app, item.id, item.titre, item.color, item.prix, animation, 'sync'):
				Generate.article(app, item.id, item.titre, item.color, item.prix, animation); */
			article = new CourseItem({
				type: 'article',
				id: item.id,
				titre: item.titre,
				prix: app.parseUnit(app.applyTaxes(item.prix)),
				couleur: item.color,
				animation: animation,
				message: item.message
			});

			if(index) document.querySelector('#panier ul').insertBefore(article, this.articlesNodeList[index]);
			else document.querySelector('#panier ul').prepend(article);
			
			setTimeout(() => article.classList.remove(animation) , 300);

		} else console.log("Article requirements not fullfilled", item);
	}
	pushPreview(item, animate){
		if(item && item.id && item.titre && item.color){
			this.insertPreview(0, item, animate)
			this.items.previews.unshift({id: item.id, titre: item.titre, color: item.color, message: item.message});
		} else console.log("Preview requirements not fullfilled", item);
	}
	insertPreview(index, item, animate = true){ // Inserts a preview in the UI
		if(item && item.id && item.titre && item.color){
			const animation = animate ? 'animateSlideIn' : 'animateScaleIn',
			/* preview = item.id < 0 ? 
				Generate.preview(item.id, item.titre, item.color, animation, 'sync') :
				Generate.preview(item.id, item.titre, item.color, animation); */
			preview = new CourseItem({
				type: 'preview',
				id: item.id,
				titre: item.titre,
				couleur: item.color,
				animation: animation,
				message: item.message
			});
		
			if(index) document.querySelector('#liste ul').insertBefore(preview, this.previewsNodeList[index]);
			else document.querySelector('#liste ul').prepend(preview);
			
			setTimeout(() => preview.classList.remove(animation) , 300);

		} else console.log("Preview requirements not fullfilled", item);
	}
	deleteArticle(app, item){
		this.items.articles = this.items.articles.filter(el => el.id != item.id);
		app.total -= item.prix;
	}
	deletePreview(id){
		this.items.previews = this.items.previews.filter(el => el.id != id);
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
	get articlesNodeList(){
		return Array.from(document.getElementsByClassName("article"));
	}
	get previewsNodeList(){
		return Array.from(document.getElementsByClassName("preview"));
	}
}