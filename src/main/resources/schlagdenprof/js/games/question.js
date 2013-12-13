define(function(require){

	var StacheText = require("stache!html/game-question-text");
	var StacheMod = require("stache!html/game-question-mod");

	var self = {};
	var our = {};

	self.drawOverlay = function(args, gc){
	};

	self.drawBeamer = function(gc){
		var question = gc.getArg(0);
		var answer = gc.getArg(1);

		var $el = $("<div>");
		$el.addClass("layer layer-crophud");

		var display = gc.getState("display", "question");

		switch(display) {
			case "answer":
				$el.prepend(
					$("<div>").
					addClass("layer layer-c layer-bigtext").
					text(answer)
				);

			case "output":
				$el.prepend(
					$("<div>").
					addClass("layer layer-e layer-text").
					text("Stud")
				);
				$el.prepend(
					$("<div>").
					addClass("layer layer-w layer-text").
					text("Prof")
				);
			case "input":
			case "question":
				$el.prepend(
					$("<div>").
					addClass("layer layer-n layer-text").
					text(question)
				);
				break;
				
		};

		return $el;

	};

	self.drawControl = function(gc){
		// don't redraw on same position
		//if(our.lastControl && our.lastControl.gc.isSamePosition(gc))
		//	return our.lastControl.$el;

		var kwargs = gc.getArgs()[0];
		var $control = $(StacheMod({
			question : gc.getArg(0),
			answer : gc.getArg(1)
		}));

		var $btns = $control.find("[data-display]");
		$btns.filter("[data-display='"+gc.getState("display", "question")+"']").
			addClass("btn-primary");

		$btns.click(function(){
			var $btn = $(this);
			var display = $btn.data("display");

			$btns.not($btn).removeClass("btn-primary");
			$btn.addClass("btn-primary");

			gc.sendState({
				display : display
			});

		});


		our.lastControl = {gc:gc, "$el": $control}
		return $control;

	};

	self.drawPlayer = function(gc, player){
		var display = gc.getState("display", "question");

		if(display != "input")
			return "";

		var $el = $("<div>");
		var $input = $("<input>");

		$el.addClass("layer layer-c layer-input");
		$el.css("height", "200px");
		$el.append($input);
		
		return $el;

	};


	return self;

});
