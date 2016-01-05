(function($) {
    $.fn.extend({
        /*
            $('selector').myplugin( { key: 'value' } );
            $('selector').myplugin( 'mymethod1', 'argument' );
        */
        ukagaka: function(options, arg) {
            if (options && typeof(options) == 'object') {
                options = $.extend({}, $.ukagaka.defaults, options);
            } else {
                options = $.extend($.ukagaka.defaults, options);
            }

            this.each(function() {
                new $.ukagaka(this, options, arg);
            });
            return;
        }
    });

    $.ukagaka = function(elem, options, arg) {

        if (options && typeof(options) == 'string') {
            if (options == 'loadTalk') {
                loadTalk(options);
            }
            return;
        } else {
            init(elem, options);
        }

        function init(elem, options) {
            var o = options;

            var obj = $(elem);

            var sheetfield = o.googleSheetField;

            var loadingText = o.loadingText,
                learnPlaceholder = o.learnPlaceholder,
                logText = o.logText,
                menuMainText = o.menuMainText,
                menuLearnText = o.menuLearnText,
                menuLogText = o.menuLogText,
                menuExitText = o.menuExitText,
                menuCancelText = o.menuCancelText,
                menuSubmitText = o.menuSubmitText,
                menuQueryText = o.menuQueryText;
            ukagakaText = o.ukagakaText;

            var footerMenuHTML = "";
            footerMenuHTML += "<div id='ukagaka_controlpanel'><ul>";
            // footerMenuHTML += "<input id='ukagaka_usertalk'>";
            footerMenuHTML += "<li id='ukagaka_btn_up'><i class='fa-arrow-up'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_down'><i class='fa-arrow-down'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_menu'><i class='fa-pencil'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_music'><i class='fa-music'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_refresh'><i class='fa-refresh'></i></li>";
            footerMenuHTML += "<li id='ukagaka_btn_power'><i class='fa-power-off'></i></li>";
            // footerMenuHTML += "<li id='ukagaka_btn_mail'><i class='fa-mail'></i></li>";
            footerMenuHTML += "</ul></div>";

            var dialogHTML = "";
            dialogHTML += playerHTML();
            dialogHTML += "<div class='ukagaka_box'>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_msgbox'></div>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_menubox' style='display:none'>" + menuMainText + "<br/><br/><span id='ukagaka_menu_btn_addstring'>" + menuLearnText + "</span><span id='ukagaka_menu_btn_renewlist'></br>" + menuLogText + "</span><span id='ukagaka_menu_btn_exit'></br>" + menuExitText + "</span></div>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_stringinput' style='display:none'>" + menuQueryText + "<input id='ukagaka_addstring' type='text' placeholder='" + learnPlaceholder + "'/><br/><span id='ukagaka_addmenu_add'>" + menuSubmitText + "</span><span id='ukagaka_btn_menu'>" + menuCancelText + "</span></div>";
            dialogHTML += "<div class='ukagaka_msg' id='ukagaka_renewlist' style='display:none'>" + logText + "<span id='ukagaka_btn_menu'>" + menuCancelText + "</span></div>";
            dialogHTML += "<input id='ukagaka_sheetfield' type='hidden' value='" + sheetfield + "'>";
            dialogHTML += "</div>";


            var innerSettingHTML = "";
            innerSettingHTML += "<div id='ukagaka_logbox' class='ukagaka_block'>";
            innerSettingHTML += "<div class=\"chat-box-content\">" + dialogHTML + "</div>";
            innerSettingHTML += "</div>";

            obj.append(innerSettingHTML);
            obj.after(footerMenuHTML);
            obj.after("<img class='ukagaka_img' src='" + options.imgs[0] + "'></img>");

            /* $.ajax({
                    type: 'GET',
                    url: 'http://localhost:8080',
                    data: sendData,
                    success: function(JData){
                        var NumOfJData = JData.length;
                        console.log(JData);
                    }
                });*/

            loadTalk(options);

            actionSetting(options, elem);

            playerDeploy();

            //$("#playblock").hide();
            //$("#ukagaka_logbox").hide();
        }

        function loadTalk(options) {
            var o = options;

            var key = o.googleKey,
                sheet = o.googleSheet,
                formkey = o.googleFormkey,
                sheetfield = o.googleSheetField;

            $.getJSON("https://spreadsheets.google.com/feeds/list/" + key + "/" + sheet + "/public/values?alt=json", function(JData) {
                for (var i = 0; i < JData.feed.entry.length; i++) {
                    $.ukagaka.talking[i] = JData.feed.entry[i].gsx$storedatabase.$t;
                }
                showText($.ukagaka.talking[Math.floor(Math.random() * $.ukagaka.talking.length)]);
                $('input#ukagaka_addstring').attr('placeholder', ukagakaText + '学习了' + JData.feed.entry.length + '条人生经验');
            });
        }

        function showText(text) {
            $.ukagaka.nextText = text;
        }

        function sendLearnText(options) {
            var o = options;

            var key = o.googleKey,
                sheet = o.googleSheet,
                formkey = o.googleFormkey,
                sheetfield = o.googleSheetField;

            var add = $("input#ukagaka_addstring").val(),
                googleSheetField = $('input#ukagaka_sheetfield').val(),
                sendData = {};
            sendData[googleSheetField] = add;
            if (!((add.length <= 1) || add.indexOf('script') > -1 || add.indexOf('body') > -1 ||
                add.indexOf('style') > -1 || add.indexOf('link') > -1 || add.indexOf('iframe') > -1 || add.indexOf('head') > -1 ||
                add.indexOf('nav') > -1 || add.indexOf('object') > -1 || add.indexOf('embed') > -1)) {
                $.ajax({
                    type: 'POST',
                    url: 'https://docs.google.com/forms/d/' + formkey + '/formResponse',
                    data: sendData,
                    dataType: "xml",
                    statusCode: {
                        0: function() {
                            $("input#ukagaka_addstring").attr("value", "");
                            $(".ukagaka_box div").fadeOut(500);
                            showText(ukagakaText + "又学习了一个 !");
                        },
                        200: function() {
                            $("input#ukagaka_addstring").attr("value", "");
                            $(".ukagaka_box div").fadeOut(500);
                            showText(ukagakaText + "又学习了一个 !");
                        }
                    }
                });
            } else {
                alert("OOPS！" + ukagakaText + "不姿瓷！");
            }
        }

        function typed(text) {
            setInterval(function() {
                if ($.ukagaka.nowText == $.ukagaka.nextText)
                    return;
                $("#ukagaka_msgbox").typed('reset');
                $.ukagaka.nowText = $.ukagaka.nextText;
                $("#ukagaka_msgbox").typed({
                    strings: [$.ukagaka.nowText],
                    typeSpeed: 10,
                    contentType: 'html',
                    loop: false,
                    backDelay: 500,
                    loopCount: false,
                    callback: function() {},
                    resetCallback: function() {}
                });
            }, 1000);
        }

        function actionSetting(options, elem) {
            typed('');

            var obj = $(elem);

            var o = options;

            var loadingText = o.loadingText,
                learnPlaceholder = o.learnPlaceholder,
                logText = o.logText,
                menuMainText = o.menuMainText,
                menuLearnText = o.menuLearnText,
                menuLogText = o.menuLogText,
                menuExitText = o.menuExitText,
                menuCancelText = o.menuCancelText,
                menuSubmitText = o.menuSubmitText,
                menuQueryText = o.menuQueryText;

            $("#ukagaka_usertalk").hide();
            if (navigator.userAgent.match(/Android|iPhone|iPad/i)) {
                $("#playblock").hide();
                $(".ukagaka_img").hide();
                $(".ukagaka_box").hide();
            } else {
                $(window).load(function() {
                    var talk_timer = setInterval(talkingbox, o.talkTime);

                    function talkingbox() {
                        if ($("#ukagaka_msgbox").css("display") != 'none' && $.ukagaka.talkValid == true) {
                            showText($.ukagaka.talking[Math.floor(Math.random() * $.ukagaka.talking.length)]);
                        }
                    }
                });
                loadTalk(options);
            }
            showText(loadingText);
            
            $("#ukagaka_usertalk").keypress(function(e) {
                code = (e.keyCode ? e.keyCode : e.which);
                if (code == 13) {
                    var sendData = {};
                    sendData['msg'] = $("#ukagaka_usertalk").val();
                    $("#ukagaka_usertalk").val("");
                    $.ajax({
                        type: 'GET',
                        url: 'http://140.115.205.194:8080',
                        data: sendData,
                        success: function(JData) {
                            showText(JData);
                        },
                        error: function(argument) {
                            showText("主機關閉中 ...");
                        }
                    });
                }
            });

            $(document).on('click', "#ukagaka_btn_mail", function(event) {
                // $("#ukagaka_usertalk").toggle('slide', null, 500)
                alert('AIML 入口，正在永久推遲建造 ...');
            }).on('click', "#ukagaka_btn_music", function(event) {
                // $("#ukagaka_usertalk").toggle('slide', null, 500)
                $("#playblock").toggle('slide', null, 500);
            }).on('click', "#ukagaka_btn_up", function(event) {
                $("html,body").animate({
                    scrollTop: 0
                }, 1000);
            }).on('click', "#ukagaka_btn_down", function(event) {
                $("html,body").animate({
                    scrollTop: document.body.scrollHeight
                }, 1000);
            }).on('click', "#ukagaka_menu_btn_exit", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_msgbox").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_btn_menu", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_menubox").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_menu_btn_addstring", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_stringinput").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_menu_btn_renewlist", function(event) {
                $(".ukagaka_box div").fadeOut(500);
                $("#ukagaka_renewlist").delay(500).fadeIn(500);
            }).on('click', "#ukagaka_addmenu_add", function(event) {
                sendLearnText(options);
            }).on('click', "#ukagaka_btn_refresh", function(event) {
                $(".ukagaka_img").attr("src", options.imgs[Math.floor(Math.random() * options.imgs.length)]);
            }).on('click', "#ukagaka_btn_power", function(event) {
                $(".chat-box-content, .ukagaka_img").toggle();
            });
        }

        function playerHTML() {
            var html;
            var header = '',
                ctrl = '',
                progress = '';
            header += '<div class="tag"><strong>Title</strong><span class="artist">Artist</span><span class="album">Album</span></div>';
            ctrl += '<div class="control">';
            ctrl += '<i class="fa-backward"></i><i class="fa-play"></i><i class="fa-forward"></i>';
            ctrl += '<span class="progress"><i class="fa-repeat"></i><i class="fa-random"></i></span>';
            ctrl += '<span class="volume"><i class="fa-volume-up"></i><div class="slider"><div class="pace"></div></div></span>';
            ctrl += '</div>';
            progress += '<div class="progress"><div class="slider"><div class="loaded"></div><div class="pace"></div></div><div class="timer right">0:00</div></div>';

            html = '<div id="playblock"><div id="player"><div class="ctrl">';
            html = html + header + ctrl + progress;
            html = html + '</div></div></div>';
            return html;
        }

        function playerDeploy() {
            var player = $('#playblock');
            var repeat = localStorage.repeat || 0,
                shuffle = localStorage.shuffle || 'false',
                continous = true,
                autoplay = false,
                playlist = [{
                    title: 'Time After Time - 花舞う街で',
                    artist: '倉木麻衣',
                    album: '',
                    cover: '',
                    mp3: '/file/Time After Time.mp3',
                    ogg: '/file/Time After Time.mp3'
                },{
                    title: '轮回之境',
                    artist: 'Critty',
                    album: '',
                    cover: '',
                    mp3: '/file/轮回之境.mp3',
                    ogg: '/file/轮回之境.mp3'
                }];

            var time = new Date(),
                currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
                trigger = false,
                audio, timeout, isPlaying, playCounts;

            var play = function() {
                audio.play();
                player.find('.fa-play').addClass('fa-pause');
                timeout = setInterval(updateProgress, 500);
                isPlaying = true;
            }

            var pause = function() {
                audio.pause();
                player.find('.fa-play').removeClass('fa-pause');
                clearInterval(updateProgress);
                isPlaying = false;
            }

            // Update progress
            var setProgress = function(value) {
                var currentSec = parseInt(value % 60) < 10 ? '0' + parseInt(value % 60) : parseInt(value % 60),
                    ratio = value / audio.duration * 100;

                player.find('.timer').html(parseInt(value / 60) + ':' + currentSec);
                player.find('.progress .pace').css('width', ratio + '%');
                player.find('.progress .slider a').css('left', ratio + '%');
            }

            var updateProgress = function() {
                setProgress(audio.currentTime);
            }

            // Progress slider
            player.find('.progress .slider').slider({
                step: 0.1,
                slide: function(event, ui) {
                    $(this).addClass('enable');
                    setProgress(audio.duration * ui.value / 100);
                    clearInterval(timeout);
                },
                stop: function(event, ui) {
                    audio.currentTime = audio.duration * ui.value / 100;
                    $(this).removeClass('enable');
                    timeout = setInterval(updateProgress, 500);
                }
            });

            // Volume slider
            var setVolume = function(value) {
                audio.volume = localStorage.volume = value;
                player.find('.volume .pace').css('width', value * 100 + '%');
                player.find('.volume .slider a').css('left', value * 100 + '%');
            }

            var volume = localStorage.volume || 0.5;
            player.find('.volume .slider').slider({
                max: 1,
                min: 0,
                step: 0.01,
                value: volume,
                slide: function(event, ui) {
                    setVolume(ui.value);
                    $(this).addClass('enable');
                    player.find('.fa-volume-up').removeClass('enable');
                },
                stop: function() {
                    $(this).removeClass('enable');
                }
            }).children('.pace').css('width', volume * 100 + '%');

            player.find('.fa-volume-up').click(function() {
                if ($(this).hasClass('enable')) {
                    setVolume($(this).data('volume'));
                    $(this).removeClass('enable').removeClass('fa-volume-off');
                } else {
                    $(this).data('volume', audio.volume).addClass('enable').addClass('fa-volume-off');
                    setVolume(0);
                }
            });

            // Switch track
            var switchTrack = function(i) {
                if (i < 0) {
                    track = currentTrack = playlist.length - 1;
                } else if (i >= playlist.length) {
                    track = currentTrack = 0;
                } else {
                    track = i;
                }

                $('audio').remove();
                loadMusic(track);
                if (isPlaying == true) play();
            }

            // Shuffle
            var shufflePlay = function() {
                var time = new Date(),
                    lastTrack = currentTrack;
                currentTrack = time.getTime() % playlist.length;
                if (lastTrack == currentTrack)++currentTrack;
                switchTrack(currentTrack);
            }

            // Fire when track ended
            var ended = function() {
                pause();
                audio.currentTime = 0;
                playCounts++;
                if (continous == true) isPlaying = true;
                if (repeat == 1) {
                    play();
                } else {
                    if (shuffle === 'true') {
                        shufflePlay();
                    } else {
                        if (repeat == 2) {
                            switchTrack(++currentTrack);
                        } else {
                            if (currentTrack < playlist.length) switchTrack(++currentTrack);
                        }
                    }
                }
            }

            var beforeLoad = function() {
                var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
                player.find('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) + '%');
            }

            // Fire when track loaded completely
            var afterLoad = function() {
                if (autoplay == true) play();
            }

            // Load track
            var loadMusic = function(i) {
                var item = playlist[i],
                    newaudio = $('<audio>').html('<source src="' + item.mp3 + '"><source src="' + item.ogg + '">').appendTo('#player');

                player.find('.tag').html('<strong>' + item.title + '</strong><span class="artist">' + item.artist + '</span><span class="album">' + item.album + '</span>');
                // player.find('#playlist li').removeClass('playing').eq(i).addClass('playing');
                audio = newaudio[0];
                audio.volume = player.find('.fa-volume-up').hasClass('enable') ? 0 : volume;
                audio.addEventListener('progress', beforeLoad, false);
                audio.addEventListener('durationchange', beforeLoad, false);
                audio.addEventListener('canplay', afterLoad, false);
                audio.addEventListener('ended', ended, false);
            }

            loadMusic(currentTrack);
            player.find('.fa-play').on('click', function() {
                if ($(this).hasClass('fa-pause')) {
                    pause();
                } else {
                    play();
                }
            });
            player.find('.fa-forward').on('click', function() {
                if (shuffle === 'true') {
                    shufflePlay();
                } else {
                    switchTrack(--currentTrack);
                }
            });
            player.find('.fa-backward').on('click', function() {
                if (shuffle === 'true') {
                    shufflePlay();
                } else {
                    switchTrack(++currentTrack);
                }
            });

            if (shuffle === 'true') player.find('.fa-random').addClass('enable');
            if (repeat == 1) {
                player.find('.repeat').addClass('once');
            } else if (repeat == 2) {
                player.find('.repeat').addClass('all');
            }

            player.find('.fa-repeat').on('click', function() {
                if ($(this).hasClass('once')) {
                    repeat = localStorage.repeat = 2;
                    $(this).removeClass('once').addClass('all').addClass('fa-refresh');
                } else if ($(this).hasClass('all')) {
                    repeat = localStorage.repeat = 0;
                    $(this).removeClass('all').removeClass('fa-refresh');
                } else {
                    repeat = localStorage.repeat = 1;
                    $(this).addClass('once');
                }
            });

            player.find('.fa-random').on('click', function() {
                if ($(this).hasClass('enable')) {
                    shuffle = localStorage.shuffle = 'false';
                    $(this).removeClass('enable');
                } else {
                    shuffle = localStorage.shuffle = 'true';
                    $(this).addClass('enable');
                }
            });
        }
    };

    $.ukagaka.defaults = {
        googleKey: '1V4ZjHqiItSJuNov0TkwfSTESALr5XEILfdzAu1xd9ys',
        googleFormkey: '1BPzP_o86Lruxu60S0C8_MHYEzwPk67BY3hkb-3wPu0M',
        googleSheet: "1",
        googleSheetField: "entry.1522432738",
        talkTime: 60000,

        ukagakaText: "和美",
        loadingText: '貌似被墙了呢.^100.^100.',
        learnPlaceholder: "被墙了还怎么学习？",
        menuMainText: "使用選單功能&#65292; 不是钦点！",
        menuLearnText: "$ 学习一个",
        menuLogText: "$ 大新闻",
        menuExitText: "$ 結束",
        menuCancelText: "$ 取消",
        menuSubmitText: "$ 確認",
        menuQueryText: "提高姿势水平<br/>",
        logText: "Shintaku 修正<br/>找尋 AI 系統<br/>谈笑风生<br/>",
        imgs: ['/img/uk0.png']
    };

    $.ukagaka.talking = [];

    $.ukagaka.talkValid = true;
    $.ukagaka.nextText = '';
    $.ukagaka.nowText = '';

})(jQuery);