import { Component } from '@angular/core';
import * as i0 from "@angular/core";
/** List of all fields that can be customized */
const requiredIds = [
    'attachmentsView',
    'authorField',
    'contextFirstPage',
    'contextLastPage',
    'contextPageRotateCcw',
    'contextPageRotateCw',
    'creationDateField',
    'creatorField',
    'currentOutlineItem',
    'cursorHandTool',
    'cursorSelectTool',
    'customScaleOption',
    'documentProperties',
    'documentPropertiesClose',
    'download',
    'primaryEditorFreeText',
    'primaryEditorHighlight',
    'primaryEditorInk',
    'primaryEditorStamp',
    'editorModeButtons',
    'editorNone',
    'editorStampAddImage',
    'errorClose',
    'errorMessage',
    'errorMoreInfo',
    'errorShowLess',
    'errorShowMore',
    'errorWrapper',
    'fileNameField',
    'fileSizeField',
    'findbar',
    'findCurrentPage',
    'findEntireWord',
    'findFuzzy',
    'findHighlightAll',
    'findIgnoreAccents',
    'findInput',
    'findInputMultiline',
    'findMatchCase',
    'findMatchDiacritics',
    'findMsg',
    'findMultipleSearchTexts',
    'findNext',
    'findPrevious',
    'findRange',
    'findResultsCount',
    'firstPage',
    'individualWordsMode',
    'individualWordsModeLabel',
    'keywordsField',
    'lastPage',
    'linearizedField',
    'modificationDateField',
    'next',
    'numPages',
    'openFile',
    'outerContainer',
    'outerContainer',
    'outlineOptionsContainer',
    'outlineView',
    'pageCountField',
    'pageNumber',
    'pageRotateCcw',
    'pageRotateCw',
    'pageSizeField',
    'password',
    'passwordCancel',
    'passwordSubmit',
    'passwordText',
    'presentationMode',
    'previous',
    'printButton',
    'producerField',
    'scaleSelect',
    'scaleSelectContainer',
    'scrollHorizontal',
    'scrollPage',
    'scrollVertical',
    'scrollWrapped',
    'secondaryDownload',
    'secondaryOpenFile',
    'secondaryPresentationMode',
    'secondaryPrintButton',
    'secondaryToolbar',
    'secondaryToolbarButtonContainer',
    'secondaryToolbarToggle',
    'secondaryViewBookmark',
    'sidebarResizer',
    'primarySidebarToggle',
    'spreadEven',
    'spreadNone',
    'spreadOdd',
    'subjectField',
    'thumbnailView',
    'titleField',
    'toolbarViewer',
    'versionField',
    'viewAttachments',
    'viewAttachments',
    'viewBookmark',
    'viewerContainer',
    'viewFind',
    'viewLayers',
    'viewOutline',
    'viewOutline',
    'viewThumbnail',
    'viewThumbnail',
    'primaryZoomIn',
    'primaryZoomOut',
];
export class PdfDummyComponentsComponent {
    dummyComponentsContainer;
    addMissingStandardWidgets() {
        this.dummyComponentsContainer = document.getElementsByClassName('dummy-pdf-viewer-components')[0];
        const container = this.dummyComponentsContainer;
        if (!container) {
            return;
        }
        for (let i = 0; i < container.children.length; i++) {
            const child = container.firstChild;
            if (child) {
                container.removeChild(child);
            }
        }
        requiredIds.forEach((id) => {
            if (this.needsDummyWidget(id)) {
                const dummy = document.createElement('span');
                dummy.id = id;
                dummy.className = 'invisible dummy-component';
                this.dummyComponentsContainer.appendChild(dummy);
            }
        });
        if (this.needsDummyWidget('scaleSelect')) {
            const dummy = document.createElement('select');
            dummy.id = 'scaleSelect';
            dummy.className = 'invisible dummy-component';
            this.dummyComponentsContainer.appendChild(dummy);
        }
    }
    needsDummyWidget(id) {
        const widget = document.getElementById(id);
        if (!widget) {
            return true;
        }
        return false;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfDummyComponentsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfDummyComponentsComponent, selector: "pdf-dummy-components", ngImport: i0, template: "<span class=\"invisible dummy-pdf-viewer-components\">\n</span>\n" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfDummyComponentsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-dummy-components', template: "<span class=\"invisible dummy-pdf-viewer-components\">\n</span>\n" }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLWR1bW15LWNvbXBvbmVudHMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi9wZGYtZHVtbXktY29tcG9uZW50cy9wZGYtZHVtbXktY29tcG9uZW50cy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci9zcmMvbGliL3BkZi1kdW1teS1jb21wb25lbnRzL3BkZi1kdW1teS1jb21wb25lbnRzLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBRTFDLGdEQUFnRDtBQUNoRCxNQUFNLFdBQVcsR0FBRztJQUNsQixpQkFBaUI7SUFDakIsYUFBYTtJQUNiLGtCQUFrQjtJQUNsQixpQkFBaUI7SUFDakIsc0JBQXNCO0lBQ3RCLHFCQUFxQjtJQUNyQixtQkFBbUI7SUFDbkIsY0FBYztJQUNkLG9CQUFvQjtJQUNwQixnQkFBZ0I7SUFDaEIsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixvQkFBb0I7SUFDcEIseUJBQXlCO0lBQ3pCLFVBQVU7SUFDVix1QkFBdUI7SUFDdkIsd0JBQXdCO0lBQ3hCLGtCQUFrQjtJQUNsQixvQkFBb0I7SUFDcEIsbUJBQW1CO0lBQ25CLFlBQVk7SUFDWixxQkFBcUI7SUFDckIsWUFBWTtJQUNaLGNBQWM7SUFDZCxlQUFlO0lBQ2YsZUFBZTtJQUNmLGVBQWU7SUFDZixjQUFjO0lBQ2QsZUFBZTtJQUNmLGVBQWU7SUFDZixTQUFTO0lBQ1QsaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixXQUFXO0lBQ1gsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixXQUFXO0lBQ1gsb0JBQW9CO0lBQ3BCLGVBQWU7SUFDZixxQkFBcUI7SUFDckIsU0FBUztJQUNULHlC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Y0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO3dHQXhDVSwyQkFBMkI7NEZBQTNCLDJCQUEyQiw0REN2SHhDLG1FQUVBOzs0RkRxSGEsMkJBQTJCO2tCQUp2QyxTQUFTOytCQUNFLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKiogTGlzdCBvZiBhbGwgZmllbGRzIHRoYXQgY2FuIGJlIGN1c3RvbWl6ZWQgKi9cbmNvbnN0IHJlcXVpcmVkSWRzID0gW1xuICAnYXR0YWNobWVudHNWaWV3JyxcbiAgJ2F1dGhvckZpZWxkJyxcbiAgJ2NvbnRleHRGaXJzdFBhZ2UnLFxuICAnY29udGV4dExhc3RQYWdlJyxcbiAgJ2NvbnRleHRQYWdlUm90YXRlQ2N3JyxcbiAgJ2NvbnRleHRQYWdlUm90YXRlQ3cnLFxuICAnY3JlYXRpb25EYXRlRmllbGQnLFxuICAnY3JlYXRvckZpZWxkJyxcbiAgJ2N1cnJlbnRPdXRsaW5lSXRlbScsXG4gICdjdXJzb3JIYW5kVG9vbCcsXG4gICdjdXJzb3JTZWxlY3RUb29sJyxcbiAgJ2N1c3RvbVNjYWxlT3B0aW9uJyxcbiAgJ2RvY3VtZW50UHJvcGVydGllcycsXG4gICdkb2N1bWVudFByb3BlcnRpZXNDbG9zZScsXG4gICdkb3dubG9hZCcsXG4gICdwcmltYXJ5RWRpdG9yRnJlZVRleHQnLFxuICAncHJpbWFyeUVkaXRvckhpZ2hsaWdodCcsXG4gICdwcmltYXJ5RWRpdG9ySW5rJyxcbiAgJ3ByaW1hcnlFZGl0b3JTdGFtcCcsXG4gICdlZGl0b3JNb2RlQnV0dG9ucycsXG4gICdlZGl0b3JOb25lJyxcbiAgJ2VkaXRvclN0YW1wQWRkSW1hZ2UnLFxuICAnZXJyb3JDbG9zZScsXG4gICdlcnJvck1lc3NhZ2UnLFxuICAnZXJyb3JNb3JlSW5mbycsXG4gICdlcnJvclNob3dMZXNzJyxcbiAgJ2Vycm9yU2hvd01vcmUnLFxuICAnZXJyb3JXcmFwcGVyJyxcbiAgJ2ZpbGVOYW1lRmllbGQnLFxuICAnZmlsZVNpemVGaWVsZCcsXG4gICdmaW5kYmFyJyxcbiAgJ2ZpbmRDdXJyZW50UGFnZScsXG4gICdmaW5kRW50aXJlV29yZCcsXG4gICdmaW5kRnV6enknLFxuICAnZmluZEhpZ2hsaWdodEFsbCcsXG4gICdmaW5kSWdub3JlQWNjZW50cycsXG4gICdmaW5kSW5wdXQnLFxuICAnZmluZElucHV0TXVsdGlsaW5lJyxcbiAgJ2ZpbmRNYXRjaENhc2UnLFxuICAnZmluZE1hdGNoRGlhY3JpdGljcycsXG4gICdmaW5kTXNnJyxcbiAgJ2ZpbmRNdWx0aXBsZVNlYXJjaFRleHRzJyxcbiAgJ2ZpbmROZXh0JyxcbiAgJ2ZpbmRQcmV2aW91cycsXG4gICdmaW5kUmFuZ2UnLFxuICAnZmluZFJlc3VsdHNDb3VudCcsXG4gICdmaXJzdFBhZ2UnLFxuICAnaW5kaXZpZHVhbFdvcmRzTW9kZScsXG4gICdpbmRpdmlkdWFsV29yZHNNb2RlTGFiZWwnLFxuICAna2V5d29yZHNGaWVsZCcsXG4gICdsYXN0UGFnZScsXG4gICdsaW5lYXJpemVkRmllbGQnLFxuICAnbW9kaWZpY2F0aW9uRGF0ZUZpZWxkJyxcbiAgJ25leHQnLFxuICAnbnVtUGFnZXMnLFxuICAnb3BlbkZpbGUnLFxuICAnb3V0ZXJDb250YWluZXInLFxuICAnb3V0ZXJDb250YWluZXInLFxuICAnb3V0bGluZU9wdGlvbnNDb250YWluZXInLFxuICAnb3V0bGluZVZpZXcnLFxuICAncGFnZUNvdW50RmllbGQnLFxuICAncGFnZU51bWJlcicsXG4gICdwYWdlUm90YXRlQ2N3JyxcbiAgJ3BhZ2VSb3RhdGVDdycsXG4gICdwYWdlU2l6ZUZpZWxkJyxcbiAgJ3Bhc3N3b3JkJyxcbiAgJ3Bhc3N3b3JkQ2FuY2VsJyxcbiAgJ3Bhc3N3b3JkU3VibWl0JyxcbiAgJ3Bhc3N3b3JkVGV4dCcsXG4gICdwcmVzZW50YXRpb25Nb2RlJyxcbiAgJ3ByZXZpb3VzJyxcbiAgJ3ByaW50QnV0dG9uJyxcbiAgJ3Byb2R1Y2VyRmllbGQnLFxuICAnc2NhbGVTZWxlY3QnLFxuICAnc2NhbGVTZWxlY3RDb250YWluZXInLFxuICAnc2Nyb2xsSG9yaXpvbnRhbCcsXG4gICdzY3JvbGxQYWdlJyxcbiAgJ3Njcm9sbFZlcnRpY2FsJyxcbiAgJ3Njcm9sbFdyYXBwZWQnLFxuICAnc2Vjb25kYXJ5RG93bmxvYWQnLFxuICAnc2Vjb25kYXJ5T3BlbkZpbGUnLFxuICAnc2Vjb25kYXJ5UHJlc2VudGF0aW9uTW9kZScsXG4gICdzZWNvbmRhcnlQcmludEJ1dHRvbicsXG4gICdzZWNvbmRhcnlUb29sYmFyJyxcbiAgJ3NlY29uZGFyeVRvb2xiYXJCdXR0b25Db250YWluZXInLFxuICAnc2Vjb25kYXJ5VG9vbGJhclRvZ2dsZScsXG4gICdzZWNvbmRhcnlWaWV3Qm9va21hcmsnLFxuICAnc2lkZWJhclJlc2l6ZXInLFxuICAncHJpbWFyeVNpZGViYXJUb2dnbGUnLFxuICAnc3ByZWFkRXZlbicsXG4gICdzcHJlYWROb25lJyxcbiAgJ3NwcmVhZE9kZCcsXG4gICdzdWJqZWN0RmllbGQnLFxuICAndGh1bWJuYWlsVmlldycsXG4gICd0aXRsZUZpZWxkJyxcbiAgJ3Rvb2xiYXJWaWV3ZXInLFxuICAndmVyc2lvbkZpZWxkJyxcbiAgJ3ZpZXdBdHRhY2htZW50cycsXG4gICd2aWV3QXR0YWNobWVudHMnLFxuICAndmlld0Jvb2ttYXJrJyxcbiAgJ3ZpZXdlckNvbnRhaW5lcicsXG4gICd2aWV3RmluZCcsXG4gICd2aWV3TGF5ZXJzJyxcbiAgJ3ZpZXdPdXRsaW5lJyxcbiAgJ3ZpZXdPdXRsaW5lJyxcbiAgJ3ZpZXdUaHVtYm5haWwnLFxuICAndmlld1RodW1ibmFpbCcsXG4gICdwcmltYXJ5Wm9vbUluJyxcbiAgJ3ByaW1hcnlab29tT3V0Jyxcbl07XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BkZi1kdW1teS1jb21wb25lbnRzJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BkZi1kdW1teS1jb21wb25lbnRzLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgUGRmRHVtbXlDb21wb25lbnRzQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBkdW1teUNvbXBvbmVudHNDb250YWluZXI6IEVsZW1lbnQ7XG5cbiAgcHVibGljIGFkZE1pc3NpbmdTdGFuZGFyZFdpZGdldHMoKTogdm9pZCB7XG4gICAgdGhpcy5kdW1teUNvbXBvbmVudHNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkdW1teS1wZGYtdmlld2VyLWNvbXBvbmVudHMnKVswXTtcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmR1bW15Q29tcG9uZW50c0NvbnRhaW5lciBhcyBIVE1MRWxlbWVudDtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IGNvbnRhaW5lci5maXJzdENoaWxkO1xuICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVxdWlyZWRJZHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGlmICh0aGlzLm5lZWRzRHVtbXlXaWRnZXQoaWQpKSB7XG4gICAgICAgIGNvbnN0IGR1bW15ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBkdW1teS5pZCA9IGlkO1xuICAgICAgICBkdW1teS5jbGFzc05hbWUgPSAnaW52aXNpYmxlIGR1bW15LWNvbXBvbmVudCc7XG4gICAgICAgIHRoaXMuZHVtbXlDb21wb25lbnRzQ29udGFpbmVyLmFwcGVuZENoaWxkKGR1bW15KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm5lZWRzRHVtbXlXaWRnZXQoJ3NjYWxlU2VsZWN0JykpIHtcbiAgICAgIGNvbnN0IGR1bW15ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0Jyk7XG4gICAgICBkdW1teS5pZCA9ICdzY2FsZVNlbGVjdCc7XG4gICAgICBkdW1teS5jbGFzc05hbWUgPSAnaW52aXNpYmxlIGR1bW15LWNvbXBvbmVudCc7XG4gICAgICB0aGlzLmR1bW15Q29tcG9uZW50c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkdW1teSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBuZWVkc0R1bW15V2lkZ2V0KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB3aWRnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgaWYgKCF3aWRnZXQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiIsIjxzcGFuIGNsYXNzPVwiaW52aXNpYmxlIGR1bW15LXBkZi12aWV3ZXItY29tcG9uZW50c1wiPlxuPC9zcGFuPlxuIl19