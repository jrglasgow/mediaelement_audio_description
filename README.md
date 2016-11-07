Adds Audio Descriptions to the MediaElement.js player

Add an audioTrack element to your video element. Kind must be description.
~~~~
<video ...>
  <track srclang="en" src="https://www.example.com/subtitles.vtt" kind="subtitles" label="English"/>
  <track srclang="en-ad" src="https://www.example.com/description-subtitles.vtt" kind="subtitles" label="English - Audio Described"/>
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

If there is a captions file with audio descriptions you can set the srclang as the above example with the language code hyphen "ad" i.e. "lc-ad" and the captions will switch to using the descriptive captions. For instance in the above code example; if the user selected the English captions and turned on Audio Descriptions the captions track would immediately switch to the "English - Audio Described" version of the captions. If Audio Descriptions are turned off the captions track switches back. If there is no matching AD track nothing is done.

TODO:
* handle caption button being pressed after Audio Descriptions are activated
* as this was developed with MediaElement.js 2.9.5 ensure all features work with the latest version
