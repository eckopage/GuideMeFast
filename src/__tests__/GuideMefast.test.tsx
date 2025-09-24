import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useGuideMeFast } from '../index';

const TestComponent = ({ config }: { config: any }) => {
    const { startTour, TourComponent } = useGuideMeFast(config);

    return (
        <div>
            <button onClick={startTour}>Start Tour</button>
            <div id="test-target">Target Element</div>
            {TourComponent}
        </div>
    );
};

describe('GuideMeFast', () => {
    const basicConfig = {
        steps: [
            {
                target: '#test-target',
                title: 'Test Step',
                content: 'This is a test step'
            }
        ]
    };

    test('renders without crashing', () => {
        render(<TestComponent config={basicConfig} />);
        expect(screen.getByText('Start Tour')).toBeInTheDocument();
    });

    test('starts tour on button click', () => {
        render(<TestComponent config={basicConfig} />);

        fireEvent.click(screen.getByText('Start Tour'));

        expect(screen.getByText('Test Step')).toBeInTheDocument();
        expect(screen.getByText('This is a test step')).toBeInTheDocument();
    });

    test('closes tour when close button is clicked', () => {
        render(<TestComponent config={basicConfig} />);

        fireEvent.click(screen.getByText('Start Tour'));
        fireEvent.click(screen.getByLabelText('Close tour'));

        expect(screen.queryByText('Test Step')).not.toBeInTheDocument();
    });
});