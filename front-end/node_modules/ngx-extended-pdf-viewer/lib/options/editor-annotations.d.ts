export declare enum AnnotationMode {
    DISABLE = 0,
    ENABLE = 1,
    ENABLE_FORMS = 2,
    ENABLE_STORAGE = 3
}
export declare enum AnnotationEditorType {
    DISABLE = -1,
    NONE = 0,
    FREETEXT = 3,
    HIGHLIGHT = 9,
    STAMP = 13,
    INK = 15
}
export declare const AnnotationEditorParamsType: {
    RESIZE: number;
    CREATE: number;
    FREETEXT_SIZE: number;
    FREETEXT_COLOR: number;
    FREETEXT_OPACITY: number;
    INK_COLOR: number;
    INK_THICKNESS: number;
    INK_OPACITY: number;
    HIGHLIGHT_COLOR: number;
    HIGHLIGHT_DEFAULT_COLOR: number;
    HIGHLIGHT_THICKNESS: number;
    HIGHLIGHT_FREE: number;
    HIGHLIGHT_SHOW_ALL: number;
};
export type AnnotationEditorTypeValue = -1 | 0 | 3 | 9 | 13 | 15;
export type BezierPath = {
    bezier: Array<number>;
    points: Array<number>;
};
export type InkEditorAnnotation = {
    annotationType: 15;
    color: Array<number>;
    thickness: number;
    opacity: number;
    paths: Array<BezierPath>;
    pageIndex: number;
    rect: Array<number>;
    rotation: 0 | 90 | 180 | 270;
};
export type FreeTextEditorAnnotation = {
    annotationType: 3;
    color: Array<number>;
    fontSize: number;
    value: string;
    pageIndex: number;
    rect: Array<number>;
    rotation: 0 | 90 | 180 | 270;
};
export type StampEditorAnnotation = {
    annotationType: 13;
    pageIndex: number;
    bitmapUrl: string | Blob;
    rect: Array<number>;
    rotation: 0 | 90 | 180 | 270;
};
export type HighlightEditorAnnotation = {
    annotationType: 9;
    color: Array<number>;
    rect: Array<number>;
    pageIndex: number;
    rotation: 0 | 90 | 180 | 270;
};
export type EditorAnnotation = InkEditorAnnotation | FreeTextEditorAnnotation | StampEditorAnnotation | HighlightEditorAnnotation;
