import { tDiff, tPatch, ElmVNode, VNode } from "./types";
import render from "./render";


function zip<T, M>(xs: T[], ys: M[]): Array<[T, M]> {
    const collection = [];
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        collection.push([xs[i], ys[i]]);
    }
    return collection;
}


const diffAttrs = (oldAttrs: object, newAttrs: object): tPatch => {

    const patches: tPatch[] = [];
    // add new attrs
    for (const [key, value] of Object.entries(newAttrs)) {
        if (!(key in oldAttrs) || ((key in oldAttrs) && oldAttrs[key] !== value)) {
            const patch: tPatch = domNode => {
                domNode.setAttribute(key, value);
                return domNode;
            };
            patches.push(patch);
        }
    }

    // delete old attrs
    for (const key in oldAttrs) {
        if (!(key in newAttrs)) {
            const patch: tPatch = domNode => {
                domNode.removeAttribute(key);
                return domNode;
            };
            patches.push(patch);
        }
    }

    return domNode => {
        for (let patch of patches) {
            patch(domNode);
        }
        return domNode;
    }
}



const diffListeners = (oldListeners: object, newListeners: object): tPatch => {

    const patches: tPatch[] = [];

    // delete old listeners
    for (const [key, fn] of Object.entries(newListeners)) {
        if (!(key in oldListeners)) {
            const patch: tPatch = domNode => {
                domNode.addEventListener(key, fn);
                return domNode;
            };
            patches.push(patch);
        } else {
            // listener exist
            // Diff the callback fns
            // `true` => do nothing
            // `false` => we have to remove it first then add it again
            const oldFn = oldListeners[key];
            if (fn !== oldFn) {
                const patch: tPatch = domNode => {
                    domNode.removeEventListener(key, oldFn);
                    domNode.addEventListener(key, fn);
                    return domNode;
                }
                patches.push(patch);
            }
        }
    }
    // old listeners
    for (const [key, fn] of Object.entries(oldListeners)) {
        if (!(key in newListeners)) {
            const patch: tPatch = domNode => {
                domNode.removeEventListener(key, fn);
                return domNode;
            };
            patches.push(patch);
        }
    }
    // add new attrs

    return domNode => {
        for (let patch of patches) {
            patch(domNode);
        }
        return domNode;
    }
}


const diffChildren = (oldChildren: VNode[], newChildren: VNode[]): tPatch => {

    // Case of old nodes
    const patches: tPatch[] = [];
    for (let [oldChild, newChild] of zip(oldChildren, newChildren)) {
        const patch = diff(oldChild, newChild);
        const newPatch = domNode => {
            patch(domNode);
            return domNode;
        }
        patches.push(newPatch);
    }

    // Case of new Nodes
    const newPatches: tPatch[] = [];
    for (let child of newChildren.slice(oldChildren.length)) {
        const newNode = render(child);
        const patch: tPatch = domNode => {
            domNode.appendChild(newNode);
            return domNode;
        }
        newPatches.push(patch);
    }

    return domNode => {

        // Patch old nodes
        for (let [patch, child] of zip<tPatch, HTMLElement>(patches, domNode.childNodes as any)) {
            patch(child);
        }

        // Patch additional nodes
        for (let patch of newPatches) {
            patch(domNode);
        }

        return domNode;
    }


}

const diff: tDiff = (oldVNode, newVNode) => {

    if (!newVNode) {
        const patch: tPatch = (domNode) => {
            domNode.remove();
            return undefined;
        }
        return patch;
    }

    if ((oldVNode as ElmVNode).tag !== (newVNode as ElmVNode).tag) {
        const newNode = render(newVNode);
        const patch: tPatch = domNode => {
            domNode.replaceWith(newNode);
            return domNode;
        }
        return patch;
    }

    if (typeof oldVNode === 'string' && typeof newVNode === 'string') {
        if (oldVNode !== newVNode) {
            const newNode = render(newVNode);
            const patch: tPatch = domNode => {
                domNode.replaceWith(newNode);
                return domNode;
            }
            return patch;
        } else {
            // Case Of Equality so we avoid going to base case
            return domNode => domNode;
        }
    }





    // Base Case
    const patchAttrs = diffAttrs((oldVNode as ElmVNode).attrs, (newVNode as ElmVNode).attrs);
    const patchChildren = diffChildren((oldVNode as ElmVNode).children, (newVNode as ElmVNode).children);
    const patchListeners = diffListeners((oldVNode as ElmVNode).listeners, (newVNode as ElmVNode).listeners);

    return domNode => {
        // apply
        patchAttrs(domNode);
        patchChildren(domNode);
        patchListeners(domNode);
        return domNode;
    }
}




export default diff;


