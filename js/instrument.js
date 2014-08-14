/*
Google Summer of Code 2012: Automagic Music Maker

Primarily written by Myles Borins
Strongly influenced by GSOC Mentor Colin Clark
Using the Infusion framework and Flocking Library

The Automagic Music Maker is distributed under the terms the MIT or GPL2 Licenses.
Choose the license that best suits your project. The text of the MIT and GPL
licenses are at the root of the Piano directory.

*/
/*global jQuery, fluid */

var automm = automm || {};

(function () {
    "use strict";

    fluid.defaults("automm.controller", {
        gradeNames: ["fluid.viewComponent", "autoInit"],

        model: {
            autoPiano: false,
            autoGrid: false,
            autoGui: false,
            artActive: false,
            columns: 8,
            rows: 8,
            afour: 69,     // The note number of A4... this could probably be calculate based on all the other stuff (probably should be)
            afourFreq: 440, // Standard freq for A4, used to calculate all other notes
            firstNote: 60, // Middle C
            octaves: 1,
            octaveNotes: 12,
            padding: 0,
            pattern: ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white'],
            keys: {
                white: {
                    fill: '#ffffff', // White
                    stroke: '#000000', //  Black
                    highlight: '#fff000', //  Yellow
                    selected: '#00F5FF'  // Turquoise
                },
                black: {
                    fill: '#000000', // Black
                    stroke: '#000000', // Black
                    highlight: '#fff000', //  Yellow
                    selected: '#00F5FF'  // Turquoise
                }
            }
        },

        events: {
            // MIDI-compatible events.
            // TODO: These should replace onNote/afterNote.
            message: null,
            noteOn: null,
            noteOff: null,

            onNote: null,
            afterNote: null,
            afterInstrumentUpdate: null,
            afterGuiUpdate: null,
            afterNoteCalc: null,
            afterUpdate: null,
            getNoteCalc: null,
            afterPoly: null,
            onClick: null,
            afterClick: null,
            onSelect: null
        },

        listeners: {
            afterGuiUpdate: {
                func: "{that}.update"
            }
        },

        invokers: {
            update: {
                funcName: "automm.controller.update",
                args: [
                    "{that}.applier", "{that}.events.afterInstrumentUpdate",
                    "{arguments}.0", "{arguments}.1"
                ]
            }
        },

        components: {
            noteSource: {
                type: "automm.noteSource",
                options: {
                    events: {
                        onClick: "{controller}.events.onClick",
                        afterClick: "{controller}.events.afterClick",
                        message: "{controller}.events.message",
                        noteOn: "{controller}.events.noteOn",
                        noteOff: "{controller}.events.noteOff"
                    }
                }
            },

            eventBinder: {
                type: "automm.eventBinder",
                container: "{controller}.container",
                options: {
                    events: {
                        afterUpdate: "{controller}.events.afterUpdate",
                        onClick: "{controller}.events.onClick",
                        afterClick: "{controller}.events.afterClick",
                        onNote: "{controller}.events.onNote",
                        afterNote: "{controller}.events.afterNote",
                        afterPoly: "{controller}.events.afterPoly"
                    }
                }
            },

            highlighter: {
                type: "automm.highlighter",
                container: "{controller}.container",
                options: {
                    model: {
                        keys: "{controller}.model.keys"
                    },
                    events: {
                        onClick: "{controller}.events.onClick",
                        afterClick: "{controller}.events.afterClick",
                        onNote: "{controller}.events.onNote",
                        afterNote: "{controller}.events.afterNote",
                        afterNoteCalc: "{controller}.events.afterNoteCalc",
                        getNoteCalc: "{controller}.events.getNoteCalc",
                        onSelect: "{controller}.events.onSelect"
                    }
                }
            }
        }
    });

    fluid.defaults("automm.noteSource", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],

        events: {
            onClick: null,
            afterClick: null,

            message: null,
            noteOn: null,
            noteOff: null
        },

        // TODO: Modelize these.
        listeners: {
            onClick: {
                funcName: "automm.noteSource.fireNoteMessage",
                args: ["{arguments}.0.0.id", "noteOn", "{that}.events"]
            },

            afterClick: {
                funcName: "automm.noteSource.fireNoteMessage",
                args: ["{arguments}.0.0.id", "noteOff", "{that}.events"]
            }
        }
    });

    automm.noteSource.fireNoteMessage = function (noteId, type, events) {
        var msg = {
            type: type,
            chan: 1,
            note: Number(noteId),
            velocity: 127
        };

        events.message.fire(msg);
        events[type].fire(msg);
    };

    automm.controller.update = function (applier, afterInstrumentUpdate, param, value) {
        that.applier.requestChange(param, value);
        that.events.afterInstrumentUpdate.fire(param, value);
    };

    fluid.defaults("automm.withArpeggiator", {
        gradeNames: ["fluid.modelComponent", "autoInit"],

        model: {
            arpActive: false,
            // Rate of the metronome... should be in bpm
            interval: 150,
            // Scale and mode to arpeggiate in
            scale: "major",
            mode: "ionian",
            // This pattern is in Note Degrees starting from 0 ({"I"": 0, "II":1, "III":etcetcetc})
            arpPattern: [0, 2, 4],

            // This is a connanon which is used to collect modes / scales / etc....
            // probably shouldn't live here
            canon: {
                modes: {
                    ionian: 0,
                    dorian: 1,
                    phyrgian: 2,
                    lydian: 3,
                    mixolydian: 4,
                    aeolian: 5,
                    locrian: 6
                },
                scales: {
                    major: [2, 2, 1, 2, 2, 2, 1],
                    minor: [2, 2, 1, 2, 2, 1, 2]
                }
            }
        },

        components: {
            arpeggiator: {
                type: "automm.arpeggiator",
                container: "{withArpeggiator}.container",
                options: {
                    model: "{withArpeggiator}.model",
                    events: {
                        message: "{withArpeggiator}.events.message",
                        noteOn: "{withArpeggiator}.events.noteOn",
                        noteOff: "{withArpeggiator}.events.noteOff",

                        onNote: "{withArpeggiator}.events.onNote",
                        afterNote: "{withArpeggiator}.events.afterNote",
                        onClick: "{withArpeggiator}.events.onClick",
                        afterClick: "{withArpeggiator}.events.afterClick",
                        afterInstrumentUpdate: "{withArpeggiator}.events.afterInstrumentUpdate"
                    }
                }
            }
        }
    });

    fluid.defaults("automm.withARIA", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],

        components: {
            aria: {
                type: "automm.aria",
                container: "{controller}.container",
                options: {
                    model: {
                        octaveNotes: "{controller}.model.octaveNotes"
                    },
                    events: {
                        afterUpdate: "{controller}.events.afterGuiUpdate",
                        onClick: "{controller}.events.onClick",
                        afterClick: "{controller}.events.afterClick",
                        onSelect: "{controller}.events.onSelect"
                    }
                }
            }
        }
    })

    fluid.defaults("automm.keyboardController", {
        gradeNames: ["automm.controller", "automm.withArpeggiator", "autoInit"],

        components: {
            piano: {
                type: "automm.piano",
                container: "{keyboardController}.container",
                options: {
                    model: "{keyboardController}.model",
                    events: {
                        afterInstrumentUpdate: "{keyboardController}.events.afterInstrumentUpdate",
                        afterNoteCalc: "{keyboardController}.events.afterNoteCalc",
                        afterUpdate: "{keyboardController}.events.afterUpdate",
                        getNoteCalc: "{keyboardController}.events.getNoteCalc"
                    }
                }
            }
        }
    });

    fluid.defaults("automm.gridController", {
        gradeNames: ["automm.controller", "automm.withArpeggiator", "autoInit"],

        components: {
            grid: {
                type: "automm.grid",
                container: "{gridController}.container",
                options: {
                    model: {
                        auto: "{gridController}.model.autoGrid",
                        columns: "{gridController}.model.columns",
                        rows: "{gridController}.model.rows",
                        firstNote: "{gridController}.model.firstNote", // Middle C
                        octaveNotes: "{gridController}.model.octaveNotes",
                        padding: "{gridController}.model.padding",
                        pattern: "{gridController}.model.pattern",
                        keys: "{gridController}.model.keys"
                    },
                    events: {
                        afterInstrumentUpdate: "{gridController}.events.afterInstrumentUpdate",
                        afterNoteCalc: "{gridController}.events.afterNoteCalc",
                        afterUpdate: "{gridController}.events.afterUpdate",
                        getNoteCalc: "{gridController}.events.getNoteCalc"
                    }
                }

            }
        }
    });

    fluid.defaults("automm.instrument", {
        gradeNames: ["automm.controller", "automm.withArpeggiator", "autoInit"],

        components: {
            piano: {
                type: "automm.piano",
                container: "{instrument}.container",
                options: {
                    model: {
                        auto: "{instrument}.model.autoPiano",
                        firstNote: "{instrument}.model.firstNote", // Middle C
                        octaves: "{instrument}.model.octaves",
                        octaveNotes: "{instrument}.model.octaveNotes",
                        padding: "{instrument}.model.padding",
                        pattern: "{instrument}.model.pattern",
                        keys: "{instrument}.model.keys"
                    },
                    events: {
                        afterInstrumentUpdate: "{instrument}.events.afterInstrumentUpdate",
                        afterNoteCalc: "{instrument}.events.afterNoteCalc",
                        afterUpdate: "{instrument}.events.afterUpdate",
                        getNoteCalc: "{instrument}.events.getNoteCalc"
                    }
                }
            },

            grid: {
                type: "automm.grid",
                container: "{instrument}.container",
                options: {
                    model: {
                        auto: "{instrument}.model.autoGrid",
                        columns: "{instrument}.model.columns",
                        rows: "{instrument}.model.rows",
                        firstNote: "{instrument}.model.firstNote", // Middle C
                        octaveNotes: "{instrument}.model.octaveNotes",
                        padding: "{instrument}.model.padding",
                        pattern: "{instrument}.model.pattern",
                        keys: "{instrument}.model.keys"
                    },
                    events: {
                        afterInstrumentUpdate: "{instrument}.events.afterInstrumentUpdate",
                        afterNoteCalc: "{instrument}.events.afterNoteCalc",
                        afterUpdate: "{instrument}.events.afterUpdate",
                        getNoteCalc: "{instrument}.events.getNoteCalc"
                    }
                }
            },

            oscillator: {
                type: "automm.oscillator",
                options: {
                    model: {
                        afour: "{instrument}.afour",
                        afourFreq: "{instrument}.afourFreq",
                        ocaveNotes: "{instrument}.octaveNotes",
                        arpActive: "{instrument}.arpActive"
                    },
                    events: {
                        onClick: "{instrument}.events.onClick",
                        afterClick: "{instrument}.events.afterClick",
                        onNote: "{instrument}.events.onNote",
                        afterNote: "{instrument}.events.afterNote",
                        afterInstrumentUpdate: "{instrument}.events.afterInstrumentUpdate"
                    }
                }
            },

            gui: {
                type: "automm.gui",
                container: "{instrument}.container",
                options: {
                    model: {
                        drawGui: "{instrument}.model.drawGui",
                        firstNote: "{instrument}.model.firstNote", // Middle C
                        octaves: "{instrument}.model.octaves",
                        octaveNotes: "{instrument}.model.octaveNotes",
                        padding: "{instrument}.model.padding",
                        pattern: "{instrument}.model.pattern",
                        keys: "{instrument}.model.keys"
                    },
                    events: {
                        afterGuiUpdate: "{instrument}.events.afterGuiUpdate"
                    }
                }
            }
        }
    });

}());
