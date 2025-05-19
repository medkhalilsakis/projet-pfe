import { IBaseProps } from '../../base';
import { MbscResponsiveOptions } from '../../commons';
import { MbscCalendarEvent, MbscResource } from '../../shared/calendar-view/calendar-view.types';
export interface MbscDraggableOptions extends IBaseProps {
    /** Specify where the dragged element will be appended in the DOM. */
    context?: string | HTMLElement;
    /** The data of the dragged element. */
    dragData?: MbscCalendarEvent | MbscResource | string;
    /** The HTML element of the dragged item. */
    element?: HTMLElement | null;
    /** Specify the type of the draggable element */
    type?: 'event' | 'resource';
    /** @hidden */
    cssClass?: string;
    /** @hidden */
    responsive?: MbscResponsiveOptions;
    /** @hidden */
    theme?: string;
    /** @hidden */
    themeVariant?: 'light' | 'dark' | 'auto';
}
