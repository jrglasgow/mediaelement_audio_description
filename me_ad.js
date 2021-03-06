(function($) {

  // Audio Description toggle
  MediaElementPlayer.prototype.buildaudioDescription = function(player, controls, layers, media) {
    // ensure there is an descriptions audioTrack before we add the button to
    // turn it on
    var descriptionTrackSrc = false,
        audioTrack = false;
    for (var i in player.media.childNodes) {
      if (player.media.childNodes[i].hasOwnProperty &&
          player.media.childNodes[i].tagName === 'AUDIOTRACK') {
        audioTrack = player.media.childNodes[i];
        if ($(audioTrack).attr('kind') === 'description' ) {
          descriptionTrackSrc = $(audioTrack).attr('src');
          player.options.audioDescriptionType = $(audioTrack).attr('type');
        }
      }
    }

    if (descriptionTrackSrc) {

      /**
       * switch to the AD captions
       */
      player.displayADCaptions = function() {
        var player = this;
        if (player.selectedTrack) {
          // captions are currently turned on, switch to AD captions if available
          currentLanguage = player.selectedTrack.srclang;
          // check to see if there is a text track with the same language
          // but with audio descriptions
          for (var i in player.tracks) {
            if (player.tracks[i].hasOwnProperty && player.tracks[i].srclang == currentLanguage + '-ad') {
              player.loadTrack(i);
              player.selectedTrack = player.tracks[i];
            }
          }
        }
      };

      // override the normal player.displayCaptions function as there is no
      // trigger we cannot add a listener
      player.displayCaptionsOriginal = player.displayCaptions;
      player.displayCaptions = function() {
        player.displayCaptionsOriginal();
        if (player.options.audioDescriptions) {
          player.displayADCaptions();
        }
      };

      // create the audio element to append to the .mejs-mediaelement div which
      // contains the video
      var audio = document.createElement('audio');
      $(audio).attr('preload', 'auto');
      var source = document.createElement('source');
      $(source).attr('src', descriptionTrackSrc);
      var srcExt = descriptionTrackSrc.split('.').pop();
      if (srcExt === 'mp3') {
        srcType = 'audio/mpeg';
      }
      if (srcType) {
        $(source).attr('type', srcType);
      }
      $(audio).append(source);
      $(audio).attr('id', player.id + '-audio_description');
      $('#' + player.id + ' .mejs-mediaelement').append(audio);
      $('#' + player.id + '-audio_description').mediaelementplayer({
        pauseOtherPlayers: false,
      });
      
      var
        // create the Audio Descriptions button
        audioDescription =
          $('<div class="mejs-button mejs-ad-button ' + ((player.options.ad) ? 'mejs-ad-on' : 'mejs-ad-off') + '">' +
              '<button type="button" aria-controls="' + player.id + '" title="' + 'Audio Description Toggle' + '">' +
                '<span class="mejs-button"></span>' +
              '</button>' +
          '</div>')
          // append it to the toolbar
          .appendTo(controls)
          // add a click toggle event
          .click(function() {
            player.options.audioDescriptions = !player.options.audioDescriptions;
            // get the id of the audio description player so we can make changes
            adPlayerID = $('#' + player.id + ' .mejs-mediaelement .mejs-audio').attr('id').split('_')[1];
            if (typeof mejs.players[adPlayerID] === 'undefined') {
              adPlayerID = 'mep_' + adPlayerID;
            }
            
            var adPlayer = mejs.players[adPlayerID],
                currentLanguage = '';
            if (player.options.audioDescriptions) {
              // audio descriptions is on
              audioDescription.removeClass('mejs-ad-off').addClass('mejs-ad-on');
              $('.mejs-ad-button span.mejs-button').text('Stop Audio Descriptions');
              // ensure the ad player is synced
              // ensure the ad player volume is up so it can be heard
              if (!player.media.paused) {
                // only start playing if the video is playing
                adPlayer.play();
              }
              meADSync(player, adPlayer);
              // the default behavior is to expect the AD audio file to contain
              // all audio so the video player is muted
              player.prevVolume = player.getVolume();
              if (player.options.audioDescriptionType !== 'additive') {
                adPlayer.setVolume(player.prevVolume);
                player.setVolume(0);
              }
              else {
                // set the audio player to the same volume as the video player
                adPlayer.setVolume(player.prevVolume);
              }

              player.displayADCaptions();
            }
            else {
              // audio descriptions is off
              audioDescription.removeClass('mejs-ad-on').addClass('mejs-ad-off');
              $('.mejs-ad-button span.mejs-button').text('Play Audio Descriptions');

              // turn the volume down
              adPlayer.setVolume(0);
              // turn the video player volume back up
              player.setVolume(player.prevVolume);

              if (player.selectedTrack) {
                // captions are currently turned on, switch to AD captions if available
                currentLanguage = player.selectedTrack.srclang.split('-')[0];
                // check to see if there is a text track with the same language
                // but with audio descriptions
                for (var j in player.tracks) {
                  if (player.tracks[j].hasOwnProperty && player.tracks[j].srclang == currentLanguage) {
                    player.loadTrack(j);
                    player.selectedTrack = player.tracks[j];
                  }
                }
              }
            }
          });

      // add play event listener
      player.media.addEventListener('play', function() {
        player = meGetPlayer(this);
        adPlayer = meGetADPlayer(this);

        adPlayer.play();
        meADSync(player, adPlayer);
        if (player.options.audioDescriptions) {
          adPlayer.setVolume(player.volume);
        }
        else {
          adPlayer.setVolume(0);
        }
      });

      // add pause event listener
      player.media.addEventListener('pause', function() {
        player = meGetPlayer(this);
        adPlayer = meGetADPlayer(this);
        meADSync(player, adPlayer);
        adPlayer.pause();
      });

      // add seeked event listener
      player.media.addEventListener('seeked', function() {
        player = meGetPlayer(this);
        adPlayer = meGetADPlayer(this);
        meADSync(player, adPlayer);
      });
    }
  };

  /**
   * Sync the time of the video player and the audio player
   */
  function meADSync(player, adPlayer) {
    adPlayer.setCurrentTime(player.media.currentTime);
  }

  /**
   * get the video player object
   */
  function meGetPlayer(video) {
    var playerID = $(video).parents('.mejs-container').attr('id').split('mep_')[1];
    if (typeof mejs.players[playerID] !== 'undefined') {
      return mejs.players[playerID];
    }
    else {
      playerID = 'mep_' + playerID;
      player = mejs.players[playerID];
      return player;
    }
  }

  /**
   * get the Audio Description player object
   */
  function meGetADPlayer(video) {
    var adPlayerID = $(video).siblings('.mejs-audio').attr('id').split('mep_')[1];
    if (typeof mejs.players[adPlayerID] !== 'undefined') {
      return mejs.players[adPlayerID];
    }
    else {
      adPlayerID = 'mep_' + adPlayerID;
      player = mejs.players[adPlayerID];
      return player;
    }
  }

})(jQuery);
