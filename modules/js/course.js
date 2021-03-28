import Generate from './generate.js';
import {IndexedDbStorage } from './storage.js';

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

		this.started;
		this.old;

		$('.main ul').children().remove();
	}
	updateSelf(app, data, save){
		
		this.id = parseInt(data.id);
		this.nom = data.nom;
		this.maxPrice = Number(data.maxPrice);
		app.total = Number(data.total);
		this.dateStart = data.dateStart;
		this.groupe = Number(data.groupe);
		this.taxes = Number(data.taxes);

		this.old = data.id != app.usedGroupe.coursesList[0].id;

		$('#maxprice').html(this.maxPrice + app.params.currency);

		this.updateItems(app, data.items.articles, data.items.previews, save)

		this.started = data.dateStart != 0;

	}
	updateItems(app, articles, previews, save = false){
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
	pushArticle(app, item){
		if(item && item.id && item.titre && item.color && item.prix){
			const article = item.id < 0 ? 
				Generate.article(app, item.id, item.titre, item.color, item.prix, 'animateSlideIn', 'sync') :
				Generate.article(app, item.id, item.titre, item.color, item.prix);
			document.querySelector('#panier ul').prepend(article);
			setTimeout(() => document.getElementsByClassName('article')[0].classList.remove('animateSlideIn') , 300);

			this.items.articles.unshift({id: item.id, titre: item.titre, color: item.color, prix: item.prix});
			app.total += item.prix;
		} else console.log("Article requirements not fullfilled at course.js");
	}
	pushPreview(item){
		if(item && item.id && item.titre && item.color){
			const preview = item.id < 0 ? 
				Generate.preview(item.id, item.titre, item.color, 'animateSlideIn', 'sync') :
				Generate.preview(item.id, item.titre, item.color);
			document.querySelector('#liste ul').prepend(preview);
			setTimeout(() => document.getElementsByClassName('preview')[0].classList.remove('animateSlideIn'), 300);

			this.items.previews.unshift({id: item.id, titre: item.titre, color: item.color});
		} else console.log("Preview requirements not fullfilled at course.js");
	}
	deleteArticle(app, item){
		this.items.articles = this.items.articles.filter(el => el.id != item.id);
		app.total -= item.prix;
	}
	deletePreview(id){
		this.items.previews = this.items.previews.filter(el => el.id != id);
	}
}