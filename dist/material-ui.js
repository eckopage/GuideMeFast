'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsxRuntime = require('react/jsx-runtime');

const MaterialUITour = ({ isOpen, onClose }) => {
    if (!isOpen)
        return null;
    return (jsxRuntime.jsx("div", { onClick: onClose, children: "Material UI Tour Component" }));
};

exports.MaterialUITour = MaterialUITour;
exports.default = MaterialUITour;
//# sourceMappingURL=material-ui.js.map
