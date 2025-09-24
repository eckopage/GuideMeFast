export declare const version = "1.0.0";
export interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}
export interface TourConfig {
    steps: TourStep[];
    theme?: 'light' | 'dark' | 'material';
}
export declare const GuideMeFast: () => string;
export default GuideMeFast;
//# sourceMappingURL=index.d.ts.map