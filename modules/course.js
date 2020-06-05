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
		this.total = data.total;
		this.maxPrice = data.maxPrice;
		$('#maxprice').html(this.maxPrice + app.params.currency);
		this.monthCost = app.getUsedGroup().monthCost;
		this.coef = app.getUsedGroup().coef;
		this.old = data.id != app.getUsedGroup().coursesList[0].id;

		app.totalPP(0, true);

		if (this.old) {
			attribute = "disabled";
		}

		items.articles.forEach((article, index) => {
			if (this.displayed.articles[index]) {
				if (article.id != this.displayed.articles[index].id){
					$('.list .article').eq(index).after(Generate.article(article.id, article.titre, article.prix, app, 'animateSlideTop', attribute));
					$('.list .article').eq(index).remove();
				}
			}
			else{
				$('.list').append(Generate.article(article.id, article.titre, article.prix, app, 'animateSlideTop', attribute));
			}
		});
		$('.list .article').slice(items.articles.length).remove();


		items.previews.forEach((preview, index) => {
			console.log(preview);
			if (this.displayed.previews[index]) {
				if (preview.id != this.displayed.previews[index].id){
					$('.prevList .preview').eq(index).after(Generate.preview(preview.id, preview.titre, preview.color, app, 'animateSlideTop', attribute));
					$('.prevList .preview').eq(index).remove();
				}
			}
			else{
				$('.prevList').append(Generate.preview(preview.id, preview.titre, preview.color, app, 'animateSlideTop', attribute));
			}
		});
		$('.prevList .preview').slice(items.previews.length).remove();


		setTimeout(function(){
			$('.article, .preview').removeClass('animateSlideTop');
		},600);

		this.displayed = {
			articles: items.articles,
			previews: items.previews
		}

		this.started = data.dateStart != 0;

	}
	setData(app, data){

		this.id = data.idCourse;
		this.total = data.total;
		this.maxPrice = data.max;
		$('#maxprice').html(data.max + app.params.currency);
		this.monthCost = data.monthly;
		this.coef = data.coef;
		this.old = data.oldCourse;

		app.totalPP(0, true);

		var attribute = "";
		if (this.old) {
			attribute = "disabled";
		}

		var iter = 0;
		data.articles.forEach((article, index) => {
			iter++;
			if (this.displayed.articles[index]) {
				if (article.id != this.displayed.articles[index].id){
					$('.list .article').eq(index).after(Generate.article(article.id, article.titre, article.prix, app, 'animateSlideTop', attribute));
					$('.list .article').eq(index).remove();
				}
			}
			else{
				$('.list').append(Generate.article(article.id, article.titre, article.prix, app, 'animateSlideTop', attribute));
			}
		});


		if (iter < this.displayed.articles.length) {
			$('.list .article').slice(iter).remove();
		}

		iter = 0;
		data.previews.forEach((preview, index) => {
			iter++;
			if (this.displayed.previews[index]) {
				if (preview.id != this.displayed.previews[index].id){
					$('.prevList .preview').eq(index).after(Generate.preview(preview.id, preview.titre, preview.color, app, 'animateSlideTop', attribute));
					$('.prevList .preview').eq(index).remove();
				}
			}
			else{
				$('.prevList').append(Generate.preview(preview.id, preview.titre, preview.color, app, 'animateSlideTop', attribute));
			}
		});

		if (iter < this.displayed.previews.length) {
			$('.prevList .preview').slice(iter).remove();
		}

		setTimeout(function(){
			$('.article, .preview').removeClass('animateSlideTop');
		},600);

		this.displayed = {
			articles: data.articles,
			previews: data.previews
		}

		this.started = data.startedState;

	}
}