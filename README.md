Adds Audio Descriptions to the MediaElement.js player

Add an audioTrack element to your video element. Kind must be description.
~~~~
<video ...>
  <audioTrack src="https://www.example.com/description.mp3" kind="description"/>
</video>
~~~~
Ensure md_ad.js and me_ad.css are added in your HTML

Add the audioDescription feature in your player declaration.
~~~~
jQuery(document).ready(function($) {

    // create player
    $('#player1').mediaelementplayer({
        // add desired features in order
        // I've put the loop function second,
        features: ['playpause','audioDescription','current','progress','duration','volume','fullscreen'],
    });

});
~~~~
Currently when the MediaElement.js player is loaded with the plugin a check is run to see if there is an audioTrack element with kind="description". If that is the case an additional <audio> element is inserted with the audioTrack as the source (currently will only work with mp3 files). The Audio element is hidden using "display:none;". An "AD" button is added to the controls.

While playing a video when the button is clicked and the feature is turned on the audio player is started and the current time of the audio is set to the current time of the video. The video volume is set to 0 and the audio volume is set to whatever the video volume was set to. The video volume level is saved for later user.

When the button is clicked again and the feature turned off the audio player is set to volume 0 and the video player is set to the previous volume.

TODO:
* if descriptions captions are available switch to them when the button is pressed.
