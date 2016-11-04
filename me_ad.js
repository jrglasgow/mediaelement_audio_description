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
        }
      }
    }

    if (descriptionTrackSrc) {
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
            
            var adPlayer = mejs.players[adPlayerID];
            if (player.options.audioDescriptions) {
              // audio descriptions is on
              audioDescription.removeClass('mejs-ad-off').addClass('mejs-ad-on');
              $('.mejs-ad-button span.mejs-button').text('Stop Audio Descriptions');
              // ensure the ad player is synced
              // ensure the ad player volume is up so it can be heard
              adPlayer.play();
              adPlayer.setCurrentTime(player.media.currentTime);
              // the default bvehavior is to expect the AD audio file to contain
              // all audio so the video player is muted
              if (!player.options.adSimultaneous) {
                player.prevVolume = player.getVolume();
                adPlayer.setVolume(player.prevVolume);
                player.setVolume(0);
              }
            }
            else {
              // audio descriptions is off
              audioDescription.removeClass('mejs-ad-on').addClass('mejs-ad-off');
              $('.mejs-ad-button span.mejs-button').text('Play Audio Descriptions');

              // turn the volume down
              adPlayer.setVolume(0);
              // turn the video player volume back up
              player.setVolume(player.prevVolume);
            }
          });
    }
  };

})(jQuery);
