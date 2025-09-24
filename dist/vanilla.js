(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GuideMeFast = factory());
})(this, (function () { 'use strict';

    // src/vanilla.js
    class GuideMeFast {
        constructor(config) {
            this.config = config;
        }

        start() {
            console.log('Tour started');
        }

        stop() {
            console.log('Tour stopped');
        }
    }

    // Export dla różnych środowisk
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GuideMeFast;
    }

    if (typeof window !== 'undefined') {
        window.GuideMeFast = GuideMeFast;
    }

    return GuideMeFast;

}));
//# sourceMappingURL=vanilla.js.map
