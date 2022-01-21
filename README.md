# Browser Pet
Browser Pet is a small browser module to create a pet using Speech Recognition. It is not use-ready, it's only a small vanilla javascript snippet that will make your life easier if you will to integrate a virtual pet on your app or game.

# Installation
Look on [MDN for Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) availability.
```HTML
<!-- Normal code -->
<script src="https://raw.githubusercontent.com/MushAsterion/browser-pet/main/browser-pet.js"></script>

<!-- Minified -->
<script src="https://raw.githubusercontent.com/MushAsterion/browser-pet/main/browser-pet.min.js"></script>
```

# Initialization
```JavaScript
const pet = new Pet({ 'name': NAME, 'words': WORDS });
```

When initializing you can use 6 properties as follow:
```JavaScript
new Pet({ 'name': NAME, 'surname': SURNAMES, 'words': WORDS, 'actions': ACTIONS, 'listenDuration': LISTENDURATION, 'lang': LANGUAGE })
```
 
Where:
* `name` is the name of the pet;
* `surname` is a list of alternative names for the pet;
* `words` is a list of words to react for;
* `actions` is a list of actions to react for;
* `listenDuration` is the time without input before the pet stops listening (in ms);
* `lang` is the lang to be recognized.
 
Once initialized you can edit all these values on the pet immediatly but I hightly suggest to initalize a new pet.
 
# Usage
There is only one class in this module that describes as follow:

## Pet class
### Properties
* `name` the name of the pet;
* `surname` a list of alternative names for the pet;
* `words` a list of words to react for;
* `actions` a list of actions to react for;
* `listenDuration` time without input before stopping listening (in ms);
* `listening` whether or not the pet is currently listening;
* `supported` whether or not SpeechRecognition and required class exists in the browser;
* `recognition` [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) interface used by the pet.
 
### Methods
```JavaScript
// Dispatch an event. See below for events.
pet.dispatchEvent(type, event);

// Creates an event listener. See below for events.
pet.addEventListener(event, listener);

// Removes an event listener. See below for events.
pet.removeEventListener(event, listener);

// Start listening. This is active listening, if you want it to wait for its name/surname use `pet.recognition.start();`
pet.listen();

// Stop listening. Set "abort" as true if you don't want to fire `result` event.
pet.stopListen(abort);
```

### Events
Once the pet dispatch `words` or `action` events, it stops listening.
 
Here are the 3 things that can be returned within events:
* `words`: array of words you asked the pet to look after and that are present within the audio
* `action`: first action detected in the audio
* `transcript`: audio transcription as a string.
```JavaScript
// Pet start actively listening
pet.addEventListener('listen', function() {  });

// Pet stop listening
pet.addEventListener('stoplisten', function() {  });

// Word(s) detected on the audio.
pet.addEventListener('words', function({ words, transcript }) {  });

// Action has been detected on the audio, only the first action is returned.
pet.addEventListener('action', function({ action, words, transcript }) {  });

// There was audio but nothing got detected within.
pet.addEventListener('result', function({ transcript }) {  });
```
 
Note: You can always directly use [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) from `pet.recognition`.
