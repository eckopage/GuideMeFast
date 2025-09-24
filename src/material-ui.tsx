// src/material-ui.tsx
import React from 'react';

export interface MaterialUITourProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MaterialUITour: React.FC<MaterialUITourProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div onClick={onClose}>
            Material UI Tour Component
        </div>
    );
};

export default MaterialUITour;