import App from './app.js';
import Generate from './generate.js';

export default class Course{
	constructor(){
		this.id;
		this.total;
		this.maxPrice;
		this.coef;
		this.displayed = {
			articles: new Array,
			previews: new Array
		};
		this.monthCost;
		this.started;
		this.old;

		this.priceCursor = {
			index: null,
			el: null
		};
	}
	update(app, data){
		let items = data.items,
			attribute = "";
		
		this.id = data.id;
		this.total = Number(data.total);
		this.maxPrice = data.maxPrice;
		$('#maxprice').html(this.maxPrice + app.params.currency);
		this.monthCost = app.getUsedGroup().monthCost;
		this.coef = Number(app.getUsedGroup().coef);
		this.old = data.id != app.getUsedGroup().coursesList[0].id;

		app.totalPP(0, true);

		if (this.old) {
			attribute = "disabled";
		}

		let iter = 0;
		while(iter < items.articles.length){
			let article = items.articles[iter];
			if (this.displayed.articles[iter]) {
				if (article.id != this.displayed.articles[iter].id){
					if(items.articles.filter(el => el.id == this.displayed.articles[iter].id).length > 0){
						this.displayed.articles.splice(iter, 0, article);
						$('.list .article').eq(iter).before(Generate.article(app, article.id, article.titre, article.prix, 'animateSlideTop', attribute));
						iter++;
					} else {
						this.displayed.articles.splice(iter, 1);
						$('.list .article').eq(iter).remove();
					}
				} else {
					iter++;
				}
			}
			else{
				this.displayed.articles.splice(iter, 0, article);
				$('.list').append(Generate.article(app, article.id, article.titre, article.prix, 'animateSlideTop', attribute));
				iter++;
			}

		}
		$('.list .article').slice(items.articles.length).remove();
		this.displayed.articles = this.displayed.articles.slice(0, items.articles.length);
		


		iter = 0;
		while(iter < items.previews.length){
			let preview = items.previews[iter];
			if (this.displayed.previews[iter]) {
				if (preview.id != this.displayed.previews[iter].id){
					if(items.previews.filter(el => el.id == this.displayed.previews[iter].id).length > 0){
						this.displayed.previews.splice(iter, 0, preview);
						$('.prevList .preview').eq(iter).before(Generate.preview(app, preview.id, preview.titre, preview.color, 'animateSlideTop', attribute));
						iter++;
					} else {
						this.displayed.previews.splice(iter, 1);
						$('.prevList .preview').eq(iter).remove();
					}
				} else {
					iter++;
				}
			}
			else{
				this.displayed.previews.splice(iter, 0, preview);
				$('.prevList').append(Generate.preview(app, preview.id, preview.titre, preview.color, 'animateSlideTop', attribute));
				iter++;
			}

		}
		$('.prevList .preview').slice(items.previews.length).remove();
		this.displayed.previews = this.displayed.previews.slice(0, items.previews.length);

		
		setTimeout(function(){
			$('.article, .preview').removeClass('animateSlideTop');
		},600);

		this.started = data.dateStart != 0;

	}
}