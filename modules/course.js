import App from './app.js';
import Generate from './generate.js';

export default class Course{
	constructor(){
		this.id;
		this.total;
		this.maxPrice;
		this.coef;
		this.displayed = {
			articles: new Array(),
			previews: new Array()
		};
		this.monthlyPaid;
		this.started;
		this.old;

		this.priceCursor = {
			index: null,
			el: null
		};
	}
	totalPP(constante, loadPage = false, appl = app){
		if(loadPage == true){
			$('#totalDep').html((this.total).toFixed(2) + appl.params.currency);
			$('#moiDep').html((this.monthlyPaid).toFixed(2) + appl.params.currency);
			$('#moiPrev').html((this.total * this.coef).toFixed(2) + appl.params.currency);
			$('#anPrev').html((this.total * this.coef * 12).toFixed(2) + appl.params.currency);
			if(this.maxPrice < this.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
		else{
			constante = parseFloat(constante);
			this.total += constante;
			this.monthlyPaid += constante;
			$('#totalDep').html((this.total).toFixed(2) + appl.params.currency);
			$('#moiDep').html((this.monthlyPaid).toFixed(2) + appl.params.currency);
			$('#moiPrev').html((this.total * this.coef).toFixed(2) + appl.params.currency);
			$('#anPrev').html((this.total * this.coef * 12).toFixed(2) + appl.params.currency);
			if(this.maxPrice < this.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
	}
	setData(data, appl){

		this.id = data.idCourse;
		this.total = data.total;
		this.maxPrice = data.max;
		$('#maxprice').html(data.max + appl.params.currency);
		this.monthlyPaid = data.monthly;
		this.coef = data.coef;
		this.old = data.oldCourse;

		this.totalPP(0, true, appl);

		var attribute = "";
		if (this.old) {
			attribute = "disabled";
		}

		var iter = 0;
		data.articles.forEach((article, index) => {
			iter++;
			if (this.displayed.articles[index]) {
				if (article.id != this.displayed.articles[index].id){
					$('.list .article').eq(index).after(Generate.article(article.id, article.titre, article.prix, appl, 'animateSlideTop', attribute));
					$('.list .article').eq(index).remove();
				}
			}
			else{
				$('.list').append(Generate.article(article.id, article.titre, article.prix, appl, 'animateSlideTop', attribute));
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
					$('.prevList .preview').eq(index).after(Generate.preview(preview.id, preview.titre, preview.color, appl, 'animateSlideTop', attribute));
					$('.prevList .preview').eq(index).remove();
				}
			}
			else{
				$('.prevList').append(Generate.preview(preview.id, preview.titre, preview.color, appl, 'animateSlideTop', attribute));
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