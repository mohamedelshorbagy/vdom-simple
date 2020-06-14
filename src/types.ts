export type Listener = {
    [key in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[key]) => void
} & {
    [key: string]: EventListener
};

export type TextVNode = string;
export interface ElmVNode {
    tag: string;
    attrs: object,
    children: VNode[],
    listeners?: Listener
};
export type VNode = ElmVNode | TextVNode;

export type tCreateElement = (t: string, opts?: Partial<Omit<ElmVNode, 'tag'>>) => ElmVNode
export type tRender = (n: VNode) => HTMLElement | Text
export type tPatch = (n: HTMLElement) => HTMLElement;
export type tDiff = (o: VNode, n: VNode) => tPatch;
