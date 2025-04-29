import { effect, Injectable } from '@angular/core';
import { AnnotationEditorParamsType, AnnotationMode } from './options/editor-annotations';
import * as i0 from "@angular/core";
import * as i1 from "./pdf-notification-service";
export class NgxExtendedPdfViewerService {
    rendererFactory;
    ngxExtendedPdfViewerInitialized = false;
    secondaryMenuIsEmpty = false;
    renderer;
    PDFViewerApplication;
    constructor(rendererFactory, notificationService) {
        this.rendererFactory = rendererFactory;
        this.renderer = this.rendererFactory.createRenderer(null, null);
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
        });
    }
    find(text, options = {}) {
        if (!this.ngxExtendedPdfViewerInitialized) {
            // tslint:disable-next-line:quotemark
            console.error("The PDF viewer hasn't finished initializing. Please call find() later.");
            return undefined;
        }
        else {
            if (!options.useSecondaryFindcontroller) {
                const highlightAllCheckbox = document.getElementById('findHighlightAll');
                if (highlightAllCheckbox) {
                    highlightAllCheckbox.checked = options.highlightAll ?? false;
                }
                const matchCaseCheckbox = document.getElementById('findMatchCase');
                if (matchCaseCheckbox) {
                    matchCaseCheckbox.checked = options.matchCase ?? false;
                }
                const findMultipleCheckbox = document.getElementById('findMultiple');
                if (findMultipleCheckbox) {
                    findMultipleCheckbox.checked = options.findMultiple ?? false;
                }
                const entireWordCheckbox = document.getElementById('findEntireWord');
                if (entireWordCheckbox) {
                    entireWordCheckbox.checked = options.wholeWords ?? false;
                }
                const matchDiacriticsCheckbox = document.getElementById('findMatchDiacritics');
                if (matchDiacriticsCheckbox) {
                    matchDiacriticsCheckbox.checked = options.matchDiacritics ?? false;
                }
                const matchRegExpCheckbox = document.getElementById('matchRegExp');
                if (matchRegExpCheckbox) {
                    matchRegExpCheckbox.checked = options.regexp ?? false;
                    if (matchRegExpCheckbox.checked) {
                        if (findMultipleCheckbox) {
                            findMultipleCheckbox.checked = false;
                        }
                        if (entireWordCheckbox) {
                            entireWordCheckbox.checked = false;
                        }
                        if (matchDiacriticsCheckbox) {
                            matchDiacriticsCheckbox.checked = false;
                        }
                    }
                    if (findMultipleCheckbox) {
                        findMultipleCheckbox.disabled = matchRegExpCheckbox.checked;
                    }
                    if (entireWordCheckbox) {
                        entireWordCheckbox.disabled = matchRegExpCheckbox.checked;
                    }
                    if (matchDiacriticsCheckbox) {
                        matchDiacriticsCheckbox.disabled = matchRegExpCheckbox.checked;
                    }
                }
                const inputField = document.getElementById('findInput');
                if (inputField && typeof text === 'string') {
                    inputField.value = text;
                }
            }
            const findParameters = {
                caseSensitive: options.matchCase ?? false,
                entireWord: options.wholeWords ?? false,
                highlightAll: options.highlightAll ?? false,
                matchDiacritics: options.matchDiacritics ?? false,
                findMultiple: options.findMultiple,
                matchRegExp: options.regexp ?? false,
                findPrevious: false,
                query: text,
                source: null,
                type: 'find',
                dontScrollIntoView: options.dontScrollIntoView ?? false,
            };
            const findController = options.useSecondaryFindcontroller ? this.PDFViewerApplication?.customFindController : this.PDFViewerApplication?.findController;
            const result = findController?.ngxFind(findParameters);
            return result;
        }
    }
    findNext(useSecondaryFindcontroller = false) {
        if (!this.ngxExtendedPdfViewerInitialized) {
            // tslint:disable-next-line:quotemark
            console.error("The PDF viewer hasn't finished initializing. Please call findNext() later.");
            return false;
        }
        else {
            const findController = useSecondaryFindcontroller ? this.PDFViewerApplication?.customFindController : this.PDFViewerApplication?.findController;
            findController?.ngxFindNext();
            return true;
        }
    }
    findPrevious(useSecondaryFindcontroller = false) {
        if (!this.ngxExtendedPdfViewerInitialized) {
            // tslint:disable-next-line:quotemark
            console.error("The PDF viewer hasn't finished initializing. Please call findPrevious() later.");
            return false;
        }
        else {
            const findController = useSecondaryFindcontroller ? this.PDFViewerApplication?.customFindController : this.PDFViewerApplication?.findController;
            findController?.ngxFindPrevious();
            return true;
        }
    }
    print(printRange) {
        if (this.PDFViewerApplication) {
            const alreadyPrinting = this.PDFViewerApplication?.PDFPrintServiceFactory?.isInPDFPrintRange !== undefined;
            if (!alreadyPrinting) {
                // slow down hurried users clicking the print button multiple times
                if (!printRange) {
                    printRange = {};
                }
                this.setPrintRange(printRange);
                this.PDFViewerApplication?.printPdf();
                this.PDFViewerApplication?.eventBus.on('afterprint', this.removePrintRange.bind(this), { once: true });
            }
        }
    }
    removePrintRange() {
        if (this.PDFViewerApplication?.PDFPrintServiceFactory) {
            delete this.PDFViewerApplication.PDFPrintServiceFactory.isInPDFPrintRange;
            delete this.PDFViewerApplication.PDFPrintServiceFactory.filteredPageCount;
        }
    }
    setPrintRange(printRange) {
        if (!this.PDFViewerApplication?.PDFPrintServiceFactory) {
            console.error("The print service hasn't been initialized yet.");
            return;
        }
        this.PDFViewerApplication.PDFPrintServiceFactory.isInPDFPrintRange = (page) => this.isInPDFPrintRange(page, printRange);
        this.PDFViewerApplication.PDFPrintServiceFactory.filteredPageCount = this.filteredPageCount(this.PDFViewerApplication?.pagesCount, printRange);
    }
    filteredPageCount(pageCount, range) {
        let result = 0;
        for (let page = 0; page < pageCount; page++) {
            if (this.isInPDFPrintRange(page, range)) {
                result++;
            }
        }
        return result;
    }
    isInPDFPrintRange(pageIndex, printRange) {
        const page = pageIndex + 1;
        if (printRange.from) {
            if (page < printRange.from) {
                return false;
            }
        }
        if (printRange.to) {
            if (page > printRange.to) {
                return false;
            }
        }
        if (printRange.excluded) {
            if (printRange.excluded.some((p) => p === page)) {
                return false;
            }
        }
        if (printRange.included) {
            if (!printRange.included.some((p) => p === page)) {
                return false;
            }
        }
        return true;
    }
    async getPageAsLines(pageNumber) {
        if (this.PDFViewerApplication) {
            const pdfDocument = this.PDFViewerApplication?.pdfDocument;
            const page = await pdfDocument.getPage(pageNumber);
            const textSnippets = (await page.getTextContent()).items //
                .filter((info) => !info['type']); // ignore the TextMarkedContent items
            const snippets = textSnippets;
            let minX = Number.MAX_SAFE_INTEGER;
            let minY = Number.MAX_SAFE_INTEGER;
            let maxX = Number.MIN_SAFE_INTEGER;
            let maxY = Number.MIN_SAFE_INTEGER;
            let countLTR = 0;
            let countRTL = 0;
            let text = '';
            let lines = new Array();
            for (let i = 0; i < snippets.length; i++) {
                const currentSnippet = snippets[i];
                if (!currentSnippet.hasEOL) {
                    const x = currentSnippet.transform[4];
                    const y = -currentSnippet.transform[5];
                    const width = currentSnippet.width;
                    const height = currentSnippet.height;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x + width);
                    maxY = Math.max(maxY, y + height);
                    text += currentSnippet.str;
                    if (currentSnippet.dir === 'rtl') {
                        countRTL++;
                    }
                    if (currentSnippet.dir === 'ltr') {
                        countLTR++;
                    }
                }
                let addIt = i === snippets.length - 1 || currentSnippet.hasEOL;
                if (addIt) {
                    let direction = undefined;
                    if (countLTR > 0 && countRTL > 0) {
                        direction = 'both';
                    }
                    else if (countLTR > 0) {
                        direction = 'ltr';
                    }
                    else if (countRTL > 0) {
                        direction = 'rtl';
                    }
                    const line = {
                        direction,
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY,
                        text: text.trim(),
                    };
                    lines.push(line);
                    minX = Number.MAX_SAFE_INTEGER;
                    minY = Number.MAX_SAFE_INTEGER;
                    maxX = Number.MIN_SAFE_INTEGER;
                    maxY = Number.MIN_SAFE_INTEGER;
                    countLTR = 0;
                    countRTL = 0;
                    text = '';
                }
            }
            return lines;
        }
        return [];
    }
    async getPageAsText(pageNumber) {
        if (!this.PDFViewerApplication) {
            return '';
        }
        const pdfDocument = this.PDFViewerApplication?.pdfDocument;
        const page = await pdfDocument.getPage(pageNumber);
        const textSnippets = (await page.getTextContent()).items;
        return this.convertTextInfoToText(textSnippets);
    }
    convertTextInfoToText(textInfoItems) {
        if (!textInfoItems) {
            return '';
        }
        return textInfoItems
            .filter((info) => !info['type'])
            .map((info) => (info.hasEOL ? info.str + '\n' : info.str))
            .join('');
    }
    async getPageAsCanvas(pageNumber, scale, background, backgroundColorToReplace = '#FFFFFF', annotationMode = AnnotationMode.ENABLE) {
        if (!this.PDFViewerApplication) {
            return Promise.resolve(undefined);
        }
        const pdfDocument = this.PDFViewerApplication.pdfDocument;
        const pdfPage = await pdfDocument.getPage(pageNumber);
        return this.draw(pdfPage, scale, background, backgroundColorToReplace, annotationMode);
    }
    async getPageAsImage(pageNumber, scale, background, backgroundColorToReplace = '#FFFFFF', annotationMode = AnnotationMode.ENABLE) {
        const canvas = await this.getPageAsCanvas(pageNumber, scale, background, backgroundColorToReplace, annotationMode);
        return canvas?.toDataURL();
    }
    async draw(pdfPage, scale, background, backgroundColorToReplace = '#FFFFFF', annotationMode = AnnotationMode.ENABLE) {
        let zoomFactor = 1;
        if (scale.scale) {
            zoomFactor = scale.scale;
        }
        else if (scale.width) {
            zoomFactor = scale.width / pdfPage.getViewport({ scale: 1 }).width;
        }
        else if (scale.height) {
            zoomFactor = scale.height / pdfPage.getViewport({ scale: 1 }).height;
        }
        const viewport = pdfPage.getViewport({
            scale: zoomFactor,
        });
        const { ctx, canvas } = this.getPageDrawContext(viewport.width, viewport.height);
        const drawViewport = viewport.clone();
        const renderContext = {
            canvasContext: ctx,
            viewport: drawViewport,
            background,
            backgroundColorToReplace,
            annotationMode,
        };
        const renderTask = pdfPage.render(renderContext);
        const dataUrlPromise = () => Promise.resolve(canvas);
        return renderTask.promise.then(dataUrlPromise);
    }
    getPageDrawContext(width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
            // tslint:disable-next-line: quotemark
            throw new Error("Couldn't create the 2d context");
        }
        canvas.width = width;
        canvas.height = height;
        this.renderer.setStyle(canvas, 'width', `${width}px`);
        this.renderer.setStyle(canvas, 'height', `${height}px`);
        return { ctx, canvas };
    }
    async getCurrentDocumentAsBlob() {
        return (await this.PDFViewerApplication?.export()) || undefined;
    }
    async getFormData(currentFormValues = true) {
        if (!this.PDFViewerApplication) {
            return [];
        }
        const pdf = this.PDFViewerApplication?.pdfDocument;
        // screen DPI / PDF DPI
        const dpiRatio = 96 / 72;
        const result = [];
        for (let i = 1; i <= pdf?.numPages; i++) {
            // track the current page
            const currentPage /* : PDFPageProxy */ = await pdf.getPage(i);
            const annotations = await currentPage.getAnnotations();
            annotations
                .filter((a) => a.subtype === 'Widget') // get the form field annotations only
                .map((a) => ({ ...a })) // only expose copies of the annotations to avoid side-effects
                .forEach((a) => {
                // get the rectangle that represent the single field
                // and resize it according to the current DPI
                const fieldRect = currentPage.getViewport({ scale: dpiRatio }).convertToViewportRectangle(a.rect);
                // add the corresponding input
                if (currentFormValues && a.fieldName) {
                    try {
                        if (a.exportValue) {
                            const currentValue = this.PDFViewerApplication?.pdfDocument.annotationStorage.getValue(a.id, a.fieldName + '/' + a.exportValue, '');
                            a.value = currentValue?.value;
                        }
                        else if (a.radioButton) {
                            const currentValue = this.PDFViewerApplication?.pdfDocument.annotationStorage.getValue(a.id, a.fieldName + '/' + a.fieldValue, '');
                            a.value = currentValue?.value;
                        }
                        else {
                            const currentValue = this.PDFViewerApplication?.pdfDocument.annotationStorage.getValue(a.id, a.fieldName, '');
                            a.value = currentValue?.value;
                        }
                    }
                    catch (exception) {
                        // just ignore it
                    }
                }
                result.push({ fieldAnnotation: a, fieldRect, pageNumber: i });
            });
        }
        return result;
    }
    /**
     * Adds a page to the rendering queue
     * @param {number} pageIndex Index of the page to render
     * @returns {boolean} false, if the page has already been rendered,
     * if it's out of range or if the viewer hasn't been initialized yet
     */
    addPageToRenderQueue(pageIndex) {
        return this.PDFViewerApplication?.pdfViewer.addPageToRenderQueue(pageIndex) ?? false;
    }
    isRenderQueueEmpty() {
        const scrolledDown = true;
        const renderExtra = false;
        if (this.PDFViewerApplication) {
            const nextPage = this.PDFViewerApplication.pdfViewer.renderingQueue.getHighestPriority(this.PDFViewerApplication?.pdfViewer._getVisiblePages(), this.PDFViewerApplication?.pdfViewer._pages, scrolledDown, renderExtra);
            return !nextPage;
        }
        return true;
    }
    hasPageBeenRendered(pageIndex) {
        if (!this.PDFViewerApplication) {
            return false;
        }
        const pages = this.PDFViewerApplication?.pdfViewer._pages;
        if (pages.length > pageIndex && pageIndex >= 0) {
            const pageView = pages[pageIndex];
            const hasBeenRendered = pageView.renderingState === 3;
            return hasBeenRendered;
        }
        return false;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async renderPage(pageIndex) {
        if (!this.hasPageBeenRendered(pageIndex)) {
            await this.addPageToRenderQueue(pageIndex);
            while (!this.hasPageBeenRendered(pageIndex)) {
                await this.sleep(7);
            }
        }
    }
    currentlyRenderedPages() {
        if (!this.PDFViewerApplication) {
            return [];
        }
        const pages = this.PDFViewerApplication?.pdfViewer._pages;
        return pages.filter((page) => page.renderingState === 3).map((page) => page.id);
    }
    numberOfPages() {
        if (!this.PDFViewerApplication) {
            return 0;
        }
        const pages = this.PDFViewerApplication?.pdfViewer._pages;
        return pages.length;
    }
    getCurrentlyVisiblePageNumbers() {
        const app = this.PDFViewerApplication;
        if (!app) {
            return [];
        }
        const pages = app.pdfViewer._getVisiblePages().views;
        return pages?.map((page) => page.id);
    }
    async listLayers() {
        if (!this.PDFViewerApplication) {
            return [];
        }
        const optionalContentConfig = await this.PDFViewerApplication?.pdfViewer.optionalContentConfigPromise;
        if (optionalContentConfig) {
            const levelData = optionalContentConfig.getOrder();
            const layerIds = levelData.filter((groupId) => typeof groupId !== 'object');
            return layerIds.map((layerId) => {
                const config = optionalContentConfig.getGroup(layerId);
                return {
                    layerId: layerId,
                    name: config.name,
                    visible: config.visible,
                };
            });
        }
        return undefined;
    }
    async toggleLayer(layerId) {
        if (!this.PDFViewerApplication) {
            return;
        }
        const optionalContentConfig = await this.PDFViewerApplication?.pdfViewer.optionalContentConfigPromise;
        if (optionalContentConfig) {
            let isVisible = optionalContentConfig.getGroup(layerId).visible;
            const checkbox = document.querySelector(`input[id='${layerId}']`);
            if (checkbox) {
                isVisible = checkbox.checked;
                checkbox.checked = !isVisible;
            }
            optionalContentConfig.setVisibility(layerId, !isVisible);
            this.PDFViewerApplication?.eventBus.dispatch('optionalcontentconfig', {
                source: this,
                promise: Promise.resolve(optionalContentConfig),
            });
        }
    }
    scrollPageIntoView(pageNumber, pageSpot) {
        const viewer = this.PDFViewerApplication?.pdfViewer;
        viewer?.scrollPagePosIntoView(pageNumber, pageSpot);
    }
    getSerializedAnnotations() {
        return this.PDFViewerApplication?.pdfViewer.getSerializedAnnotations();
    }
    async addEditorAnnotation(serializedAnnotation) {
        await this.PDFViewerApplication?.pdfViewer.addEditorAnnotation(serializedAnnotation);
    }
    removeEditorAnnotations(filter) {
        this.PDFViewerApplication?.pdfViewer.removeEditorAnnotations(filter);
    }
    async loadImageAsDataURL(imageUrl) {
        if (imageUrl.startsWith('data:')) {
            return imageUrl;
        }
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch the image from ${imageUrl}: ${response.statusText}`);
        }
        const imageBlob = await response.blob();
        return imageBlob;
    }
    async addImageToAnnotationLayer({ urlOrDataUrl, page, left, bottom, right, top, rotation }) {
        if (!this.PDFViewerApplication) {
            console.error('The PDF viewer has not been initialized yet.');
            return;
        }
        let pageToModify;
        if (page !== undefined) {
            if (page !== this.currentPageIndex()) {
                await this.renderPage(page);
            }
            pageToModify = page;
        }
        else {
            pageToModify = this.currentPageIndex() ?? 0;
        }
        const previousAnnotationEditorMode = this.PDFViewerApplication.pdfViewer.annotationEditorMode;
        this.switchAnnotationEdtorMode(13);
        const dataUrl = await this.loadImageAsDataURL(urlOrDataUrl);
        const pageSize = this.PDFViewerApplication.pdfViewer._pages[pageToModify].pdfPage.view;
        const leftDim = pageSize[0];
        const bottomDim = pageSize[1];
        const rightDim = pageSize[2];
        const topDim = pageSize[3];
        const width = rightDim - leftDim;
        const height = topDim - bottomDim;
        const imageWidth = this.PDFViewerApplication?.pdfViewer._pages[pageToModify].div.clientWidth;
        const imageHeight = this.PDFViewerApplication?.pdfViewer._pages[pageToModify].div.clientHeight;
        const leftPdf = this.convertToPDFCoordinates(left, width, 0, imageWidth);
        const bottomPdf = this.convertToPDFCoordinates(bottom, height, 0, imageHeight);
        const rightPdf = this.convertToPDFCoordinates(right, width, width, imageWidth);
        const topPdf = this.convertToPDFCoordinates(top, height, height, imageHeight);
        const stampAnnotation = {
            annotationType: 13,
            pageIndex: pageToModify,
            bitmapUrl: dataUrl,
            rect: [leftPdf, bottomPdf, rightPdf, topPdf],
            rotation: rotation ?? 0,
        };
        this.addEditorAnnotation(stampAnnotation);
        await this.sleep(10);
        this.switchAnnotationEdtorMode(previousAnnotationEditorMode);
    }
    currentPageIndex() {
        const viewer = this.PDFViewerApplication?.pdfViewer;
        if (viewer) {
            return viewer.currentPageNumber - 1;
        }
        return undefined;
    }
    convertToPDFCoordinates(value, maxValue, defaultValue, imageMaxValue) {
        if (!value) {
            return defaultValue;
        }
        if (typeof value === 'string') {
            if (value.endsWith('%')) {
                return (parseInt(value, 10) / 100) * maxValue;
            }
            else if (value.endsWith('px')) {
                return parseInt(value, 10) * (maxValue / imageMaxValue);
            }
            else {
                return parseInt(value, 10);
            }
        }
        else {
            return value;
        }
    }
    switchAnnotationEdtorMode(mode) {
        this.PDFViewerApplication?.eventBus.dispatch('switchannotationeditormode', { mode });
    }
    set editorFontSize(size) {
        this.setEditorProperty(AnnotationEditorParamsType.FREETEXT_SIZE, size);
    }
    set editorFontColor(color) {
        this.setEditorProperty(AnnotationEditorParamsType.FREETEXT_COLOR, color);
    }
    set editorInkColor(color) {
        this.setEditorProperty(AnnotationEditorParamsType.INK_COLOR, color);
    }
    set editorInkOpacity(opacity) {
        this.setEditorProperty(AnnotationEditorParamsType.INK_OPACITY, opacity);
    }
    set editorInkThickness(thickness) {
        this.setEditorProperty(AnnotationEditorParamsType.INK_THICKNESS, thickness);
    }
    set editorHighlightColor(color) {
        this.setEditorProperty(AnnotationEditorParamsType.HIGHLIGHT_COLOR, color);
    }
    set editorHighlightDefaultColor(color) {
        this.setEditorProperty(AnnotationEditorParamsType.HIGHLIGHT_DEFAULT_COLOR, color);
    }
    set editorHighlightShowAll(showAll) {
        this.setEditorProperty(AnnotationEditorParamsType.HIGHLIGHT_SHOW_ALL, showAll);
    }
    set editorHighlightThickness(thickness) {
        this.setEditorProperty(AnnotationEditorParamsType.HIGHLIGHT_THICKNESS, thickness);
    }
    setEditorProperty(editorPropertyType, value) {
        this.PDFViewerApplication?.eventBus.dispatch('switchannotationeditorparams', { type: editorPropertyType, value });
        this.PDFViewerApplication?.eventBus.dispatch('annotationeditorparamschanged', { details: [[editorPropertyType, value]] });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxExtendedPdfViewerService, deps: [{ token: i0.RendererFactory2 }, { token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxExtendedPdfViewerService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxExtendedPdfViewerService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: i0.RendererFactory2 }, { type: i1.PDFNotificationService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBK0IsTUFBTSxlQUFlLENBQUM7QUFDaEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLGNBQWMsRUFBMkMsTUFBTSw4QkFBOEIsQ0FBQzs7O0FBNERuSSxNQUFNLE9BQU8sMkJBQTJCO0lBUVQ7SUFQdEIsK0JBQStCLEdBQUcsS0FBSyxDQUFDO0lBRXhDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztJQUVuQixRQUFRLENBQVk7SUFDN0Isb0JBQW9CLENBQXlCO0lBRXJELFlBQTZCLGVBQWlDLEVBQUUsbUJBQTJDO1FBQTlFLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtRQUM1RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdEUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sSUFBSSxDQUFDLElBQWdDLEVBQUUsVUFBdUIsRUFBRTtRQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFFO1lBQ3pDLHFDQUFxQztZQUNyQyxPQUFPLENBQUMsS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7WUFDeEYsT0FBTyxTQUFTLENBQUM7U0FDbEI7YUFBTTtZQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ3ZDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBcUIsQ0FBQztnQkFDN0YsSUFBSSxvQkFBb0IsRUFBRTtvQkFDeEIsb0JBQW9CLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDO2lCQUM5RDtnQkFFRCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFxQixDQUFDO2dCQUN2RixJQUFJLGlCQUFpQixFQUFFO29CQUNyQixpQkFBaUIsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUM7aUJBQ3hEO2dCQUVELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQXFCLENBQUM7Z0JBQ3pGLElBQUksb0JBQW9CLEVBQUU7b0JBQ3hCLG9CQUFvQixDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQztpQkFDOUQ7Z0JBRUQsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFxQixDQUFDO2dCQUN6RixJQUFJLGtCQUFrQixFQUFFO29CQUN0QixrQkFBa0IsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7aUJBQzFEO2dCQUVELE1BQU0sdUJBQXVCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBcUIsQ0FBQztnQkFDbkcsSUFBSSx1QkFBdUIsRUFBRTtvQkFDM0IsdUJBQXVCLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDO2lCQUNwRTtnQkFFRCxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFxQixDQUFDO2dCQUN2RixJQUFJLG1CQUFtQixFQUFFO29CQUN2QixtQkFBbUIsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7b0JBQ3RELElBQUksbUJBQW1CLENBQUMsT0FBTyxFQUFFO3dCQUMvQixJQUFJLG9CQUFvQixFQUFFOzRCQUN4QixvQkFBb0IsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO3lCQUN0Qzt3QkFDRCxJQUFJLGtCQUFrQixFQUFFOzRCQUN0QixrQkFBa0IsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO3lCQUNwQzt3QkFFRCxJQUFJLHVCQUF1QixFQUFFOzRCQUMzQix1QkFBdUIsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO3lCQUN6QztxQkFDRjtvQkFDRCxJQUFJLG9CQUFvQixFQUFFO3dCQUN4QixvQkFBb0IsQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDO3FCQUM3RDtvQkFDRCxJQUFJLGtCQUFrQixFQUFFO3dCQUN0QixrQkFBa0IsQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDO3FCQUMzRDtvQkFFRCxJQUFJLHVCQUF1QixFQUFFO3dCQUMzQix1QkFBdUIsQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDO3FCQUNoRTtpQkFDRjtnQkFFRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBcUIsQ0FBQztnQkFDNUUsSUFBSSxVQUFVLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUMxQyxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztpQkFDekI7YUFDRjtZQUVELE1BQU0sY0FBYyxHQUFzQjtnQkFDeEMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxTQUFTLElBQUksS0FBSztnQkFDekMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLElBQUksS0FBSztnQkFDdkMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLElBQUksS0FBSztnQkFDM0MsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLElBQUksS0FBSztnQkFDakQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2dCQUNsQyxXQUFXLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLO2dCQUNwQyxZQUFZLEVBQUUsS0FBSztnQkFDbkIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsTUFBTSxFQUFFLElBQUk7Z0JBQ1osSUFBSSxFQUFFLE1BQU07Z0JBQ1osa0JBQWtCLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixJQUFJLEtBQUs7YUFDeEQsQ0FBQztZQUNGLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsY0FBYyxDQUFDO1lBQ3hKLE1BQU0sTUFBTSxHQUFHLGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdkQsT0FBTyxNQUFNLENBQUM7U0FDZjtJQUNILENBQUM7SUFFTSxRQUFRLENBQUMsNkJBQXNDLEtBQUs7UUFDekQsSUFBSSxDQUFDLElBQUksQ0FBQywrQkFBK0IsRUFBRTtZQUN6QyxxQ0FBcUM7WUFDckMsT0FBTyxDQUFDLEtBQUssQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO1lBQzVGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7YUFBTTtZQUNMLE1BQU0sY0FBYyxHQUFHLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUM7WUFDaEosY0FBYyxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQzlCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBRU0sWUFBWSxDQUFDLDZCQUFzQyxLQUFLO1FBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUU7WUFDekMscUNBQXFDO1lBQ3JDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQztZQUNoRyxPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU07WUFDTCxNQUFNLGNBQWMsR0FBRywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsY0FBYyxDQUFDO1lBQ2hKLGNBQWMsRUFBRSxlQUFlLEVBQUUsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUEwQjtRQUNyQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM3QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQUUsaUJBQWlCLEtBQUssU0FBUyxDQUFDO1lBQzNHLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3BCLG1FQUFtRTtnQkFDbkUsSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDZixVQUFVLEdBQUcsRUFBbUIsQ0FBQztpQkFDbEM7Z0JBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ3hHO1NBQ0Y7SUFDSCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ3JCLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFO1lBQ3JELE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDO1lBQzFFLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDO1NBQzNFO0lBQ0gsQ0FBQztJQUVNLGFBQWEsQ0FBQyxVQUF5QjtRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFO1lBQ3RELE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUNoRSxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDaEksSUFBSSxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ2pKLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxTQUFpQixFQUFFLEtBQW9CO1FBQzlELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNmLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDM0MsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLEVBQUUsQ0FBQzthQUNWO1NBQ0Y7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRU0saUJBQWlCLENBQUMsU0FBaUIsRUFBRSxVQUF5QjtRQUNuRSxNQUFNLElBQUksR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksVUFBVSxDQUFDLElBQUksRUFBRTtZQUNuQixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFO2dCQUMxQixPQUFPLEtBQUssQ0FBQzthQUNkO1NBQ0Y7UUFDRCxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUU7WUFDakIsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLEVBQUUsRUFBRTtnQkFDeEIsT0FBTyxLQUFLLENBQUM7YUFDZDtTQUNGO1FBQ0QsSUFBSSxVQUFVLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRTtnQkFDL0MsT0FBTyxLQUFLLENBQUM7YUFDZDtTQUNGO1FBQ0QsSUFBSSxVQUFVLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFO2dCQUNoRCxPQUFPLEtBQUssQ0FBQzthQUNkO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTSxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQWtCO1FBQzVDLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUM7WUFFM0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sWUFBWSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtpQkFDeEQsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMscUNBQXFDO1lBRXpFLE1BQU0sUUFBUSxHQUFHLFlBQStCLENBQUM7WUFFakQsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ25DLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNuQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFDbkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ25DLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNqQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2QsSUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQVEsQ0FBQztZQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRTtvQkFDMUIsTUFBTSxDQUFDLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDO29CQUNuQyxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO29CQUNyQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDekIsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztvQkFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztvQkFDbEMsSUFBSSxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUM7b0JBQzNCLElBQUksY0FBYyxDQUFDLEdBQUcsS0FBSyxLQUFLLEVBQUU7d0JBQ2hDLFFBQVEsRUFBRSxDQUFDO3FCQUNaO29CQUNELElBQUksY0FBYyxDQUFDLEdBQUcsS0FBSyxLQUFLLEVBQUU7d0JBQ2hDLFFBQVEsRUFBRSxDQUFDO3FCQUNaO2lCQUNGO2dCQUVELElBQUksS0FBSyxHQUFHLENBQUMsS0FBSyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUMvRCxJQUFJLEtBQUssRUFBRTtvQkFDVCxJQUFJLFNBQVMsR0FBa0IsU0FBUyxDQUFDO29CQUN6QyxJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTt3QkFDaEMsU0FBUyxHQUFHLE1BQU0sQ0FBQztxQkFDcEI7eUJBQU0sSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO3dCQUN2QixTQUFTLEdBQUcsS0FBSyxDQUFDO3FCQUNuQjt5QkFBTSxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7d0JBQ3ZCLFNBQVMsR0FBRyxLQUFLLENBQUM7cUJBQ25CO29CQUNELE1BQU0sSUFBSSxHQUFHO3dCQUNYLFNBQVM7d0JBQ1QsQ0FBQyxFQUFFLElBQUk7d0JBQ1AsQ0FBQyxFQUFFLElBQUk7d0JBQ1AsS0FBSyxFQUFFLElBQUksR0FBRyxJQUFJO3dCQUNsQixNQUFNLEVBQUUsSUFBSSxHQUFHLElBQUk7d0JBQ25CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFO3FCQUNWLENBQUM7b0JBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDL0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDL0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDL0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDL0IsUUFBUSxHQUFHLENBQUMsQ0FBQztvQkFDYixRQUFRLEdBQUcsQ0FBQyxDQUFDO29CQUNiLElBQUksR0FBRyxFQUFFLENBQUM7aUJBQ1g7YUFDRjtZQUNELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQWtCO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDOUIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUM7UUFFM0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sWUFBWSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVPLHFCQUFxQixDQUFDLGFBQWtEO1FBQzlFLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELE9BQU8sYUFBYTthQUNqQixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQy9CLEdBQUcsQ0FBQyxDQUFDLElBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25FLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNkLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBZSxDQUMxQixVQUFrQixFQUNsQixLQUEyQixFQUMzQixVQUFtQixFQUNuQiwyQkFBbUMsU0FBUyxFQUM1QyxpQkFBaUMsY0FBYyxDQUFDLE1BQU07UUFFdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM5QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbkM7UUFDRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDO1FBQzFELE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsd0JBQXdCLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVNLEtBQUssQ0FBQyxjQUFjLENBQ3pCLFVBQWtCLEVBQ2xCLEtBQTJCLEVBQzNCLFVBQW1CLEVBQ25CLDJCQUFtQyxTQUFTLEVBQzVDLGlCQUFpQyxjQUFjLENBQUMsTUFBTTtRQUV0RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsd0JBQXdCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDbkgsT0FBTyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVPLEtBQUssQ0FBQyxJQUFJLENBQ2hCLE9BQXFCLEVBQ3JCLEtBQTJCLEVBQzNCLFVBQW1CLEVBQ25CLDJCQUFtQyxTQUFTLEVBQzVDLGlCQUFpQyxjQUFjLENBQUMsTUFBTTtRQUV0RCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ2YsVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7U0FDMUI7YUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDdEIsVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNwRTthQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUN2QixVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ3RFO1FBQ0QsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUNuQyxLQUFLLEVBQUUsVUFBVTtTQUNsQixDQUFDLENBQUM7UUFDSCxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFdEMsTUFBTSxhQUFhLEdBQUc7WUFDcEIsYUFBYSxFQUFFLEdBQUc7WUFDbEIsUUFBUSxFQUFFLFlBQVk7WUFDdEIsVUFBVTtZQUNWLHdCQUF3QjtZQUN4QixjQUFjO1NBQ2YsQ0FBQztRQUNGLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFakQsTUFBTSxjQUFjLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVyRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxLQUFhLEVBQUUsTUFBYztRQUN0RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLHNDQUFzQztZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7U0FDbkQ7UUFFRCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNyQixNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUV4RCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxLQUFLLENBQUMsd0JBQXdCO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLFNBQVMsQ0FBQztJQUNsRSxDQUFDO0lBRU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJO1FBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDOUIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELE1BQU0sR0FBRyxHQUFpQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDO1FBQ2pGLHVCQUF1QjtRQUN2QixNQUFNLFFBQVEsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sTUFBTSxHQUFrQixFQUFFLENBQUM7UUFDakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdkMseUJBQXlCO1lBQ3pCLE1BQU0sV0FBVyxDQUFDLG9CQUFvQixHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RCxNQUFNLFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUV2RCxXQUFXO2lCQUNSLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxzQ0FBc0M7aUJBQzVFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLDhEQUE4RDtpQkFDckYsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2Isb0RBQW9EO2dCQUNwRCw2Q0FBNkM7Z0JBQzdDLE1BQU0sU0FBUyxHQUFrQixXQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVqSCw4QkFBOEI7Z0JBQzlCLElBQUksaUJBQWlCLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRTtvQkFDcEMsSUFBSTt3QkFDRixJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7NEJBQ2pCLE1BQU0sWUFBWSxHQUFRLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDekksQ0FBQyxDQUFDLEtBQUssR0FBRyxZQUFZLEVBQUUsS0FBSyxDQUFDO3lCQUMvQjs2QkFBTSxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7NEJBQ3hCLE1BQU0sWUFBWSxHQUFRLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDeEksQ0FBQyxDQUFDLEtBQUssR0FBRyxZQUFZLEVBQUUsS0FBSyxDQUFDO3lCQUMvQjs2QkFBTTs0QkFDTCxNQUFNLFlBQVksR0FBUSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ25ILENBQUMsQ0FBQyxLQUFLLEdBQUcsWUFBWSxFQUFFLEtBQUssQ0FBQzt5QkFDL0I7cUJBQ0Y7b0JBQUMsT0FBTyxTQUFTLEVBQUU7d0JBQ2xCLGlCQUFpQjtxQkFDbEI7aUJBQ0Y7Z0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxvQkFBb0IsQ0FBQyxTQUFpQjtRQUMzQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDO0lBQ3ZGLENBQUM7SUFFTSxrQkFBa0I7UUFDdkIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQzFCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FDcEYsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUN2RCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFDM0MsWUFBWSxFQUNaLFdBQVcsQ0FDWixDQUFDO1lBQ0YsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUNsQjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVNLG1CQUFtQixDQUFDLFNBQWlCO1FBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDOUIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQzFELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTtZQUM5QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEMsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLGNBQWMsS0FBSyxDQUFDLENBQUM7WUFDdEQsT0FBTyxlQUFlLENBQUM7U0FDeEI7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxLQUFLLENBQUMsRUFBVTtRQUN0QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBaUI7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN4QyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMzQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDckI7U0FDRjtJQUNILENBQUM7SUFFTSxzQkFBc0I7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM5QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDMUQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFTSxhQUFhO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDOUIsT0FBTyxDQUFDLENBQUM7U0FDVjtRQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQzFELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUN0QixDQUFDO0lBRU0sOEJBQThCO1FBQ25DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUN0QyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELE1BQU0sS0FBSyxHQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQVUsQ0FBQyxLQUFtQixDQUFDO1FBQzVFLE9BQU8sS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxLQUFLLENBQUMsVUFBVTtRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzlCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQztRQUN0RyxJQUFJLHFCQUFxQixFQUFFO1lBQ3pCLE1BQU0sU0FBUyxHQUFHLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25ELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQzVFLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM5QixNQUFNLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZELE9BQU87b0JBQ0wsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtvQkFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO2lCQUNaLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFTSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQWU7UUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM5QixPQUFPO1NBQ1I7UUFDRCxNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQztRQUN0RyxJQUFJLHFCQUFxQixFQUFFO1lBQ3pCLElBQUksU0FBUyxHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDaEUsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLE9BQU8sSUFBSSxDQUFDLENBQUM7WUFDbEUsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osU0FBUyxHQUFJLFFBQTZCLENBQUMsT0FBTyxDQUFDO2dCQUNsRCxRQUE2QixDQUFDLE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQzthQUNyRDtZQUNELHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRTtnQkFDcEUsTUFBTSxFQUFFLElBQUk7Z0JBQ1osT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUM7YUFDaEQsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU0sa0JBQWtCLENBQUMsVUFBa0IsRUFBRSxRQUE0RDtRQUN4RyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsU0FBZ0IsQ0FBQztRQUMzRCxNQUFNLEVBQUUscUJBQXFCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTSx3QkFBd0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLHdCQUF3QixFQUFFLENBQUM7SUFDekUsQ0FBQztJQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBK0M7UUFDOUUsTUFBTSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVNLHVCQUF1QixDQUFDLE1BQXdDO1FBQ3JFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFnQjtRQUMvQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDaEMsT0FBTyxRQUFRLENBQUM7U0FDakI7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxRQUFRLEtBQUssUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7U0FDdkY7UUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRU0sS0FBSyxDQUFDLHlCQUF5QixDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFzQjtRQUNuSCxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztZQUM5RCxPQUFPO1NBQ1I7UUFDRCxJQUFJLFlBQW9CLENBQUM7UUFDekIsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ3RCLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO2dCQUNwQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0I7WUFDRCxZQUFZLEdBQUcsSUFBSSxDQUFDO1NBQ3JCO2FBQU07WUFDTCxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO1FBQzlGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuQyxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQ3ZGLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLEtBQUssR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFDbEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUM3RixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1FBQy9GLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDL0UsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUU5RSxNQUFNLGVBQWUsR0FBMEI7WUFDN0MsY0FBYyxFQUFFLEVBQUU7WUFDbEIsU0FBUyxFQUFFLFlBQVk7WUFDdkIsU0FBUyxFQUFFLE9BQU87WUFDbEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQzVDLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQztTQUN4QixDQUFDO1FBQ0YsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMseUJBQXlCLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ3JCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUM7UUFDcEQsSUFBSSxNQUFNLEVBQUU7WUFDVixPQUFPLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7U0FDckM7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRU8sdUJBQXVCLENBQUMsS0FBa0MsRUFBRSxRQUFnQixFQUFFLFlBQW9CLEVBQUUsYUFBcUI7UUFDL0gsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLE9BQU8sWUFBWSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDN0IsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7YUFDL0M7aUJBQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUMvQixPQUFPLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLENBQUM7YUFDekQ7aUJBQU07Z0JBQ0wsT0FBTyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzVCO1NBQ0Y7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0lBRU0seUJBQXlCLENBQUMsSUFBWTtRQUMzQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELElBQVcsY0FBYyxDQUFDLElBQVk7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLDBCQUEwQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsSUFBVyxlQUFlLENBQUMsS0FBYTtRQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxJQUFXLGNBQWMsQ0FBQyxLQUFhO1FBQ3JDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELElBQVcsZ0JBQWdCLENBQUMsT0FBZTtRQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxJQUFXLGtCQUFrQixDQUFDLFNBQWlCO1FBQzdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVELElBQVcsb0JBQW9CLENBQUMsS0FBYTtRQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRCxJQUFXLDJCQUEyQixDQUFDLEtBQWE7UUFDbEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLDBCQUEwQixDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxJQUFXLHNCQUFzQixDQUFDLE9BQWdCO1FBQ2hELElBQUksQ0FBQyxpQkFBaUIsQ0FBQywwQkFBMEIsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsSUFBVyx3QkFBd0IsQ0FBQyxTQUFpQjtRQUNuRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVNLGlCQUFpQixDQUFDLGtCQUEwQixFQUFFLEtBQVU7UUFDN0QsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsOEJBQThCLEVBQUUsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNsSCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUgsQ0FBQzt3R0F6cEJVLDJCQUEyQjs0R0FBM0IsMkJBQTJCLGNBRjFCLE1BQU07OzRGQUVQLDJCQUEyQjtrQkFIdkMsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtpQkFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlZmZlY3QsIEluamVjdGFibGUsIFJlbmRlcmVyMiwgUmVuZGVyZXJGYWN0b3J5MiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQW5ub3RhdGlvbkVkaXRvclBhcmFtc1R5cGUsIEFubm90YXRpb25Nb2RlLCBFZGl0b3JBbm5vdGF0aW9uLCBTdGFtcEVkaXRvckFubm90YXRpb24gfSBmcm9tICcuL29wdGlvbnMvZWRpdG9yLWFubm90YXRpb25zJztcbmltcG9ydCB7IFBkZkxheWVyIH0gZnJvbSAnLi9vcHRpb25zL29wdGlvbmFsX2NvbnRlbnRfY29uZmlnJztcbmltcG9ydCB7IFBERlByaW50UmFuZ2UgfSBmcm9tICcuL29wdGlvbnMvcGRmLXByaW50LXJhbmdlJztcbmltcG9ydCB7IElQREZWaWV3ZXJBcHBsaWNhdGlvbiwgUERGRG9jdW1lbnRQcm94eSwgUERGRmluZFBhcmFtZXRlcnMsIFBERlBhZ2VQcm94eSwgVGV4dEl0ZW0sIFRleHRNYXJrZWRDb250ZW50IH0gZnJvbSAnLi9vcHRpb25zL3BkZi12aWV3ZXItYXBwbGljYXRpb24nO1xuaW1wb3J0IHsgUERGTm90aWZpY2F0aW9uU2VydmljZSB9IGZyb20gJy4vcGRmLW5vdGlmaWNhdGlvbi1zZXJ2aWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBGaW5kT3B0aW9ucyB7XG4gIGhpZ2hsaWdodEFsbD86IGJvb2xlYW47XG4gIG1hdGNoQ2FzZT86IGJvb2xlYW47XG4gIHdob2xlV29yZHM/OiBib29sZWFuO1xuICBtYXRjaERpYWNyaXRpY3M/OiBib29sZWFuO1xuICBkb250U2Nyb2xsSW50b1ZpZXc/OiBib29sZWFuO1xuICBmaW5kTXVsdGlwbGU/OiBib29sZWFuO1xuICByZWdleHA/OiBib29sZWFuO1xuICB1c2VTZWNvbmRhcnlGaW5kY29udHJvbGxlcj86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBEcmF3Q29udGV4dCB7XG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBERkV4cG9ydFNjYWxlRmFjdG9yIHtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGhlaWdodD86IG51bWJlcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbnR5cGUgRGlyZWN0aW9uVHlwZSA9ICdsdHInIHwgJ3J0bCcgfCAnYm90aCcgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGRmSW1hZ2VQYXJhbWV0ZXJzIHtcbiAgdXJsT3JEYXRhVXJsOiBzdHJpbmc7XG4gIHBhZ2U/OiBudW1iZXI7XG4gIGxlZnQ/OiBudW1iZXIgfCBzdHJpbmc7XG4gIGJvdHRvbT86IG51bWJlciB8IHN0cmluZztcbiAgcmlnaHQ/OiBudW1iZXIgfCBzdHJpbmc7XG4gIHRvcD86IG51bWJlciB8IHN0cmluZztcbiAgcm90YXRpb24/OiAwIHwgOTAgfCAxODAgfCAyNzA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGluZSB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25UeXBlO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIFNlY3Rpb24ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uVHlwZTtcbiAgbGluZXM6IEFycmF5PExpbmU+O1xufVxuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgTmd4RXh0ZW5kZWRQZGZWaWV3ZXJTZXJ2aWNlIHtcbiAgcHVibGljIG5neEV4dGVuZGVkUGRmVmlld2VySW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICBwdWJsaWMgc2Vjb25kYXJ5TWVudUlzRW1wdHkgPSBmYWxzZTtcblxuICBwcml2YXRlIHJlYWRvbmx5IHJlbmRlcmVyOiBSZW5kZXJlcjI7XG4gIHByaXZhdGUgUERGVmlld2VyQXBwbGljYXRpb24/OiBJUERGVmlld2VyQXBwbGljYXRpb247XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSByZW5kZXJlckZhY3Rvcnk6IFJlbmRlcmVyRmFjdG9yeTIsIG5vdGlmaWNhdGlvblNlcnZpY2U6IFBERk5vdGlmaWNhdGlvblNlcnZpY2UpIHtcbiAgICB0aGlzLnJlbmRlcmVyID0gdGhpcy5yZW5kZXJlckZhY3RvcnkuY3JlYXRlUmVuZGVyZXIobnVsbCwgbnVsbCk7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSBub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgZmluZCh0ZXh0OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFJlZ0V4cCwgb3B0aW9uczogRmluZE9wdGlvbnMgPSB7fSk6IEFycmF5PFByb21pc2U8bnVtYmVyPj4gfCB1bmRlZmluZWQge1xuICAgIGlmICghdGhpcy5uZ3hFeHRlbmRlZFBkZlZpZXdlckluaXRpYWxpemVkKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6cXVvdGVtYXJrXG4gICAgICBjb25zb2xlLmVycm9yKFwiVGhlIFBERiB2aWV3ZXIgaGFzbid0IGZpbmlzaGVkIGluaXRpYWxpemluZy4gUGxlYXNlIGNhbGwgZmluZCgpIGxhdGVyLlwiKTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghb3B0aW9ucy51c2VTZWNvbmRhcnlGaW5kY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBoaWdobGlnaHRBbGxDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5kSGlnaGxpZ2h0QWxsJykgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgaWYgKGhpZ2hsaWdodEFsbENoZWNrYm94KSB7XG4gICAgICAgICAgaGlnaGxpZ2h0QWxsQ2hlY2tib3guY2hlY2tlZCA9IG9wdGlvbnMuaGlnaGxpZ2h0QWxsID8/IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWF0Y2hDYXNlQ2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmluZE1hdGNoQ2FzZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIGlmIChtYXRjaENhc2VDaGVja2JveCkge1xuICAgICAgICAgIG1hdGNoQ2FzZUNoZWNrYm94LmNoZWNrZWQgPSBvcHRpb25zLm1hdGNoQ2FzZSA/PyBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbmRNdWx0aXBsZUNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbmRNdWx0aXBsZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIGlmIChmaW5kTXVsdGlwbGVDaGVja2JveCkge1xuICAgICAgICAgIGZpbmRNdWx0aXBsZUNoZWNrYm94LmNoZWNrZWQgPSBvcHRpb25zLmZpbmRNdWx0aXBsZSA/PyBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVudGlyZVdvcmRDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5kRW50aXJlV29yZCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIGlmIChlbnRpcmVXb3JkQ2hlY2tib3gpIHtcbiAgICAgICAgICBlbnRpcmVXb3JkQ2hlY2tib3guY2hlY2tlZCA9IG9wdGlvbnMud2hvbGVXb3JkcyA/PyBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1hdGNoRGlhY3JpdGljc0NoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbmRNYXRjaERpYWNyaXRpY3MnKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICBpZiAobWF0Y2hEaWFjcml0aWNzQ2hlY2tib3gpIHtcbiAgICAgICAgICBtYXRjaERpYWNyaXRpY3NDaGVja2JveC5jaGVja2VkID0gb3B0aW9ucy5tYXRjaERpYWNyaXRpY3MgPz8gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtYXRjaFJlZ0V4cENoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hdGNoUmVnRXhwJykgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgaWYgKG1hdGNoUmVnRXhwQ2hlY2tib3gpIHtcbiAgICAgICAgICBtYXRjaFJlZ0V4cENoZWNrYm94LmNoZWNrZWQgPSBvcHRpb25zLnJlZ2V4cCA/PyBmYWxzZTtcbiAgICAgICAgICBpZiAobWF0Y2hSZWdFeHBDaGVja2JveC5jaGVja2VkKSB7XG4gICAgICAgICAgICBpZiAoZmluZE11bHRpcGxlQ2hlY2tib3gpIHtcbiAgICAgICAgICAgICAgZmluZE11bHRpcGxlQ2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVudGlyZVdvcmRDaGVja2JveCkge1xuICAgICAgICAgICAgICBlbnRpcmVXb3JkQ2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWF0Y2hEaWFjcml0aWNzQ2hlY2tib3gpIHtcbiAgICAgICAgICAgICAgbWF0Y2hEaWFjcml0aWNzQ2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZmluZE11bHRpcGxlQ2hlY2tib3gpIHtcbiAgICAgICAgICAgIGZpbmRNdWx0aXBsZUNoZWNrYm94LmRpc2FibGVkID0gbWF0Y2hSZWdFeHBDaGVja2JveC5jaGVja2VkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZW50aXJlV29yZENoZWNrYm94KSB7XG4gICAgICAgICAgICBlbnRpcmVXb3JkQ2hlY2tib3guZGlzYWJsZWQgPSBtYXRjaFJlZ0V4cENoZWNrYm94LmNoZWNrZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1hdGNoRGlhY3JpdGljc0NoZWNrYm94KSB7XG4gICAgICAgICAgICBtYXRjaERpYWNyaXRpY3NDaGVja2JveC5kaXNhYmxlZCA9IG1hdGNoUmVnRXhwQ2hlY2tib3guY2hlY2tlZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnB1dEZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbmRJbnB1dCcpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgIGlmIChpbnB1dEZpZWxkICYmIHR5cGVvZiB0ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlucHV0RmllbGQudmFsdWUgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbmRQYXJhbWV0ZXJzOiBQREZGaW5kUGFyYW1ldGVycyA9IHtcbiAgICAgICAgY2FzZVNlbnNpdGl2ZTogb3B0aW9ucy5tYXRjaENhc2UgPz8gZmFsc2UsXG4gICAgICAgIGVudGlyZVdvcmQ6IG9wdGlvbnMud2hvbGVXb3JkcyA/PyBmYWxzZSxcbiAgICAgICAgaGlnaGxpZ2h0QWxsOiBvcHRpb25zLmhpZ2hsaWdodEFsbCA/PyBmYWxzZSxcbiAgICAgICAgbWF0Y2hEaWFjcml0aWNzOiBvcHRpb25zLm1hdGNoRGlhY3JpdGljcyA/PyBmYWxzZSxcbiAgICAgICAgZmluZE11bHRpcGxlOiBvcHRpb25zLmZpbmRNdWx0aXBsZSxcbiAgICAgICAgbWF0Y2hSZWdFeHA6IG9wdGlvbnMucmVnZXhwID8/IGZhbHNlLFxuICAgICAgICBmaW5kUHJldmlvdXM6IGZhbHNlLFxuICAgICAgICBxdWVyeTogdGV4dCxcbiAgICAgICAgc291cmNlOiBudWxsLFxuICAgICAgICB0eXBlOiAnZmluZCcsXG4gICAgICAgIGRvbnRTY3JvbGxJbnRvVmlldzogb3B0aW9ucy5kb250U2Nyb2xsSW50b1ZpZXcgPz8gZmFsc2UsXG4gICAgICB9O1xuICAgICAgY29uc3QgZmluZENvbnRyb2xsZXIgPSBvcHRpb25zLnVzZVNlY29uZGFyeUZpbmRjb250cm9sbGVyID8gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uY3VzdG9tRmluZENvbnRyb2xsZXIgOiB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5maW5kQ29udHJvbGxlcjtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGZpbmRDb250cm9sbGVyPy5uZ3hGaW5kKGZpbmRQYXJhbWV0ZXJzKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGZpbmROZXh0KHVzZVNlY29uZGFyeUZpbmRjb250cm9sbGVyOiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMubmd4RXh0ZW5kZWRQZGZWaWV3ZXJJbml0aWFsaXplZCkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnF1b3RlbWFya1xuICAgICAgY29uc29sZS5lcnJvcihcIlRoZSBQREYgdmlld2VyIGhhc24ndCBmaW5pc2hlZCBpbml0aWFsaXppbmcuIFBsZWFzZSBjYWxsIGZpbmROZXh0KCkgbGF0ZXIuXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmaW5kQ29udHJvbGxlciA9IHVzZVNlY29uZGFyeUZpbmRjb250cm9sbGVyID8gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uY3VzdG9tRmluZENvbnRyb2xsZXIgOiB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5maW5kQ29udHJvbGxlcjtcbiAgICAgIGZpbmRDb250cm9sbGVyPy5uZ3hGaW5kTmV4dCgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGZpbmRQcmV2aW91cyh1c2VTZWNvbmRhcnlGaW5kY29udHJvbGxlcjogYm9vbGVhbiA9IGZhbHNlKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLm5neEV4dGVuZGVkUGRmVmlld2VySW5pdGlhbGl6ZWQpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpxdW90ZW1hcmtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJUaGUgUERGIHZpZXdlciBoYXNuJ3QgZmluaXNoZWQgaW5pdGlhbGl6aW5nLiBQbGVhc2UgY2FsbCBmaW5kUHJldmlvdXMoKSBsYXRlci5cIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZpbmRDb250cm9sbGVyID0gdXNlU2Vjb25kYXJ5RmluZGNvbnRyb2xsZXIgPyB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5jdXN0b21GaW5kQ29udHJvbGxlciA6IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmZpbmRDb250cm9sbGVyO1xuICAgICAgZmluZENvbnRyb2xsZXI/Lm5neEZpbmRQcmV2aW91cygpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHByaW50KHByaW50UmFuZ2U/OiBQREZQcmludFJhbmdlKSB7XG4gICAgaWYgKHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIGNvbnN0IGFscmVhZHlQcmludGluZyA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LlBERlByaW50U2VydmljZUZhY3Rvcnk/LmlzSW5QREZQcmludFJhbmdlICE9PSB1bmRlZmluZWQ7XG4gICAgICBpZiAoIWFscmVhZHlQcmludGluZykge1xuICAgICAgICAvLyBzbG93IGRvd24gaHVycmllZCB1c2VycyBjbGlja2luZyB0aGUgcHJpbnQgYnV0dG9uIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIGlmICghcHJpbnRSYW5nZSkge1xuICAgICAgICAgIHByaW50UmFuZ2UgPSB7fSBhcyBQREZQcmludFJhbmdlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0UHJpbnRSYW5nZShwcmludFJhbmdlKTtcbiAgICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucHJpbnRQZGYoKTtcbiAgICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uZXZlbnRCdXMub24oJ2FmdGVycHJpbnQnLCB0aGlzLnJlbW92ZVByaW50UmFuZ2UuYmluZCh0aGlzKSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVQcmludFJhbmdlKCkge1xuICAgIGlmICh0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5QREZQcmludFNlcnZpY2VGYWN0b3J5KSB7XG4gICAgICBkZWxldGUgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5QREZQcmludFNlcnZpY2VGYWN0b3J5LmlzSW5QREZQcmludFJhbmdlO1xuICAgICAgZGVsZXRlIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24uUERGUHJpbnRTZXJ2aWNlRmFjdG9yeS5maWx0ZXJlZFBhZ2VDb3VudDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0UHJpbnRSYW5nZShwcmludFJhbmdlOiBQREZQcmludFJhbmdlKSB7XG4gICAgaWYgKCF0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5QREZQcmludFNlcnZpY2VGYWN0b3J5KSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiVGhlIHByaW50IHNlcnZpY2UgaGFzbid0IGJlZW4gaW5pdGlhbGl6ZWQgeWV0LlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLlBERlByaW50U2VydmljZUZhY3RvcnkuaXNJblBERlByaW50UmFuZ2UgPSAocGFnZTogbnVtYmVyKSA9PiB0aGlzLmlzSW5QREZQcmludFJhbmdlKHBhZ2UsIHByaW50UmFuZ2UpO1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24uUERGUHJpbnRTZXJ2aWNlRmFjdG9yeS5maWx0ZXJlZFBhZ2VDb3VudCA9IHRoaXMuZmlsdGVyZWRQYWdlQ291bnQodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGFnZXNDb3VudCwgcHJpbnRSYW5nZSk7XG4gIH1cblxuICBwdWJsaWMgZmlsdGVyZWRQYWdlQ291bnQocGFnZUNvdW50OiBudW1iZXIsIHJhbmdlOiBQREZQcmludFJhbmdlKTogbnVtYmVyIHtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICBmb3IgKGxldCBwYWdlID0gMDsgcGFnZSA8IHBhZ2VDb3VudDsgcGFnZSsrKSB7XG4gICAgICBpZiAodGhpcy5pc0luUERGUHJpbnRSYW5nZShwYWdlLCByYW5nZSkpIHtcbiAgICAgICAgcmVzdWx0Kys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgaXNJblBERlByaW50UmFuZ2UocGFnZUluZGV4OiBudW1iZXIsIHByaW50UmFuZ2U6IFBERlByaW50UmFuZ2UpIHtcbiAgICBjb25zdCBwYWdlID0gcGFnZUluZGV4ICsgMTtcbiAgICBpZiAocHJpbnRSYW5nZS5mcm9tKSB7XG4gICAgICBpZiAocGFnZSA8IHByaW50UmFuZ2UuZnJvbSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcmludFJhbmdlLnRvKSB7XG4gICAgICBpZiAocGFnZSA+IHByaW50UmFuZ2UudG8pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJpbnRSYW5nZS5leGNsdWRlZCkge1xuICAgICAgaWYgKHByaW50UmFuZ2UuZXhjbHVkZWQuc29tZSgocCkgPT4gcCA9PT0gcGFnZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJpbnRSYW5nZS5pbmNsdWRlZCkge1xuICAgICAgaWYgKCFwcmludFJhbmdlLmluY2x1ZGVkLnNvbWUoKHApID0+IHAgPT09IHBhZ2UpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0UGFnZUFzTGluZXMocGFnZU51bWJlcjogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxMaW5lPj4ge1xuICAgIGlmICh0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICBjb25zdCBwZGZEb2N1bWVudCA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZkRvY3VtZW50O1xuXG4gICAgICBjb25zdCBwYWdlID0gYXdhaXQgcGRmRG9jdW1lbnQuZ2V0UGFnZShwYWdlTnVtYmVyKTtcbiAgICAgIGNvbnN0IHRleHRTbmlwcGV0cyA9IChhd2FpdCBwYWdlLmdldFRleHRDb250ZW50KCkpLml0ZW1zIC8vXG4gICAgICAgIC5maWx0ZXIoKGluZm8pID0+ICFpbmZvWyd0eXBlJ10pOyAvLyBpZ25vcmUgdGhlIFRleHRNYXJrZWRDb250ZW50IGl0ZW1zXG5cbiAgICAgIGNvbnN0IHNuaXBwZXRzID0gdGV4dFNuaXBwZXRzIGFzIEFycmF5PFRleHRJdGVtPjtcblxuICAgICAgbGV0IG1pblggPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgIGxldCBtaW5ZID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICBsZXQgbWF4WCA9IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSO1xuICAgICAgbGV0IG1heFkgPSBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUjtcbiAgICAgIGxldCBjb3VudExUUiA9IDA7XG4gICAgICBsZXQgY291bnRSVEwgPSAwO1xuICAgICAgbGV0IHRleHQgPSAnJztcbiAgICAgIGxldCBsaW5lcyA9IG5ldyBBcnJheTxMaW5lPigpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbmlwcGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjdXJyZW50U25pcHBldCA9IHNuaXBwZXRzW2ldO1xuICAgICAgICBpZiAoIWN1cnJlbnRTbmlwcGV0Lmhhc0VPTCkge1xuICAgICAgICAgIGNvbnN0IHggPSBjdXJyZW50U25pcHBldC50cmFuc2Zvcm1bNF07XG4gICAgICAgICAgY29uc3QgeSA9IC1jdXJyZW50U25pcHBldC50cmFuc2Zvcm1bNV07XG4gICAgICAgICAgY29uc3Qgd2lkdGggPSBjdXJyZW50U25pcHBldC53aWR0aDtcbiAgICAgICAgICBjb25zdCBoZWlnaHQgPSBjdXJyZW50U25pcHBldC5oZWlnaHQ7XG4gICAgICAgICAgbWluWCA9IE1hdGgubWluKG1pblgsIHgpO1xuICAgICAgICAgIG1pblkgPSBNYXRoLm1pbihtaW5ZLCB5KTtcbiAgICAgICAgICBtYXhYID0gTWF0aC5tYXgobWF4WCwgeCArIHdpZHRoKTtcbiAgICAgICAgICBtYXhZID0gTWF0aC5tYXgobWF4WSwgeSArIGhlaWdodCk7XG4gICAgICAgICAgdGV4dCArPSBjdXJyZW50U25pcHBldC5zdHI7XG4gICAgICAgICAgaWYgKGN1cnJlbnRTbmlwcGV0LmRpciA9PT0gJ3J0bCcpIHtcbiAgICAgICAgICAgIGNvdW50UlRMKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjdXJyZW50U25pcHBldC5kaXIgPT09ICdsdHInKSB7XG4gICAgICAgICAgICBjb3VudExUUisrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhZGRJdCA9IGkgPT09IHNuaXBwZXRzLmxlbmd0aCAtIDEgfHwgY3VycmVudFNuaXBwZXQuaGFzRU9MO1xuICAgICAgICBpZiAoYWRkSXQpIHtcbiAgICAgICAgICBsZXQgZGlyZWN0aW9uOiBEaXJlY3Rpb25UeXBlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChjb3VudExUUiA+IDAgJiYgY291bnRSVEwgPiAwKSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSAnYm90aCc7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb3VudExUUiA+IDApIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9ICdsdHInO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY291bnRSVEwgPiAwKSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSAncnRsJztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbGluZSA9IHtcbiAgICAgICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgICAgIHg6IG1pblgsXG4gICAgICAgICAgICB5OiBtaW5ZLFxuICAgICAgICAgICAgd2lkdGg6IG1heFggLSBtaW5YLFxuICAgICAgICAgICAgaGVpZ2h0OiBtYXhZIC0gbWluWSxcbiAgICAgICAgICAgIHRleHQ6IHRleHQudHJpbSgpLFxuICAgICAgICAgIH0gYXMgTGluZTtcbiAgICAgICAgICBsaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICAgIG1pblggPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICBtaW5ZID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgbWF4WCA9IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSO1xuICAgICAgICAgIG1heFkgPSBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUjtcbiAgICAgICAgICBjb3VudExUUiA9IDA7XG4gICAgICAgICAgY291bnRSVEwgPSAwO1xuICAgICAgICAgIHRleHQgPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGxpbmVzO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0UGFnZUFzVGV4dChwYWdlTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICghdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb25zdCBwZGZEb2N1bWVudCA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZkRvY3VtZW50O1xuXG4gICAgY29uc3QgcGFnZSA9IGF3YWl0IHBkZkRvY3VtZW50LmdldFBhZ2UocGFnZU51bWJlcik7XG4gICAgY29uc3QgdGV4dFNuaXBwZXRzID0gKGF3YWl0IHBhZ2UuZ2V0VGV4dENvbnRlbnQoKSkuaXRlbXM7XG4gICAgcmV0dXJuIHRoaXMuY29udmVydFRleHRJbmZvVG9UZXh0KHRleHRTbmlwcGV0cyk7XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRUZXh0SW5mb1RvVGV4dCh0ZXh0SW5mb0l0ZW1zOiBBcnJheTxUZXh0SXRlbSB8IFRleHRNYXJrZWRDb250ZW50Pik6IHN0cmluZyB7XG4gICAgaWYgKCF0ZXh0SW5mb0l0ZW1zKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0SW5mb0l0ZW1zXG4gICAgICAuZmlsdGVyKChpbmZvKSA9PiAhaW5mb1sndHlwZSddKVxuICAgICAgLm1hcCgoaW5mbzogVGV4dEl0ZW0pID0+IChpbmZvLmhhc0VPTCA/IGluZm8uc3RyICsgJ1xcbicgOiBpbmZvLnN0cikpXG4gICAgICAuam9pbignJyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0UGFnZUFzQ2FudmFzKFxuICAgIHBhZ2VOdW1iZXI6IG51bWJlcixcbiAgICBzY2FsZTogUERGRXhwb3J0U2NhbGVGYWN0b3IsXG4gICAgYmFja2dyb3VuZD86IHN0cmluZyxcbiAgICBiYWNrZ3JvdW5kQ29sb3JUb1JlcGxhY2U6IHN0cmluZyA9ICcjRkZGRkZGJyxcbiAgICBhbm5vdGF0aW9uTW9kZTogQW5ub3RhdGlvbk1vZGUgPSBBbm5vdGF0aW9uTW9kZS5FTkFCTEVcbiAgKTogUHJvbWlzZTxIVE1MQ2FudmFzRWxlbWVudCB8IHVuZGVmaW5lZD4ge1xuICAgIGlmICghdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgICBjb25zdCBwZGZEb2N1bWVudCA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24ucGRmRG9jdW1lbnQ7XG4gICAgY29uc3QgcGRmUGFnZSA9IGF3YWl0IHBkZkRvY3VtZW50LmdldFBhZ2UocGFnZU51bWJlcik7XG4gICAgcmV0dXJuIHRoaXMuZHJhdyhwZGZQYWdlLCBzY2FsZSwgYmFja2dyb3VuZCwgYmFja2dyb3VuZENvbG9yVG9SZXBsYWNlLCBhbm5vdGF0aW9uTW9kZSk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0UGFnZUFzSW1hZ2UoXG4gICAgcGFnZU51bWJlcjogbnVtYmVyLFxuICAgIHNjYWxlOiBQREZFeHBvcnRTY2FsZUZhY3RvcixcbiAgICBiYWNrZ3JvdW5kPzogc3RyaW5nLFxuICAgIGJhY2tncm91bmRDb2xvclRvUmVwbGFjZTogc3RyaW5nID0gJyNGRkZGRkYnLFxuICAgIGFubm90YXRpb25Nb2RlOiBBbm5vdGF0aW9uTW9kZSA9IEFubm90YXRpb25Nb2RlLkVOQUJMRVxuICApOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IGF3YWl0IHRoaXMuZ2V0UGFnZUFzQ2FudmFzKHBhZ2VOdW1iZXIsIHNjYWxlLCBiYWNrZ3JvdW5kLCBiYWNrZ3JvdW5kQ29sb3JUb1JlcGxhY2UsIGFubm90YXRpb25Nb2RlKTtcbiAgICByZXR1cm4gY2FudmFzPy50b0RhdGFVUkwoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZHJhdyhcbiAgICBwZGZQYWdlOiBQREZQYWdlUHJveHksXG4gICAgc2NhbGU6IFBERkV4cG9ydFNjYWxlRmFjdG9yLFxuICAgIGJhY2tncm91bmQ/OiBzdHJpbmcsXG4gICAgYmFja2dyb3VuZENvbG9yVG9SZXBsYWNlOiBzdHJpbmcgPSAnI0ZGRkZGRicsXG4gICAgYW5ub3RhdGlvbk1vZGU6IEFubm90YXRpb25Nb2RlID0gQW5ub3RhdGlvbk1vZGUuRU5BQkxFXG4gICk6IFByb21pc2U8SFRNTENhbnZhc0VsZW1lbnQ+IHtcbiAgICBsZXQgem9vbUZhY3RvciA9IDE7XG4gICAgaWYgKHNjYWxlLnNjYWxlKSB7XG4gICAgICB6b29tRmFjdG9yID0gc2NhbGUuc2NhbGU7XG4gICAgfSBlbHNlIGlmIChzY2FsZS53aWR0aCkge1xuICAgICAgem9vbUZhY3RvciA9IHNjYWxlLndpZHRoIC8gcGRmUGFnZS5nZXRWaWV3cG9ydCh7IHNjYWxlOiAxIH0pLndpZHRoO1xuICAgIH0gZWxzZSBpZiAoc2NhbGUuaGVpZ2h0KSB7XG4gICAgICB6b29tRmFjdG9yID0gc2NhbGUuaGVpZ2h0IC8gcGRmUGFnZS5nZXRWaWV3cG9ydCh7IHNjYWxlOiAxIH0pLmhlaWdodDtcbiAgICB9XG4gICAgY29uc3Qgdmlld3BvcnQgPSBwZGZQYWdlLmdldFZpZXdwb3J0KHtcbiAgICAgIHNjYWxlOiB6b29tRmFjdG9yLFxuICAgIH0pO1xuICAgIGNvbnN0IHsgY3R4LCBjYW52YXMgfSA9IHRoaXMuZ2V0UGFnZURyYXdDb250ZXh0KHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHQpO1xuICAgIGNvbnN0IGRyYXdWaWV3cG9ydCA9IHZpZXdwb3J0LmNsb25lKCk7XG5cbiAgICBjb25zdCByZW5kZXJDb250ZXh0ID0ge1xuICAgICAgY2FudmFzQ29udGV4dDogY3R4LFxuICAgICAgdmlld3BvcnQ6IGRyYXdWaWV3cG9ydCxcbiAgICAgIGJhY2tncm91bmQsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JUb1JlcGxhY2UsXG4gICAgICBhbm5vdGF0aW9uTW9kZSxcbiAgICB9O1xuICAgIGNvbnN0IHJlbmRlclRhc2sgPSBwZGZQYWdlLnJlbmRlcihyZW5kZXJDb250ZXh0KTtcblxuICAgIGNvbnN0IGRhdGFVcmxQcm9taXNlID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKGNhbnZhcyk7XG5cbiAgICByZXR1cm4gcmVuZGVyVGFzay5wcm9taXNlLnRoZW4oZGF0YVVybFByb21pc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQYWdlRHJhd0NvbnRleHQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBEcmF3Q29udGV4dCB7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJywgeyBhbHBoYTogdHJ1ZSB9KTtcbiAgICBpZiAoIWN0eCkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBxdW90ZW1hcmtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGNyZWF0ZSB0aGUgMmQgY29udGV4dFwiKTtcbiAgICB9XG5cbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoY2FudmFzLCAnd2lkdGgnLCBgJHt3aWR0aH1weGApO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoY2FudmFzLCAnaGVpZ2h0JywgYCR7aGVpZ2h0fXB4YCk7XG5cbiAgICByZXR1cm4geyBjdHgsIGNhbnZhcyB9O1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEN1cnJlbnREb2N1bWVudEFzQmxvYigpOiBQcm9taXNlPEJsb2IgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmV4cG9ydCgpKSB8fCB1bmRlZmluZWQ7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Rm9ybURhdGEoY3VycmVudEZvcm1WYWx1ZXMgPSB0cnVlKTogUHJvbWlzZTxBcnJheTxPYmplY3Q+PiB7XG4gICAgaWYgKCF0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBkZjogUERGRG9jdW1lbnRQcm94eSB8IHVuZGVmaW5lZCA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZkRvY3VtZW50O1xuICAgIC8vIHNjcmVlbiBEUEkgLyBQREYgRFBJXG4gICAgY29uc3QgZHBpUmF0aW8gPSA5NiAvIDcyO1xuICAgIGNvbnN0IHJlc3VsdDogQXJyYXk8T2JqZWN0PiA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHBkZj8ubnVtUGFnZXM7IGkrKykge1xuICAgICAgLy8gdHJhY2sgdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgY29uc3QgY3VycmVudFBhZ2UgLyogOiBQREZQYWdlUHJveHkgKi8gPSBhd2FpdCBwZGYuZ2V0UGFnZShpKTtcbiAgICAgIGNvbnN0IGFubm90YXRpb25zID0gYXdhaXQgY3VycmVudFBhZ2UuZ2V0QW5ub3RhdGlvbnMoKTtcblxuICAgICAgYW5ub3RhdGlvbnNcbiAgICAgICAgLmZpbHRlcigoYSkgPT4gYS5zdWJ0eXBlID09PSAnV2lkZ2V0JykgLy8gZ2V0IHRoZSBmb3JtIGZpZWxkIGFubm90YXRpb25zIG9ubHlcbiAgICAgICAgLm1hcCgoYSkgPT4gKHsgLi4uYSB9KSkgLy8gb25seSBleHBvc2UgY29waWVzIG9mIHRoZSBhbm5vdGF0aW9ucyB0byBhdm9pZCBzaWRlLWVmZmVjdHNcbiAgICAgICAgLmZvckVhY2goKGEpID0+IHtcbiAgICAgICAgICAvLyBnZXQgdGhlIHJlY3RhbmdsZSB0aGF0IHJlcHJlc2VudCB0aGUgc2luZ2xlIGZpZWxkXG4gICAgICAgICAgLy8gYW5kIHJlc2l6ZSBpdCBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgRFBJXG4gICAgICAgICAgY29uc3QgZmllbGRSZWN0OiBBcnJheTxudW1iZXI+ID0gY3VycmVudFBhZ2UuZ2V0Vmlld3BvcnQoeyBzY2FsZTogZHBpUmF0aW8gfSkuY29udmVydFRvVmlld3BvcnRSZWN0YW5nbGUoYS5yZWN0KTtcblxuICAgICAgICAgIC8vIGFkZCB0aGUgY29ycmVzcG9uZGluZyBpbnB1dFxuICAgICAgICAgIGlmIChjdXJyZW50Rm9ybVZhbHVlcyAmJiBhLmZpZWxkTmFtZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgaWYgKGEuZXhwb3J0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50VmFsdWU6IGFueSA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZkRvY3VtZW50LmFubm90YXRpb25TdG9yYWdlLmdldFZhbHVlKGEuaWQsIGEuZmllbGROYW1lICsgJy8nICsgYS5leHBvcnRWYWx1ZSwgJycpO1xuICAgICAgICAgICAgICAgIGEudmFsdWUgPSBjdXJyZW50VmFsdWU/LnZhbHVlO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGEucmFkaW9CdXR0b24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50VmFsdWU6IGFueSA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZkRvY3VtZW50LmFubm90YXRpb25TdG9yYWdlLmdldFZhbHVlKGEuaWQsIGEuZmllbGROYW1lICsgJy8nICsgYS5maWVsZFZhbHVlLCAnJyk7XG4gICAgICAgICAgICAgICAgYS52YWx1ZSA9IGN1cnJlbnRWYWx1ZT8udmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFZhbHVlOiBhbnkgPSB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZEb2N1bWVudC5hbm5vdGF0aW9uU3RvcmFnZS5nZXRWYWx1ZShhLmlkLCBhLmZpZWxkTmFtZSwgJycpO1xuICAgICAgICAgICAgICAgIGEudmFsdWUgPSBjdXJyZW50VmFsdWU/LnZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgLy8ganVzdCBpZ25vcmUgaXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0LnB1c2goeyBmaWVsZEFubm90YXRpb246IGEsIGZpZWxkUmVjdCwgcGFnZU51bWJlcjogaSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHBhZ2UgdG8gdGhlIHJlbmRlcmluZyBxdWV1ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFnZUluZGV4IEluZGV4IG9mIHRoZSBwYWdlIHRvIHJlbmRlclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gZmFsc2UsIGlmIHRoZSBwYWdlIGhhcyBhbHJlYWR5IGJlZW4gcmVuZGVyZWQsXG4gICAqIGlmIGl0J3Mgb3V0IG9mIHJhbmdlIG9yIGlmIHRoZSB2aWV3ZXIgaGFzbid0IGJlZW4gaW5pdGlhbGl6ZWQgeWV0XG4gICAqL1xuICBwdWJsaWMgYWRkUGFnZVRvUmVuZGVyUXVldWUocGFnZUluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyLmFkZFBhZ2VUb1JlbmRlclF1ZXVlKHBhZ2VJbmRleCkgPz8gZmFsc2U7XG4gIH1cblxuICBwdWJsaWMgaXNSZW5kZXJRdWV1ZUVtcHR5KCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNjcm9sbGVkRG93biA9IHRydWU7XG4gICAgY29uc3QgcmVuZGVyRXh0cmEgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgY29uc3QgbmV4dFBhZ2UgPSB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlci5yZW5kZXJpbmdRdWV1ZS5nZXRIaWdoZXN0UHJpb3JpdHkoXG4gICAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlci5fZ2V0VmlzaWJsZVBhZ2VzKCksXG4gICAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlci5fcGFnZXMsXG4gICAgICAgIHNjcm9sbGVkRG93bixcbiAgICAgICAgcmVuZGVyRXh0cmFcbiAgICAgICk7XG4gICAgICByZXR1cm4gIW5leHRQYWdlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHB1YmxpYyBoYXNQYWdlQmVlblJlbmRlcmVkKHBhZ2VJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBhZ2VzID0gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyLl9wYWdlcztcbiAgICBpZiAocGFnZXMubGVuZ3RoID4gcGFnZUluZGV4ICYmIHBhZ2VJbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBwYWdlVmlldyA9IHBhZ2VzW3BhZ2VJbmRleF07XG4gICAgICBjb25zdCBoYXNCZWVuUmVuZGVyZWQgPSBwYWdlVmlldy5yZW5kZXJpbmdTdGF0ZSA9PT0gMztcbiAgICAgIHJldHVybiBoYXNCZWVuUmVuZGVyZWQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgc2xlZXAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHJlbmRlclBhZ2UocGFnZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuaGFzUGFnZUJlZW5SZW5kZXJlZChwYWdlSW5kZXgpKSB7XG4gICAgICBhd2FpdCB0aGlzLmFkZFBhZ2VUb1JlbmRlclF1ZXVlKHBhZ2VJbmRleCk7XG4gICAgICB3aGlsZSAoIXRoaXMuaGFzUGFnZUJlZW5SZW5kZXJlZChwYWdlSW5kZXgpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGN1cnJlbnRseVJlbmRlcmVkUGFnZXMoKTogQXJyYXk8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHBhZ2VzID0gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyLl9wYWdlcztcbiAgICByZXR1cm4gcGFnZXMuZmlsdGVyKChwYWdlKSA9PiBwYWdlLnJlbmRlcmluZ1N0YXRlID09PSAzKS5tYXAoKHBhZ2UpID0+IHBhZ2UuaWQpO1xuICB9XG5cbiAgcHVibGljIG51bWJlck9mUGFnZXMoKTogbnVtYmVyIHtcbiAgICBpZiAoIXRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBjb25zdCBwYWdlcyA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlci5fcGFnZXM7XG4gICAgcmV0dXJuIHBhZ2VzLmxlbmd0aDtcbiAgfVxuXG4gIHB1YmxpYyBnZXRDdXJyZW50bHlWaXNpYmxlUGFnZU51bWJlcnMoKTogQXJyYXk8bnVtYmVyPiB7XG4gICAgY29uc3QgYXBwID0gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbjtcbiAgICBpZiAoIWFwcCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBwYWdlcyA9IChhcHAucGRmVmlld2VyLl9nZXRWaXNpYmxlUGFnZXMoKSBhcyBhbnkpLnZpZXdzIGFzIEFycmF5PGFueT47XG4gICAgcmV0dXJuIHBhZ2VzPy5tYXAoKHBhZ2UpID0+IHBhZ2UuaWQpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGxpc3RMYXllcnMoKTogUHJvbWlzZTxBcnJheTxQZGZMYXllcj4gfCB1bmRlZmluZWQ+IHtcbiAgICBpZiAoIXRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25hbENvbnRlbnRDb25maWcgPSBhd2FpdCB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZWaWV3ZXIub3B0aW9uYWxDb250ZW50Q29uZmlnUHJvbWlzZTtcbiAgICBpZiAob3B0aW9uYWxDb250ZW50Q29uZmlnKSB7XG4gICAgICBjb25zdCBsZXZlbERhdGEgPSBvcHRpb25hbENvbnRlbnRDb25maWcuZ2V0T3JkZXIoKTtcbiAgICAgIGNvbnN0IGxheWVySWRzID0gbGV2ZWxEYXRhLmZpbHRlcigoZ3JvdXBJZCkgPT4gdHlwZW9mIGdyb3VwSWQgIT09ICdvYmplY3QnKTtcbiAgICAgIHJldHVybiBsYXllcklkcy5tYXAoKGxheWVySWQpID0+IHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gb3B0aW9uYWxDb250ZW50Q29uZmlnLmdldEdyb3VwKGxheWVySWQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxheWVySWQ6IGxheWVySWQsXG4gICAgICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICAgICAgdmlzaWJsZTogY29uZmlnLnZpc2libGUsXG4gICAgICAgIH0gYXMgUGRmTGF5ZXI7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyB0b2dnbGVMYXllcihsYXllcklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuUERGVmlld2VyQXBwbGljYXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb3B0aW9uYWxDb250ZW50Q29uZmlnID0gYXdhaXQgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyLm9wdGlvbmFsQ29udGVudENvbmZpZ1Byb21pc2U7XG4gICAgaWYgKG9wdGlvbmFsQ29udGVudENvbmZpZykge1xuICAgICAgbGV0IGlzVmlzaWJsZSA9IG9wdGlvbmFsQ29udGVudENvbmZpZy5nZXRHcm91cChsYXllcklkKS52aXNpYmxlO1xuICAgICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBpbnB1dFtpZD0nJHtsYXllcklkfSddYCk7XG4gICAgICBpZiAoY2hlY2tib3gpIHtcbiAgICAgICAgaXNWaXNpYmxlID0gKGNoZWNrYm94IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQ7XG4gICAgICAgIChjaGVja2JveCBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkID0gIWlzVmlzaWJsZTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbmFsQ29udGVudENvbmZpZy5zZXRWaXNpYmlsaXR5KGxheWVySWQsICFpc1Zpc2libGUpO1xuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uZXZlbnRCdXMuZGlzcGF0Y2goJ29wdGlvbmFsY29udGVudGNvbmZpZycsIHtcbiAgICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgICBwcm9taXNlOiBQcm9taXNlLnJlc29sdmUob3B0aW9uYWxDb250ZW50Q29uZmlnKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzY3JvbGxQYWdlSW50b1ZpZXcocGFnZU51bWJlcjogbnVtYmVyLCBwYWdlU3BvdD86IHsgdG9wPzogbnVtYmVyIHwgc3RyaW5nOyBsZWZ0PzogbnVtYmVyIHwgc3RyaW5nIH0pOiB2b2lkIHtcbiAgICBjb25zdCB2aWV3ZXIgPSB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZWaWV3ZXIgYXMgYW55O1xuICAgIHZpZXdlcj8uc2Nyb2xsUGFnZVBvc0ludG9WaWV3KHBhZ2VOdW1iZXIsIHBhZ2VTcG90KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRTZXJpYWxpemVkQW5ub3RhdGlvbnMoKTogRWRpdG9yQW5ub3RhdGlvbltdIHwgbnVsbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlci5nZXRTZXJpYWxpemVkQW5ub3RhdGlvbnMoKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhZGRFZGl0b3JBbm5vdGF0aW9uKHNlcmlhbGl6ZWRBbm5vdGF0aW9uOiBzdHJpbmcgfCBFZGl0b3JBbm5vdGF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyLmFkZEVkaXRvckFubm90YXRpb24oc2VyaWFsaXplZEFubm90YXRpb24pO1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUVkaXRvckFubm90YXRpb25zKGZpbHRlcj86IChzZXJpYWxpemVkOiBvYmplY3QpID0+IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5wZGZWaWV3ZXIucmVtb3ZlRWRpdG9yQW5ub3RhdGlvbnMoZmlsdGVyKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbG9hZEltYWdlQXNEYXRhVVJMKGltYWdlVXJsOiBzdHJpbmcpOiBQcm9taXNlPEJsb2IgfCBzdHJpbmc+IHtcbiAgICBpZiAoaW1hZ2VVcmwuc3RhcnRzV2l0aCgnZGF0YTonKSkge1xuICAgICAgcmV0dXJuIGltYWdlVXJsO1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGltYWdlVXJsKTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCB0aGUgaW1hZ2UgZnJvbSAke2ltYWdlVXJsfTogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuICAgIH1cblxuICAgIGNvbnN0IGltYWdlQmxvYiA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKTtcbiAgICByZXR1cm4gaW1hZ2VCbG9iO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGFkZEltYWdlVG9Bbm5vdGF0aW9uTGF5ZXIoeyB1cmxPckRhdGFVcmwsIHBhZ2UsIGxlZnQsIGJvdHRvbSwgcmlnaHQsIHRvcCwgcm90YXRpb24gfTogUGRmSW1hZ2VQYXJhbWV0ZXJzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUaGUgUERGIHZpZXdlciBoYXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQgeWV0LicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgcGFnZVRvTW9kaWZ5OiBudW1iZXI7XG4gICAgaWYgKHBhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHBhZ2UgIT09IHRoaXMuY3VycmVudFBhZ2VJbmRleCgpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucmVuZGVyUGFnZShwYWdlKTtcbiAgICAgIH1cbiAgICAgIHBhZ2VUb01vZGlmeSA9IHBhZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhZ2VUb01vZGlmeSA9IHRoaXMuY3VycmVudFBhZ2VJbmRleCgpID8/IDA7XG4gICAgfVxuICAgIGNvbnN0IHByZXZpb3VzQW5ub3RhdGlvbkVkaXRvck1vZGUgPSB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uLnBkZlZpZXdlci5hbm5vdGF0aW9uRWRpdG9yTW9kZTtcbiAgICB0aGlzLnN3aXRjaEFubm90YXRpb25FZHRvck1vZGUoMTMpO1xuICAgIGNvbnN0IGRhdGFVcmwgPSBhd2FpdCB0aGlzLmxvYWRJbWFnZUFzRGF0YVVSTCh1cmxPckRhdGFVcmwpO1xuICAgIGNvbnN0IHBhZ2VTaXplID0gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuX3BhZ2VzW3BhZ2VUb01vZGlmeV0ucGRmUGFnZS52aWV3O1xuICAgIGNvbnN0IGxlZnREaW0gPSBwYWdlU2l6ZVswXTtcbiAgICBjb25zdCBib3R0b21EaW0gPSBwYWdlU2l6ZVsxXTtcbiAgICBjb25zdCByaWdodERpbSA9IHBhZ2VTaXplWzJdO1xuICAgIGNvbnN0IHRvcERpbSA9IHBhZ2VTaXplWzNdO1xuICAgIGNvbnN0IHdpZHRoID0gcmlnaHREaW0gLSBsZWZ0RGltO1xuICAgIGNvbnN0IGhlaWdodCA9IHRvcERpbSAtIGJvdHRvbURpbTtcbiAgICBjb25zdCBpbWFnZVdpZHRoID0gdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8ucGRmVmlld2VyLl9wYWdlc1twYWdlVG9Nb2RpZnldLmRpdi5jbGllbnRXaWR0aDtcbiAgICBjb25zdCBpbWFnZUhlaWdodCA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlci5fcGFnZXNbcGFnZVRvTW9kaWZ5XS5kaXYuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IGxlZnRQZGYgPSB0aGlzLmNvbnZlcnRUb1BERkNvb3JkaW5hdGVzKGxlZnQsIHdpZHRoLCAwLCBpbWFnZVdpZHRoKTtcbiAgICBjb25zdCBib3R0b21QZGYgPSB0aGlzLmNvbnZlcnRUb1BERkNvb3JkaW5hdGVzKGJvdHRvbSwgaGVpZ2h0LCAwLCBpbWFnZUhlaWdodCk7XG4gICAgY29uc3QgcmlnaHRQZGYgPSB0aGlzLmNvbnZlcnRUb1BERkNvb3JkaW5hdGVzKHJpZ2h0LCB3aWR0aCwgd2lkdGgsIGltYWdlV2lkdGgpO1xuICAgIGNvbnN0IHRvcFBkZiA9IHRoaXMuY29udmVydFRvUERGQ29vcmRpbmF0ZXModG9wLCBoZWlnaHQsIGhlaWdodCwgaW1hZ2VIZWlnaHQpO1xuXG4gICAgY29uc3Qgc3RhbXBBbm5vdGF0aW9uOiBTdGFtcEVkaXRvckFubm90YXRpb24gPSB7XG4gICAgICBhbm5vdGF0aW9uVHlwZTogMTMsXG4gICAgICBwYWdlSW5kZXg6IHBhZ2VUb01vZGlmeSxcbiAgICAgIGJpdG1hcFVybDogZGF0YVVybCxcbiAgICAgIHJlY3Q6IFtsZWZ0UGRmLCBib3R0b21QZGYsIHJpZ2h0UGRmLCB0b3BQZGZdLFxuICAgICAgcm90YXRpb246IHJvdGF0aW9uID8/IDAsXG4gICAgfTtcbiAgICB0aGlzLmFkZEVkaXRvckFubm90YXRpb24oc3RhbXBBbm5vdGF0aW9uKTtcbiAgICBhd2FpdCB0aGlzLnNsZWVwKDEwKTtcbiAgICB0aGlzLnN3aXRjaEFubm90YXRpb25FZHRvck1vZGUocHJldmlvdXNBbm5vdGF0aW9uRWRpdG9yTW9kZSk7XG4gIH1cblxuICBwdWJsaWMgY3VycmVudFBhZ2VJbmRleCgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHZpZXdlciA9IHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LnBkZlZpZXdlcjtcbiAgICBpZiAodmlld2VyKSB7XG4gICAgICByZXR1cm4gdmlld2VyLmN1cnJlbnRQYWdlTnVtYmVyIC0gMTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFRvUERGQ29vcmRpbmF0ZXModmFsdWU6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCwgbWF4VmFsdWU6IG51bWJlciwgZGVmYXVsdFZhbHVlOiBudW1iZXIsIGltYWdlTWF4VmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICh2YWx1ZS5lbmRzV2l0aCgnJScpKSB7XG4gICAgICAgIHJldHVybiAocGFyc2VJbnQodmFsdWUsIDEwKSAvIDEwMCkgKiBtYXhWYWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUuZW5kc1dpdGgoJ3B4JykpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMCkgKiAobWF4VmFsdWUgLyBpbWFnZU1heFZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN3aXRjaEFubm90YXRpb25FZHRvck1vZGUobW9kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uZXZlbnRCdXMuZGlzcGF0Y2goJ3N3aXRjaGFubm90YXRpb25lZGl0b3Jtb2RlJywgeyBtb2RlIH0pO1xuICB9XG5cbiAgcHVibGljIHNldCBlZGl0b3JGb250U2l6ZShzaXplOiBudW1iZXIpIHtcbiAgICB0aGlzLnNldEVkaXRvclByb3BlcnR5KEFubm90YXRpb25FZGl0b3JQYXJhbXNUeXBlLkZSRUVURVhUX1NJWkUsIHNpemUpO1xuICB9XG5cbiAgcHVibGljIHNldCBlZGl0b3JGb250Q29sb3IoY29sb3I6IHN0cmluZykge1xuICAgIHRoaXMuc2V0RWRpdG9yUHJvcGVydHkoQW5ub3RhdGlvbkVkaXRvclBhcmFtc1R5cGUuRlJFRVRFWFRfQ09MT1IsIGNvbG9yKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZWRpdG9ySW5rQ29sb3IoY29sb3I6IHN0cmluZykge1xuICAgIHRoaXMuc2V0RWRpdG9yUHJvcGVydHkoQW5ub3RhdGlvbkVkaXRvclBhcmFtc1R5cGUuSU5LX0NPTE9SLCBjb2xvcik7XG4gIH1cblxuICBwdWJsaWMgc2V0IGVkaXRvcklua09wYWNpdHkob3BhY2l0eTogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRFZGl0b3JQcm9wZXJ0eShBbm5vdGF0aW9uRWRpdG9yUGFyYW1zVHlwZS5JTktfT1BBQ0lUWSwgb3BhY2l0eSk7XG4gIH1cblxuICBwdWJsaWMgc2V0IGVkaXRvcklua1RoaWNrbmVzcyh0aGlja25lc3M6IG51bWJlcikge1xuICAgIHRoaXMuc2V0RWRpdG9yUHJvcGVydHkoQW5ub3RhdGlvbkVkaXRvclBhcmFtc1R5cGUuSU5LX1RISUNLTkVTUywgdGhpY2tuZXNzKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZWRpdG9ySGlnaGxpZ2h0Q29sb3IoY29sb3I6IHN0cmluZykge1xuICAgIHRoaXMuc2V0RWRpdG9yUHJvcGVydHkoQW5ub3RhdGlvbkVkaXRvclBhcmFtc1R5cGUuSElHSExJR0hUX0NPTE9SLCBjb2xvcik7XG4gIH1cblxuICBwdWJsaWMgc2V0IGVkaXRvckhpZ2hsaWdodERlZmF1bHRDb2xvcihjb2xvcjogc3RyaW5nKSB7XG4gICAgdGhpcy5zZXRFZGl0b3JQcm9wZXJ0eShBbm5vdGF0aW9uRWRpdG9yUGFyYW1zVHlwZS5ISUdITElHSFRfREVGQVVMVF9DT0xPUiwgY29sb3IpO1xuICB9XG5cbiAgcHVibGljIHNldCBlZGl0b3JIaWdobGlnaHRTaG93QWxsKHNob3dBbGw6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnNldEVkaXRvclByb3BlcnR5KEFubm90YXRpb25FZGl0b3JQYXJhbXNUeXBlLkhJR0hMSUdIVF9TSE9XX0FMTCwgc2hvd0FsbCk7XG4gIH1cblxuICBwdWJsaWMgc2V0IGVkaXRvckhpZ2hsaWdodFRoaWNrbmVzcyh0aGlja25lc3M6IG51bWJlcikge1xuICAgIHRoaXMuc2V0RWRpdG9yUHJvcGVydHkoQW5ub3RhdGlvbkVkaXRvclBhcmFtc1R5cGUuSElHSExJR0hUX1RISUNLTkVTUywgdGhpY2tuZXNzKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRFZGl0b3JQcm9wZXJ0eShlZGl0b3JQcm9wZXJ0eVR5cGU6IG51bWJlciwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmV2ZW50QnVzLmRpc3BhdGNoKCdzd2l0Y2hhbm5vdGF0aW9uZWRpdG9ycGFyYW1zJywgeyB0eXBlOiBlZGl0b3JQcm9wZXJ0eVR5cGUsIHZhbHVlIH0pO1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmV2ZW50QnVzLmRpc3BhdGNoKCdhbm5vdGF0aW9uZWRpdG9ycGFyYW1zY2hhbmdlZCcsIHsgZGV0YWlsczogW1tlZGl0b3JQcm9wZXJ0eVR5cGUsIHZhbHVlXV0gfSk7XG4gIH1cbn1cbiJdfQ==