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

export { GuideMeFast as default };
//# sourceMappingURL=vanilla.esm.js.map
