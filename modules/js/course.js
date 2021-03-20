import Generate from './generate.js';

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
	update(app, data){
		
		this.id = parseInt(data.id);
		this.nom = data.nom;
		this.maxPrice = Number(data.maxPrice);
		app.total = Number(data.total);
		this.dateStart = data.dateStart;
		this.groupe = Number(data.groupe);
		this.taxes = Number(data.taxes);

		this.old = data.id != app.usedGroupe.coursesList[0].id;

		$('#maxprice').html(this.maxPrice + app.params.currency);

		let items = data.items,
			attribute = this.old ? "disabled" : "";

		let iter = 0;
		while(iter < items.articles.length){
			let article = items.articles[iter];
			if (this.items.articles[iter]) {
				if (article.id != this.items.articles[iter].id){
					if(items.articles.filter(el => el.id == this.items.articles[iter].id).length > 0){
						this.items.articles.splice(iter, 0, article);
						$('#panier ul .article').eq(iter).before(Generate.article(app, article.id, article.titre, article.color, article.prix, 'animateSlideTop', attribute));
						iter++;
					} else {
						this.items.articles.splice(iter, 1);
						$('#panier ul .article').eq(iter).remove();
					}
				} else {
					iter++;
				}
			}
			else{
				this.items.articles.splice(iter, 0, article);
				$('#panier ul').append(Generate.article(app, article.id, article.titre, article.color, article.prix, 'animateSlideTop', attribute));
				iter++;
			}

		}
		$('#panier ul .article').slice(items.articles.length).remove();
		this.items.articles = this.items.articles.slice(0, items.articles.length);
		



		iter = 0;
		while(iter < items.previews.length){
			let preview = items.previews[iter];
			if (this.items.previews[iter]) {
				if (preview.id != this.items.previews[iter].id){
					if(items.previews.filter(el => el.id == this.items.previews[iter].id).length > 0){
						this.items.previews.splice(iter, 0, preview);
						$('#liste ul .preview').eq(iter).before(Generate.preview(app, preview.id, preview.titre, preview.color, 'animateSlideTop', attribute));
						iter++;
					} else {
						this.items.previews.splice(iter, 1);
						$('#liste ul .preview').eq(iter).remove();
					}
				} else {
					iter++;
				}
			}
			else{
				this.items.previews.splice(iter, 0, preview);
				$('#liste ul').append(Generate.preview(app, preview.id, preview.titre, preview.color, 'animateSlideTop', attribute));
				iter++;
			}

		}
		$('#liste ul .preview').slice(items.previews.length).remove();
		this.items.previews = this.items.previews.slice(0, items.previews.length);

		
		setTimeout(function(){
			$('.article, .preview').removeClass('animateSlideTop');
		},600);

		this.started = data.dateStart != 0;

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
}