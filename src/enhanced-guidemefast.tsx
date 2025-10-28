/**
 * enhanced-guidemefast.tsx
 * Complete enhanced implementation with i18n, AI, and keyboard support
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TourTranslations {
    [key: string]: {
        next: string;
        previous: string;
        skip: string;
        finish: string;
        close: string;
        loading: string;
        stepCounter: string;
        progressAriaLabel: string;
        closeAriaLabel: string;
        tooltipAriaLabel: string;
        highlightAriaLabel: string;
        aiSuggestionLoading: string;
        aiSuggestionError: string;
        aiPersonalizeButton: string;
        aiOptimizeButton: string;
    };
}

export interface AIConfig {
    enabled: boolean;
    apiKey?: string;
    provider?: 'openai' | 'anthropic' | 'custom';
    features?: {
        personalizeContent?: boolean;
        optimizeFlow?: boolean;
        adaptToUser?: boolean;
        generateSteps?: boolean;
    };
    customEndpoint?: string;
    onAIRequest?: (prompt: string, context: any) => Promise<string>;
}

export interface KeyboardConfig {
    enabled: boolean;
    shortcuts?: {
        next: string[];
        previous: string[];
        skip: string[];
        close: string[];
        finish: string[];
    };
    preventDefaults?: boolean;
}

export interface TourStep {
    target: string;
    title: string | ((translations: TourTranslations[string]) => string);
    content: string | ((translations: TourTranslations[string]) => string);
    placement?: 'top' | 'bottom' | 'left' | 'right';
    customTexts?: {
        next?: string;
        previous?: string;
        skip?: string;
        finish?: string;
    };
    aiContext?: {
        userRole?: string;
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        importance?: 'low' | 'medium' | 'high';
        personalizable?: boolean;
    };
    showSkip?: boolean;
    showPrev?: boolean;
    showNext?: boolean;
    onNext?: () => void | Promise<void>;
    onPrev?: () => void | Promise<void>;
    onSkip?: () => void | Promise<void>;
    customClass?: string;
    offset?: { x: number; y: number };
}

export interface TourConfig {
    steps: TourStep[];
    onComplete?: () => void;
    onSkip?: () => void;
    locale?: string;
    translations?: TourTranslations;
    customTexts?: {
        next?: string;
        previous?: string;
        skip?: string;
        finish?: string;
        close?: string;
        loading?: string;
    };
    ai?: AIConfig;
    keyboard?: KeyboardConfig;
    theme?: 'light' | 'dark' | 'material';
    showProgress?: boolean;
    showStepNumbers?: boolean;
    backdropOpacity?: number;
    highlightPadding?: number;
    scrollBehavior?: 'smooth' | 'auto';
    zIndex?: number;
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    customStyles?: {
        tooltip?: React.CSSProperties;
        backdrop?: React.CSSProperties;
        highlight?: React.CSSProperties;
    };
}

interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

// ============================================================================
// DEFAULT TRANSLATIONS
// ============================================================================

export const defaultTranslations: TourTranslations = {
    en: {
        next: 'Next',
        previous: 'Previous',
        skip: 'Skip Tour',
        finish: 'Finish',
        close: 'Close',
        loading: 'Loading...',
        stepCounter: '{current} of {total}',
        progressAriaLabel: 'Tour progress: step {current} of {total}',
        closeAriaLabel: 'Close tour',
        tooltipAriaLabel: 'Tour step {current}: {title}',
        highlightAriaLabel: 'Highlighted element for tour step {current}',
        aiSuggestionLoading: 'AI is personalizing content...',
        aiSuggestionError: 'Unable to personalize content',
        aiPersonalizeButton: 'Personalize with AI',
        aiOptimizeButton: 'Optimize Tour'
    },
    pl: {
        next: 'Dalej',
        previous: 'Wstecz',
        skip: 'Pomiń przewodnik',
        finish: 'Zakończ',
        close: 'Zamknij',
        loading: 'Ładowanie...',
        stepCounter: '{current} z {total}',
        progressAriaLabel: 'Postęp przewodnika: krok {current} z {total}',
        closeAriaLabel: 'Zamknij przewodnik',
        tooltipAriaLabel: 'Krok przewodnika {current}: {title}',
        highlightAriaLabel: 'Podświetlony element dla kroku {current}',
        aiSuggestionLoading: 'AI personalizuje treść...',
        aiSuggestionError: 'Nie można spersonalizować treści',
        aiPersonalizeButton: 'Personalizuj z AI',
        aiOptimizeButton: 'Optymalizuj przewodnik'
    },
    es: {
        next: 'Siguiente',
        previous: 'Anterior',
        skip: 'Saltar tour',
        finish: 'Finalizar',
        close: 'Cerrar',
        loading: 'Cargando...',
        stepCounter: '{current} de {total}',
        progressAriaLabel: 'Progreso del tour: paso {current} de {total}',
        closeAriaLabel: 'Cerrar tour',
        tooltipAriaLabel: 'Paso del tour {current}: {title}',
        highlightAriaLabel: 'Elemento resaltado para el paso {current}',
        aiSuggestionLoading: 'IA está personalizando contenido...',
        aiSuggestionError: 'No se puede personalizar el contenido',
        aiPersonalizeButton: 'Personalizar con IA',
        aiOptimizeButton: 'Optimizar Tour'
    },
    fr: {
        next: 'Suivant',
        previous: 'Précédent',
        skip: 'Ignorer le tour',
        finish: 'Terminer',
        close: 'Fermer',
        loading: 'Chargement...',
        stepCounter: '{current} sur {total}',
        progressAriaLabel: 'Progression du tour: étape {current} sur {total}',
        closeAriaLabel: 'Fermer le tour',
        tooltipAriaLabel: 'Étape du tour {current}: {title}',
        highlightAriaLabel: 'Élément en surbrillance pour l\'étape {current}',
        aiSuggestionLoading: 'L\'IA personnalise le contenu...',
        aiSuggestionError: 'Impossible de personnaliser le contenu',
        aiPersonalizeButton: 'Personnaliser avec l\'IA',
        aiOptimizeButton: 'Optimiser le Tour'
    },
    de: {
        next: 'Weiter',
        previous: 'Zurück',
        skip: 'Tour überspringen',
        finish: 'Beenden',
        close: 'Schließen',
        loading: 'Laden...',
        stepCounter: '{current} von {total}',
        progressAriaLabel: 'Tour-Fortschritt: Schritt {current} von {total}',
        closeAriaLabel: 'Tour schließen',
        tooltipAriaLabel: 'Tour-Schritt {current}: {title}',
        highlightAriaLabel: 'Hervorgehobenes Element für Schritt {current}',
        aiSuggestionLoading: 'KI personalisiert Inhalte...',
        aiSuggestionError: 'Inhalte können nicht personalisiert werden',
        aiPersonalizeButton: 'Mit KI personalisieren',
        aiOptimizeButton: 'Tour optimieren'
    }
};

// ============================================================================
// AI SERVICE
// ============================================================================

export class TourAIService {
    private config: AIConfig;

    constructor(config: AIConfig) {
        this.config = config;
    }

    async personalizeStep(step: TourStep, userContext: any): Promise<Partial<TourStep>> {
        if (!this.config.enabled || !this.config.features?.personalizeContent) {
            return {};
        }

        try {
            const prompt = this.buildPersonalizationPrompt(step, userContext);
            const response = await this.makeAIRequest(prompt, { step, userContext });
            return this.parsePersonalizationResponse(response);
        } catch (error) {
            console.warn('AI personalization failed:', error);
            return {};
        }
    }

    async optimizeTourFlow(steps: TourStep[], userBehavior: any): Promise<TourStep[]> {
        if (!this.config.enabled || !this.config.features?.optimizeFlow) {
            return steps;
        }

        try {
            const prompt = this.buildOptimizationPrompt(steps, userBehavior);
            const response = await this.makeAIRequest(prompt, { steps, userBehavior });
            return this.parseOptimizationResponse(response, steps);
        } catch (error) {
            console.warn('AI optimization failed:', error);
            return steps;
        }
    }

    async generateSteps(targetSelectors: string[], context: any): Promise<TourStep[]> {
        if (!this.config.enabled || !this.config.features?.generateSteps) {
            return [];
        }

        try {
            const prompt = this.buildGenerationPrompt(targetSelectors, context);
            const response = await this.makeAIRequest(prompt, { targetSelectors, context });
            return this.parseGenerationResponse(response);
        } catch (error) {
            console.warn('AI step generation failed:', error);
            return [];
        }
    }

    private buildPersonalizationPrompt(step: TourStep, userContext: any): string {
        const title = typeof step.title === 'function' ? 'Dynamic title' : step.title;
        const content = typeof step.content === 'function' ? 'Dynamic content' : step.content;

        return `Personalize this tour step for the user:
      
Current Step:
- Title: ${title}
- Content: ${content}
- Target: ${step.target}
- Importance: ${step.aiContext?.importance || 'medium'}

User Context:
- Role: ${userContext.role || 'unknown'}
- Experience: ${userContext.experience || 'beginner'}
- Preferences: ${JSON.stringify(userContext.preferences || {})}

Instructions:
1. Adapt the title and content to the user's role and experience level
2. Use appropriate technical language for their skill level
3. Add relevant examples or analogies
4. Keep the core message intact
5. Return JSON with 'title' and 'content' fields

Focus on making the content more relevant and engaging for this specific user.`;
    }

    private buildOptimizationPrompt(steps: TourStep[], userBehavior: any): string {
        return `Optimize this tour flow based on user behavior:
      
Current Steps: ${steps.length} steps
User Behavior:
- Completion rate: ${userBehavior.completionRate || 0}%
- Average time per step: ${userBehavior.avgTimePerStep || 0}s
- Skip patterns: ${JSON.stringify(userBehavior.skipPatterns || [])}
- Drop-off points: ${JSON.stringify(userBehavior.dropOffPoints || [])}

Suggest optimizations:
1. Which steps to combine or split
2. Which steps to reorder
3. Which steps to make optional
4. Content improvements for low-engagement steps

Return recommendations as JSON with specific step indices and actions.`;
    }

    private buildGenerationPrompt(targetSelectors: string[], context: any): string {
        return `Generate tour steps for these UI elements:
      
Target Elements: ${targetSelectors.join(', ')}

Context:
- Application type: ${context.appType || 'web application'}
- User role: ${context.userRole || 'general user'}
- Tour purpose: ${context.purpose || 'onboarding'}

For each element, create a tour step with:
1. Appropriate title
2. Helpful content explaining the feature
3. Suitable placement
4. Importance level

Return array of step objects with target, title, content, placement, and aiContext.`;
    }

    private async makeAIRequest(prompt: string, context: any): Promise<string> {
        if (this.config.onAIRequest) {
            return await this.config.onAIRequest(prompt, context);
        }

        if (this.config.customEndpoint) {
            const response = await fetch(this.config.customEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey || ''}`
                },
                body: JSON.stringify({ prompt, context })
            });

            const data = await response.json();
            return data.response || data.content || '';
        }

        throw new Error('No AI request handler configured');
    }

    private parsePersonalizationResponse(response: string): Partial<TourStep> {
        try {
            const parsed = JSON.parse(response);
            return {
                title: parsed.title,
                content: parsed.content
            };
        } catch (error) {
            console.warn('Failed to parse AI personalization response');
            return {};
        }
    }

    private parseOptimizationResponse(response: string, originalSteps: TourStep[]): TourStep[] {
        try {
            JSON.parse(response);
            // In a real implementation, apply recommendations here
            return originalSteps;
        } catch (error) {
            console.warn('Failed to parse AI optimization response');
            return originalSteps;
        }
    }

    private parseGenerationResponse(response: string): TourStep[] {
        try {
            const steps = JSON.parse(response);
            return Array.isArray(steps) ? steps : [];
        } catch (error) {
            console.warn('Failed to parse AI generation response');
            return [];
        }
    }
}

// ============================================================================
// KEYBOARD NAVIGATION SERVICE
// ============================================================================

export class KeyboardNavigationService {
    private config: KeyboardConfig;
    private tourInstance: any;
    private boundHandler: (e: KeyboardEvent) => void;

    constructor(config: KeyboardConfig, tourInstance: any) {
        this.config = config;
        this.tourInstance = tourInstance;
        this.boundHandler = this.handleKeyDown.bind(this);
    }

    attach(): void {
        if (!this.config.enabled) return;
        document.addEventListener('keydown', this.boundHandler, true);
    }

    detach(): void {
        document.removeEventListener('keydown', this.boundHandler, true);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.tourInstance.isActive) return;

        const shortcuts = this.config.shortcuts || this.getDefaultShortcuts();
        const key = this.getKeyString(event);
        let handled = false;

        if (shortcuts.next?.includes(key)) {
            this.tourInstance.next();
            handled = true;
        } else if (shortcuts.previous?.includes(key)) {
            this.tourInstance.prev();
            handled = true;
        } else if (shortcuts.skip?.includes(key)) {
            if (typeof this.tourInstance.handleSkip === 'function') {
                this.tourInstance.handleSkip();
            }
            handled = true;
        } else if (shortcuts.close?.includes(key)) {
            if (typeof this.tourInstance.handleClose === 'function') {
                this.tourInstance.handleClose();
            } else if (typeof this.tourInstance.stop === 'function') {
                this.tourInstance.stop();
            }
            handled = true;
        } else if (shortcuts.finish?.includes(key)) {
            const stepsLength = this.tourInstance.config?.steps?.length || 0;
            if (this.tourInstance.currentStep === stepsLength - 1) {
                this.tourInstance.next();
                handled = true;
            }
        }

        if (handled && this.config.preventDefaults) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private getKeyString(event: KeyboardEvent): string {
        const parts: string[] = [];

        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');

        parts.push(event.key.toLowerCase());

        return parts.join('+');
    }

    private getDefaultShortcuts() {
        return {
            next: ['arrowright', 'space', 'enter'],
            previous: ['arrowleft', 'backspace'],
            skip: ['ctrl+s', 'alt+s'],
            close: ['escape', 'ctrl+c'],
            finish: ['ctrl+enter', 'alt+enter']
        };
    }
}

// ============================================================================
// ENHANCED GUIDEMEFAST CLASS
// ============================================================================

export class EnhancedGuideMeFast {
    public currentStep: number = 0;
    public isActive: boolean = false;
    public config: TourConfig;

    private elements: { [key: string]: HTMLElement } = {};
    private loading: boolean = false;
    private rafId: number | null = null;
    private translations: TourTranslations[string];
    private aiService?: TourAIService;
    private keyboardService?: KeyboardNavigationService;
    private userContext: any = {};

    constructor(config: TourConfig) {
        this.config = {
            locale: 'en',
            keyboard: { enabled: true },
            ai: { enabled: false },
            theme: 'light',
            showProgress: true,
            showStepNumbers: true,
            backdropOpacity: 0.7,
            highlightPadding: 8,
            scrollBehavior: 'smooth',
            zIndex: 9999,
            closeOnEscape: true,
            closeOnClickOutside: false,
            ...config
        };

        this.translations = this.getTranslations();

        if (this.config.ai?.enabled) {
            this.aiService = new TourAIService(this.config.ai);
        }

        if (this.config.keyboard?.enabled) {
            this.keyboardService = new KeyboardNavigationService(this.config.keyboard, this);
        }

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
        this.handleSkip = this.handleSkip.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.updatePositions = this.updatePositions.bind(this);
    }

    private getTranslations(): TourTranslations[string] {
        const locale = this.config.locale || 'en';

        if (this.config.translations?.[locale]) {
            return { ...defaultTranslations[locale], ...this.config.translations[locale] };
        }

        return defaultTranslations[locale] || defaultTranslations.en;
    }

    private getText(key: keyof TourTranslations[string], stepCustomTexts?: any): string {
        if (stepCustomTexts?.[key]) {
            return stepCustomTexts[key];
        }

        if (this.config.customTexts && (this.config.customTexts as any)[key]) {
            return (this.config.customTexts as any)[key];
        }

        return this.translations[key] || key;
    }

    private formatText(template: string, values: Record<string, any>): string {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return values[key] !== undefined ? String(values[key]) : match;
        });
    }

    async start(): Promise<void> {
        if (this.isActive || !this.config.steps?.length) return;

        this.isActive = true;
        this.currentStep = 0;

        if (this.aiService) {
            try {
                this.config.steps = await this.aiService.optimizeTourFlow(
                    this.config.steps,
                    this.userContext
                );
            } catch (error) {
                console.warn('AI optimization failed, proceeding with original steps');
            }
        }

        this.createElements();
        await this.updateStep();
        this.attachEventListeners();
    }

    stop(): void {
        if (!this.isActive) return;

        this.isActive = false;
        this.removeEventListeners();
        this.removeElements();
        this.currentStep = 0;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    async next(): Promise<void> {
        if (this.currentStep < this.config.steps.length - 1) {
            await this.handleNext();
        }
    }

    async prev(): Promise<void> {
        if (this.currentStep > 0) {
            await this.handlePrev();
        }
    }

    goToStep(stepIndex: number): void {
        if (stepIndex >= 0 && stepIndex < this.config.steps.length) {
            this.currentStep = stepIndex;
            this.updateStep();
        }
    }

    async personalizeCurrentStep(): Promise<void> {
        if (!this.aiService) return;

        const step = this.config.steps[this.currentStep];
        if (!step?.aiContext?.personalizable) return;

        try {
            this.setLoading(true, this.getText('aiSuggestionLoading'));

            const personalizedStep = await this.aiService.personalizeStep(step, this.userContext);
            Object.assign(step, personalizedStep);

            this.updateTooltipContent(step);
        } catch (error) {
            console.error('Personalization failed:', error);
            const originalContent = this.elements.body?.innerHTML;
            if (this.elements.body) {
                this.elements.body.innerHTML = this.getText('aiSuggestionError');
                setTimeout(() => {
                    if (this.elements.body && originalContent) {
                        this.elements.body.innerHTML = originalContent;
                    }
                }, 2000);
            }
        } finally {
            this.setLoading(false);
        }
    }

    setUserContext(context: any): void {
        this.userContext = { ...this.userContext, ...context };
    }

    async generateTourFromPage(options: {
        includeSelectors?: string[];
        excludeSelectors?: string[];
        context?: any;
        autoPersonalize?: boolean;
    } = {}): Promise<TourStep[]> {
        if (!this.aiService) {
            throw new Error('AI service not enabled');
        }

        let selectors = options.includeSelectors;
        if (!selectors) {
            const interactiveElements = document.querySelectorAll(
                'button, a, input, select, textarea, [role="button"], [tabindex="0"]'
            );
            selectors = Array.from(interactiveElements).map((el, index) => {
                if (!el.id) {
                    el.id = `ai-tour-element-${index}`;
                }
                return `#${el.id}`;
            });
        }

        if (options.excludeSelectors) {
            selectors = selectors.filter(selector =>
                !options.excludeSelectors!.some(exclude => selector.includes(exclude))
            );
        }

        const context = {
            appType: 'web application',
            userRole: this.userContext.role || 'user',
            purpose: 'onboarding',
            ...options.context
        };

        const steps = await this.aiService.generateSteps(selectors, context);

        if (options.autoPersonalize) {
            const personalizedSteps = await Promise.all(
                steps.map(step => this.aiService!.personalizeStep(step, this.userContext))
            );
            return personalizedSteps.map((personalizedStep, index) => ({
                ...steps[index],
                ...personalizedStep
            }));
        }

        return steps;
    }

    private createElements(): void {
        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = `guidemefast-overlay guidemefast-theme-${this.config.theme}`;
        this.elements.overlay.setAttribute('role', 'dialog');
        this.elements.overlay.setAttribute('aria-modal', 'true');

        this.elements.backdrop = document.createElement('div');
        this.elements.backdrop.className = 'guidemefast-backdrop';
        this.elements.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: ${this.config.zIndex};
            opacity: ${this.config.backdropOpacity};
        `;
        Object.assign(this.elements.backdrop.style, this.config.customStyles?.backdrop || {});

        if (this.config.closeOnClickOutside) {
            this.elements.backdrop.addEventListener('click', this.handleClose);
        }

        this.elements.highlight = document.createElement('div');
        this.elements.highlight.className = 'guidemefast-highlight';
        this.elements.highlight.style.cssText = `
            position: fixed;
            z-index: ${this.config.zIndex! + 1};
            pointer-events: none;
        `;
        Object.assign(this.elements.highlight.style, this.config.customStyles?.highlight || {});

        this.elements.tooltip = document.createElement('div');
        this.elements.tooltip.className = 'guidemefast-tooltip';
        this.elements.tooltip.style.cssText = `
            position: fixed;
            z-index: ${this.config.zIndex! + 2};
        `;
        Object.assign(this.elements.tooltip.style, this.config.customStyles?.tooltip || {});

        this.createTooltipContent();

        this.elements.overlay.appendChild(this.elements.backdrop);
        this.elements.overlay.appendChild(this.elements.highlight);
        this.elements.overlay.appendChild(this.elements.tooltip);

        document.body.appendChild(this.elements.overlay);
    }

    private createTooltipContent(): void {
        this.elements.tooltip.innerHTML = `
            <button class="guidemefast-close" aria-label="${this.getText('closeAriaLabel')}">×</button>
            
            ${this.config.showProgress ? `
                <div class="guidemefast-progress">
                    <div class="guidemefast-progress-bar"></div>
                </div>
            ` : ''}
            
            ${this.config.showStepNumbers ? `
                <div class="guidemefast-step-counter"></div>
            ` : ''}
            
            <div class="guidemefast-content">
                <h3 class="guidemefast-title"></h3>
                <div class="guidemefast-body"></div>
            </div>
            
            <div class="guidemefast-navigation">
                <button class="guidemefast-btn guidemefast-btn-ghost guidemefast-skip">${this.getText('skip')}</button>
                <button class="guidemefast-btn guidemefast-btn-secondary guidemefast-prev">${this.getText('previous')}</button>
                <button class="guidemefast-btn guidemefast-btn-primary guidemefast-next">${this.getText('next')}</button>
            </div>
            
            <div class="guidemefast-arrow"></div>
        `;

        this.elements.closeBtn = this.elements.tooltip.querySelector('.guidemefast-close') as HTMLButtonElement;
        this.elements.skipBtn = this.elements.tooltip.querySelector('.guidemefast-skip') as HTMLButtonElement;
        this.elements.prevBtn = this.elements.tooltip.querySelector('.guidemefast-prev') as HTMLButtonElement;
        this.elements.nextBtn = this.elements.tooltip.querySelector('.guidemefast-next') as HTMLButtonElement;
        this.elements.progressBar = this.elements.tooltip.querySelector('.guidemefast-progress-bar') as HTMLElement;
        this.elements.stepCounter = this.elements.tooltip.querySelector('.guidemefast-step-counter') as HTMLElement;
        this.elements.title = this.elements.tooltip.querySelector('.guidemefast-title') as HTMLElement;
        this.elements.body = this.elements.tooltip.querySelector('.guidemefast-body') as HTMLElement;
        this.elements.arrow = this.elements.tooltip.querySelector('.guidemefast-arrow') as HTMLElement;

        this.elements.closeBtn?.addEventListener('click', this.handleClose);
        this.elements.skipBtn?.addEventListener('click', this.handleSkip);
        this.elements.prevBtn?.addEventListener('click', this.handlePrev);
        this.elements.nextBtn?.addEventListener('click', this.handleNext);
    }

    private async updateStep(): Promise<void> {
        const step = this.config.steps[this.currentStep];
        if (!step) return;

        if (this.aiService && step.aiContext?.personalizable) {
            try {
                const personalizedStep = await this.aiService.personalizeStep(step, this.userContext);
                Object.assign(step, personalizedStep);
            } catch (error) {
                console.warn('Auto-personalization failed, using original content');
            }
        }

        this.updateTooltipContent(step);
        this.updatePositions();
        this.scrollToElement(step.target);
    }

    private updatePositions(): void {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        this.rafId = requestAnimationFrame(() => {
            const step = this.config.steps[this.currentStep];
            if (!step) return;

            this.updateHighlight(step.target);
            this.updateTooltip(step);
        });
    }

    private updateHighlight(target: string): void {
        const element = document.querySelector(target);
        if (!element) {
            this.elements.highlight.style.display = 'none';
            return;
        }

        const rect = element.getBoundingClientRect();
        const padding = this.config.highlightPadding!;

        Object.assign(this.elements.highlight.style, {
            display: 'block',
            position: 'fixed',
            top: (rect.top - padding) + 'px',
            left: (rect.left - padding) + 'px',
            width: (rect.width + padding * 2) + 'px',
            height: (rect.height + padding * 2) + 'px',
        });
    }

    private updateTooltip(step: TourStep): void {
        const target = document.querySelector(step.target);
        if (!target) return;

        const targetRect = target.getBoundingClientRect();
        const tooltipRect = this.elements.tooltip.getBoundingClientRect();

        const position = this.calculateTooltipPosition(
            {
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
            },
            step.placement || 'top',
            {
                width: tooltipRect.width || 320,
                height: tooltipRect.height || 200,
            },
            step.offset || { x: 0, y: 0 }
        );

        this.elements.tooltip.style.top = position.top + 'px';
        this.elements.tooltip.style.left = position.left + 'px';
    }

    private calculateTooltipPosition(
        targetPos: Position,
        placement: string,
        tooltipSize: { width: number; height: number },
        offset: { x: number; y: number }
    ): { top: number; left: number } {
        const gap = 12;
        let top = 0;
        let left = 0;

        switch (placement) {
            case 'top':
                top = targetPos.top - tooltipSize.height - gap + offset.y;
                left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
                break;
            case 'bottom':
                top = targetPos.top + targetPos.height + gap + offset.y;
                left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
                break;
            case 'left':
                top = targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2) + offset.y;
                left = targetPos.left - tooltipSize.width - gap + offset.x;
                break;
            case 'right':
                top = targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2) + offset.y;
                left = targetPos.left + targetPos.width + gap + offset.x;
                break;
            default:
                top = targetPos.top - tooltipSize.height - gap + offset.y;
                left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipSize.width > viewportWidth - 10) {
            left = viewportWidth - tooltipSize.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipSize.height > viewportHeight - 10) {
            top = viewportHeight - tooltipSize.height - 10;
        }

        return { top, left };
    }

    private scrollToElement(target: string): void {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: this.config.scrollBehavior,
                block: 'center',
                inline: 'nearest',
            });
        }
    }

    private updateTooltipContent(step: TourStep): void {
        const stepCustomTexts = step.customTexts;

        if (this.elements.title) {
            const title = typeof step.title === 'function' ? step.title(this.translations) : step.title;
            this.elements.title.textContent = title || '';
            this.elements.title.style.display = title ? 'block' : 'none';
        }

        if (this.elements.body) {
            const content = typeof step.content === 'function' ? step.content(this.translations) : step.content;
            this.elements.body.innerHTML = content || '';
        }

        if (this.elements.stepCounter && this.config.showStepNumbers) {
            const counterText = this.formatText(
                this.getText('stepCounter'),
                { current: this.currentStep + 1, total: this.config.steps.length }
            );
            this.elements.stepCounter.textContent = counterText;
        }

        if (this.elements.progressBar && this.config.showProgress) {
            const progress = ((this.currentStep + 1) / this.config.steps.length) * 100;
            this.elements.progressBar.style.width = progress + '%';

            const progressLabel = this.formatText(
                this.getText('progressAriaLabel'),
                { current: this.currentStep + 1, total: this.config.steps.length }
            );
            this.elements.progressBar.setAttribute('aria-label', progressLabel);
        }

        const isFirstStep = this.currentStep === 0;
        const isLastStep = this.currentStep === this.config.steps.length - 1;

        if (this.elements.prevBtn) {
            this.elements.prevBtn.textContent = this.getText('previous', stepCustomTexts);
            this.elements.prevBtn.style.display = (isFirstStep || step.showPrev === false) ? 'none' : 'inline-flex';
        }

        if (this.elements.skipBtn) {
            this.elements.skipBtn.textContent = this.getText('skip', stepCustomTexts);
            this.elements.skipBtn.style.display = (isLastStep || step.showSkip === false) ? 'none' : 'inline-flex';
        }

        if (this.elements.nextBtn) {
            const buttonText = isLastStep ? this.getText('finish', stepCustomTexts) : this.getText('next', stepCustomTexts);
            this.elements.nextBtn.textContent = buttonText;
            this.elements.nextBtn.style.display = step.showNext === false ? 'none' : 'inline-flex';
        }

        if (this.elements.closeBtn) {
            this.elements.closeBtn.setAttribute('aria-label', this.getText('closeAriaLabel'));
        }

        if (this.elements.tooltip) {
            const tooltipLabel = this.formatText(
                this.getText('tooltipAriaLabel'),
                { current: this.currentStep + 1, title: step.title }
            );
            this.elements.tooltip.setAttribute('aria-label', tooltipLabel);
        }

        this.addAIFeatures(step);

        if (step.customClass) {
            this.elements.tooltip.className = `guidemefast-tooltip ${step.customClass}`;
        }

        if (this.elements.arrow) {
            const placement = step.placement || 'top';
            this.elements.arrow.className = `guidemefast-arrow guidemefast-arrow-${placement}`;
        }
    }

    private addAIFeatures(step: TourStep): void {
        if (!this.aiService || !step.aiContext?.personalizable) return;

        let aiButton = this.elements.tooltip.querySelector('.guidemefast-ai-personalize') as HTMLButtonElement;

        if (!aiButton) {
            aiButton = document.createElement('button');
            aiButton.className = 'guidemefast-btn guidemefast-btn-ghost guidemefast-ai-personalize';
            aiButton.innerHTML = `🤖 ${this.getText('aiPersonalizeButton')}`;
            aiButton.addEventListener('click', () => this.personalizeCurrentStep());

            const navigation = this.elements.tooltip.querySelector('.guidemefast-navigation');
            if (navigation?.parentNode) {
                navigation.parentNode.insertBefore(aiButton, navigation);
            }
        }
    }

    private setLoading(loading: boolean, customText?: string): void {
        this.loading = loading;

        const buttons = [this.elements.nextBtn, this.elements.prevBtn, this.elements.skipBtn];
        buttons.forEach(btn => {
            if (btn) {
                //@ts-ignore
                btn.disabled = loading;
                if (btn === this.elements.nextBtn) {
                    if (loading) {
                        btn.dataset.originalText = btn.textContent || '';
                        btn.textContent = customText || this.getText('loading');
                    } else if (btn.dataset.originalText) {
                        btn.textContent = btn.dataset.originalText;
                        delete btn.dataset.originalText;
                    }
                }
            }
        });
    }

    private async handleNext(): Promise<void> {
        if (this.loading) return;

        const step = this.config.steps[this.currentStep];
        const isLastStep = this.currentStep === this.config.steps.length - 1;

        this.setLoading(true);

        try {
            if (step?.onNext) {
                await step.onNext();
            }

            if (isLastStep) {
                this.config.onComplete?.();
                this.stop();
            } else {
                this.currentStep++;
                await this.updateStep();
            }
        } catch (error) {
            console.error('Error in onNext:', error);
        } finally {
            this.setLoading(false);
        }
    }

    private async handlePrev(): Promise<void> {
        if (this.loading || this.currentStep === 0) return;

        const step = this.config.steps[this.currentStep];

        this.setLoading(true);

        try {
            if (step?.onPrev) {
                await step.onPrev();
            }

            this.currentStep--;
            await this.updateStep();
        } catch (error) {
            console.error('Error in onPrev:', error);
        } finally {
            this.setLoading(false);
        }
    }

    public async handleSkip(): Promise<void> {
        if (this.loading) return;

        const step = this.config.steps[this.currentStep];

        this.setLoading(true);

        try {
            if (step?.onSkip) {
                await step.onSkip();
            } else if (this.config.onSkip) {
                 this.config.onSkip();
            }
        } catch (error) {
            console.error('Error in onSkip:', error);
        } finally {
            this.setLoading(false);
            this.stop();
        }
    }

    public handleClose(): void {
        this.stop();
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (this.config.closeOnEscape && e.key === 'Escape') {
            this.handleClose();
        }
    }

    private handleResize(): void {
        if (!this.isActive) return;
        this.updatePositions();
    }

    private handleScroll(): void {
        if (!this.isActive) return;
        this.updatePositions();
    }

    private attachEventListeners(): void {
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', this.handleKeyDown);
        }

        this.keyboardService?.attach();

        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    private removeEventListeners(): void {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.keyboardService?.detach();
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
    }

    private removeElements(): void {
        if (this.elements.overlay?.parentNode) {
            this.elements.overlay.parentNode.removeChild(this.elements.overlay);
        }
        this.elements = {};
    }

    getCurrentStep(): TourStep | undefined {
        return this.config.steps[this.currentStep];
    }

    getProgress(): number {
        return Math.round(((this.currentStep + 1) / this.config.steps.length) * 100);
    }

    addStep(step: TourStep, index: number | null = null): void {
        if (index === null) {
            this.config.steps.push(step);
        } else {
            this.config.steps.splice(index, 0, step);
        }
    }

    removeStep(index: number): void {
        if (index >= 0 && index < this.config.steps.length) {
            this.config.steps.splice(index, 1);

            if (this.currentStep >= index && this.currentStep > 0) {
                this.currentStep--;
            }

            if (this.isActive) {
                this.updateStep();
            }
        }
    }

    updateConfig(newConfig: Partial<TourConfig>): void {
        this.config = { ...this.config, ...newConfig };

        if (newConfig.locale || newConfig.translations) {
            this.translations = this.getTranslations();
        }

        if (newConfig.ai) {
            if (newConfig.ai.enabled && !this.aiService) {
                this.aiService = new TourAIService(newConfig.ai);
            } else if (!newConfig.ai.enabled) {
                this.aiService = undefined;
            }
        }

        if (newConfig.keyboard) {
            if (newConfig.keyboard.enabled && !this.keyboardService) {
                this.keyboardService = new KeyboardNavigationService(newConfig.keyboard, this);
                if (this.isActive) {
                    this.keyboardService.attach();
                }
            } else if (!newConfig.keyboard.enabled) {
                this.keyboardService?.detach();
                this.keyboardService = undefined;
            }
        }

        if (this.isActive && this.elements.overlay) {
            this.elements.overlay.className = `guidemefast-overlay guidemefast-theme-${this.config.theme}`;
        }
    }
}

// ============================================================================
// REACT COMPONENT
// ============================================================================

interface GuideMeFastProps {
    isOpen: boolean;
    config: TourConfig;
    onClose: () => void;
}

export const GuideMeFast: React.FC<GuideMeFastProps> = ({ isOpen, config, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetPosition, setTargetPosition] = useState<Position | null>(null);
    const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 200 });
    const [loading, setLoading] = useState(false);

    const {
        steps,
        theme = 'light',
        showProgress = true,
        showStepNumbers = true,
        backdropOpacity = 0.7,
        highlightPadding = 8,
        scrollBehavior = 'smooth',
        zIndex = 9999,
        closeOnEscape = true,
        closeOnClickOutside = false,
        customStyles = {},
        locale = 'en',
        translations,
        customTexts = {},
    } = config;

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    const currentTranslations = useMemo(() => {
        if (translations?.[locale]) {
            return { ...defaultTranslations[locale], ...translations[locale] };
        }
        return defaultTranslations[locale] || defaultTranslations.en;
    }, [locale, translations]);

    const getText = useCallback((key: keyof TourTranslations[string], stepCustomTexts?: any): string => {
        if (stepCustomTexts?.[key]) return stepCustomTexts[key];
        if (customTexts && (customTexts as any)[key]) return (customTexts as any)[key];
        return currentTranslations[key] || key;
    }, [currentTranslations, customTexts]);

    const formatText = useCallback((template: string, values: Record<string, any>): string => {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return values[key] !== undefined ? String(values[key]) : match;
        });
    }, []);

    const updatePosition = useCallback(() => {
        if (!isOpen || !currentStepData) return;

        const element = document.querySelector(currentStepData.target);
        if (!element) {
            setTargetPosition(null);
            return;
        }

        const rect = element.getBoundingClientRect();
        setTargetPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });
    }, [isOpen, currentStepData]);

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape, onClose]);

    useEffect(() => {
        if (!isOpen || !currentStepData) return;

        const timer = setTimeout(() => {
            updatePosition();
            const element = document.querySelector(currentStepData.target);
            element?.scrollIntoView({
                behavior: scrollBehavior,
                block: 'center',
                inline: 'nearest',
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [currentStep, isOpen, currentStepData, scrollBehavior, updatePosition]);

    useEffect(() => {
        if (!isOpen) return;

        let rafId: number;
        const scheduleUpdate = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updatePosition);
        };

        const handleScroll = () => scheduleUpdate();
        const handleResize = () => scheduleUpdate();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen, updatePosition]);

    const handleNext = useCallback(async () => {
        setLoading(true);
        try {
            if (currentStepData?.onNext) await currentStepData.onNext();
            if (isLastStep) {
                config.onComplete?.();
                onClose();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } finally {
            setLoading(false);
        }
    }, [currentStepData, isLastStep, config, onClose]);

    const handlePrev = useCallback(async () => {
        if (isFirstStep) return;
        setLoading(true);
        try {
            if (currentStepData?.onPrev) await currentStepData.onPrev();
            setCurrentStep(prev => prev - 1);
        } finally {
            setLoading(false);
        }
    }, [currentStepData, isFirstStep]);

    const handleSkip = useCallback(async () => {
        setLoading(true);
        try {
            if (currentStepData?.onSkip) {
                await currentStepData.onSkip();
            } else if (config.onSkip) {
                await config.onSkip();
            }
        } finally {
            setLoading(false);
            onClose();
        }
    }, [currentStepData, config, onClose]);

    const tooltipPosition = useMemo(() => {
        if (!targetPosition || !currentStepData) return { top: 0, left: 0 };

        const gap = 12;
        const placement = currentStepData.placement || 'top';
        const offset = currentStepData.offset || { x: 0, y: 0 };
        let top = 0;
        let left = 0;

        switch (placement) {
            case 'top':
                top = targetPosition.top - tooltipSize.height - gap + offset.y;
                left = targetPosition.left + (targetPosition.width / 2) - (tooltipSize.width / 2) + offset.x;
                break;
            case 'bottom':
                top = targetPosition.top + targetPosition.height + gap + offset.y;
                left = targetPosition.left + (targetPosition.width / 2) - (tooltipSize.width / 2) + offset.x;
                break;
            case 'left':
                top = targetPosition.top + (targetPosition.height / 2) - (tooltipSize.height / 2) + offset.y;
                left = targetPosition.left - tooltipSize.width - gap + offset.x;
                break;
            case 'right':
                top = targetPosition.top + (targetPosition.height / 2) - (tooltipSize.height / 2) + offset.y;
                left = targetPosition.left + targetPosition.width + gap + offset.x;
                break;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipSize.width > viewportWidth - 10) {
            left = viewportWidth - tooltipSize.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipSize.height > viewportHeight - 10) {
            top = viewportHeight - tooltipSize.height - 10;
        }

        return { top, left };
    }, [targetPosition, currentStepData, tooltipSize]);

    const highlightStyle = useMemo(() => {
        if (!targetPosition) return { display: 'none' as const };

        return {
            position: 'fixed' as const,
            top: targetPosition.top - highlightPadding,
            left: targetPosition.left - highlightPadding,
            width: targetPosition.width + (highlightPadding * 2),
            height: targetPosition.height + (highlightPadding * 2),
            zIndex: zIndex + 1,
            pointerEvents: 'none' as const,
            ...customStyles.highlight,
        };
    }, [targetPosition, highlightPadding, zIndex, customStyles.highlight]);

    if (!isOpen || !currentStepData) return null;

    return createPortal(
        <div className={`guidemefast-overlay guidemefast-theme-${theme}`}>
            <div
                className="guidemefast-backdrop"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: backdropOpacity,
                    zIndex,
                    ...customStyles.backdrop,
                }}
                onClick={closeOnClickOutside ? onClose : undefined}
            />

            {targetPosition && (
                <div
                    className="guidemefast-highlight"
                    style={highlightStyle}
                    aria-label={formatText(getText('highlightAriaLabel'), { current: currentStep + 1 })}
                />
            )}

            <div
                className={`guidemefast-tooltip ${currentStepData.customClass || ''}`}
                style={{
                    position: 'fixed',
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    zIndex: zIndex + 2,
                    ...customStyles.tooltip,
                }}
                ref={(ref) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        if (rect.width !== tooltipSize.width || rect.height !== tooltipSize.height) {
                            setTooltipSize({ width: rect.width, height: rect.height });
                        }
                    }
                }}
                role="dialog"
                aria-modal="true"
                aria-label={formatText(getText('tooltipAriaLabel'), { current: currentStep + 1, title: currentStepData.title })}
            >
                <button className="guidemefast-close" onClick={onClose} aria-label={getText('closeAriaLabel')}>×</button>

                {showProgress && (
                    <div className="guidemefast-progress">
                        <div
                            className="guidemefast-progress-bar"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            role="progressbar"
                            aria-valuenow={currentStep + 1}
                            aria-valuemin={1}
                            aria-valuemax={steps.length}
                            aria-label={formatText(getText('progressAriaLabel'), { current: currentStep + 1, total: steps.length })}
                        />
                    </div>
                )}

                {showStepNumbers && (
                    <div className="guidemefast-step-counter">
                        {formatText(getText('stepCounter'), { current: currentStep + 1, total: steps.length })}
                    </div>
                )}

                <div className="guidemefast-content">
                    {currentStepData.title && (
                        <h3 className="guidemefast-title">
                            {typeof currentStepData.title === 'function' ? currentStepData.title(currentTranslations) : currentStepData.title}
                        </h3>
                    )}
                    <div className="guidemefast-body">
                        {typeof currentStepData.content === 'function' ? currentStepData.content(currentTranslations) : currentStepData.content}
                    </div>
                </div>

                <div className="guidemefast-navigation">
                    {!isFirstStep && currentStepData.showPrev !== false && (
                        <button className="guidemefast-btn guidemefast-btn-secondary" onClick={handlePrev} disabled={loading}>
                            {getText('previous', currentStepData.customTexts)}
                        </button>
                    )}

                    {currentStepData.showSkip !== false && !isLastStep && (
                        <button className="guidemefast-btn guidemefast-btn-ghost" onClick={handleSkip} disabled={loading}>
                            {getText('skip', currentStepData.customTexts)}
                        </button>
                    )}

                    {currentStepData.showNext !== false && (
                        <button className="guidemefast-btn guidemefast-btn-primary" onClick={handleNext} disabled={loading}>
                            {loading ? getText('loading') : (isLastStep ? getText('finish', currentStepData.customTexts) : getText('next', currentStepData.customTexts))}
                        </button>
                    )}
                </div>

                <div className={`guidemefast-arrow guidemefast-arrow-${currentStepData.placement || 'top'}`} />
            </div>
        </div>,
        document.body
    );
};

// ============================================================================
// REACT HOOKS
// ============================================================================

export const useEnhancedGuideMeFast = (config: TourConfig) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tourInstance, setTourInstance] = useState<EnhancedGuideMeFast | null>(null);

    useEffect(() => {
        const instance = new EnhancedGuideMeFast({
            ...config,
            onComplete: () => {
                config.onComplete?.();
                setIsOpen(false);
            },
            onSkip: () => {
                config.onSkip?.();
                setIsOpen(false);
            }
        });
        setTourInstance(instance);

        return () => {
            instance.stop();
        };
    }, []);

    const startTour = useCallback(async () => {
        if (tourInstance) {
            setIsOpen(true);
            await tourInstance.start();
        }
    }, [tourInstance]);

    const endTour = useCallback(() => {
        if (tourInstance) {
            tourInstance.stop();
            setIsOpen(false);
        }
    }, [tourInstance]);

    const personalizeCurrentStep = useCallback(async () => {
        if (tourInstance) {
            await tourInstance.personalizeCurrentStep();
        }
    }, [tourInstance]);

    const setUserContext = useCallback((context: any) => {
        if (tourInstance) {
            tourInstance.setUserContext(context);
        }
    }, [tourInstance]);

    const generateTourFromPage = useCallback(async (options?: any) => {
        if (tourInstance) {
            return await tourInstance.generateTourFromPage(options);
        }
        return [];
    }, [tourInstance]);

    return {
        startTour,
        endTour,
        isOpen,
        tourInstance,
        personalizeCurrentStep,
        setUserContext,
        generateTourFromPage
    };
};

export const useGuideMeFast = (config: TourConfig) => {
    const [isOpen, setIsOpen] = useState(false);

    const startTour = useCallback(() => setIsOpen(true), []);
    const endTour = useCallback(() => setIsOpen(false), []);

    const TourComponent = useMemo(() => (
        <GuideMeFast
            isOpen={isOpen}
            config={{
                ...config,
                onComplete: () => {
                    config.onComplete?.();
                    setIsOpen(false);
                },
                onSkip: () => {
                    config.onSkip?.();
                    setIsOpen(false);
                }
            }}
            onClose={endTour}
        />
    ), [isOpen, config, endTour]);

    return { startTour, endTour, isOpen, TourComponent };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default GuideMeFast;

if (typeof window !== 'undefined') {
    (window as any).EnhancedGuideMeFast = EnhancedGuideMeFast;
    (window as any).TourAIService = TourAIService;
    (window as any).KeyboardNavigationService = KeyboardNavigationService;
    (window as any).GuideMeFastTranslations = defaultTranslations;
}