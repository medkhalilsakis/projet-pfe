import { RendererFactory2 } from '@angular/core';
import { AnnotationMode, EditorAnnotation } from './options/editor-annotations';
import { PdfLayer } from './options/optional_content_config';
import { PDFPrintRange } from './options/pdf-print-range';
import { PDFNotificationService } from './pdf-notification-service';
import * as i0 from "@angular/core";
export interface FindOptions {
    highlightAll?: boolean;
    matchCase?: boolean;
    wholeWords?: boolean;
    matchDiacritics?: boolean;
    dontScrollIntoView?: boolean;
    findMultiple?: boolean;
    regexp?: boolean;
    useSecondaryFindcontroller?: boolean;
}
export interface PDFExportScaleFactor {
    width?: number;
    height?: number;
    scale?: number;
}
type DirectionType = 'ltr' | 'rtl' | 'both' | undefined;
export interface PdfImageParameters {
    urlOrDataUrl: string;
    page?: number;
    left?: number | string;
    bottom?: number | string;
    right?: number | string;
    top?: number | string;
    rotation?: 0 | 90 | 180 | 270;
}
export interface Line {
    x: number;
    y: number;
    width: number;
    height: number;
    direction: DirectionType;
    text: string;
}
export interface Section {
    x: number;
    y: number;
    width: number;
    height: number;
    direction: DirectionType;
    lines: Array<Line>;
}
export declare class NgxExtendedPdfViewerService {
    private readonly rendererFactory;
    ngxExtendedPdfViewerInitialized: boolean;
    secondaryMenuIsEmpty: boolean;
    private readonly renderer;
    private PDFViewerApplication?;
    constructor(rendererFactory: RendererFactory2, notificationService: PDFNotificationService);
    find(text: string | string[] | RegExp, options?: FindOptions): Array<Promise<number>> | undefined;
    findNext(useSecondaryFindcontroller?: boolean): boolean;
    findPrevious(useSecondaryFindcontroller?: boolean): boolean;
    print(printRange?: PDFPrintRange): void;
    removePrintRange(): void;
    setPrintRange(printRange: PDFPrintRange): void;
    filteredPageCount(pageCount: number, range: PDFPrintRange): number;
    isInPDFPrintRange(pageIndex: number, printRange: PDFPrintRange): boolean;
    getPageAsLines(pageNumber: number): Promise<Array<Line>>;
    getPageAsText(pageNumber: number): Promise<string>;
    private convertTextInfoToText;
    getPageAsCanvas(pageNumber: number, scale: PDFExportScaleFactor, background?: string, backgroundColorToReplace?: string, annotationMode?: AnnotationMode): Promise<HTMLCanvasElement | undefined>;
    getPageAsImage(pageNumber: number, scale: PDFExportScaleFactor, background?: string, backgroundColorToReplace?: string, annotationMode?: AnnotationMode): Promise<string | undefined>;
    private draw;
    private getPageDrawContext;
    getCurrentDocumentAsBlob(): Promise<Blob | undefined>;
    getFormData(currentFormValues?: boolean): Promise<Array<Object>>;
    /**
     * Adds a page to the rendering queue
     * @param {number} pageIndex Index of the page to render
     * @returns {boolean} false, if the page has already been rendered,
     * if it's out of range or if the viewer hasn't been initialized yet
     */
    addPageToRenderQueue(pageIndex: number): boolean;
    isRenderQueueEmpty(): boolean;
    hasPageBeenRendered(pageIndex: number): boolean;
    private sleep;
    renderPage(pageIndex: number): Promise<void>;
    currentlyRenderedPages(): Array<number>;
    numberOfPages(): number;
    getCurrentlyVisiblePageNumbers(): Array<number>;
    listLayers(): Promise<Array<PdfLayer> | undefined>;
    toggleLayer(layerId: string): Promise<void>;
    scrollPageIntoView(pageNumber: number, pageSpot?: {
        top?: number | string;
        left?: number | string;
    }): void;
    getSerializedAnnotations(): EditorAnnotation[] | null | undefined;
    addEditorAnnotation(serializedAnnotation: string | EditorAnnotation): Promise<void>;
    removeEditorAnnotations(filter?: (serialized: object) => boolean): void;
    private loadImageAsDataURL;
    addImageToAnnotationLayer({ urlOrDataUrl, page, left, bottom, right, top, rotation }: PdfImageParameters): Promise<void>;
    currentPageIndex(): number | undefined;
    private convertToPDFCoordinates;
    switchAnnotationEdtorMode(mode: number): void;
    set editorFontSize(size: number);
    set editorFontColor(color: string);
    set editorInkColor(color: string);
    set editorInkOpacity(opacity: number);
    set editorInkThickness(thickness: number);
    set editorHighlightColor(color: string);
    set editorHighlightDefaultColor(color: string);
    set editorHighlightShowAll(showAll: boolean);
    set editorHighlightThickness(thickness: number);
    setEditorProperty(editorPropertyType: number, value: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxExtendedPdfViewerService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NgxExtendedPdfViewerService>;
}
export {};
