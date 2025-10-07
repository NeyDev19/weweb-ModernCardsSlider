import { getContent } from './src/getContent.js';

export default {
    editor: {
        label: {
            en: 'Card Carousel', 
        },
        icon: 'slider', 
        bubble: {
            icon: 'slider',
        },
        customSettingsPropertiesOrder: [
            ['mainLayoutContent', 'slideIndex'],
            ['cardType', 'height', 'direction'], 
            ['transitionDuration', 'trigger'], 
            'navigation',
            'pagination',
            'loop',
            'autoplay', 
            ['autoplayInterval', 'pauseOnHover'], 
        ],
    },
    actions: [
        {
            action: 'addSlide',
            label: { en: 'Add slide' },
        },
        {
            action: 'removeSlide',
            label: { en: 'Remove slide' },
            args: [
                {
                    name: 'index',
                    type: 'number',
                    label: { en: 'Slide index' },
                },
            ],
        },
        {
            action: 'moveSlideUp',
            label: { en: 'Move slide up' },
            args: [
                {
                    name: 'index',
                    type: 'number',
                    label: { en: 'Slide index' },
                },
            ],
        },
        {
            action: 'moveSlideDown',
            label: { en: 'Move slide down' },
            args: [
                {
                    name: 'index',
                    type: 'number',
                    label: { en: 'Slide index' },
                },
            ],
        },
        {
            action: 'updateSlideLabel',
            label: { en: 'Update slide label' },
            args: [
                {
                    name: 'payload',
                    type: 'object',
                    label: { en: 'Slide data' },
                    options: {
                        item: {
                            index: { type: 'number', label: { en: 'Slide index' } },
                            label: { type: 'string', label: { en: 'New label' } },
                        },
                    },
                },
            ],
        },
        { 
            action: 'setActiveItem',
            label: { en: 'Set Active Slide' },
            args: [
                {
                    name: 'index',
                    type: 'number',
                    label: { en: 'Slide index' },
                },
            ],
        },
        { 
            action: 'prev',
            label: { en: 'Previous Slide' },
        },
        { 
            action: 'next',
            label: { en: 'Next Slide' },
        },
    ],
    properties: {
        mainLayoutContent: {
            label: {
                en: 'Bind slides',
            },
            bindable: 'repeatable',
            type: 'Info',
            options: {
                text: ' ',
            },
            section: 'settings',
            defaultValue: [
                { isWwObject: true, type: 'ww-flexbox' },
                { isWwObject: true, type: 'ww-flexbox' },
                { isWwObject: true, type: 'ww-flexbox' },
            ],
            navigator: {
                group: 'Slides',
            },
            
            bindingValidation: {
                validations: [
                    {
                        type: 'array',
                    },
                    {
                        type: 'object',
                    },
                ],
                tooltip:
                    'A collection or an array of data: \n\n`myCollection` or `[{}, {}, ...] || ["string1", "string2", ...] || [1, 2, ...]`',
            },
            
        },
        slideIndex: {
            label: { en: 'Slides', fr: 'Slides' },
            type: 'Tabs',
            editorOnly: true,
            options: (content, _, boundProps) => {
                const isBound = !!boundProps.mainLayoutContent;
                const _content = getContent(content.mainLayoutContent);

                return {
                    labels: _content.map((_, index) => ({
                        label: content.slideLabels?.[index] || `slide ${index + 1}`,
                        customizable: true,
                    })),
                    prefixLabel: 'Slide',
                    nbTabs: _content.length,
                    add: 'addSlide',
                    remove: 'removeSlide',
                    orderable: true,
                    moveUp: 'moveSlideUp',
                    moveDown: 'moveSlideDown',
                    updateLabel: 'updateSlideLabel',
                    fixed: isBound,
                };
            },
            section: 'settings',
            defaultValue: 0,
        },
        cardType: { 
            label: {
                en: 'Carousel Type',
                fr: 'Type de carrousel',
            },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'card', label: { en: 'Card (Stacked)' } }, 
                ],
            },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: 'card',
            section: 'settings',
        },
        height: { 
            type: 'Length',
            label: {
                en: 'Height',
                fr: 'Hauteur',
            },
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0 }, { value: '%', label: '%' }, { value: 'vh', label: 'vh' }],
            },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: '260px', 
            section: 'settings',
        },
        transitionDuration: { 
            type: 'Length',
            label: {
                en: 'Transition Duration',
                fr: 'Durée de transition',
            },
            options: {
                unitChoices: [{ value: 'ms', label: 'ms', min: 0, max: 20000 }],
            },
            defaultValue: '500ms', 
            section: 'settings',
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
        },
        trigger: { 
            label: {
                en: 'Indicator Trigger',
                fr: 'Déclencheur d\'indicateur',
            },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'hover', label: { en: 'Hover' } },
                    { value: 'click', label: { en: 'Click' } },
                ],
            },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: 'hover',
            section: 'settings',
            hidden: content => !content.pagination, 
        },
        navigation: {
            type: 'OnOff',
            label: {
                en: 'Navigation Arrows', 
                fr: 'Flèches de navigation',
            },
            defaultValue: true,
            section: 'settings',
        },
        pagination: {
            type: 'OnOff',
            label: {
                en: 'Pagination Indicators', 
                fr: 'Indicateurs de pagination',
            },
            defaultValue: true, 
            section: 'settings',
        },
        loop: {
            type: 'OnOff',
            label: {
                en: 'Loop',
                fr: 'Boucle',
            },
            defaultValue: false,
            section: 'settings',
        },
        autoplay: { 
            type: 'OnOff',
            label: {
                en: 'Autoplay',
                fr: 'Lecture automatique',
            },
            defaultValue: false,
            section: 'settings',
        },
        autoplayInterval: { 
            hidden: content => !content.autoplay,
            type: 'Length',
            label: {
                en: 'Interval',
                fr: 'Intervalle',
            },
            options: {
                unitChoices: [{ value: 'ms', label: 'ms', min: 100, max: 20000 }], 
            },
            defaultValue: '3000ms',
            section: 'settings',
        },
        direction: { 
            label: {
                en: 'Direction',
                fr: 'Direction',
            },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'horizontal', label: { en: 'Horizontal' } },
                    { value: 'vertical', label: { en: 'Vertical' } },
                ],
            },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: 'horizontal',
            section: 'settings',
        },
        pauseOnHover: { 
            hidden: content => !content.autoplay,
            type: 'OnOff',
            label: {
                en: 'Pause on Hover',
                fr: 'Mettre en pause au survol',
            },
            defaultValue: true,
            section: 'settings',
        },
        slidesContainer: {
            hidden: true,
            defaultValue: [],
        },
        navigationIcons: {
            hidden: true,
            defaultValue: [
                { isWwObject: true, type: 'ww-icon', content: { icon: 'wwi-arrow-left' } }, 
                { isWwObject: true, type: 'ww-icon', content: { icon: 'wwi-arrow-right' } }, 
            ],
        },
        bulletsIcons: {
            hidden: true,
            isArray: false,
            defaultValue: { isWwObject: true, type: 'ww-icon', content: { icon: '' } }, 
        },
        slideLabels: {
            hidden: true,
            defaultValue: [],
        },
    },
};