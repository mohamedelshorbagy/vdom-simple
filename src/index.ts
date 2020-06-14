import createElement from './create-element';
import render from './render'
import mount from './mount';
import diff from './diff';



const inputListener = (event) => {
    console.log(event.target.value);
}

const clickListener = () => {
    console.count('Button Clicked')
}

const createApp = count => createElement('div', {
    attrs: {
        class: 'app',
    },
    children: [
        String(count),
        createElement('input', {
            attrs: {
                type: 'text'
            },
            listeners: {
                'input': inputListener
            }
        }),
        createElement('button', {
            children: [
                String("Hello")
            ],
            listeners: {
                click: clickListener
            }
        })
        // ...[...Array(count)].map(() =>
        //     createElement('img', {
        //         attrs: {
        //             src: 'https://source.unsplash.com/collection/190727/400x400'
        //         }
        //     }))
    ]
});

let count = 0;
let App = createApp(count);

const elm = render(App);

let elRoot = mount(elm as HTMLElement, document.getElementById('app'));



const interval = setInterval(() => {
    count++;
    let newApp = createApp(count);
    const patch = diff(App, newApp);
    elRoot = patch(elRoot);
    App = newApp;
}, 1000)

// For aborting the interval
// setTimeout(() => {
//     clearInterval(interval);
// }, 2000)




