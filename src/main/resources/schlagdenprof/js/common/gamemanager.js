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
    }

    var self = {};

    var replace = function($root, $el, fnIn, fnOut) {
        $root.children().not($el).filter(":visible").remove();

        $root.append($el);
        $el.show();

    }

    self.drawGameFrame = function(data) {
        var active = data.active;
        var game = data.games[data.active];

        if(!game) return;

        var step = data.step;

        if(!step) step = null;

        var $container = $("<div>");
        $container.data("active", active);

        $.each(game.sequence, function(i, config){
            var type = config.slice(0,1);
            var args = config.slice(1);
            var pos = i+1;
			var gc = GameContext(data, null, pos);

            var $el = Games[type].drawBeamer(gc);
			var $div = $("<div>");
			$div.html($el);
            $div.addClass("frame");
            $div.data("step", pos);
            if(pos!=step) $div.hide();
            $container.append($div);

        });

        replace($("#game-content"), $container);


    };

    self.drawModControl = function(data) {
        var active = data.active;
        var game = data.games[active];
        var step = data.step;

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
		
		$container.find("[data-content]").each(function(i,el){
			var $el = $(el);

			if($el.data("content") != "control-panel")
				return;

			var pos = $el.data("pos");
			var gc = GameContext(data, null, pos);

			var $control = Games[gc.getType()].drawControl(gc);
			$el.html($control);

		});


        replace($("#mod-control"), $container);
        $("#mod-control").parents(".panel").show();

    };

    return self;


});
