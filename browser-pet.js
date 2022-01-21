class Pet {
    /**
     * A virtual pet commanded by speech.
     * @param {Object} pet
     * @param {string} pet.name Name of the pet. Must be called before the words.
     * @param {string[]} pet.surname Other ways to call your pet. Must be called before the words.
     * @param {string[]} pet.words List of words to look for.
     * @param {string[]} pet.actions Recognized actions.
     * @param {number} pet.listenDuration Duration in milliseconds the pet will listen after being called. Default: 25000.
     * @param {string} pet.lang Language for speech recognition. Please note that English is still recognized most of the time even for a different language.
     */
    constructor(pet) {
        /** @type {string} Name of the pet. */
        this.name = pet && typeof pet.name === 'string' ? pet.name : '';

        /** @type {string[]} Other ways to call your pet. Must be called before the words. */
        this.surname = pet && typeof pet.surname === 'object' && typeof pet.surname.length === 'number' ? pet.surname.map(function(s) { return typeof s === 'string' ? s : ''; }) : [];

        /** @type {string[]} List of words to look for. */
        this.words = pet && typeof pet.words === 'object' && typeof pet.words.length === 'number' ? pet.words.map(function(g) { return typeof g === 'string' ? g : ''; }) : [];

        /** @type {string[]} Recognized actions. */
        this.actions = pet && typeof pet.actions === 'object' && typeof pet.actions.length === 'number' ? pet.actions.map(function(a) { return typeof a === 'string' ? a : ''; }) : []

        /** @type {number} Duration in milliseconds the pet will listen after being called. Default: 2500. */
        this.listenDuration = pet && typeof pet.listenDuration === 'number' && isFinite(pet.listenDuration) ? pet.listenDuration : 25000;

        /** @type {boolean} Whether or not the pet has been called so is listening. */
        this.listening = false;

        const SpeechRecognition = 'SpeechRecognition' in window ? window.SpeechRecognition : 'webkitSpeechRecognition' in window ? window.webkitSpeechRecognition : null;
        const SpeechGrammarList = 'SpeechGrammarList' in window ? window.SpeechGrammarList : 'webkitSpeechGrammarList' in window ? window.webkitSpeechGrammarList : null;
        const SpeechRecognitionEvent = 'SpeechRecognitionEvent' in window ? window.SpeechRecognitionEvent : 'webkitSpeechRecognitionEvent' in window ? window.webkitSpeechRecognitionEvent : null;

        /** @type {boolean} Whether or not SpeechRecognition and required class exists. */
        this.supported = [ SpeechRecognition, SpeechRecognitionEvent ].includes(null) ? false : true;

        this.recognition;

        /** @type {{ event: string, callback: function }[]} List of event listeners. */
        this.eventListeners = [];

        if (this.supported) {
            const P = this;

            this.recognition = new SpeechRecognition();

            if (SpeechGrammarList) {
                const speechRecognitionList = new SpeechGrammarList();
                speechRecognitionList.addFromString(`#JSGF V1.0; grammar virtual_pet; public <virtual_pet> = ${P.words.concat([ P.name, ...P.surname ], P.actions).join(' | ')} ;`, 1);
                this.recognition.grammars = speechRecognitionList;
            }

            this.recognition.continuous = true;
            this.recognition.lang = pet && typeof pet.lang === 'string' ? pet.lang || 'en-US' : 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.addEventListener('result', function(event) {
                const results = [].concat.apply([], [ ...event.results ].map(function(r) { return r[0].transcript.split(' '); }));

                const names = results.filter(function(r) { return r === name || P.surname.includes(r); });
                const actions = results.filter(function(r) { return P.actions.includes(r); });
                const words = results.filter(function(r) { return P.words.includes(r); });

                if (!P.listening && names.length) { P.listen(); }
                else if (actions.length) {
                    P.dispatchEvent('action', {
                        'action': actions[0],
                        'words': words,
                        'transcript': results.join(' ')
                    });

                    P.stopListen(true);
                }
                else if (words.length) {
                    P.dispatchEvent('words', {
                        'words': words,
                        'transcript': results.join(' ')
                    });

                    P.stopListen(true);
                }

                P.dispatchEvent('result', { 'transcript': results.join(' ') });
            });

            this.recognition.addEventListener('speechend', function() { P.recognition.stop(); });
            this.recognition.addEventListener('error', function(event) { console.error(event.error); });
        }
        else { console.error('Browser is not compatible with this module.'); }
    }

    /**
     * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
     * @param {"listen"|"stoplisten"|"words"|"action"|"result"} type 
     * @param {null|null|{ words: string[], transcript: string }|{ action: string, words: string[], transcript: string }|{ transcript: string }} event 
     */
    dispatchEvent(type, event) {
        const P = this;
        this.eventListeners.forEach(function(e) { if (e && e.event === type) { e.callback.bind(P)(event); } });
    }

    /**
     * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
     * @param {"listen"|"stoplisten"|"words"|"action"|"result"} type 
     * @param {(this: Pet, e: null|null|{ words: string[], transcript: string }|{ action: string, words: string[], transcript: string }|{ transcript: string } )} listener 
     */
    addEventListener(type, listener) {
        const e = {
            'event': type,
            'callback': listener
        };

        this.eventListeners.push(e);
        return e;
    }

    /**
     * Removes the event listener in target's event listener list with the same type, callback, and options.
     * @param {"listen"|"stoplisten"|"words"|"action"|"result"} type 
     * @param {(this: Pet, e: null|null|{ words: string[], transcript: string }|{ action: string, words: string[], transcript: string }|{ transcript: string } )} listener 
     * @returns {boolean}
     */
    removeEventListener(type, listener) {
        if (this.eventListeners.includes(type)) { this.eventListeners[this.eventListeners.indexOf(type)] = null; }
        else if (this.eventListeners.includes({ 'event': type, 'callback': listener })) { this.eventListeners[this.eventListeners.indexOf({ 'event': type, 'callback': listener })] = null; }
        else { return false; }
    }

    /** Make the pet listen to further demands. */
    listen() {
        if (!this.supported) { return; }

        this.listening = true;

        const P = this;
        setTimeout(function() { P.stopListen(); }, this.listenDuration);

        this.recognition.abort();
        this.recognition.start();

        this.dispatchEvent('listen', null);
    }

    /**
     * Make the pet stop listening to demands.
     * @param {boolean} abort Whether or not to abort the listening.
     */
    stopListen(abort) {
        if (!this.supported) { return; }

        this.listening = false;

        if (abort) { this.recognition.abort(); }
        else { this.recognition.stop(); }

        this.dispatchEvent('stoplisten', null);
    }
}
