define(function(require){
	
	var Screen = require("common/screen");
	var DataBus = require("common/databus");
    var GameManager = require("common/gamemanager");
	
	var $scores = $(require("stache!html/beamer.scores")());
    var $frame = $(require("stache!html/beamer.frame")());

	return function() {
		Screen.add($scores);
		Screen.add($frame);

        /**
         * BEAMER CONTROL
         */

        DataBus.register(/^beamer.show$/, function(data){
            switch(data.beamer.show){
                default:
                case "screensaver":
                    Screen.showScreensaver();
                    break;

                case "logo":
                    Screen.showLoading();
                    break;

                case "scores":
                    Screen.enable($scores);
                    break;

                case "gameframe":
                    Screen.enable($frame);
                    break;
            }
        });

        /**
         * GAME FRAME
         */
        DataBus.register("active", function(data){
            GameManager.drawGameFrame(data);

        });

        DataBus.register("step", function(data){
            GameManager.drawGameFrame(data);

        });

        DataBus.register(/^games.(.+).state/, function(data){
            GameManager.drawGameFrame(data);

        });

    };


});
