# Spotify Artist Search

A JQuery/ES2015 app that searches artists using the Spotify API.

## Running
There is no build process, but to run the app locally, `express` is used to mimic a server.

1. `npm install` 
2. `npm run app`
3. In Chrome, go to `localhost:8000`

## Design Philosophy
This app was designed to take advantage of modern browser capabilities but to stay lightweight, meaning no frameworks. The most important consideration was to easily be able to reason about app state.

### Intro
One of the biggest challenges of building an app without a modern framework like Angular or React is application state management. JQuery, though a useful tool, tends to lead to poorly-written code due to its imperative syntax (hence why frameworks with data-binding abstractions became popular in the first place). In pure JQuery apps, application state is "stored" in the DOM, but the DOM is also what the user is interacting with. jQuery apps are usually written with some HTML template being the intial view, and event handlers are attached to interactive elements (buttons, form fields, etc.). These events lead to the app performing some logic and then usually updating the DOM. As apps get more complex, what components are updating when and how exactly the app will look as a result can become very hard to determine, especially when asynchronous calls are made. Thus, it becomes desireable to have some application code representing app state, and to put in protections around how that state gets updated so it happens in a deterministic way. Enter the `Component` class.

### The `Component` class
This is an ES2015 `class` that handles the lifecycle of mounting, rendering, and state changes behind the scenes for an application component. When a component extends the `Component` class, the only thing that component needs to do is to call the constructor and have a `render` function, and other lifecycle hooks as desired, just like React. To instantiate a component, it's as simple as:
```
const app = new App('id');
app.initialize();
```
where `id` is a string id attribute in the html. This id tells the component where to mount itself to. The `initialize` call kicks off the rendering and mounting lifeycle to set the intial state of the component and place it into the DOM accordingly.

The component constructor call's 2nd param and the `intialize` function's first param are properties that are then usable by the component as `props` (just like React). Components also have internal `state`, which, again like React, is meant to represent application state specific to that component.

`Render` is a function of external `props` and internal `state` and must return a jQuery element representing the DOM to mount. If event handlers are needed, they can be added in the `beforeMount` function, where the rendered element is passed in. If child components are needed, they should be intialized in the `afterMount` function, since they require the parent to be attached to the DOM first.

For such a small app with minimal data flow, additions like a state-handling library (e.g. Redux) are not needed. Further, jQuery is fast enough that a virtual DOM implementation is not needed, but in theory one could be added to the Component class.

## Future Optimizations
This app was written quickly, as such, compromises were made in the design. 
1) Microsoft Edge is currently not supported due to the use of `object-fit` in the css. This property saves us the hassle of using pseudo elements and JS hacks for sizing images and the background video of the app. If support was desired, such functionality could be added easily.
2) Older browsers are also not supported due to the use of ES2015 features such as `class`, arrow syntax, template literals, and `let/const`. This could be fixed with transpiling using babel, but that would come with adding in a build process (`babel-standalone` isn't really meant for production uses), which undercuts the simplicity of the app slightly.
3) CSS tends to quickly grow out of hand, and if it were to continue to grow past 200 lines or so, a preprocessor such as Sass would be a welcome addition.
4) Although the `class` syntax give the JS some structure, without some sort of module loader or bundler, the length of the `app.js` file could grow out of hand as well. A simple solution to obviate the need for a build process would be to include an (ES2015 module polyfill)[https://github.com/ModuleLoader/browser-es-module-loader] and break up each component into its own module.