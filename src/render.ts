import { tRender } from "./types";

const render: tRender = (vNode) => {

    if(typeof vNode === 'string') {
        return document.createTextNode(String(vNode));
    }

    const { tag = 'div', attrs = {}, children = [], listeners = {} } = vNode;

    const elm = document.createElement(tag);
    // Add Atrrs to element
    for(let [key, value] of Object.entries(attrs)) {
        elm.setAttribute(key, value);
    }
    
    // Add Listener to element
    for(let [key, fnOrListenerObj] of Object.entries(listeners)) {
        elm.addEventListener(key, fnOrListenerObj);
    }

    // Add Children
    for(let child of children) {
        const newChild = render(child);
        elm.appendChild(newChild);
    }


    return elm;

}


export default render;
