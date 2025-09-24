import { jsx } from 'react/jsx-runtime';

const MaterialUITour = ({ isOpen, onClose }) => {
    if (!isOpen)
        return null;
    return (jsx("div", { onClick: onClose, children: "Material UI Tour Component" }));
};

export { MaterialUITour, MaterialUITour as default };
//# sourceMappingURL=material-ui.esm.js.map
