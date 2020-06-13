export interface ElmVNode {
    tag: string;
    attrs: object,
    children: VNode[],
    listeners?: {
        [key: string]: Function
    }
};

export type TextVNode = string;
export type VNode = ElmVNode | TextVNode;

export type tCreateElement = (t: string, opts?: Partial<Omit<ElmVNode, 'tag'>>) => ElmVNode
export type tRender = (n: VNode) => HTMLElement | Text
export type tPatch = (n: HTMLElement) => HTMLElement;
export type tDiff = (o: VNode, n: VNode) => tPatch;
