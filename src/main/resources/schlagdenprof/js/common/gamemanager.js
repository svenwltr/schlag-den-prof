define(function(require){

    var DataBus = require("common/databus");
	var GameContext = require("common/gamecontext");

    var ModSeqStache = require("stache!html/mod.seq");

    var Games = {
        score : require("games/score"),
		image : require("games/image"),
		mappick : require("games/mappick"),
		text : require("games/text"),
		countdown : require("games/countdown"),
		question : require("games/question")
    }

    var self = {};
	var our = {};
	our.$overlays = $();
	our.player = null;

    var replace = function($root, $el, fnIn, fnOut) {
        $root.children().not($el).filter(":visible").remove();

        $root.append($el);
        $el.show();

    }

    self.drawGameFrame = function(data) {
        var active = data.active;
        var game = data.games[data.active];
		var step = data.step;

        if(!game || !step) {
			$("#game-content").html("");
			$("#game-player-input").html("");
			our.$lastBeamerElement = null;

		} else {
			try {
				var gc = GameContext();
				var $el = Games[gc.getType()].drawBeamer(gc);
				if(!our.$lastBeamerElement || !our.$lastBeamerElement.is($el))
					$("#game-content").html($el);
				
				our.$lastBeamerElement = $el;

			} catch(e) {
				return;

			}

			var $overlays = $();

			if(game.overlay)
			$.each(game.overlay, function(i, config){
				var type = config[0];
				var args = config.slice(1);
				var $el = Games[type].drawOverlay(args, gc);

				$overlays = $overlays.add($el);

			});

			$("#game-overlays").html($overlays);

			if(our.player && Games[gc.getType()].drawPlayer) {
				var $el = Games[gc.getType()].drawPlayer(gc, our.player);
				$("#game-player-input").html($el);
				$("input").select();

			} else {
				$("#game-player-input").html("");
			}

		}

    };

    self.drawStrokeControl = function(data) {
        var active = data.active;
        var game = data.games[active];
        var step = data.step;
		var gc = GameContext(data);

        if(!game) {
            $("#mod-control").parents(".panel").hide();
            return;
        }

        var ctx = {
            items : [],
            idle : !Boolean(step)
        };




        $.each(game.sequence, function(i, config){
            var type = config.slice(0,1);
            var args = config.slice(1);
            var pos = i+1;

			var meta = {};
			meta.name = Games[type].name;
            meta.pos = pos;
			meta.info = "";

			if(Games[type].getInfo)
				meta.info = Games[type].getInfo(args);

            if(step === pos)
                meta.active = true;

            ctx.items.push(meta);

        });

        var $container = $(ModSeqStache(ctx));

        $container.find("[data-action]").click(function(){
            var action = $(this).data("action");
            var pos = $(this).data("pos");

            if(action == "stop" || action == "jump")
            {
                if(action == "stop")
                    pos = null;

                DataBus.send("step", pos);

            }
        });
		
        //replace($("#mod-control"), $container);
		var $old = $("#mod-control").children();
		$("#mod-control").append($container);
		$old.remove();
        $("#mod-control").parents(".panel").show();

		var Stache = require("stache!html/mod-overlay-control");
		var game = Games[gc.getType()];

		if(game) {
			var $el = $(Stache({
				name: game.name
			}));
			$("#mod-fuck-it").html($el);
			$el.find(".panel-body").html(Games[gc.getType()].drawControl(gc));
		}
		
		var $activeButton = $("[data-pos='"+step+"'][data-action='jump']");
		if($activeButton.offset())
			$('html, body').animate({
				"scrollTop":
				$activeButton.offset().top - 100
			}, 0);

    };

	self.drawOverlayControl = function(data) {
		var $container = $("#mod-overlays");
		var $overlays = $();
		var Stache = require("stache!html/mod-overlay-control");

		if(data.games && data.active &&
			data.games[data.active] &&
			data.games[data.active].overlay)
		{
			$.each(data.games[data.active].overlay, function(i, config){
				var type = config[0];
				var args = config.slice(1);

				var $el = $(Stache({name:Games[type].name}));

				$el.find(".panel-body").html(
					Games[type].drawControl(GameContext(data), args)
				);
				$overlays = $overlays.add($el);

			});
	   	}

		$container.html($overlays);

	};

	self.setPlayer = function(player) {
		our.player = player;
	};

	self.tick = function() {
		var gc = GameContext();
		var game = Games[gc.getType()];
		var beamerShow = DataBus.get("beamer.show");
		var round = gc.getRound();
		var stroke = gc.getStroke();

		if(!round) {
		   	if(beamerShow != 'logo')
				DataBus.send("beamer.show", "logo");
			else
				DataBus.send("", {
					step: 0,
					active: 1,
					beamer: {show: "gameframe"}
				});

		}

		else if(!stroke || stroke < 1) {
			if(beamerShow != 'gameframe')
				DataBus.send("beamer.show", "gameframe");
			else
				DataBus.send("step", 1);

		}

		else {
			var ticked = game && game.tick && game.tick(gc);
			var nextStroke = stroke

			if(!ticked) {
				nextStroke++;
				DataBus.send("step", nextStroke);
			}

			if(nextStroke > gc.getGame().sequence.length) {
				if(beamerShow == 'gameframe')
					DataBus.send("beamer.show", "scores");
				else
					DataBus.send("beamer.show", "logo");
			}

		}

	};

	self.nextRound = function() {
		var gc = GameContext();
		var round = gc.getRound();
		DataBus.send("", {
			active: round + 1,
			step : 0
		});

	};

	self.jumpTo = function(game) {
		var gc = GameContext();
		var gameData = gc.getGame();
		var stroke = gc.getStroke();

		$.each(gameData.sequence, function(i, config){
			var pos = i+1;
			if(pos >= stroke && config[0] == game) {
				DataBus.send("step", pos);
				return false;
			}
		});
	};

    return self;


});
