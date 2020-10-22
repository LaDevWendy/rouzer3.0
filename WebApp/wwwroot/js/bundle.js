
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self$1(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    function oe(n){return l=>{const o=Object.keys(n.$$.callbacks),i=[];return o.forEach(o=>i.push(listen(l,o,e=>bubble(n,e)))),{destroy:()=>{i.forEach(e=>e());}}}}function ie(){return "undefined"!=typeof window&&!(window.CSS&&window.CSS.supports&&window.CSS.supports("(--foo: red)"))}function se(e){var t;return "r"===e.charAt(0)?e=(t=(t=e).match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i))&&4===t.length?"#"+("0"+parseInt(t[1],10).toString(16)).slice(-2)+("0"+parseInt(t[2],10).toString(16)).slice(-2)+("0"+parseInt(t[3],10).toString(16)).slice(-2):"":"transparent"===e.toLowerCase()&&(e="#00000000"),e}const{document:re}=globals;function ae(e){let t;return {c(){t=element("div"),attr(t,"class","ripple svelte-po4fcb");},m(n,l){insert(n,t,l),e[5](t);},p:noop,i:noop,o:noop,d(n){n&&detach(t),e[5](null);}}}function ce(e,t){e.style.transform=t,e.style.webkitTransform=t;}function de(e,t){e.style.opacity=t.toString();}const ue=function(e,t){const n=["touchcancel","mouseleave","dragstart"];let l=t.currentTarget||t.target;if(l&&!l.classList.contains("ripple")&&(l=l.querySelector(".ripple")),!l)return;const o=l.dataset.event;if(o&&o!==e)return;l.dataset.event=e;const i=document.createElement("span"),{radius:s,scale:r,x:a,y:c,centerX:d,centerY:u}=((e,t)=>{const n=t.getBoundingClientRect(),l=function(e){return "TouchEvent"===e.constructor.name}(e)?e.touches[e.touches.length-1]:e,o=l.clientX-n.left,i=l.clientY-n.top;let s=0,r=.3;const a=t.dataset.center;t.dataset.circle?(r=.15,s=t.clientWidth/2,s=a?s:s+Math.sqrt((o-s)**2+(i-s)**2)/4):s=Math.sqrt(t.clientWidth**2+t.clientHeight**2)/2;const c=(t.clientWidth-2*s)/2+"px",d=(t.clientHeight-2*s)/2+"px";return {radius:s,scale:r,x:a?c:o-s+"px",y:a?d:i-s+"px",centerX:c,centerY:d}})(t,l),p=l.dataset.color,f=2*s+"px";i.className="animation",i.style.width=f,i.style.height=f,i.style.background=p,i.classList.add("animation--enter"),i.classList.add("animation--visible"),ce(i,`translate(${a}, ${c}) scale3d(${r},${r},${r})`),de(i,0),i.dataset.activated=String(performance.now()),l.appendChild(i),setTimeout(()=>{i.classList.remove("animation--enter"),i.classList.add("animation--in"),ce(i,`translate(${d}, ${u}) scale3d(1,1,1)`),de(i,.25);},0);const v="mousedown"===e?"mouseup":"touchend",h=function(){document.removeEventListener(v,h),n.forEach(e=>{document.removeEventListener(e,h);});const e=performance.now()-Number(i.dataset.activated),t=Math.max(250-e,0);setTimeout(()=>{i.classList.remove("animation--in"),i.classList.add("animation--out"),de(i,0),setTimeout(()=>{i&&l.removeChild(i),0===l.children.length&&delete l.dataset.event;},300);},t);};document.addEventListener(v,h),n.forEach(e=>{document.addEventListener(e,h,{passive:!0});});},pe=function(e){0===e.button&&ue(e.type,e);},fe=function(e){if(e.changedTouches)for(let t=0;t<e.changedTouches.length;++t)ue(e.type,e.changedTouches[t]);};function ve(e,t,n){let l,o,{center:i=!1}=t,{circle:s=!1}=t,{color:r="currentColor"}=t;return onMount(async()=>{await tick();try{i&&n(0,l.dataset.center="true",l),s&&n(0,l.dataset.circle="true",l),n(0,l.dataset.color=r,l),o=l.parentElement;}catch(e){}if(!o)return void console.error("Ripple: Trigger element not found.");let e=window.getComputedStyle(o);0!==e.position.length&&"static"!==e.position||(o.style.position="relative"),o.addEventListener("touchstart",fe,{passive:!0}),o.addEventListener("mousedown",pe,{passive:!0});}),onDestroy(()=>{o&&(o.removeEventListener("mousedown",pe),o.removeEventListener("touchstart",fe));}),e.$set=e=>{"center"in e&&n(1,i=e.center),"circle"in e&&n(2,s=e.circle),"color"in e&&n(3,r=e.color);},[l,i,s,r,o,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(0,l=e);});}]}class he extends SvelteComponent{constructor(e){var t;super(),re.getElementById("svelte-po4fcb-style")||((t=element("style")).id="svelte-po4fcb-style",t.textContent=".ripple.svelte-po4fcb{display:block;position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;border-radius:inherit;color:inherit;pointer-events:none;z-index:0;contain:strict}.ripple.svelte-po4fcb .animation{color:inherit;position:absolute;top:0;left:0;border-radius:50%;opacity:0;pointer-events:none;overflow:hidden;will-change:transform, opacity}.ripple.svelte-po4fcb .animation--enter{transition:none}.ripple.svelte-po4fcb .animation--in{transition:opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1);transition:transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\topacity 0.1s cubic-bezier(0.4, 0, 0.2, 1)}.ripple.svelte-po4fcb .animation--out{transition:opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)}",append(re.head,t)),init(this,e,ve,ae,safe_not_equal,{center:1,circle:2,color:3});}}function ge(e){let t;const n=new he({props:{center:e[3],circle:e[3]}});return {c(){create_component(n.$$.fragment);},m(e,l){mount_component(n,e,l),t=!0;},p(e,t){const l={};8&t&&(l.center=e[3]),8&t&&(l.circle=e[3]),n.$set(l);},i(e){t||(transition_in(n.$$.fragment,e),t=!0);},o(e){transition_out(n.$$.fragment,e),t=!1;},d(e){destroy_component(n,e);}}}function me(t){let n,l,o,i,a,d;const p=t[22].default,v=create_slot(p,t,t[21],null);let h=t[10]&&ge(t),b=[{class:t[1]},{style:t[2]},t[14]],E={};for(let e=0;e<b.length;e+=1)E=assign(E,b[e]);return {c(){n=element("button"),v&&v.c(),l=space(),h&&h.c(),set_attributes(n,E),toggle_class(n,"raised",t[6]),toggle_class(n,"outlined",t[8]&&!(t[6]||t[7])),toggle_class(n,"shaped",t[9]&&!t[3]),toggle_class(n,"dense",t[5]),toggle_class(n,"fab",t[4]&&t[3]),toggle_class(n,"icon-button",t[3]),toggle_class(n,"toggle",t[11]),toggle_class(n,"active",t[11]&&t[0]),toggle_class(n,"full-width",t[12]&&!t[3]),toggle_class(n,"svelte-6bcb3a",!0);},m(s,u){insert(s,n,u),v&&v.m(n,null),append(n,l),h&&h.m(n,null),t[23](n),i=!0,a||(d=[listen(n,"click",t[16]),action_destroyer(o=t[15].call(null,n))],a=!0);},p(e,[t]){v&&v.p&&2097152&t&&update_slot(v,p,e,e[21],t,null,null),e[10]?h?(h.p(e,t),1024&t&&transition_in(h,1)):(h=ge(e),h.c(),transition_in(h,1),h.m(n,null)):h&&(group_outros(),transition_out(h,1,1,()=>{h=null;}),check_outros()),set_attributes(n,E=get_spread_update(b,[2&t&&{class:e[1]},4&t&&{style:e[2]},16384&t&&e[14]])),toggle_class(n,"raised",e[6]),toggle_class(n,"outlined",e[8]&&!(e[6]||e[7])),toggle_class(n,"shaped",e[9]&&!e[3]),toggle_class(n,"dense",e[5]),toggle_class(n,"fab",e[4]&&e[3]),toggle_class(n,"icon-button",e[3]),toggle_class(n,"toggle",e[11]),toggle_class(n,"active",e[11]&&e[0]),toggle_class(n,"full-width",e[12]&&!e[3]),toggle_class(n,"svelte-6bcb3a",!0);},i(e){i||(transition_in(v,e),transition_in(h),i=!0);},o(e){transition_out(v,e),transition_out(h),i=!1;},d(e){e&&detach(n),v&&v.d(e),h&&h.d(),t[23](null),a=!1,run_all(d);}}}function be(e,t,n){const l=createEventDispatcher(),o=oe(current_component);let i,{class:s=""}=t,{style:r=null}=t,{icon:a=!1}=t,{fab:c=!1}=t,{dense:d=!1}=t,{raised:u=!1}=t,{unelevated:f=!1}=t,{outlined:v=!1}=t,{shaped:h=!1}=t,{color:g=null}=t,{ripple:m=!0}=t,{toggle:b=!1}=t,{active:x=!1}=t,{fullWidth:w=!1}=t,$={};beforeUpdate(()=>{if(!i)return;let e=i.getElementsByTagName("svg"),t=e.length;for(let n=0;n<t;n++)e[n].setAttribute("width",z+(b&&!a?2:0)),e[n].setAttribute("height",z+(b&&!a?2:0));n(13,i.style.backgroundColor=u||f?g:"transparent",i);let l=getComputedStyle(i).getPropertyValue("background-color");n(13,i.style.color=u||f?function(e="#ffffff"){let t,n,l,o,i,s;if(0===e.length&&(e="#ffffff"),e=se(e),e=String(e).replace(/[^0-9a-f]/gi,""),!new RegExp(/^(?:[0-9a-f]{3}){1,2}$/i).test(e))throw new Error("Invalid HEX color!");e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t=parseInt(r[1],16)/255,n=parseInt(r[2],16)/255,l=parseInt(r[3],16)/255,o=t<=.03928?t/12.92:Math.pow((t+.055)/1.055,2.4),i=n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4),s=l<=.03928?l/12.92:Math.pow((l+.055)/1.055,2.4),.2126*o+.7152*i+.0722*s}(l)>.5?"#000":"#fff":g,i);});let z,{$$slots:k={},$$scope:D}=t;return e.$set=e=>{n(20,t=assign(assign({},t),exclude_internal_props(e))),"class"in e&&n(1,s=e.class),"style"in e&&n(2,r=e.style),"icon"in e&&n(3,a=e.icon),"fab"in e&&n(4,c=e.fab),"dense"in e&&n(5,d=e.dense),"raised"in e&&n(6,u=e.raised),"unelevated"in e&&n(7,f=e.unelevated),"outlined"in e&&n(8,v=e.outlined),"shaped"in e&&n(9,h=e.shaped),"color"in e&&n(17,g=e.color),"ripple"in e&&n(10,m=e.ripple),"toggle"in e&&n(11,b=e.toggle),"active"in e&&n(0,x=e.active),"fullWidth"in e&&n(12,w=e.fullWidth),"$$scope"in e&&n(21,D=e.$$scope);},e.$$.update=()=>{{const{style:e,icon:l,fab:o,dense:i,raised:s,unelevated:r,outlined:a,shaped:c,color:d,ripple:u,toggle:p,active:f,fullWidth:v,...h}=t;!h.disabled&&delete h.disabled,delete h.class,n(14,$=h);}56&e.$$.dirty&&(z=a?c?24:d?20:24:d?16:18),139264&e.$$.dirty&&("primary"===g?n(17,g=ie()?"#1976d2":"var(--primary, #1976d2)"):"accent"==g?n(17,g=ie()?"#f50057":"var(--accent, #f50057)"):!g&&i&&n(17,g=i.style.color||i.parentElement.style.color||(ie()?"#333":"var(--color, #333)")));},t=exclude_internal_props(t),[x,s,r,a,c,d,u,f,v,h,m,b,w,i,$,o,function(e){b&&(n(0,x=!x),l("change",x));},g,z,l,t,D,k,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(13,i=e);});}]}class ye extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-6bcb3a-style")||((t=element("style")).id="svelte-6bcb3a-style",t.textContent="button.svelte-6bcb3a:disabled{cursor:default}button.svelte-6bcb3a{cursor:pointer;font-family:Roboto, Helvetica, sans-serif;font-family:var(--button-font-family, Roboto, Helvetica, sans-serif);font-size:0.875rem;font-weight:500;letter-spacing:0.75px;text-decoration:none;text-transform:uppercase;will-change:transform, opacity;margin:0;padding:0 16px;display:-ms-inline-flexbox;display:inline-flex;position:relative;align-items:center;justify-content:center;box-sizing:border-box;height:36px;border:none;outline:none;line-height:inherit;user-select:none;overflow:hidden;vertical-align:middle;border-radius:4px}button.svelte-6bcb3a::-moz-focus-inner{border:0}button.svelte-6bcb3a:-moz-focusring{outline:none}button.svelte-6bcb3a:before{box-sizing:inherit;border-radius:inherit;color:inherit;bottom:0;content:'';left:0;opacity:0;pointer-events:none;position:absolute;right:0;top:0;transition:0.2s cubic-bezier(0.25, 0.8, 0.5, 1);will-change:background-color, opacity}.toggle.svelte-6bcb3a:before{box-sizing:content-box}.active.svelte-6bcb3a:before{background-color:currentColor;opacity:0.3}.raised.svelte-6bcb3a{box-shadow:0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),\n\t\t\t0 1px 5px 0 rgba(0, 0, 0, 0.12)}.outlined.svelte-6bcb3a{padding:0 14px;border-style:solid;border-width:2px}.shaped.svelte-6bcb3a{border-radius:18px}.dense.svelte-6bcb3a{height:32px}.icon-button.svelte-6bcb3a{line-height:0.5;border-radius:50%;padding:8px;width:40px;height:40px;vertical-align:middle}.icon-button.outlined.svelte-6bcb3a{padding:6px}.icon-button.fab.svelte-6bcb3a{border:none;width:56px;height:56px;box-shadow:0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14),\n\t\t\t0 1px 18px 0 rgba(0, 0, 0, 0.12)}.icon-button.dense.svelte-6bcb3a{width:36px;height:36px}.icon-button.fab.dense.svelte-6bcb3a{width:40px;height:40px}.outlined.svelte-6bcb3a:not(.shaped) .ripple{border-radius:0 !important}.full-width.svelte-6bcb3a{width:100%}@media(hover: hover){button.svelte-6bcb3a:hover:not(.toggle):not([disabled]):not(.disabled):before{background-color:currentColor;opacity:0.15}button.focus-visible.svelte-6bcb3a:focus:not(.toggle):not([disabled]):not(.disabled):before{background-color:currentColor;opacity:0.3}button.focus-visible.toggle.svelte-6bcb3a:focus:not(.active):not([disabled]):not(.disabled):before{background-color:currentColor;opacity:0.15}}",append(document.head,t)),init(this,e,be,me,safe_not_equal,{class:1,style:2,icon:3,fab:4,dense:5,raised:6,unelevated:7,outlined:8,shaped:9,color:17,ripple:10,toggle:11,active:0,fullWidth:12});}}function ze(e){let t;const n=e[13].default,l=create_slot(n,e,e[12],null);return {c(){l&&l.c();},m(e,n){l&&l.m(e,n),t=!0;},p(e,t){l&&l.p&&4096&t&&update_slot(l,n,e,e[12],t,null,null);},i(e){t||(transition_in(l,e),t=!0);},o(e){transition_out(l,e),t=!1;},d(e){l&&l.d(e);}}}function ke(e){let t,n;return {c(){t=svg_element("svg"),n=svg_element("path"),attr(n,"d",e[1]),attr(t,"xmlns","http://www.w3.org/2000/svg"),attr(t,"viewBox",e[2]),attr(t,"class","svelte-h2unzw");},m(e,l){insert(e,t,l),append(t,n);},p(e,l){2&l&&attr(n,"d",e[1]),4&l&&attr(t,"viewBox",e[2]);},i:noop,o:noop,d(e){e&&detach(t);}}}function De(e){let t,n,l,o,i,r,a;const d=[ke,ze],p=[];function f(e,t){return "string"==typeof e[1]?0:1}n=f(e),l=p[n]=d[n](e);let v=[{class:"icon "+e[0]},e[7]],h={};for(let e=0;e<v.length;e+=1)h=assign(h,v[e]);return {c(){t=element("i"),l.c(),set_attributes(t,h),toggle_class(t,"flip",e[3]&&"boolean"==typeof e[3]),toggle_class(t,"flip-h","h"===e[3]),toggle_class(t,"flip-v","v"===e[3]),toggle_class(t,"spin",e[4]),toggle_class(t,"pulse",e[5]&&!e[4]),toggle_class(t,"svelte-h2unzw",!0);},m(l,s){insert(l,t,s),p[n].m(t,null),e[14](t),i=!0,r||(a=action_destroyer(o=e[8].call(null,t)),r=!0);},p(e,[o]){let i=n;n=f(e),n===i?p[n].p(e,o):(group_outros(),transition_out(p[i],1,1,()=>{p[i]=null;}),check_outros(),l=p[n],l||(l=p[n]=d[n](e),l.c()),transition_in(l,1),l.m(t,null)),set_attributes(t,h=get_spread_update(v,[1&o&&{class:"icon "+e[0]},128&o&&e[7]])),toggle_class(t,"flip",e[3]&&"boolean"==typeof e[3]),toggle_class(t,"flip-h","h"===e[3]),toggle_class(t,"flip-v","v"===e[3]),toggle_class(t,"spin",e[4]),toggle_class(t,"pulse",e[5]&&!e[4]),toggle_class(t,"svelte-h2unzw",!0);},i(e){i||(transition_in(l),i=!0);},o(e){transition_out(l),i=!1;},d(l){l&&detach(t),p[n].d(),e[14](null),r=!1,a();}}}function Ce(e,t,n){const l=oe(current_component);let o,{class:i=""}=t,{path:s=null}=t,{size:r=24}=t,{viewBox:a="0 0 24 24"}=t,{color:c="currentColor"}=t,{flip:d=!1}=t,{spin:u=!1}=t,{pulse:f=!1}=t,v={},{$$slots:h={},$$scope:g}=t;return e.$set=e=>{n(11,t=assign(assign({},t),exclude_internal_props(e))),"class"in e&&n(0,i=e.class),"path"in e&&n(1,s=e.path),"size"in e&&n(9,r=e.size),"viewBox"in e&&n(2,a=e.viewBox),"color"in e&&n(10,c=e.color),"flip"in e&&n(3,d=e.flip),"spin"in e&&n(4,u=e.spin),"pulse"in e&&n(5,f=e.pulse),"$$scope"in e&&n(12,g=e.$$scope);},e.$$.update=()=>{{const{path:e,size:l,viewBox:o,color:i,flip:s,spin:r,pulse:a,...c}=t;delete c.class,n(7,v=c);}1600&e.$$.dirty&&o&&(o.firstChild.setAttribute("width",r),o.firstChild.setAttribute("height",r),c&&o.firstChild.setAttribute("fill",c));},t=exclude_internal_props(t),[i,s,a,d,u,f,o,v,l,r,c,t,g,h,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(6,o=e);});}]}class Me extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-h2unzw-style")||((t=element("style")).id="svelte-h2unzw-style",t.textContent=".icon.svelte-h2unzw.svelte-h2unzw{display:inline-block;position:relative;vertical-align:middle;line-height:0.5}.icon.svelte-h2unzw>svg.svelte-h2unzw{display:inline-block}.flip.svelte-h2unzw.svelte-h2unzw{transform:scale(-1, -1)}.flip-h.svelte-h2unzw.svelte-h2unzw{transform:scale(-1, 1)}.flip-v.svelte-h2unzw.svelte-h2unzw{transform:scale(1, -1)}.spin.svelte-h2unzw.svelte-h2unzw{animation:svelte-h2unzw-spin 1s 0s infinite linear}.pulse.svelte-h2unzw.svelte-h2unzw{animation:svelte-h2unzw-spin 1s infinite steps(8)}@keyframes svelte-h2unzw-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}",append(document.head,t)),init(this,e,Ce,De,safe_not_equal,{class:0,path:1,size:9,viewBox:2,color:10,flip:3,spin:4,pulse:5});}}function Le(e){let t;const n=new he({props:{center:!0,circle:!0}});return {c(){create_component(n.$$.fragment);},m(e,l){mount_component(n,e,l),t=!0;},i(e){t||(transition_in(n.$$.fragment,e),t=!0);},o(e){transition_out(n.$$.fragment,e),t=!1;},d(e){destroy_component(n,e);}}}function Ee(t){let n,l,o,i,d,p,E,Y,j,N,B,I,F,S=[{type:"checkbox"},{__value:t[9]},t[10]],q={};for(let e=0;e<S.length;e+=1)q=assign(q,S[e]);const _=new Me({props:{path:t[2]?Ae:t[0]?Ye:je}});let H=t[7]&&Le();const O=t[17].default,P=create_slot(O,t,t[16],null);return {c(){n=element("label"),l=element("input"),i=space(),d=element("div"),create_component(_.$$.fragment),p=space(),H&&H.c(),Y=space(),j=element("div"),P&&P.c(),set_attributes(l,q),void 0!==t[0]&&void 0!==t[2]||add_render_callback(()=>t[18].call(l)),toggle_class(l,"svelte-1idh7xl",!0),attr(d,"class","mark svelte-1idh7xl"),attr(d,"style",E="color: "+(t[2]||t[0]?t[1]:"#9a9a9a")),attr(j,"class","label-text svelte-1idh7xl"),attr(n,"class",N=null_to_empty(t[3])+" svelte-1idh7xl"),attr(n,"style",t[4]),attr(n,"title",t[8]),toggle_class(n,"right",t[6]),toggle_class(n,"disabled",t[5]);},m(s,a){insert(s,n,a),append(n,l),l.checked=t[0],l.indeterminate=t[2],append(n,i),append(n,d),mount_component(_,d,null),append(d,p),H&&H.m(d,null),append(n,Y),append(n,j),P&&P.m(j,null),B=!0,I||(F=[listen(l,"change",t[18]),listen(l,"change",t[12]),action_destroyer(o=t[11].call(null,l))],I=!0);},p(e,[t]){set_attributes(l,q=get_spread_update(S,[{type:"checkbox"},512&t&&{__value:e[9]},1024&t&&e[10]])),1&t&&(l.checked=e[0]),4&t&&(l.indeterminate=e[2]),toggle_class(l,"svelte-1idh7xl",!0);const o={};5&t&&(o.path=e[2]?Ae:e[0]?Ye:je),_.$set(o),e[7]?H?128&t&&transition_in(H,1):(H=Le(),H.c(),transition_in(H,1),H.m(d,null)):H&&(group_outros(),transition_out(H,1,1,()=>{H=null;}),check_outros()),(!B||7&t&&E!==(E="color: "+(e[2]||e[0]?e[1]:"#9a9a9a")))&&attr(d,"style",E),P&&P.p&&65536&t&&update_slot(P,O,e,e[16],t,null,null),(!B||8&t&&N!==(N=null_to_empty(e[3])+" svelte-1idh7xl"))&&attr(n,"class",N),(!B||16&t)&&attr(n,"style",e[4]),(!B||256&t)&&attr(n,"title",e[8]),72&t&&toggle_class(n,"right",e[6]),40&t&&toggle_class(n,"disabled",e[5]);},i(e){B||(transition_in(_.$$.fragment,e),transition_in(H),transition_in(P,e),B=!0);},o(e){transition_out(_.$$.fragment,e),transition_out(H),transition_out(P,e),B=!1;},d(e){e&&detach(n),destroy_component(_),H&&H.d(),P&&P.d(e),I=!1,run_all(F);}}}let Ye="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",je="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",Ae="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z";function Te(e,t,n){const l=oe(current_component);let{checked:o=!1}=t,{class:i=""}=t,{style:s=null}=t,{color:r="primary"}=t,{disabled:a=!1}=t,{group:c=null}=t,{indeterminate:d=!1}=t,{right:u=!1}=t,{ripple:p=!0}=t,{title:f=null}=t,{value:v="on"}=t,h={};function g(){setTimeout(()=>{n(0,o=c.indexOf(v)>=0);},0);}let{$$slots:m={},$$scope:b}=t;return e.$set=e=>{n(15,t=assign(assign({},t),exclude_internal_props(e))),"checked"in e&&n(0,o=e.checked),"class"in e&&n(3,i=e.class),"style"in e&&n(4,s=e.style),"color"in e&&n(1,r=e.color),"disabled"in e&&n(5,a=e.disabled),"group"in e&&n(13,c=e.group),"indeterminate"in e&&n(2,d=e.indeterminate),"right"in e&&n(6,u=e.right),"ripple"in e&&n(7,p=e.ripple),"title"in e&&n(8,f=e.title),"value"in e&&n(9,v=e.value),"$$scope"in e&&n(16,b=e.$$scope);},e.$$.update=()=>{{const{checked:e,style:l,color:o,group:i,indeterminate:s,right:r,ripple:a,title:c,value:d,...u}=t;!u.disabled&&delete u.disabled,delete u.class,n(10,h=u);}8192&e.$$.dirty&&null!==c&&g(),2&e.$$.dirty&&("primary"!==r&&r?"accent"===r&&n(1,r=ie()?"#f50057":"var(--accent, #f50057)"):n(1,r=ie()?"#1976d2":"var(--primary, #1976d2)"));},t=exclude_internal_props(t),[o,r,d,i,s,a,u,p,f,v,h,l,function(){if(null!==c){let e=c.indexOf(v);o?e<0&&c.push(v):e>=0&&c.splice(e,1),n(13,c);}},c,g,t,b,m,function(){o=this.checked,d=this.indeterminate,n(0,o),n(2,d);}]}class Ne extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1idh7xl-style")||((t=element("style")).id="svelte-1idh7xl-style",t.textContent="label.svelte-1idh7xl.svelte-1idh7xl{width:100%;align-items:center;display:flex;margin:0;position:relative;cursor:pointer;line-height:40px;user-select:none}input.svelte-1idh7xl.svelte-1idh7xl{cursor:inherit;width:100%;height:100%;position:absolute;top:0;left:0;margin:0;padding:0;opacity:0 !important}.mark.svelte-1idh7xl.svelte-1idh7xl{display:flex;position:relative;justify-content:center;align-items:center;border-radius:50%;width:40px;height:40px}.mark.svelte-1idh7xl.svelte-1idh7xl:before{background-color:currentColor;border-radius:inherit;bottom:0;color:inherit;content:'';left:0;opacity:0;pointer-events:none;position:absolute;right:0;top:0;transition:0.3s cubic-bezier(0.25, 0.8, 0.5, 1)}@media not all and (min-resolution: 0.001dpcm){@supports (-webkit-appearance: none) and (stroke-color: transparent){.mark.svelte-1idh7xl.svelte-1idh7xl:before{transition:none}}}.label-text.svelte-1idh7xl.svelte-1idh7xl{margin-left:4px;white-space:nowrap;overflow:hidden}.right.svelte-1idh7xl .label-text.svelte-1idh7xl{margin-left:0;margin-right:auto;order:-1}@media(hover: hover){label.svelte-1idh7xl:hover:not([disabled]):not(.disabled) .mark.svelte-1idh7xl:before{opacity:0.15}.focus-visible:focus:not([disabled]):not(.disabled)~.mark.svelte-1idh7xl.svelte-1idh7xl:before{opacity:0.3}}",append(document.head,t)),init(this,e,Te,Ee,safe_not_equal,{checked:0,class:3,style:4,color:1,disabled:5,group:13,indeterminate:2,right:6,ripple:7,title:8,value:9});}}function He(e){let t;return {c(){t=element("span"),t.textContent="*",attr(t,"class","required svelte-1dzu4e7");},m(e,n){insert(e,t,n);},d(e){e&&detach(t);}}}function Oe(e){let t,n,l;return {c(){t=element("div"),n=space(),l=element("div"),attr(t,"class","input-line svelte-1dzu4e7"),attr(l,"class","focus-line svelte-1dzu4e7");},m(e,o){insert(e,t,o),insert(e,n,o),insert(e,l,o);},d(e){e&&detach(t),e&&detach(n),e&&detach(l);}}}function Pe(e){let t,n,l,o=(e[11]||e[10])+"";return {c(){t=element("div"),n=element("div"),l=text(o),attr(n,"class","message"),attr(t,"class","help svelte-1dzu4e7"),toggle_class(t,"persist",e[9]),toggle_class(t,"error",e[11]);},m(e,o){insert(e,t,o),append(t,n),append(n,l);},p(e,n){3072&n&&o!==(o=(e[11]||e[10])+"")&&set_data(l,o),512&n&&toggle_class(t,"persist",e[9]),2048&n&&toggle_class(t,"error",e[11]);},d(e){e&&detach(t);}}}function We(t){let n,l,o,i,p,f,v,h,g,m,b,k,D,C,E=[{class:"input"},t[12]],Y={};for(let e=0;e<E.length;e+=1)Y=assign(Y,E[e]);let j=t[2]&&!t[0].length&&He(),A=(!t[7]||t[8])&&Oe(),F=(!!t[10]||!!t[11])&&Pe(t);return {c(){n=element("div"),l=element("input"),i=space(),p=element("div"),f=space(),v=element("div"),h=text(t[6]),g=space(),j&&j.c(),m=space(),A&&A.c(),b=space(),F&&F.c(),set_attributes(l,Y),toggle_class(l,"svelte-1dzu4e7",!0),attr(p,"class","focus-ring svelte-1dzu4e7"),attr(v,"class","label svelte-1dzu4e7"),attr(n,"class",k=null_to_empty(`text-field ${t[7]&&!t[8]?"outlined":"baseline"} ${t[3]}`)+" svelte-1dzu4e7"),attr(n,"style",t[4]),attr(n,"title",t[5]),toggle_class(n,"filled",t[8]),toggle_class(n,"dirty",t[13]),toggle_class(n,"disabled",t[1]);},m(s,a){insert(s,n,a),append(n,l),set_input_value(l,t[0]),append(n,i),append(n,p),append(n,f),append(n,v),append(v,h),append(v,g),j&&j.m(v,null),append(n,m),A&&A.m(n,null),append(n,b),F&&F.m(n,null),D||(C=[listen(l,"input",t[19]),action_destroyer(o=t[14].call(null,l))],D=!0);},p(e,[t]){set_attributes(l,Y=get_spread_update(E,[{class:"input"},4096&t&&e[12]])),1&t&&l.value!==e[0]&&set_input_value(l,e[0]),toggle_class(l,"svelte-1dzu4e7",!0),64&t&&set_data(h,e[6]),e[2]&&!e[0].length?j||(j=He(),j.c(),j.m(v,null)):j&&(j.d(1),j=null),!e[7]||e[8]?A||(A=Oe(),A.c(),A.m(n,b)):A&&(A.d(1),A=null),e[10]||e[11]?F?F.p(e,t):(F=Pe(e),F.c(),F.m(n,null)):F&&(F.d(1),F=null),392&t&&k!==(k=null_to_empty(`text-field ${e[7]&&!e[8]?"outlined":"baseline"} ${e[3]}`)+" svelte-1dzu4e7")&&attr(n,"class",k),16&t&&attr(n,"style",e[4]),32&t&&attr(n,"title",e[5]),392&t&&toggle_class(n,"filled",e[8]),8584&t&&toggle_class(n,"dirty",e[13]),394&t&&toggle_class(n,"disabled",e[1]);},i:noop,o:noop,d(e){e&&detach(n),j&&j.d(),A&&A.d(),F&&F.d(),D=!1,run_all(C);}}}function Xe(e,t,n){const l=oe(current_component);let o,{value:i=""}=t,{disabled:s=!1}=t,{required:r=!1}=t,{class:a=""}=t,{style:c=null}=t,{title:d=null}=t,{label:u=""}=t,{outlined:p=!1}=t,{filled:f=!1}=t,{messagePersist:v=!1}=t,{message:h=""}=t,{error:g=""}=t,m={};const b=["date","datetime-local","email","month","number","password","search","tel","text","time","url","week"],x=["date","datetime-local","month","time","week"];let w;return e.$set=e=>{n(18,t=assign(assign({},t),exclude_internal_props(e))),"value"in e&&n(0,i=e.value),"disabled"in e&&n(1,s=e.disabled),"required"in e&&n(2,r=e.required),"class"in e&&n(3,a=e.class),"style"in e&&n(4,c=e.style),"title"in e&&n(5,d=e.title),"label"in e&&n(6,u=e.label),"outlined"in e&&n(7,p=e.outlined),"filled"in e&&n(8,f=e.filled),"messagePersist"in e&&n(9,v=e.messagePersist),"message"in e&&n(10,h=e.message),"error"in e&&n(11,g=e.error);},e.$$.update=()=>{{const{value:e,style:l,title:i,label:s,outlined:r,filled:a,messagePersist:c,message:d,error:u,...p}=t;!p.readonly&&delete p.readonly,!p.disabled&&delete p.disabled,delete p.class,p.type=b.indexOf(p.type)<0?"text":p.type,n(15,o=p.placeholder),n(12,m=p);}36865&e.$$.dirty&&n(13,w="string"==typeof i&&i.length>0||"number"==typeof i||o||x.indexOf(m.type)>=0);},t=exclude_internal_props(t),[i,s,r,a,c,d,u,p,f,v,h,g,m,w,l,o,b,x,t,function(){i=this.value,n(0,i);}]}class Ve extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1dzu4e7-style")||((t=element("style")).id="svelte-1dzu4e7-style",t.textContent=".text-field.svelte-1dzu4e7.svelte-1dzu4e7{font-family:Roboto, 'Segoe UI', sans-serif;font-weight:400;font-size:inherit;text-decoration:inherit;text-transform:inherit;box-sizing:border-box;margin:0 0 20px;position:relative;width:100%;background-color:inherit;will-change:opacity, transform, color}.outlined.svelte-1dzu4e7.svelte-1dzu4e7{margin-top:12px}.required.svelte-1dzu4e7.svelte-1dzu4e7{position:relative;top:0.175em;left:0.125em;color:#ff5252}.input.svelte-1dzu4e7.svelte-1dzu4e7{box-sizing:border-box;font:inherit;width:100%;min-height:32px;background:none;text-align:left;color:#333;color:var(--color, #333);caret-color:#1976d2;caret-color:var(--primary, #1976d2);border:none;margin:0;padding:2px 0 0;outline:none}.input.svelte-1dzu4e7.svelte-1dzu4e7::placeholder{color:rgba(0, 0, 0, 0.3755);color:var(--label, rgba(0, 0, 0, 0.3755));font-weight:100}.input.svelte-1dzu4e7.svelte-1dzu4e7::-moz-focus-inner{padding:0;border:0}.input.svelte-1dzu4e7.svelte-1dzu4e7:-moz-focusring{outline:none}.input.svelte-1dzu4e7.svelte-1dzu4e7:required{box-shadow:none}.input.svelte-1dzu4e7.svelte-1dzu4e7:invalid{box-shadow:none}.input.svelte-1dzu4e7.svelte-1dzu4e7:active{outline:none}.input:hover~.input-line.svelte-1dzu4e7.svelte-1dzu4e7{background:#333;background:var(--color, #333)}.label.svelte-1dzu4e7.svelte-1dzu4e7{font:inherit;display:inline-flex;position:absolute;left:0;top:28px;padding-right:0.2em;color:rgba(0, 0, 0, 0.3755);color:var(--label, rgba(0, 0, 0, 0.3755));background-color:inherit;pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden;max-width:90%;white-space:nowrap;transform-origin:left top;transition:0.18s cubic-bezier(0.25, 0.8, 0.5, 1)}.focus-ring.svelte-1dzu4e7.svelte-1dzu4e7{pointer-events:none;margin:0;padding:0;border:2px solid transparent;border-radius:4px;position:absolute;left:0;top:0;right:0;bottom:0}.input-line.svelte-1dzu4e7.svelte-1dzu4e7{position:absolute;left:0;right:0;bottom:0;margin:0;height:1px;background:rgba(0, 0, 0, 0.3755);background:var(--label, rgba(0, 0, 0, 0.3755))}.focus-line.svelte-1dzu4e7.svelte-1dzu4e7{position:absolute;bottom:0;left:0;right:0;height:2px;-webkit-transform:scaleX(0);transform:scaleX(0);transition:transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\topacity 0.18s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\t-webkit-transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);transition:transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),\n\t\t\topacity 0.18s cubic-bezier(0.4, 0, 0.2, 1);opacity:0;z-index:2;background:#1976d2;background:var(--primary, #1976d2)}.help.svelte-1dzu4e7.svelte-1dzu4e7{position:absolute;left:0;right:0;bottom:-18px;display:flex;justify-content:space-between;font-size:12px;line-height:normal;letter-spacing:0.4px;color:rgba(0, 0, 0, 0.3755);color:var(--label, rgba(0, 0, 0, 0.3755));opacity:0;overflow:hidden;max-width:90%;white-space:nowrap}.persist.svelte-1dzu4e7.svelte-1dzu4e7,.error.svelte-1dzu4e7.svelte-1dzu4e7,.input:focus~.help.svelte-1dzu4e7.svelte-1dzu4e7{opacity:1}.error.svelte-1dzu4e7.svelte-1dzu4e7{color:#ff5252}.baseline.dirty.svelte-1dzu4e7 .label.svelte-1dzu4e7{letter-spacing:0.4px;top:6px;bottom:unset;font-size:13px}.baseline .input:focus~.label.svelte-1dzu4e7.svelte-1dzu4e7{letter-spacing:0.4px;top:6px;bottom:unset;font-size:13px;color:#1976d2;color:var(--primary, #1976d2)}.baseline .input:focus~.focus-line.svelte-1dzu4e7.svelte-1dzu4e7{transform:scaleX(1);opacity:1}.baseline.svelte-1dzu4e7 .input.svelte-1dzu4e7{height:52px;padding-top:22px}.baseline.filled.svelte-1dzu4e7.svelte-1dzu4e7{background:rgba(0, 0, 0, 0.0555);background:var(--bg-input-filled, rgba(0, 0, 0, 0.0555));border-radius:4px 4px 0 0}.baseline.filled.svelte-1dzu4e7 .label.svelte-1dzu4e7{background:none}.baseline.filled.svelte-1dzu4e7 .input.svelte-1dzu4e7,.baseline.filled.svelte-1dzu4e7 .label.svelte-1dzu4e7{padding-left:8px;padding-right:8px}.baseline.filled .input:focus~.label.svelte-1dzu4e7.svelte-1dzu4e7{top:6px}.baseline.filled.svelte-1dzu4e7 .help.svelte-1dzu4e7{padding-left:8px}.filled.svelte-1dzu4e7 .input.svelte-1dzu4e7:hover,.filled.svelte-1dzu4e7 .input.svelte-1dzu4e7:focus{background:rgba(0, 0, 0, 0.0555);background:var(--bg-input-filled, rgba(0, 0, 0, 0.0555))}.outlined.svelte-1dzu4e7 .help.svelte-1dzu4e7{left:18px}.outlined.svelte-1dzu4e7 .input.svelte-1dzu4e7{padding:11px 16px 9px;border-radius:4px;border:1px solid;border-color:rgba(0, 0, 0, 0.3755);border-color:var(--label, rgba(0, 0, 0, 0.3755))}.outlined.svelte-1dzu4e7 .label.svelte-1dzu4e7{top:12px;bottom:unset;left:17px}.outlined.dirty.svelte-1dzu4e7 .label.svelte-1dzu4e7{top:-6px;bottom:unset;font-size:12px;letter-spacing:0.4px;padding:0 4px;left:13px}.outlined.svelte-1dzu4e7 .input.svelte-1dzu4e7:hover{border-color:#333;border-color:var(--color, #333)}.outlined .input:focus~.label.svelte-1dzu4e7.svelte-1dzu4e7{top:-6px;bottom:unset;font-size:12px;letter-spacing:0.4px;padding:0 4px;left:13px;color:#1976d2;color:var(--primary, #1976d2)}.outlined .input:focus~.focus-ring.svelte-1dzu4e7.svelte-1dzu4e7,.outlined .input.focus-visible~.focus-ring.svelte-1dzu4e7.svelte-1dzu4e7{border-color:#1976d2;border-color:var(--primary, #1976d2)}",append(document.head,t)),init(this,e,Xe,We,safe_not_equal,{value:0,disabled:1,required:2,class:3,style:4,title:5,label:6,outlined:7,filled:8,messagePersist:9,message:10,error:11});}}function Re(e,t){if("Tab"!==e.key&&9!==e.keyCode)return;let n=function(e=document){return Array.prototype.slice.call(e.querySelectorAll('button, [href], select, textarea, input:not([type="hidden"]), [tabindex]:not([tabindex="-1"])')).filter((function(e){const t=window.getComputedStyle(e);return !e.disabled&&!e.getAttribute("disabled")&&!e.classList.contains("disabled")&&"none"!==t.display&&"hidden"!==t.visibility&&t.opacity>0}))}(t);if(0===n.length)return void e.preventDefault();let l=document.activeElement,o=n.indexOf(l);e.shiftKey?o<=0&&(n[n.length-1].focus(),e.preventDefault()):o>=n.length-1&&(n[0].focus(),e.preventDefault());}const{window:Ze}=globals;function Ue(t){let n,l,o,i,r,d,p,v;const h=t[23].default,b=create_slot(h,t,t[22],null);return {c(){n=element("div"),b&&b.c(),attr(n,"class",l=null_to_empty("popover "+t[1])+" svelte-5k22n0"),attr(n,"style",t[2]),attr(n,"tabindex","-1");},m(l,i){insert(l,n,i),b&&b.m(n,null),t[26](n),d=!0,p||(v=[listen(n,"introstart",t[24]),listen(n,"introend",t[25]),action_destroyer(o=t[4].call(null,n))],p=!0);},p(e,t){b&&b.p&&4194304&t&&update_slot(b,h,e,e[22],t,null,null),(!d||2&t&&l!==(l=null_to_empty("popover "+e[1])+" svelte-5k22n0"))&&attr(n,"class",l),(!d||4&t)&&attr(n,"style",e[2]);},i(e){d||(transition_in(b,e),add_render_callback(()=>{r&&r.end(1),i||(i=create_in_transition(n,t[5],{})),i.start();}),d=!0);},o(e){transition_out(b,e),i&&i.invalidate(),r=create_out_transition(n,t[6],{}),d=!1;},d(e){e&&detach(n),b&&b.d(e),t[26](null),e&&r&&r.end(),p=!1,run_all(v);}}}function Ge(t){let n,l,o,i,s=t[0]&&Ue(t);return {c(){s&&s.c(),n=empty();},m(r,a){s&&s.m(r,a),insert(r,n,a),l=!0,o||(i=[listen(Ze,"scroll",t[8],{passive:!0}),listen(Ze,"resize",t[9],{passive:!0}),listen(Ze,"keydown",t[10],!0),listen(Ze,"click",t[11],!0)],o=!0);},p(e,[t]){e[0]?s?(s.p(e,t),1&t&&transition_in(s,1)):(s=Ue(e),s.c(),transition_in(s,1),s.m(n.parentNode,n)):s&&(group_outros(),transition_out(s,1,1,()=>{s=null;}),check_outros());},i(e){l||(transition_in(s),l=!0);},o(e){transition_out(s),l=!1;},d(e){s&&s.d(e),e&&detach(n),o=!1,run_all(i);}}}function Ke(e,t,n){const l=oe(current_component),o=createEventDispatcher();let i,s,{class:r=""}=t,{style:a=null}=t,{origin:c="top left"}=t,{dx:d=0}=t,{dy:u=0}=t,{visible:f=!1}=t,{duration:v=300}=t;async function h({target:e}){setTimeout(()=>{e.style.transitionDuration=v+"ms",e.style.transitionProperty="opacity, transform",e.style.transform="scale(1)",e.style.opacity=null;},0);}function g(e,t){let l=0;n(12,d=+d);const o=window.innerWidth-8-e;return l=l=c.indexOf("left")>=0?t.left+d:t.left+t.width-e-d,l=Math.min(o,l),l=Math.max(8,l),l}function m(e,t){let l=0;n(13,u=+u);const o=window.innerHeight-8-e;return l=l=c.indexOf("top")>=0?t.top+u:t.top+t.height-e-u,l=Math.min(o,l),l=Math.max(8,l),l}function b(){if(!f||!i||!s)return;const e=s.getBoundingClientRect();e.top<-e.height||e.top>window.innerHeight?y("overflow"):(n(3,i.style.top=m(i.offsetHeight,e)+"px",i),n(3,i.style.left=g(i.offsetWidth,e)+"px",i));}function y(e){o("close",e),n(0,f=!1);}beforeUpdate(()=>{s=i?i.parentElement:null,s&&b();});let{$$slots:x={},$$scope:w}=t;return e.$set=e=>{"class"in e&&n(1,r=e.class),"style"in e&&n(2,a=e.style),"origin"in e&&n(14,c=e.origin),"dx"in e&&n(12,d=e.dx),"dy"in e&&n(13,u=e.dy),"visible"in e&&n(0,f=e.visible),"duration"in e&&n(15,v=e.duration),"$$scope"in e&&n(22,w=e.$$scope);},[f,r,a,i,l,function(e){return e.style.transformOrigin=c,e.style.transform="scale(0.6)",e.style.opacity="0",{duration:+v}},function(e){return e.style.transformOrigin=c,e.style.transitionDuration=v+"ms",e.style.transitionProperty="opacity, transform",e.style.transform="scale(0.6)",e.style.opacity="0",{duration:+v}},h,function(){b();},function(){b();},function(e){f&&(27===e.keyCode&&(e.stopPropagation(),y("escape")),Re(e,i));},function(e){f&&s&&!s.contains(e.target)&&(e.stopPropagation(),y("clickOutside"));},d,u,c,v,s,o,g,m,b,y,w,x,e=>h(e),e=>function({target:e}){e.style.transformOrigin=null,e.style.transitionDuration=null,e.style.transitionProperty=null,e.style.transform=null,e.focus();}(e),function(e){binding_callbacks[e?"unshift":"push"](()=>{n(3,i=e);});}]}class Je extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-5k22n0-style")||((t=element("style")).id="svelte-5k22n0-style",t.textContent=".popover.svelte-5k22n0{color:#333;color:var(--color, #333);background:#fff;background:var(--bg-popover, #fff);backface-visibility:hidden;position:fixed;border-radius:2px;max-height:100%;max-width:80%;overflow:auto;outline:none;box-shadow:0 3px 3px -2px rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.14),\n\t\t\t0 1px 8px 0 rgba(0, 0, 0, 0.12);z-index:50}",append(document.head,t)),init(this,e,Ke,Ge,safe_not_equal,{class:1,style:2,origin:14,dx:12,dy:13,visible:0,duration:15});}}function tn(e){let t="hidden"===document.body.style.overflow;if(e&&t){let e=Math.abs(parseInt(document.body.style.top));document.body.style.cssText=null,document.body.removeAttribute("style"),window.scrollTo(0,e);}else e||t||(document.body.style.top="-"+Math.max(document.body.scrollTop,document.documentElement&&document.documentElement.scrollTop||0)+"px",document.body.style.position="fixed",document.body.style.width="100%",document.body.style.overflow="hidden");}const nn=e=>({}),ln=e=>({}),on=e=>({}),sn=e=>({}),rn=e=>({}),an=e=>({});function cn(t){let n,l,o,i,d,p,v,h,b,D,C,E,Y;const j=t[19].title,T=create_slot(j,t,t[18],an),N=t[19].default,B=create_slot(N,t,t[18],null),I=t[19].actions,S=create_slot(I,t,t[18],sn),q=t[19].footer,_=create_slot(q,t,t[18],ln);let H=[{class:"dialog "+t[1]},{style:`width: ${t[3]}px;${t[2]}`},{tabindex:"-1"},t[6]],O={};for(let e=0;e<H.length;e+=1)O=assign(O,H[e]);return {c(){n=element("div"),l=element("div"),o=element("div"),T&&T.c(),i=space(),d=element("div"),B&&B.c(),p=space(),S&&S.c(),v=space(),_&&_.c(),attr(o,"class","title svelte-1pkw9hl"),attr(d,"class","content svelte-1pkw9hl"),set_attributes(l,O),toggle_class(l,"svelte-1pkw9hl",!0),attr(n,"class","overlay svelte-1pkw9hl");},m(s,a){insert(s,n,a),append(n,l),append(l,o),T&&T.m(o,null),append(l,i),append(l,d),B&&B.m(d,null),append(l,p),S&&S.m(l,null),append(l,v),_&&_.m(l,null),t[21](l),C=!0,E||(Y=[action_destroyer(h=t[8].call(null,l)),listen(l,"mousedown",stop_propagation(t[20])),listen(l,"mouseenter",t[22]),listen(n,"mousedown",t[23]),listen(n,"mouseup",t[24])],E=!0);},p(e,t){T&&T.p&&262144&t&&update_slot(T,j,e,e[18],t,rn,an),B&&B.p&&262144&t&&update_slot(B,N,e,e[18],t,null,null),S&&S.p&&262144&t&&update_slot(S,I,e,e[18],t,on,sn),_&&_.p&&262144&t&&update_slot(_,q,e,e[18],t,nn,ln),set_attributes(l,O=get_spread_update(H,[2&t&&{class:"dialog "+e[1]},12&t&&{style:`width: ${e[3]}px;${e[2]}`},{tabindex:"-1"},64&t&&e[6]])),toggle_class(l,"svelte-1pkw9hl",!0);},i(e){C||(transition_in(T,e),transition_in(B,e),transition_in(S,e),transition_in(_,e),b||add_render_callback(()=>{b=create_in_transition(l,scale,{duration:180,opacity:.5,start:.75,easing:quintOut}),b.start();}),add_render_callback(()=>{D||(D=create_bidirectional_transition(n,fade,{duration:180},!0)),D.run(1);}),C=!0);},o(e){transition_out(T,e),transition_out(B,e),transition_out(S,e),transition_out(_,e),D||(D=create_bidirectional_transition(n,fade,{duration:180},!1)),D.run(0),C=!1;},d(e){e&&detach(n),T&&T.d(e),B&&B.d(e),S&&S.d(e),_&&_.d(e),t[21](null),e&&D&&D.end(),E=!1,run_all(Y);}}}function dn(t){let n,l,o,i,s=t[0]&&cn(t);return {c(){s&&s.c(),n=empty();},m(r,a){s&&s.m(r,a),insert(r,n,a),l=!0,o||(i=[listen(window,"keydown",t[10]),listen(window,"popstate",t[11])],o=!0);},p(e,[t]){e[0]?s?(s.p(e,t),1&t&&transition_in(s,1)):(s=cn(e),s.c(),transition_in(s,1),s.m(n.parentNode,n)):s&&(group_outros(),transition_out(s,1,1,()=>{s=null;}),check_outros());},i(e){l||(transition_in(s),l=!0);},o(e){transition_out(s),l=!1;},d(e){s&&s.d(e),e&&detach(n),o=!1,run_all(i);}}}function un(e,n,l){const o=createEventDispatcher(),i=oe(current_component);let s,{class:r=""}=n,{style:a=""}=n,{visible:c=!1}=n,{width:d=320}=n,{modal:u=!1}=n,{closeByEsc:f=!0}=n,{beforeClose:v=(()=>!0)}=n,h=!1,g={},m=!1;function b(e){v()&&(o("close",e),l(0,c=!1));}async function x(){if(!s)return;await tick();let e=s.querySelectorAll('input:not([type="hidden"])'),t=e.length,n=0;for(;n<t&&!e[n].getAttribute("autofocus");n++);n<t?e[n].focus():t>0?e[0].focus():s.focus(),o("open");}onMount(async()=>{await tick(),l(14,m=!0);}),onDestroy(()=>{m&&tn(!0);});let{$$slots:w={},$$scope:$}=n;return e.$set=e=>{l(17,n=assign(assign({},n),exclude_internal_props(e))),"class"in e&&l(1,r=e.class),"style"in e&&l(2,a=e.style),"visible"in e&&l(0,c=e.visible),"width"in e&&l(3,d=e.width),"modal"in e&&l(4,u=e.modal),"closeByEsc"in e&&l(12,f=e.closeByEsc),"beforeClose"in e&&l(13,v=e.beforeClose),"$$scope"in e&&l(18,$=e.$$scope);},e.$$.update=()=>{{const{style:e,visible:t,width:o,modal:i,closeByEsc:s,beforeClose:r,...a}=n;l(6,g=a);}16385&e.$$.dirty&&(c?(m&&tn(!1),x()):(l(5,h=!1),m&&tn(!0)));},n=exclude_internal_props(n),[c,r,a,d,u,h,g,s,i,b,function(e){const t="Escape";27!==e.keyCode&&e.key!==t&&e.code!==t||f&&b(t),c&&Re(e,s);},function(){l(0,c=!1);},f,v,m,o,x,n,$,w,function(n){bubble(e,n);},function(e){binding_callbacks[e?"unshift":"push"](()=>{l(7,s=e);});},()=>{l(5,h=!1);},()=>{l(5,h=!0);},()=>{h&&!u&&b("clickOutside");}]}class pn extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1pkw9hl-style")||((t=element("style")).id="svelte-1pkw9hl-style",t.textContent=".overlay.svelte-1pkw9hl{background-color:rgba(0, 0, 0, 0.5);cursor:pointer;position:fixed;left:0;top:0;right:0;bottom:0;z-index:30;display:flex;justify-content:center;align-items:center}.dialog.svelte-1pkw9hl{position:relative;font-size:1rem;background:#eee;background:var(--bg-panel, #eee);border-radius:4px;cursor:auto;box-shadow:0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14),\n\t\t\t0 9px 46px 8px rgba(0, 0, 0, 0.12);z-index:40;max-height:80%;overflow-x:hidden;overflow-y:auto}.dialog.svelte-1pkw9hl:focus{outline:none}.dialog.svelte-1pkw9hl::-moz-focus-inner{border:0}.dialog.svelte-1pkw9hl:-moz-focusring{outline:none}div.svelte-1pkw9hl .actions{min-height:48px;padding:8px;display:flex;align-items:center}div.svelte-1pkw9hl .center{justify-content:center}div.svelte-1pkw9hl .left{justify-content:flex-start}div.svelte-1pkw9hl .right{justify-content:flex-end}.title.svelte-1pkw9hl{padding:16px 16px 12px;font-size:24px;line-height:36px;background:rgba(0, 0, 0, 0.1);background:var(--divider, rgba(0, 0, 0, 0.1))}.content.svelte-1pkw9hl{margin:16px}",append(document.head,t)),init(this,e,un,dn,safe_not_equal,{class:1,style:2,visible:0,width:3,modal:4,closeByEsc:12,beforeClose:13});}}const yn=e=>({}),xn=e=>({});function wn(e){let t,n,l;const o=e[11].default,i=create_slot(o,e,e[14],null);return {c(){t=element("ul"),i&&i.c(),attr(t,"style",n=`min-width: ${e[5]}px`),attr(t,"class","svelte-1vc5q8h");},m(e,n){insert(e,t,n),i&&i.m(t,null),l=!0;},p(e,s){i&&i.p&&16384&s&&update_slot(i,o,e,e[14],s,null,null),(!l||32&s&&n!==(n=`min-width: ${e[5]}px`))&&attr(t,"style",n);},i(e){l||(transition_in(i,e),l=!0);},o(e){transition_out(i,e),l=!1;},d(e){e&&detach(t),i&&i.d(e);}}}function $n(t){let n,l,o,i,d,y,w;const $=t[11].activator,D=create_slot($,t,t[14],xn),C=D||function(e){let t;return {c(){t=element("span");},m(e,n){insert(e,t,n);},d(e){e&&detach(t);}}}();function M(e){t[12].call(null,e);}let E={class:t[0],style:t[1],origin:t[4],dx:t[2],dy:t[3],$$slots:{default:[wn]},$$scope:{ctx:t}};void 0!==t[6]&&(E.visible=t[6]);const Y=new Je({props:E});return binding_callbacks.push(()=>bind(Y,"visible",M)),Y.$on("click",t[10]),{c(){n=element("div"),C&&C.c(),l=space(),create_component(Y.$$.fragment),attr(n,"class","menu svelte-1vc5q8h");},m(o,s){insert(o,n,s),C&&C.m(n,null),append(n,l),mount_component(Y,n,null),t[13](n),d=!0,y||(w=[listen(n,"click",t[9]),action_destroyer(i=t[8].call(null,n))],y=!0);},p(e,[t]){D&&D.p&&16384&t&&update_slot(D,$,e,e[14],t,yn,xn);const n={};1&t&&(n.class=e[0]),2&t&&(n.style=e[1]),16&t&&(n.origin=e[4]),4&t&&(n.dx=e[2]),8&t&&(n.dy=e[3]),16416&t&&(n.$$scope={dirty:t,ctx:e}),!o&&64&t&&(o=!0,n.visible=e[6],add_flush_callback(()=>o=!1)),Y.$set(n);},i(e){d||(transition_in(C,e),transition_in(Y.$$.fragment,e),d=!0);},o(e){transition_out(C,e),transition_out(Y.$$.fragment,e),d=!1;},d(e){e&&detach(n),C&&C.d(e),destroy_component(Y),t[13](null),y=!1,run_all(w);}}}function zn(e,t,n){const l=oe(current_component);let o,{class:i=""}=t,{style:s=null}=t,{dx:r=0}=t,{dy:a=0}=t,{origin:c="top left"}=t,{width:d=112}=t,u=!1;let{$$slots:f={},$$scope:v}=t;return e.$set=e=>{"class"in e&&n(0,i=e.class),"style"in e&&n(1,s=e.style),"dx"in e&&n(2,r=e.dx),"dy"in e&&n(3,a=e.dy),"origin"in e&&n(4,c=e.origin),"width"in e&&n(5,d=e.width),"$$scope"in e&&n(14,v=e.$$scope);},[i,s,r,a,c,d,u,o,l,function(e){try{o.childNodes[0].contains(e.target)?n(6,u=!u):e.target===o&&n(6,u=!1);}catch(e){console.error(e);}},function(e){e.target.classList.contains("menu-item")&&n(6,u=!1);},f,function(e){u=e,n(6,u);},function(e){binding_callbacks[e?"unshift":"push"](()=>{n(7,o=e);});},v]}class kn extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1vc5q8h-style")||((t=element("style")).id="svelte-1vc5q8h-style",t.textContent="@supports (-webkit-overflow-scrolling: touch){html{cursor:pointer}}.menu.svelte-1vc5q8h{position:relative;display:inline-block;vertical-align:middle}ul.svelte-1vc5q8h{margin:0;padding:8px 0;width:100%;position:relative;overflow-x:hidden;overflow-y:visible}",append(document.head,t)),init(this,e,zn,$n,safe_not_equal,{class:0,style:1,dx:2,dy:3,origin:4,width:5});}}function Dn(t){let n,l,o,i,a,d;const p=t[10].default,v=create_slot(p,t,t[9],null);let h=t[1]&&Mn(),b=[{class:"menu-item "+t[0]},{tabindex:t[2]?"-1":"0"},t[4]],E={};for(let e=0;e<b.length;e+=1)E=assign(E,b[e]);return {c(){n=element("li"),v&&v.c(),l=space(),h&&h.c(),set_attributes(n,E),toggle_class(n,"svelte-mmrniu",!0);},m(s,u){insert(s,n,u),v&&v.m(n,null),append(n,l),h&&h.m(n,null),t[12](n),i=!0,a||(d=[listen(n,"keydown",t[7]),action_destroyer(o=t[6].call(null,n))],a=!0);},p(e,t){v&&v.p&&512&t&&update_slot(v,p,e,e[9],t,null,null),e[1]?h?2&t&&transition_in(h,1):(h=Mn(),h.c(),transition_in(h,1),h.m(n,null)):h&&(group_outros(),transition_out(h,1,1,()=>{h=null;}),check_outros()),set_attributes(n,E=get_spread_update(b,[1&t&&{class:"menu-item "+e[0]},4&t&&{tabindex:e[2]?"-1":"0"},16&t&&e[4]])),toggle_class(n,"svelte-mmrniu",!0);},i(e){i||(transition_in(v,e),transition_in(h),i=!0);},o(e){transition_out(v,e),transition_out(h),i=!1;},d(e){e&&detach(n),v&&v.d(e),h&&h.d(),t[12](null),a=!1,run_all(d);}}}function Cn(t){let n,l,o,i,d,p,v;const h=t[10].default,b=create_slot(h,t,t[9],null);let E=t[1]&&Ln(),Y=[{class:"menu-item "+t[0]},{href:t[3]},{tabindex:t[2]?"-1":"0"},t[4]],j={};for(let e=0;e<Y.length;e+=1)j=assign(j,Y[e]);return {c(){n=element("li"),l=element("a"),b&&b.c(),o=space(),E&&E.c(),set_attributes(l,j),toggle_class(l,"svelte-mmrniu",!0),attr(n,"class","svelte-mmrniu");},m(s,a){insert(s,n,a),append(n,l),b&&b.m(l,null),append(l,o),E&&E.m(l,null),t[11](l),d=!0,p||(v=[listen(l,"keydown",t[7]),action_destroyer(i=t[6].call(null,l))],p=!0);},p(e,t){b&&b.p&&512&t&&update_slot(b,h,e,e[9],t,null,null),e[1]?E?2&t&&transition_in(E,1):(E=Ln(),E.c(),transition_in(E,1),E.m(l,null)):E&&(group_outros(),transition_out(E,1,1,()=>{E=null;}),check_outros()),set_attributes(l,j=get_spread_update(Y,[1&t&&{class:"menu-item "+e[0]},8&t&&{href:e[3]},4&t&&{tabindex:e[2]?"-1":"0"},16&t&&e[4]])),toggle_class(l,"svelte-mmrniu",!0);},i(e){d||(transition_in(b,e),transition_in(E),d=!0);},o(e){transition_out(b,e),transition_out(E),d=!1;},d(e){e&&detach(n),b&&b.d(e),E&&E.d(),t[11](null),p=!1,run_all(v);}}}function Mn(e){let t;const n=new he({});return {c(){create_component(n.$$.fragment);},m(e,l){mount_component(n,e,l),t=!0;},i(e){t||(transition_in(n.$$.fragment,e),t=!0);},o(e){transition_out(n.$$.fragment,e),t=!1;},d(e){destroy_component(n,e);}}}function Ln(e){let t;const n=new he({});return {c(){create_component(n.$$.fragment);},m(e,l){mount_component(n,e,l),t=!0;},i(e){t||(transition_in(n.$$.fragment,e),t=!0);},o(e){transition_out(n.$$.fragment,e),t=!1;},d(e){destroy_component(n,e);}}}function En(e){let t,n,l,o;const i=[Cn,Dn],s=[];function r(e,t){return e[3]?0:1}return t=r(e),n=s[t]=i[t](e),{c(){n.c(),l=empty();},m(e,n){s[t].m(e,n),insert(e,l,n),o=!0;},p(e,[o]){let a=t;t=r(e),t===a?s[t].p(e,o):(group_outros(),transition_out(s[a],1,1,()=>{s[a]=null;}),check_outros(),n=s[t],n||(n=s[t]=i[t](e),n.c()),transition_in(n,1),n.m(l.parentNode,l));},i(e){o||(transition_in(n),o=!0);},o(e){transition_out(n),o=!1;},d(e){s[t].d(e),e&&detach(l);}}}function Yn(e,t,n){const l=oe(current_component);let o,{class:i=""}=t,{ripple:s=!0}=t,r=!1,a=null,c={};let{$$slots:d={},$$scope:u}=t;return e.$set=e=>{n(8,t=assign(assign({},t),exclude_internal_props(e))),"class"in e&&n(0,i=e.class),"ripple"in e&&n(1,s=e.ripple),"$$scope"in e&&n(9,u=e.$$scope);},e.$$.update=()=>{{const{href:e,ripple:l,...o}=t;delete o.class,!1===o.disabled&&delete o.disabled,n(2,r=!!o.disabled),n(3,a=e&&!r?e:null),n(4,c=o);}},t=exclude_internal_props(t),[i,s,r,a,c,o,l,function(e){if(13===e.keyCode||32===e.keyCode){e.stopPropagation(),e.preventDefault();const t=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.dispatchEvent(t),o.blur();}},t,u,d,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(5,o=e);});},function(e){binding_callbacks[e?"unshift":"push"](()=>{n(5,o=e);});}]}class jn extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-mmrniu-style")||((t=element("style")).id="svelte-mmrniu-style",t.textContent="li.svelte-mmrniu{display:block}a.svelte-mmrniu,a.svelte-mmrniu:hover{text-decoration:none}.menu-item.svelte-mmrniu{position:relative;color:inherit;cursor:pointer;height:44px;user-select:none;display:flex;align-items:center;padding:0 16px;white-space:nowrap}.menu-item.svelte-mmrniu:focus{outline:none}.menu-item.svelte-mmrniu::-moz-focus-inner{border:0}.menu-item.svelte-mmrniu:-moz-focusring{outline:none}.menu-item.svelte-mmrniu:before{background-color:currentColor;color:inherit;bottom:0;content:'';left:0;opacity:0;pointer-events:none;position:absolute;right:0;top:0;transition:0.3s cubic-bezier(0.25, 0.8, 0.5, 1)}@media(hover: hover){.menu-item.svelte-mmrniu:hover:not([disabled]):not(.disabled):before{opacity:0.15}.focus-visible.menu-item:focus:not([disabled]):not(.disabled):before{opacity:0.3}}",append(document.head,t)),init(this,e,Yn,En,safe_not_equal,{class:0,ripple:1});}}const{window:Sn}=globals;function qn(t){let n,l,o,i,r;return {c(){n=element("div"),attr(n,"class","overlay svelte-1o2jp7l");},m(l,s){insert(l,n,s),o=!0,i||(r=listen(n,"click",t[4]),i=!0);},p:noop,i(e){o||(add_render_callback(()=>{l||(l=create_bidirectional_transition(n,fade,{duration:300},!0)),l.run(1);}),o=!0);},o(e){l||(l=create_bidirectional_transition(n,fade,{duration:300},!1)),l.run(0),o=!1;},d(e){e&&detach(n),e&&l&&l.end(),i=!1,r();}}}function _n(t){let n,l,o,i,r,d,p,v=t[0]&&qn(t);const h=t[14].default,b=create_slot(h,t,t[13],null);return {c(){n=space(),v&&v.c(),l=space(),o=element("aside"),b&&b.c(),attr(o,"class","side-panel svelte-1o2jp7l"),attr(o,"tabindex","-1"),toggle_class(o,"left",!t[1]),toggle_class(o,"right",t[1]),toggle_class(o,"visible",t[0]);},m(s,a){insert(s,n,a),v&&v.m(s,a),insert(s,l,a),insert(s,o,a),b&&b.m(o,null),t[15](o),r=!0,d||(p=[listen(Sn,"keydown",t[8]),listen(document.body,"touchstart",t[6]),listen(document.body,"touchend",t[7]),listen(o,"transitionend",t[5]),action_destroyer(i=t[3].call(null,o))],d=!0);},p(e,[t]){e[0]?v?(v.p(e,t),1&t&&transition_in(v,1)):(v=qn(e),v.c(),transition_in(v,1),v.m(l.parentNode,l)):v&&(group_outros(),transition_out(v,1,1,()=>{v=null;}),check_outros()),b&&b.p&&8192&t&&update_slot(b,h,e,e[13],t,null,null),2&t&&toggle_class(o,"left",!e[1]),2&t&&toggle_class(o,"right",e[1]),1&t&&toggle_class(o,"visible",e[0]);},i(e){r||(transition_in(v),transition_in(b,e),r=!0);},o(e){transition_out(v),transition_out(b,e),r=!1;},d(e){e&&detach(n),v&&v.d(e),e&&detach(l),e&&detach(o),b&&b.d(e),t[15](null),d=!1,run_all(p);}}}let Hn=!1;function On(e,t,n){const l=oe(current_component);let o,{right:i=!1}=t,{visible:s=!1}=t,{disableScroll:r=!1}=t,a={x:null,y:null},c=!1;function d(){n(0,s=!1),setTimeout(()=>{Hn=!1;},20);}function u(){n(0,s=!0);}onMount(async()=>{await tick(),n(11,c=!0);});let{$$slots:f={},$$scope:v}=t;return e.$set=e=>{"right"in e&&n(1,i=e.right),"visible"in e&&n(0,s=e.visible),"disableScroll"in e&&n(9,r=e.disableScroll),"$$scope"in e&&n(13,v=e.$$scope);},e.$$.update=()=>{2561&e.$$.dirty&&(s?(Hn=!0,c&&r&&tn(!1)):(c&&tn(!0),d()));},[s,i,o,l,d,function(e){s&&"visibility"===e.propertyName&&o.focus();},function(e){a.x=e.changedTouches[0].clientX,a.y=e.changedTouches[0].clientY;},function(e){const t=e.changedTouches[0].clientX-a.x,n=e.changedTouches[0].clientY-a.y;if(Math.abs(t)>50){if(Math.abs(n)<100)if(s)(t>0&&i||t<0&&!i)&&d();else {if(Hn)return;t>0&&a.x<=20?i||u():a.x>=window.innerWidth-20&&i&&u();}}},function(e){s&&(27!==e.keyCode&&"Escape"!==e.key&&"Escape"!==e.code||d(),s&&Re(e,o));},r,a,c,u,v,f,function(e){binding_callbacks[e?"unshift":"push"](()=>{n(2,o=e);});}]}class Pn extends SvelteComponent{constructor(e){var t;super(),document.getElementById("svelte-1o2jp7l-style")||((t=element("style")).id="svelte-1o2jp7l-style",t.textContent=".side-panel.svelte-1o2jp7l{background:#fbfbfb;background:var(--bg-color, #fbfbfb);position:fixed;visibility:hidden;width:256px;top:0;height:100%;box-shadow:0 0 10px rgba(0, 0, 0, 0.2);z-index:40;overflow-x:hidden;overflow-y:auto;transform-style:preserve-3d;will-change:transform, visibility;transition-duration:0.2s;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transition-property:transform, visibility}.side-panel.svelte-1o2jp7l:focus{outline:none}.side-panel.svelte-1o2jp7l::-moz-focus-inner{border:0}.side-panel.svelte-1o2jp7l:-moz-focusring{outline:none}.left.svelte-1o2jp7l{left:0;transform:translateX(-256px)}.right.svelte-1o2jp7l{left:auto;right:0;transform:translateX(256px)}.visible.svelte-1o2jp7l{visibility:visible;transform:translateX(0)}.overlay.svelte-1o2jp7l{background-color:rgba(0, 0, 0, 0.5);cursor:pointer;position:fixed;left:0;top:0;right:0;bottom:0;z-index:30}",append(document.head,t)),init(this,e,On,_n,safe_not_equal,{right:1,visible:0,disableScroll:9});}}

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var comentarioStore = writable('');

    /* src\components\Tiempo.svelte generated by Svelte v3.29.0 */

    const file = "src\\components\\Tiempo.svelte";

    function create_fragment(ctx) {
    	let span;
    	let t_value = /*tiempoRelativo*/ ctx[1].short + "";
    	let t;
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "title", span_title_value = /*tiempoRelativo*/ ctx[1].long + "\n" + new Date(/*date*/ ctx[0]));
    			add_location(span, file, 61, 0, 2239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tiempoRelativo*/ 2 && t_value !== (t_value = /*tiempoRelativo*/ ctx[1].short + "")) set_data_dev(t, t_value);

    			if (dirty & /*tiempoRelativo, date*/ 3 && span_title_value !== (span_title_value = /*tiempoRelativo*/ ctx[1].long + "\n" + new Date(/*date*/ ctx[0]))) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function relativeTime(date, horaActual) {
    	if (horaActual == undefined) horaActual = new Date();
    	if (typeof date === "string") date = Date.parse(date);
    	let current = horaActual.getTime();
    	let previous = date;
    	const msPerMinute = 60 * 1000;
    	const msPerHour = msPerMinute * 60;
    	const msPerDay = msPerHour * 24;
    	const msPerMonth = msPerDay * 30;
    	const msPerYear = msPerDay * 365;
    	let elapsed = current - previous;

    	if (elapsed < msPerMinute) {
    		return {
    			short: Math.round(elapsed / 1000) + " s",
    			long: Math.round(elapsed / 1000) + " segundos",
    			diferencia: elapsed
    		};
    	} else if (elapsed < msPerHour) {
    		return {
    			short: Math.round(elapsed / msPerMinute) + " m",
    			long: Math.round(elapsed / msPerMinute) + " minutos",
    			diferencia: elapsed
    		};
    	} else if (elapsed < msPerDay) {
    		return {
    			short: Math.round(elapsed / msPerHour) + " h",
    			long: Math.round(elapsed / msPerHour) + " horas",
    			diferencia: elapsed
    		};
    	} else if (elapsed < msPerMonth) {
    		return {
    			short: Math.round(elapsed / msPerDay) + " d",
    			long: Math.round(elapsed / msPerDay) + " dias",
    			diferencia: elapsed
    		};
    	} else if (elapsed < msPerYear) {
    		return {
    			short: Math.round(elapsed / msPerMonth) + " M",
    			long: Math.round(elapsed / msPerMonth) + " meses",
    			diferencia: elapsed
    		};
    	} else {
    		return {
    			short: Math.round(elapsed / msPerYear) + " a",
    			long: Math.round(elapsed / msPerYear) + " años",
    			diferencia: elapsed
    		};
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tiempo", slots, []);
    	let { date } = $$props;
    	let horaActual = new Date();

    	setInterval(() => $$invalidate(2, horaActual = new Date()), relativeTime(date, horaActual).diferencia < 60000
    	? 1000
    	: 6000);

    	const writable_props = ["date"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tiempo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    	};

    	$$self.$capture_state = () => ({
    		date,
    		horaActual,
    		relativeTime,
    		tiempoRelativo
    	});

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    		if ("horaActual" in $$props) $$invalidate(2, horaActual = $$props.horaActual);
    		if ("tiempoRelativo" in $$props) $$invalidate(1, tiempoRelativo = $$props.tiempoRelativo);
    	};

    	let tiempoRelativo;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*date, horaActual*/ 5) {
    			 $$invalidate(1, tiempoRelativo = relativeTime(date, horaActual));
    		}
    	};

    	return [date, tiempoRelativo];
    }

    class Tiempo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { date: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tiempo",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*date*/ ctx[0] === undefined && !("date" in props)) {
    			console.warn("<Tiempo> was created without expected prop 'date'");
    		}
    	}

    	get date() {
    		throw new Error("<Tiempo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Tiempo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class config {
        static categorias =  [{
            "id": 1,
            "nombre": "Arte",
            "nombreCorto": "ART",
            "oculta": false
        }, {
            "id": 2,
            "nombre": "Tecnologia",
            "nombreCorto": "TEC",
            "oculta": false
        }, {
            "id": 3,
            "nombre": "Random",
            "nombreCorto": "UFF",
            "oculta": true
        }]

        static getCategoriaById(id){ return this.categorias[id - 1]} 
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var js_cookie = createCommonjsModule(function (module, exports) {
    (function (factory) {
    	var registeredInModuleLoader;
    	{
    		module.exports = factory();
    		registeredInModuleLoader = true;
    	}
    	if (!registeredInModuleLoader) {
    		var OldCookies = window.Cookies;
    		var api = window.Cookies = factory();
    		api.noConflict = function () {
    			window.Cookies = OldCookies;
    			return api;
    		};
    	}
    }(function () {
    	function extend () {
    		var i = 0;
    		var result = {};
    		for (; i < arguments.length; i++) {
    			var attributes = arguments[ i ];
    			for (var key in attributes) {
    				result[key] = attributes[key];
    			}
    		}
    		return result;
    	}

    	function decode (s) {
    		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
    	}

    	function init (converter) {
    		function api() {}

    		function set (key, value, attributes) {
    			if (typeof document === 'undefined') {
    				return;
    			}

    			attributes = extend({
    				path: '/'
    			}, api.defaults, attributes);

    			if (typeof attributes.expires === 'number') {
    				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
    			}

    			// We're using "expires" because "max-age" is not supported by IE
    			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

    			try {
    				var result = JSON.stringify(value);
    				if (/^[\{\[]/.test(result)) {
    					value = result;
    				}
    			} catch (e) {}

    			value = converter.write ?
    				converter.write(value, key) :
    				encodeURIComponent(String(value))
    					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

    			key = encodeURIComponent(String(key))
    				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
    				.replace(/[\(\)]/g, escape);

    			var stringifiedAttributes = '';
    			for (var attributeName in attributes) {
    				if (!attributes[attributeName]) {
    					continue;
    				}
    				stringifiedAttributes += '; ' + attributeName;
    				if (attributes[attributeName] === true) {
    					continue;
    				}

    				// Considers RFC 6265 section 5.2:
    				// ...
    				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
    				//     character:
    				// Consume the characters of the unparsed-attributes up to,
    				// not including, the first %x3B (";") character.
    				// ...
    				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
    			}

    			return (document.cookie = key + '=' + value + stringifiedAttributes);
    		}

    		function get (key, json) {
    			if (typeof document === 'undefined') {
    				return;
    			}

    			var jar = {};
    			// To prevent the for loop in the first place assign an empty array
    			// in case there are no cookies at all.
    			var cookies = document.cookie ? document.cookie.split('; ') : [];
    			var i = 0;

    			for (; i < cookies.length; i++) {
    				var parts = cookies[i].split('=');
    				var cookie = parts.slice(1).join('=');

    				if (!json && cookie.charAt(0) === '"') {
    					cookie = cookie.slice(1, -1);
    				}

    				try {
    					var name = decode(parts[0]);
    					cookie = (converter.read || converter)(cookie, name) ||
    						decode(cookie);

    					if (json) {
    						try {
    							cookie = JSON.parse(cookie);
    						} catch (e) {}
    					}

    					jar[name] = cookie;

    					if (key === name) {
    						break;
    					}
    				} catch (e) {}
    			}

    			return key ? jar[key] : jar;
    		}

    		api.set = set;
    		api.get = function (key) {
    			return get(key, false /* read as raw */);
    		};
    		api.getJSON = function (key) {
    			return get(key, true /* read as json */);
    		};
    		api.remove = function (key, attributes) {
    			set(key, '', extend(attributes, {
    				expires: -1
    			}));
    		};

    		api.defaults = {};

    		api.withConverter = init;

    		return api;
    	}

    	return init(function () {});
    }));
    });

    let data = Object.assign({
        mostrarLogin: false,
        mostrarRegistro: false,
    }, window.globalState);

    //Categorias 
    data.categoriasActivas = config.categorias.filter(c => !c.oculta).map(c => c.id);

    if(js_cookie.getJSON('categoriasActivas'))
        data.categoriasActivas = js_cookie.getJSON('categoriasActivas');
    else
        js_cookie.set('categoriasActivas', data.categoriasActivas);

    //Hide comentarios
    let comentariosOcultosStorage = localStorage.getItem('comentariosOcultos');
    if(!comentariosOcultosStorage) comentariosOcultosStorage = JSON.stringify(['test']);
    data.comentariosOcultos = new Map(JSON.parse(comentariosOcultosStorage).map(e => [e, true]));


    const store= writable(data);
    var globalStore = {
        subscribe: store.subscribe,
        set(value) {
            localStorage.setItem('comentariosOcultos', JSON.stringify(Array.from(value.comentariosOcultos.keys())));
            js_cookie.set('categoriasActivas', value.categoriasActivas);
            store.set(value);
        },
        update (config){
            js_cookie.set('categoriasActivas', config.categoriasActivas);
            store.update(config);
        }
    };

    /* src\components\Comentarios\Comentario.svelte generated by Svelte v3.29.0 */
    const file$1 = "src\\components\\Comentarios\\Comentario.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (54:8) {#each comentario.respuestas as r (r)}
    function create_each_block(key_1, ctx) {
    	let a;
    	let t0;
    	let t1_value = /*r*/ ctx[16] + "";
    	let t1;
    	let a_href_value;
    	let a_r_r_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[12](/*r*/ ctx[16], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			t0 = text(">>");
    			t1 = text(t1_value);
    			attr_dev(a, "href", a_href_value = "#" + /*r*/ ctx[16]);
    			attr_dev(a, "class", "restag");
    			attr_dev(a, "r-r", a_r_r_value = /*r*/ ctx[16]);
    			add_location(a, file$1, 54, 8, 1678);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(a, "mouseleave", /*ocultarRespuesta*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*comentario*/ 1 && t1_value !== (t1_value = /*r*/ ctx[16] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*comentario*/ 1 && a_href_value !== (a_href_value = "#" + /*r*/ ctx[16])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*comentario*/ 1 && a_r_r_value !== (a_r_r_value = /*r*/ ctx[16])) {
    				attr_dev(a, "r-r", a_r_r_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:8) {#each comentario.respuestas as r (r)}",
    		ctx
    	});

    	return block;
    }

    // (63:8) {#if comentario.esOp}
    function create_if_block_6(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "OP";
    			attr_dev(span, "class", "nick tag");
    			add_location(span, file$1, 62, 30, 2003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(63:8) {#if comentario.esOp}",
    		ctx
    	});

    	return block;
    }

    // (70:12) <div slot="activator">
    function create_activator_slot(ctx) {
    	let div;
    	let span;
    	let i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", "fe fe-more-vertical relative");
    			add_location(i, file$1, 70, 42, 2425);
    			attr_dev(span, "onclick", "");
    			attr_dev(span, "class", "");
    			add_location(span, file$1, 70, 16, 2399);
    			attr_dev(div, "slot", "activator");
    			add_location(div, file$1, 69, 12, 2359);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, i);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot.name,
    		type: "slot",
    		source: "(70:12) <div slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    // (75:12) <Menuitem on:click={toggle} >
    function create_default_slot_3(ctx) {
    	let t_value = (/*visible*/ ctx[4] ? "Ocultar" : "Mostrar  ") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*visible*/ 16 && t_value !== (t_value = (/*visible*/ ctx[4] ? "Ocultar" : "Mostrar  ") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(75:12) <Menuitem on:click={toggle} >",
    		ctx
    	});

    	return block;
    }

    // (76:12) <Menuitem >
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reportar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(76:12) <Menuitem >",
    		ctx
    	});

    	return block;
    }

    // (77:12) {#if $globalStore.usuario.esMod}
    function create_if_block_5(ctx) {
    	let hr;
    	let t;
    	let menuitem;
    	let current;

    	menuitem = new jn({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t = space();
    			create_component(menuitem.$$.fragment);
    			add_location(hr, file$1, 77, 16, 2720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(menuitem, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t);
    			destroy_component(menuitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(77:12) {#if $globalStore.usuario.esMod}",
    		ctx
    	});

    	return block;
    }

    // (79:16) <Menuitem >
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Eliminar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(79:16) <Menuitem >",
    		ctx
    	});

    	return block;
    }

    // (69:8) <Menu origin="top right">
    function create_default_slot(ctx) {
    	let t0;
    	let menuitem0;
    	let t1;
    	let menuitem1;
    	let t2;
    	let if_block_anchor;
    	let current;

    	menuitem0 = new jn({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	menuitem0.$on("click", /*toggle*/ ctx[10]);

    	menuitem1 = new jn({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*$globalStore*/ ctx[5].usuario.esMod && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(menuitem0.$$.fragment);
    			t1 = space();
    			create_component(menuitem1.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(menuitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(menuitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menuitem0_changes = {};

    			if (dirty & /*$$scope, visible*/ 524304) {
    				menuitem0_changes.$$scope = { dirty, ctx };
    			}

    			menuitem0.$set(menuitem0_changes);
    			const menuitem1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				menuitem1_changes.$$scope = { dirty, ctx };
    			}

    			menuitem1.$set(menuitem1_changes);

    			if (/*$globalStore*/ ctx[5].usuario.esMod) {
    				if (if_block) {
    					if (dirty & /*$globalStore*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem0.$$.fragment, local);
    			transition_in(menuitem1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem0.$$.fragment, local);
    			transition_out(menuitem1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(menuitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(menuitem1, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(69:8) <Menu origin=\\\"top right\\\">",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#if visible}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let raw_value = /*comentario*/ ctx[0].contenido + "";
    	let if_block = /*comentario*/ ctx[0].media && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "media");
    			add_location(div0, file$1, 89, 12, 2950);
    			attr_dev(div1, "class", "texto");
    			add_location(div1, file$1, 104, 12, 3681);
    			attr_dev(div2, "class", "contenido");
    			add_location(div2, file$1, 88, 8, 2913);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			div1.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (/*comentario*/ ctx[0].media) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*comentario*/ 1 && raw_value !== (raw_value = /*comentario*/ ctx[0].contenido + "")) div1.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(88:4) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (91:16) {#if comentario.media}
    function create_if_block_2(ctx) {
    	let if_block_anchor;
    	let if_block = (/*comentario*/ ctx[0].media.tipo == 1 || true) && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*comentario*/ ctx[0].media.tipo == 1 || true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(91:16) {#if comentario.media}",
    		ctx
    	});

    	return block;
    }

    // (92:20) {#if comentario.media.tipo  == 1 || true}
    function create_if_block_3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*comentario*/ ctx[0].media.esGif) return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(92:20) {#if comentario.media.tipo  == 1 || true}",
    		ctx
    	});

    	return block;
    }

    // (97:24) {:else}
    function create_else_block(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = /*comentario*/ ctx[0].media.vistaPrevia)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "srcset", "");
    			add_location(img, file$1, 98, 32, 3473);
    			attr_dev(a, "href", a_href_value = "/" + /*comentario*/ ctx[0].media.url);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 97, 28, 3389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*comentario*/ 1 && img.src !== (img_src_value = /*comentario*/ ctx[0].media.vistaPrevia)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*comentario*/ 1 && a_href_value !== (a_href_value = "/" + /*comentario*/ ctx[0].media.url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(97:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:24) {#if comentario.media.esGif}
    function create_if_block_4(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = "/" + /*comentario*/ ctx[0].media.url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "srcset", "");
    			add_location(img, file$1, 94, 32, 3240);
    			attr_dev(a, "href", a_href_value = "/" + /*comentario*/ ctx[0].media.url);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 93, 28, 3156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*comentario*/ 1 && img.src !== (img_src_value = "/" + /*comentario*/ ctx[0].media.url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*comentario*/ 1 && a_href_value !== (a_href_value = "/" + /*comentario*/ ctx[0].media.url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(93:24) {#if comentario.media.esGif}",
    		ctx
    	});

    	return block;
    }

    // (110:4) {#if mostrandoRespuesta}
    function create_if_block(ctx) {
    	let div;
    	let comentario_1;
    	let div_transition;
    	let current;

    	comentario_1 = new Comentario({
    			props: { comentario: /*respuestaMostrada*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(comentario_1.$$.fragment);
    			attr_dev(div, "class", "comentario-flotante");
    			add_location(div, file$1, 110, 8, 3833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(comentario_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const comentario_1_changes = {};
    			if (dirty & /*respuestaMostrada*/ 8) comentario_1_changes.comentario = /*respuestaMostrada*/ ctx[3];
    			comentario_1.$set(comentario_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(comentario_1.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: -50, duration: 150 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(comentario_1.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: -50, duration: 150 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(comentario_1);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(110:4) {#if mostrandoRespuesta}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div4;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div2;
    	let t3;
    	let span0;
    	let t5;
    	let span1;
    	let t7;
    	let span2;
    	let t8_value = /*comentario*/ ctx[0].id + "";
    	let t8;
    	let t9;
    	let span3;
    	let tiempo;
    	let t10;
    	let menu;
    	let t11;
    	let div3;
    	let t12;
    	let t13;
    	let div4_class_value;
    	let div4_r_id_value;
    	let div4_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*comentario*/ ctx[0].respuestas;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*r*/ ctx[16];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let if_block0 = /*comentario*/ ctx[0].esOp && create_if_block_6(ctx);

    	tiempo = new Tiempo({
    			props: { date: /*comentario*/ ctx[0].creacion },
    			$$inline: true
    		});

    	menu = new kn({
    			props: {
    				origin: "top right",
    				$$slots: {
    					default: [create_default_slot],
    					activator: [create_activator_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*visible*/ ctx[4] && create_if_block_1(ctx);
    	let if_block2 = /*mostrandoRespuesta*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			t1 = text("ANON");
    			t2 = space();
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = "Gordo";
    			t5 = space();
    			span1 = element("span");
    			span1.textContent = "anon";
    			t7 = space();
    			span2 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			span3 = element("span");
    			create_component(tiempo.$$.fragment);
    			t10 = space();
    			create_component(menu.$$.fragment);
    			t11 = space();
    			div3 = element("div");
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "respuestas");
    			add_location(div0, file$1, 52, 4, 1595);
    			attr_dev(div1, "class", "color");
    			set_style(div1, "background", /*comentario*/ ctx[0].color);
    			add_location(div1, file$1, 60, 4, 1876);
    			attr_dev(span0, "class", "nick");
    			add_location(span0, file$1, 63, 8, 2050);
    			attr_dev(span1, "class", "rol tag");
    			add_location(span1, file$1, 64, 8, 2091);
    			attr_dev(span2, "class", "id tag");
    			add_location(span2, file$1, 65, 8, 2134);
    			attr_dev(span3, "class", "tiempo");
    			add_location(span3, file$1, 66, 8, 2244);
    			attr_dev(div2, "class", "header");
    			add_location(div2, file$1, 61, 4, 1951);
    			attr_dev(div3, "class", "respuestas");
    			add_location(div3, file$1, 85, 4, 2848);
    			attr_dev(div4, "class", div4_class_value = "comentario " + (/*windowsWidh*/ ctx[7] <= 400 ? "comentario-movil" : ""));
    			attr_dev(div4, "r-id", div4_r_id_value = /*comentario*/ ctx[0].id);
    			attr_dev(div4, "id", div4_id_value = /*comentario*/ ctx[0].id);
    			add_location(div4, file$1, 51, 0, 1463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, span0);
    			append_dev(div2, t5);
    			append_dev(div2, span1);
    			append_dev(div2, t7);
    			append_dev(div2, span2);
    			append_dev(span2, t8);
    			append_dev(div2, t9);
    			append_dev(div2, span3);
    			mount_component(tiempo, span3, null);
    			append_dev(div2, t10);
    			mount_component(menu, div2, null);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div4, t12);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t13);
    			if (if_block2) if_block2.m(div4, null);
    			/*div4_binding*/ ctx[14](div4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span2, "click", /*click_handler*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*comentario, mostrarRespuesta, ocultarRespuesta*/ 769) {
    				const each_value = /*comentario*/ ctx[0].respuestas;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block, null, get_each_context);
    			}

    			if (!current || dirty & /*comentario*/ 1) {
    				set_style(div1, "background", /*comentario*/ ctx[0].color);
    			}

    			if (/*comentario*/ ctx[0].esOp) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div2, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*comentario*/ 1) && t8_value !== (t8_value = /*comentario*/ ctx[0].id + "")) set_data_dev(t8, t8_value);
    			const tiempo_changes = {};
    			if (dirty & /*comentario*/ 1) tiempo_changes.date = /*comentario*/ ctx[0].creacion;
    			tiempo.$set(tiempo_changes);
    			const menu_changes = {};

    			if (dirty & /*$$scope, $globalStore, visible*/ 524336) {
    				menu_changes.$$scope = { dirty, ctx };
    			}

    			menu.$set(menu_changes);

    			if (/*visible*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div4, t13);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*mostrandoRespuesta*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*mostrandoRespuesta*/ 4) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div4, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*comentario*/ 1 && div4_r_id_value !== (div4_r_id_value = /*comentario*/ ctx[0].id)) {
    				attr_dev(div4, "r-id", div4_r_id_value);
    			}

    			if (!current || dirty & /*comentario*/ 1 && div4_id_value !== (div4_id_value = /*comentario*/ ctx[0].id)) {
    				attr_dev(div4, "id", div4_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tiempo.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tiempo.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block0) if_block0.d();
    			destroy_component(tiempo);
    			destroy_component(menu);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			/*div4_binding*/ ctx[14](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $globalStore;
    	let $comentarioStore;
    	validate_store(globalStore, "globalStore");
    	component_subscribe($$self, globalStore, $$value => $$invalidate(5, $globalStore = $$value));
    	validate_store(comentarioStore, "comentarioStore");
    	component_subscribe($$self, comentarioStore, $$value => $$invalidate(6, $comentarioStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Comentario", slots, []);
    	let { comentario } = $$props;
    	let { comentariosDic = {} } = $$props;
    	let el;
    	let respuestas;
    	let mostrandoRespuesta = false;
    	let respuestaMostrada;
    	let windowsWidh = window.screen.width;
    	let visible = !$globalStore.comentariosOcultos.has(comentario.id);

    	onMount(() => {
    		let respuestas = el.querySelectorAll(".restag");

    		respuestas.forEach(r => {
    			r.addEventListener("mouseover", () => mostrarRespuesta(r.getAttribute("r-id").trim()));
    			r.addEventListener("mouseleave", ocultarRespuesta);
    		});
    	});

    	function mostrarRespuesta(id) {
    		$$invalidate(2, mostrandoRespuesta = true);
    		$$invalidate(3, respuestaMostrada = comentariosDic[id]);
    	}

    	function ocultarRespuesta() {
    		$$invalidate(2, mostrandoRespuesta = false);
    	}

    	function toggle() {
    		if (visible) {
    			$globalStore.comentariosOcultos.set(comentario.id, true);
    		} else {
    			$globalStore.comentariosOcultos.delete(comentario.id);
    		}

    		globalStore.set($globalStore);
    		$$invalidate(4, visible = !visible);
    	}

    	const writable_props = ["comentario", "comentariosDic"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Comentario> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = r => mostrarRespuesta(r);
    	const click_handler = () => set_store_value(comentarioStore, $comentarioStore += `>>${comentario.id}\n`, $comentarioStore);

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(1, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("comentario" in $$props) $$invalidate(0, comentario = $$props.comentario);
    		if ("comentariosDic" in $$props) $$invalidate(11, comentariosDic = $$props.comentariosDic);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Menu: kn,
    		Menuitem: jn,
    		Button: ye,
    		Icon: Me,
    		comentarioStore,
    		fade,
    		blur,
    		fly,
    		Tiempo,
    		globalStore,
    		comentario,
    		comentariosDic,
    		el,
    		respuestas,
    		mostrandoRespuesta,
    		respuestaMostrada,
    		windowsWidh,
    		visible,
    		mostrarRespuesta,
    		ocultarRespuesta,
    		toggle,
    		$globalStore,
    		$comentarioStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("comentario" in $$props) $$invalidate(0, comentario = $$props.comentario);
    		if ("comentariosDic" in $$props) $$invalidate(11, comentariosDic = $$props.comentariosDic);
    		if ("el" in $$props) $$invalidate(1, el = $$props.el);
    		if ("respuestas" in $$props) respuestas = $$props.respuestas;
    		if ("mostrandoRespuesta" in $$props) $$invalidate(2, mostrandoRespuesta = $$props.mostrandoRespuesta);
    		if ("respuestaMostrada" in $$props) $$invalidate(3, respuestaMostrada = $$props.respuestaMostrada);
    		if ("windowsWidh" in $$props) $$invalidate(7, windowsWidh = $$props.windowsWidh);
    		if ("visible" in $$props) $$invalidate(4, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		comentario,
    		el,
    		mostrandoRespuesta,
    		respuestaMostrada,
    		visible,
    		$globalStore,
    		$comentarioStore,
    		windowsWidh,
    		mostrarRespuesta,
    		ocultarRespuesta,
    		toggle,
    		comentariosDic,
    		mouseover_handler,
    		click_handler,
    		div4_binding
    	];
    }

    class Comentario extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { comentario: 0, comentariosDic: 11 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Comentario",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*comentario*/ ctx[0] === undefined && !("comentario" in props)) {
    			console.warn("<Comentario> was created without expected prop 'comentario'");
    		}
    	}

    	get comentario() {
    		throw new Error("<Comentario>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comentario(value) {
    		throw new Error("<Comentario>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get comentariosDic() {
    		throw new Error("<Comentario>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comentariosDic(value) {
    		throw new Error("<Comentario>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        if (
          (utils.isBlob(requestData) || utils.isFile(requestData)) &&
          requestData.type
        ) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = unescape(encodeURIComponent(config.auth.password)) || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$1(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    class RChanClient {
        // Acciones
        static crearHilo(titulo, categoria, contenido, archivo) {
            let form = new FormData();
            form.append("Titulo", titulo);
            form.append("CategoriaId", categoria);
            form.append("Contenido", contenido);
            form.append("Archivo", archivo);
            return axios$1.post("/api/Hilo/Crear", form)
        }

        static crearComentario(hiloId, contenido, archivo = null) {
            let form = new FormData();
            form.append('hiloId', hiloId);
            form.append('contenido', contenido);
            form.append('archivo', archivo);
            return axios$1.post('/api/Comentario/Crear', form)
        }

        static registrase(nick, contraseña) {
            return axios$1.post('/api/Usuario/Registro', {
                nick,
                contraseña
            })
        }

        static logearse(nick, contraseña) {
            return axios$1.post('/api/Usuario/Login', {
                nick,
                contraseña
            })
        }
        static agregar(accion, id) {
            return axios$1.post('/api/Hilo/Agregar', {
                accion, // favoritos | seguidos | ocultos
                hiloId: id
            })
        }
        static limpiarNotificaciones() {
            return axios$1.post("/api/Notificacion/Limpiar")
        }

        static añadirRol(nick, role) {
            return axios$1.post("/api/Administracion/AñadirRol", {
                username: nick,
                role
            })
        }

        static removerRol(nick, role) {
            return axios$1.post("/api/Administracion/RemoverRol", {
                username: nick,
                role
            })
        }

        static añadirSticky(hiloId, global, importancia) {
            return axios$1.post("/api/Administracion/AñadirSticky", {
                hiloId,
                global,
                importancia: Number(importancia),
            })
        }
        static borrarHilo(hiloId) {
            return axios$1.post("/api/Administracion/BorrarHilo", {
                hiloId,
            })
        }
        static cambiarCategoria(hiloId, categoriaId) {
            return axios$1.post("/api/Administracion/CambiarCategoria", {
                hiloId,
                categoriaId,
            })
        }
        //Paginas
        static index(){
            return axios$1.get("/")
        }
        static hilo(id){
            return axios$1.get(`/Hilo/${id}`)
        }
        static favoritos(id){
            return axios$1.get(`/Hilo/Favoritos`)
        }
    }

    /* src\components\ErrorValidacion.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file$2 = "src\\components\\ErrorValidacion.svelte";

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (18:16) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let each_value_2 = Object.keys(/*error*/ ctx[0]);
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Ay no se!";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$2, 19, 4, 456);
    			attr_dev(div, "class", "error-validacion");
    			add_location(div, file$2, 18, 0, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error, Object*/ 1) {
    				each_value_2 = Object.keys(/*error*/ ctx[0]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(18:16) ",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if error && error.errors}
    function create_if_block$1(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let each_value = Object.keys(/*error*/ ctx[0].errors);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Ay no se!";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$2, 7, 4, 119);
    			attr_dev(div, "class", "error-validacion");
    			add_location(div, file$2, 6, 0, 83);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error, Object*/ 1) {
    				each_value = Object.keys(/*error*/ ctx[0].errors);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(6:0) {#if error && error.errors}",
    		ctx
    	});

    	return block;
    }

    // (24:16) {#each error[key] as e}
    function create_each_block_3(ctx) {
    	let t_value = /*e*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 1 && t_value !== (t_value = /*e*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(24:16) {#each error[key] as e}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#each Object.keys(error) as key}
    function create_each_block_2(ctx) {
    	let div;
    	let strong;
    	let t0_value = /*key*/ ctx[1] + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_3 = /*error*/ ctx[0][/*key*/ ctx[1]];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			add_location(strong, file$2, 22, 16, 559);
    			attr_dev(div, "class", "");
    			add_location(div, file$2, 21, 12, 527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, strong);
    			append_dev(strong, t0);
    			append_dev(strong, t1);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 1 && t0_value !== (t0_value = /*key*/ ctx[1] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*error, Object*/ 1) {
    				each_value_3 = /*error*/ ctx[0][/*key*/ ctx[1]];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(21:4) {#each Object.keys(error) as key}",
    		ctx
    	});

    	return block;
    }

    // (12:16) {#each error.errors[key] as e}
    function create_each_block_1(ctx) {
    	let t_value = /*e*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 1 && t_value !== (t_value = /*e*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(12:16) {#each error.errors[key] as e}",
    		ctx
    	});

    	return block;
    }

    // (9:4) {#each Object.keys(error.errors) as key}
    function create_each_block$1(ctx) {
    	let div;
    	let strong;
    	let t0_value = /*key*/ ctx[1] + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*error*/ ctx[0].errors[/*key*/ ctx[1]];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			add_location(strong, file$2, 10, 16, 229);
    			attr_dev(div, "class", "");
    			add_location(div, file$2, 9, 12, 197);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, strong);
    			append_dev(strong, t0);
    			append_dev(strong, t1);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 1 && t0_value !== (t0_value = /*key*/ ctx[1] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*error, Object*/ 1) {
    				each_value_1 = /*error*/ ctx[0].errors[/*key*/ ctx[1]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(9:4) {#each Object.keys(error.errors) as key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*error*/ ctx[0] && /*error*/ ctx[0].errors) return create_if_block$1;
    		if (/*error*/ ctx[0]) return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ErrorValidacion", slots, []);
    	let { error = null } = $$props;
    	const writable_props = ["error"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ErrorValidacion> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("error" in $$props) $$invalidate(0, error = $$props.error);
    	};

    	$$self.$capture_state = () => ({ error });

    	$$self.$inject_state = $$props => {
    		if ("error" in $$props) $$invalidate(0, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [error];
    }

    class ErrorValidacion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { error: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorValidacion",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get error() {
    		throw new Error("<ErrorValidacion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<ErrorValidacion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Comentarios\Formulario.svelte generated by Svelte v3.29.0 */
    const file$3 = "src\\components\\Comentarios\\Formulario.svelte";

    // (58:4) {#if archivo}
    function create_if_block$2(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t;
    	let div0;
    	let i;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t = space();
    			div0 = element("div");
    			i = element("i");
    			if (img.src !== (img_src_value = /*archivoBlob*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "srcset", "");
    			add_location(img, file$3, 59, 12, 1609);
    			attr_dev(i, "class", "fe fe-x-circle");
    			add_location(i, file$3, 61, 16, 1733);
    			attr_dev(div0, "class", "btn-cancel");
    			add_location(div0, file$3, 60, 12, 1665);
    			attr_dev(div1, "class", "archivo");
    			set_style(div1, "position", "relative");
    			add_location(div1, file$3, 58, 8, 1508);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*removerArchivo*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*archivoBlob*/ 4 && img.src !== (img_src_value = /*archivoBlob*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { y: -50, duration: 250 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { y: -50, duration: 250 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(58:4) {#if archivo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let form;
    	let errorvalidacion;
    	let t0;
    	let t1;
    	let textarea;
    	let t2;
    	let input_1;
    	let t3;
    	let div;
    	let button0;
    	let i;
    	let t4;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	errorvalidacion = new ErrorValidacion({
    			props: { error: /*error*/ ctx[3] },
    			$$inline: true
    		});

    	let if_block = /*archivo*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			create_component(errorvalidacion.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			input_1 = element("input");
    			t3 = space();
    			div = element("div");
    			button0 = element("button");
    			i = element("i");
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Comentar";
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			add_location(textarea, file$3, 66, 4, 1818);
    			attr_dev(input_1, "type", "file");
    			attr_dev(input_1, "id", "comentario-input");
    			set_style(input_1, "position", "absolute");
    			set_style(input_1, "top", "-1000px");
    			add_location(input_1, file$3, 68, 4, 1920);
    			attr_dev(i, "class", "fe fe-image");
    			add_location(i, file$3, 73, 12, 2163);
    			attr_dev(button0, "class", "btn");
    			add_location(button0, file$3, 72, 8, 2098);
    			attr_dev(button1, "class", "btn");
    			add_location(button1, file$3, 75, 8, 2219);
    			attr_dev(div, "class", "acciones");
    			add_location(div, file$3, 71, 4, 2066);
    			attr_dev(form, "id", "form-comentario");
    			attr_dev(form, "class", "form-comentario panel");
    			add_location(form, file$3, 55, 0, 1362);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			mount_component(errorvalidacion, form, null);
    			append_dev(form, t0);
    			if (if_block) if_block.m(form, null);
    			append_dev(form, t1);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*contenido*/ ctx[4]);
    			append_dev(form, t2);
    			append_dev(form, input_1);
    			/*input_1_binding*/ ctx[12](input_1);
    			append_dev(form, t3);
    			append_dev(form, div);
    			append_dev(div, button0);
    			append_dev(button0, i);
    			append_dev(div, t4);
    			append_dev(div, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "focus", /*focus_handler*/ ctx[10], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen_dev(input_1, "change", /*actualizarArchivo*/ ctx[6], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(button1, "click", prevent_default(/*crearComentario*/ ctx[5]), false, true, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const errorvalidacion_changes = {};
    			if (dirty & /*error*/ 8) errorvalidacion_changes.error = /*error*/ ctx[3];
    			errorvalidacion.$set(errorvalidacion_changes);

    			if (/*archivo*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*archivo*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(form, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*contenido*/ 16) {
    				set_input_value(textarea, /*contenido*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(errorvalidacion.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(errorvalidacion.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(errorvalidacion);
    			if (if_block) if_block.d();
    			/*input_1_binding*/ ctx[12](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $comentarioStore;
    	validate_store(comentarioStore, "comentarioStore");
    	component_subscribe($$self, comentarioStore, $$value => $$invalidate(16, $comentarioStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Formulario", slots, []);
    	let { hilo } = $$props;
    	let creando = false;
    	let input;
    	let archivo = null;
    	let archivoBlob = null;
    	let espera = 0;
    	let error = null;

    	async function crearComentario() {
    		if (espera != 0 || creando) return;

    		try {
    			await RChanClient.crearComentario(hilo.id, contenido, input.files[0]);
    			creando = true;
    		} catch(e) {
    			$$invalidate(3, error = e.response.data);
    			return;
    		}

    		creando = false;
    		espera = 0;
    		$$invalidate(4, contenido = "");
    		$$invalidate(1, archivo = null);
    		$$invalidate(0, input.value = "", input);
    		$$invalidate(3, error = null);
    	}

    	function actualizarArchivo() {
    		if (input.files && input.files[0]) {
    			var reader = new FileReader();

    			reader.onload = function (e) {
    				$$invalidate(2, archivoBlob = e.target.result);
    				$$invalidate(1, archivo = input.files[0]);
    			};

    			reader.readAsDataURL(input.files[0]);
    		}
    	}

    	function removerArchivo() {
    		$$invalidate(1, archivo = null);
    		$$invalidate(2, archivoBlob = null);
    		$$invalidate(0, input.value = "", input);
    	}

    	const writable_props = ["hilo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Formulario> was created with unknown prop '${key}'`);
    	});

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	const focus_handler = () => $$invalidate(3, error = null);

    	function textarea_input_handler() {
    		contenido = this.value;
    		($$invalidate(4, contenido), $$invalidate(16, $comentarioStore));
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(0, input);
    		});
    	}

    	const click_handler = () => input.click();

    	$$self.$$set = $$props => {
    		if ("hilo" in $$props) $$invalidate(8, hilo = $$props.hilo);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		blur,
    		fly,
    		comentarioStore,
    		RChanClient,
    		ErrorValidacion,
    		hilo,
    		creando,
    		input,
    		archivo,
    		archivoBlob,
    		espera,
    		error,
    		crearComentario,
    		actualizarArchivo,
    		removerArchivo,
    		contenido,
    		$comentarioStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("hilo" in $$props) $$invalidate(8, hilo = $$props.hilo);
    		if ("creando" in $$props) creando = $$props.creando;
    		if ("input" in $$props) $$invalidate(0, input = $$props.input);
    		if ("archivo" in $$props) $$invalidate(1, archivo = $$props.archivo);
    		if ("archivoBlob" in $$props) $$invalidate(2, archivoBlob = $$props.archivoBlob);
    		if ("espera" in $$props) espera = $$props.espera;
    		if ("error" in $$props) $$invalidate(3, error = $$props.error);
    		if ("contenido" in $$props) $$invalidate(4, contenido = $$props.contenido);
    	};

    	let contenido;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$comentarioStore*/ 65536) {
    			 $$invalidate(4, contenido = $comentarioStore);
    		}
    	};

    	return [
    		input,
    		archivo,
    		archivoBlob,
    		error,
    		contenido,
    		crearComentario,
    		actualizarArchivo,
    		removerArchivo,
    		hilo,
    		submit_handler,
    		focus_handler,
    		textarea_input_handler,
    		input_1_binding,
    		click_handler
    	];
    }

    class Formulario extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { hilo: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Formulario",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*hilo*/ ctx[8] === undefined && !("hilo" in props)) {
    			console.warn("<Formulario> was created without expected prop 'hilo'");
    		}
    	}

    	get hilo() {
    		throw new Error("<Formulario>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hilo(value) {
    		throw new Error("<Formulario>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __extends = (undefined && undefined.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    /** Error thrown when an HTTP request fails. */
    var HttpError = /** @class */ (function (_super) {
        __extends(HttpError, _super);
        /** Constructs a new instance of {@link @microsoft/signalr.HttpError}.
         *
         * @param {string} errorMessage A descriptive error message.
         * @param {number} statusCode The HTTP status code represented by this error.
         */
        function HttpError(errorMessage, statusCode) {
            var _newTarget = this.constructor;
            var _this = this;
            var trueProto = _newTarget.prototype;
            _this = _super.call(this, errorMessage) || this;
            _this.statusCode = statusCode;
            // Workaround issue in Typescript compiler
            // https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
            _this.__proto__ = trueProto;
            return _this;
        }
        return HttpError;
    }(Error));
    /** Error thrown when a timeout elapses. */
    var TimeoutError = /** @class */ (function (_super) {
        __extends(TimeoutError, _super);
        /** Constructs a new instance of {@link @microsoft/signalr.TimeoutError}.
         *
         * @param {string} errorMessage A descriptive error message.
         */
        function TimeoutError(errorMessage) {
            var _newTarget = this.constructor;
            if (errorMessage === void 0) { errorMessage = "A timeout occurred."; }
            var _this = this;
            var trueProto = _newTarget.prototype;
            _this = _super.call(this, errorMessage) || this;
            // Workaround issue in Typescript compiler
            // https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
            _this.__proto__ = trueProto;
            return _this;
        }
        return TimeoutError;
    }(Error));
    /** Error thrown when an action is aborted. */
    var AbortError = /** @class */ (function (_super) {
        __extends(AbortError, _super);
        /** Constructs a new instance of {@link AbortError}.
         *
         * @param {string} errorMessage A descriptive error message.
         */
        function AbortError(errorMessage) {
            var _newTarget = this.constructor;
            if (errorMessage === void 0) { errorMessage = "An abort occurred."; }
            var _this = this;
            var trueProto = _newTarget.prototype;
            _this = _super.call(this, errorMessage) || this;
            // Workaround issue in Typescript compiler
            // https://github.com/Microsoft/TypeScript/issues/13965#issuecomment-278570200
            _this.__proto__ = trueProto;
            return _this;
        }
        return AbortError;
    }(Error));

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    /** Represents an HTTP response. */
    var HttpResponse = /** @class */ (function () {
        function HttpResponse(statusCode, statusText, content) {
            this.statusCode = statusCode;
            this.statusText = statusText;
            this.content = content;
        }
        return HttpResponse;
    }());
    /** Abstraction over an HTTP client.
     *
     * This class provides an abstraction over an HTTP client so that a different implementation can be provided on different platforms.
     */
    var HttpClient = /** @class */ (function () {
        function HttpClient() {
        }
        HttpClient.prototype.get = function (url, options) {
            return this.send(__assign({}, options, { method: "GET", url: url }));
        };
        HttpClient.prototype.post = function (url, options) {
            return this.send(__assign({}, options, { method: "POST", url: url }));
        };
        HttpClient.prototype.delete = function (url, options) {
            return this.send(__assign({}, options, { method: "DELETE", url: url }));
        };
        /** Gets all cookies that apply to the specified URL.
         *
         * @param url The URL that the cookies are valid for.
         * @returns {string} A string containing all the key-value cookie pairs for the specified URL.
         */
        // @ts-ignore
        HttpClient.prototype.getCookieString = function (url) {
            return "";
        };
        return HttpClient;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    // These values are designed to match the ASP.NET Log Levels since that's the pattern we're emulating here.
    /** Indicates the severity of a log message.
     *
     * Log Levels are ordered in increasing severity. So `Debug` is more severe than `Trace`, etc.
     */
    var LogLevel;
    (function (LogLevel) {
        /** Log level for very low severity diagnostic messages. */
        LogLevel[LogLevel["Trace"] = 0] = "Trace";
        /** Log level for low severity diagnostic messages. */
        LogLevel[LogLevel["Debug"] = 1] = "Debug";
        /** Log level for informational diagnostic messages. */
        LogLevel[LogLevel["Information"] = 2] = "Information";
        /** Log level for diagnostic messages that indicate a non-fatal problem. */
        LogLevel[LogLevel["Warning"] = 3] = "Warning";
        /** Log level for diagnostic messages that indicate a failure in the current operation. */
        LogLevel[LogLevel["Error"] = 4] = "Error";
        /** Log level for diagnostic messages that indicate a failure that will terminate the entire application. */
        LogLevel[LogLevel["Critical"] = 5] = "Critical";
        /** The highest possible log level. Used when configuring logging to indicate that no log messages should be emitted. */
        LogLevel[LogLevel["None"] = 6] = "None";
    })(LogLevel || (LogLevel = {}));

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    /** A logger that does nothing when log messages are sent to it. */
    var NullLogger = /** @class */ (function () {
        function NullLogger() {
        }
        /** @inheritDoc */
        // tslint:disable-next-line
        NullLogger.prototype.log = function (_logLevel, _message) {
        };
        /** The singleton instance of the {@link @microsoft/signalr.NullLogger}. */
        NullLogger.instance = new NullLogger();
        return NullLogger;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /** @private */
    var Arg = /** @class */ (function () {
        function Arg() {
        }
        Arg.isRequired = function (val, name) {
            if (val === null || val === undefined) {
                throw new Error("The '" + name + "' argument is required.");
            }
        };
        Arg.isIn = function (val, values, name) {
            // TypeScript enums have keys for **both** the name and the value of each enum member on the type itself.
            if (!(val in values)) {
                throw new Error("Unknown " + name + " value: " + val + ".");
            }
        };
        return Arg;
    }());
    /** @private */
    var Platform = /** @class */ (function () {
        function Platform() {
        }
        Object.defineProperty(Platform, "isBrowser", {
            get: function () {
                return typeof window === "object";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Platform, "isWebWorker", {
            get: function () {
                return typeof self === "object" && "importScripts" in self;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Platform, "isNode", {
            get: function () {
                return !this.isBrowser && !this.isWebWorker;
            },
            enumerable: true,
            configurable: true
        });
        return Platform;
    }());
    /** @private */
    function getDataDetail(data, includeContent) {
        var detail = "";
        if (isArrayBuffer$1(data)) {
            detail = "Binary data of length " + data.byteLength;
            if (includeContent) {
                detail += ". Content: '" + formatArrayBuffer(data) + "'";
            }
        }
        else if (typeof data === "string") {
            detail = "String data of length " + data.length;
            if (includeContent) {
                detail += ". Content: '" + data + "'";
            }
        }
        return detail;
    }
    /** @private */
    function formatArrayBuffer(data) {
        var view = new Uint8Array(data);
        // Uint8Array.map only supports returning another Uint8Array?
        var str = "";
        view.forEach(function (num) {
            var pad = num < 16 ? "0" : "";
            str += "0x" + pad + num.toString(16) + " ";
        });
        // Trim of trailing space.
        return str.substr(0, str.length - 1);
    }
    // Also in signalr-protocol-msgpack/Utils.ts
    /** @private */
    function isArrayBuffer$1(val) {
        return val && typeof ArrayBuffer !== "undefined" &&
            (val instanceof ArrayBuffer ||
                // Sometimes we get an ArrayBuffer that doesn't satisfy instanceof
                (val.constructor && val.constructor.name === "ArrayBuffer"));
    }
    /** @private */
    function sendMessage(logger, transportName, httpClient, url, accessTokenFactory, content, logMessageContent) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, headers, token, responseType, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!accessTokenFactory) return [3 /*break*/, 2];
                        return [4 /*yield*/, accessTokenFactory()];
                    case 1:
                        token = _b.sent();
                        if (token) {
                            headers = (_a = {},
                                _a["Authorization"] = "Bearer " + token,
                                _a);
                        }
                        _b.label = 2;
                    case 2:
                        logger.log(LogLevel.Trace, "(" + transportName + " transport) sending data. " + getDataDetail(content, logMessageContent) + ".");
                        responseType = isArrayBuffer$1(content) ? "arraybuffer" : "text";
                        return [4 /*yield*/, httpClient.post(url, {
                                content: content,
                                headers: headers,
                                responseType: responseType,
                            })];
                    case 3:
                        response = _b.sent();
                        logger.log(LogLevel.Trace, "(" + transportName + " transport) request complete. Response status: " + response.statusCode + ".");
                        return [2 /*return*/];
                }
            });
        });
    }
    /** @private */
    function createLogger(logger) {
        if (logger === undefined) {
            return new ConsoleLogger(LogLevel.Information);
        }
        if (logger === null) {
            return NullLogger.instance;
        }
        if (logger.log) {
            return logger;
        }
        return new ConsoleLogger(logger);
    }
    /** @private */
    var SubjectSubscription = /** @class */ (function () {
        function SubjectSubscription(subject, observer) {
            this.subject = subject;
            this.observer = observer;
        }
        SubjectSubscription.prototype.dispose = function () {
            var index = this.subject.observers.indexOf(this.observer);
            if (index > -1) {
                this.subject.observers.splice(index, 1);
            }
            if (this.subject.observers.length === 0 && this.subject.cancelCallback) {
                this.subject.cancelCallback().catch(function (_) { });
            }
        };
        return SubjectSubscription;
    }());
    /** @private */
    var ConsoleLogger = /** @class */ (function () {
        function ConsoleLogger(minimumLogLevel) {
            this.minimumLogLevel = minimumLogLevel;
            this.outputConsole = console;
        }
        ConsoleLogger.prototype.log = function (logLevel, message) {
            if (logLevel >= this.minimumLogLevel) {
                switch (logLevel) {
                    case LogLevel.Critical:
                    case LogLevel.Error:
                        this.outputConsole.error("[" + new Date().toISOString() + "] " + LogLevel[logLevel] + ": " + message);
                        break;
                    case LogLevel.Warning:
                        this.outputConsole.warn("[" + new Date().toISOString() + "] " + LogLevel[logLevel] + ": " + message);
                        break;
                    case LogLevel.Information:
                        this.outputConsole.info("[" + new Date().toISOString() + "] " + LogLevel[logLevel] + ": " + message);
                        break;
                    default:
                        // console.debug only goes to attached debuggers in Node, so we use console.log for Trace and Debug
                        this.outputConsole.log("[" + new Date().toISOString() + "] " + LogLevel[logLevel] + ": " + message);
                        break;
                }
            }
        };
        return ConsoleLogger;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __extends$1 = (undefined && undefined.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __assign$1 = (undefined && undefined.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    var requestModule;
    if (typeof XMLHttpRequest === "undefined") {
        // In order to ignore the dynamic require in webpack builds we need to do this magic
        // @ts-ignore: TS doesn't know about these names
        var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
        requestModule = requireFunc("request");
    }
    /** @private */
    var NodeHttpClient = /** @class */ (function (_super) {
        __extends$1(NodeHttpClient, _super);
        function NodeHttpClient(logger) {
            var _this = _super.call(this) || this;
            if (typeof requestModule === "undefined") {
                throw new Error("The 'request' module could not be loaded.");
            }
            _this.logger = logger;
            _this.cookieJar = requestModule.jar();
            _this.request = requestModule.defaults({ jar: _this.cookieJar });
            return _this;
        }
        NodeHttpClient.prototype.send = function (httpRequest) {
            var _this = this;
            // Check that abort was not signaled before calling send
            if (httpRequest.abortSignal) {
                if (httpRequest.abortSignal.aborted) {
                    return Promise.reject(new AbortError());
                }
            }
            return new Promise(function (resolve, reject) {
                var requestBody;
                if (isArrayBuffer$1(httpRequest.content)) {
                    requestBody = Buffer.from(httpRequest.content);
                }
                else {
                    requestBody = httpRequest.content || "";
                }
                var currentRequest = _this.request(httpRequest.url, {
                    body: requestBody,
                    // If binary is expected 'null' should be used, otherwise for text 'utf8'
                    encoding: httpRequest.responseType === "arraybuffer" ? null : "utf8",
                    headers: __assign$1({ 
                        // Tell auth middleware to 401 instead of redirecting
                        "X-Requested-With": "XMLHttpRequest" }, httpRequest.headers),
                    method: httpRequest.method,
                    timeout: httpRequest.timeout,
                }, function (error, response, body) {
                    if (httpRequest.abortSignal) {
                        httpRequest.abortSignal.onabort = null;
                    }
                    if (error) {
                        if (error.code === "ETIMEDOUT") {
                            _this.logger.log(LogLevel.Warning, "Timeout from HTTP request.");
                            reject(new TimeoutError());
                        }
                        _this.logger.log(LogLevel.Warning, "Error from HTTP request. " + error);
                        reject(error);
                        return;
                    }
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(new HttpResponse(response.statusCode, response.statusMessage || "", body));
                    }
                    else {
                        reject(new HttpError(response.statusMessage || "", response.statusCode || 0));
                    }
                });
                if (httpRequest.abortSignal) {
                    httpRequest.abortSignal.onabort = function () {
                        currentRequest.abort();
                        reject(new AbortError());
                    };
                }
            });
        };
        NodeHttpClient.prototype.getCookieString = function (url) {
            return this.cookieJar.getCookieString(url);
        };
        return NodeHttpClient;
    }(HttpClient));

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __extends$2 = (undefined && undefined.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var XhrHttpClient = /** @class */ (function (_super) {
        __extends$2(XhrHttpClient, _super);
        function XhrHttpClient(logger) {
            var _this = _super.call(this) || this;
            _this.logger = logger;
            return _this;
        }
        /** @inheritDoc */
        XhrHttpClient.prototype.send = function (request) {
            var _this = this;
            // Check that abort was not signaled before calling send
            if (request.abortSignal && request.abortSignal.aborted) {
                return Promise.reject(new AbortError());
            }
            if (!request.method) {
                return Promise.reject(new Error("No method defined."));
            }
            if (!request.url) {
                return Promise.reject(new Error("No url defined."));
            }
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(request.method, request.url, true);
                xhr.withCredentials = true;
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                // Explicitly setting the Content-Type header for React Native on Android platform.
                xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
                var headers = request.headers;
                if (headers) {
                    Object.keys(headers)
                        .forEach(function (header) {
                        xhr.setRequestHeader(header, headers[header]);
                    });
                }
                if (request.responseType) {
                    xhr.responseType = request.responseType;
                }
                if (request.abortSignal) {
                    request.abortSignal.onabort = function () {
                        xhr.abort();
                        reject(new AbortError());
                    };
                }
                if (request.timeout) {
                    xhr.timeout = request.timeout;
                }
                xhr.onload = function () {
                    if (request.abortSignal) {
                        request.abortSignal.onabort = null;
                    }
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(new HttpResponse(xhr.status, xhr.statusText, xhr.response || xhr.responseText));
                    }
                    else {
                        reject(new HttpError(xhr.statusText, xhr.status));
                    }
                };
                xhr.onerror = function () {
                    _this.logger.log(LogLevel.Warning, "Error from HTTP request. " + xhr.status + ": " + xhr.statusText + ".");
                    reject(new HttpError(xhr.statusText, xhr.status));
                };
                xhr.ontimeout = function () {
                    _this.logger.log(LogLevel.Warning, "Timeout from HTTP request.");
                    reject(new TimeoutError());
                };
                xhr.send(request.content || "");
            });
        };
        return XhrHttpClient;
    }(HttpClient));

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __extends$3 = (undefined && undefined.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    /** Default implementation of {@link @microsoft/signalr.HttpClient}. */
    var DefaultHttpClient = /** @class */ (function (_super) {
        __extends$3(DefaultHttpClient, _super);
        /** Creates a new instance of the {@link @microsoft/signalr.DefaultHttpClient}, using the provided {@link @microsoft/signalr.ILogger} to log messages. */
        function DefaultHttpClient(logger) {
            var _this = _super.call(this) || this;
            if (typeof XMLHttpRequest !== "undefined") {
                _this.httpClient = new XhrHttpClient(logger);
            }
            else {
                _this.httpClient = new NodeHttpClient(logger);
            }
            return _this;
        }
        /** @inheritDoc */
        DefaultHttpClient.prototype.send = function (request) {
            // Check that abort was not signaled before calling send
            if (request.abortSignal && request.abortSignal.aborted) {
                return Promise.reject(new AbortError());
            }
            if (!request.method) {
                return Promise.reject(new Error("No method defined."));
            }
            if (!request.url) {
                return Promise.reject(new Error("No url defined."));
            }
            return this.httpClient.send(request);
        };
        DefaultHttpClient.prototype.getCookieString = function (url) {
            return this.httpClient.getCookieString(url);
        };
        return DefaultHttpClient;
    }(HttpClient));

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    // Not exported from index
    /** @private */
    var TextMessageFormat = /** @class */ (function () {
        function TextMessageFormat() {
        }
        TextMessageFormat.write = function (output) {
            return "" + output + TextMessageFormat.RecordSeparator;
        };
        TextMessageFormat.parse = function (input) {
            if (input[input.length - 1] !== TextMessageFormat.RecordSeparator) {
                throw new Error("Message is incomplete.");
            }
            var messages = input.split(TextMessageFormat.RecordSeparator);
            messages.pop();
            return messages;
        };
        TextMessageFormat.RecordSeparatorCode = 0x1e;
        TextMessageFormat.RecordSeparator = String.fromCharCode(TextMessageFormat.RecordSeparatorCode);
        return TextMessageFormat;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    /** @private */
    var HandshakeProtocol = /** @class */ (function () {
        function HandshakeProtocol() {
        }
        // Handshake request is always JSON
        HandshakeProtocol.prototype.writeHandshakeRequest = function (handshakeRequest) {
            return TextMessageFormat.write(JSON.stringify(handshakeRequest));
        };
        HandshakeProtocol.prototype.parseHandshakeResponse = function (data) {
            var responseMessage;
            var messageData;
            var remainingData;
            if (isArrayBuffer$1(data) || (typeof Buffer !== "undefined" && data instanceof Buffer)) {
                // Format is binary but still need to read JSON text from handshake response
                var binaryData = new Uint8Array(data);
                var separatorIndex = binaryData.indexOf(TextMessageFormat.RecordSeparatorCode);
                if (separatorIndex === -1) {
                    throw new Error("Message is incomplete.");
                }
                // content before separator is handshake response
                // optional content after is additional messages
                var responseLength = separatorIndex + 1;
                messageData = String.fromCharCode.apply(null, binaryData.slice(0, responseLength));
                remainingData = (binaryData.byteLength > responseLength) ? binaryData.slice(responseLength).buffer : null;
            }
            else {
                var textData = data;
                var separatorIndex = textData.indexOf(TextMessageFormat.RecordSeparator);
                if (separatorIndex === -1) {
                    throw new Error("Message is incomplete.");
                }
                // content before separator is handshake response
                // optional content after is additional messages
                var responseLength = separatorIndex + 1;
                messageData = textData.substring(0, responseLength);
                remainingData = (textData.length > responseLength) ? textData.substring(responseLength) : null;
            }
            // At this point we should have just the single handshake message
            var messages = TextMessageFormat.parse(messageData);
            var response = JSON.parse(messages[0]);
            if (response.type) {
                throw new Error("Expected a handshake response from the server.");
            }
            responseMessage = response;
            // multiple messages could have arrived with handshake
            // return additional data to be parsed as usual, or null if all parsed
            return [remainingData, responseMessage];
        };
        return HandshakeProtocol;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    /** Defines the type of a Hub Message. */
    var MessageType;
    (function (MessageType) {
        /** Indicates the message is an Invocation message and implements the {@link @microsoft/signalr.InvocationMessage} interface. */
        MessageType[MessageType["Invocation"] = 1] = "Invocation";
        /** Indicates the message is a StreamItem message and implements the {@link @microsoft/signalr.StreamItemMessage} interface. */
        MessageType[MessageType["StreamItem"] = 2] = "StreamItem";
        /** Indicates the message is a Completion message and implements the {@link @microsoft/signalr.CompletionMessage} interface. */
        MessageType[MessageType["Completion"] = 3] = "Completion";
        /** Indicates the message is a Stream Invocation message and implements the {@link @microsoft/signalr.StreamInvocationMessage} interface. */
        MessageType[MessageType["StreamInvocation"] = 4] = "StreamInvocation";
        /** Indicates the message is a Cancel Invocation message and implements the {@link @microsoft/signalr.CancelInvocationMessage} interface. */
        MessageType[MessageType["CancelInvocation"] = 5] = "CancelInvocation";
        /** Indicates the message is a Ping message and implements the {@link @microsoft/signalr.PingMessage} interface. */
        MessageType[MessageType["Ping"] = 6] = "Ping";
        /** Indicates the message is a Close message and implements the {@link @microsoft/signalr.CloseMessage} interface. */
        MessageType[MessageType["Close"] = 7] = "Close";
    })(MessageType || (MessageType = {}));

    // Copyright (c) .NET Foundation. All rights reserved.
    /** Stream implementation to stream items to the server. */
    var Subject = /** @class */ (function () {
        function Subject() {
            this.observers = [];
        }
        Subject.prototype.next = function (item) {
            for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                observer.next(item);
            }
        };
        Subject.prototype.error = function (err) {
            for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                if (observer.error) {
                    observer.error(err);
                }
            }
        };
        Subject.prototype.complete = function () {
            for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                if (observer.complete) {
                    observer.complete();
                }
            }
        };
        Subject.prototype.subscribe = function (observer) {
            this.observers.push(observer);
            return new SubjectSubscription(this, observer);
        };
        return Subject;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$1 = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var DEFAULT_TIMEOUT_IN_MS = 30 * 1000;
    var DEFAULT_PING_INTERVAL_IN_MS = 15 * 1000;
    /** Describes the current state of the {@link HubConnection} to the server. */
    var HubConnectionState;
    (function (HubConnectionState) {
        /** The hub connection is disconnected. */
        HubConnectionState["Disconnected"] = "Disconnected";
        /** The hub connection is connecting. */
        HubConnectionState["Connecting"] = "Connecting";
        /** The hub connection is connected. */
        HubConnectionState["Connected"] = "Connected";
        /** The hub connection is disconnecting. */
        HubConnectionState["Disconnecting"] = "Disconnecting";
        /** The hub connection is reconnecting. */
        HubConnectionState["Reconnecting"] = "Reconnecting";
    })(HubConnectionState || (HubConnectionState = {}));
    /** Represents a connection to a SignalR Hub. */
    var HubConnection = /** @class */ (function () {
        function HubConnection(connection, logger, protocol, reconnectPolicy) {
            var _this = this;
            Arg.isRequired(connection, "connection");
            Arg.isRequired(logger, "logger");
            Arg.isRequired(protocol, "protocol");
            this.serverTimeoutInMilliseconds = DEFAULT_TIMEOUT_IN_MS;
            this.keepAliveIntervalInMilliseconds = DEFAULT_PING_INTERVAL_IN_MS;
            this.logger = logger;
            this.protocol = protocol;
            this.connection = connection;
            this.reconnectPolicy = reconnectPolicy;
            this.handshakeProtocol = new HandshakeProtocol();
            this.connection.onreceive = function (data) { return _this.processIncomingData(data); };
            this.connection.onclose = function (error) { return _this.connectionClosed(error); };
            this.callbacks = {};
            this.methods = {};
            this.closedCallbacks = [];
            this.reconnectingCallbacks = [];
            this.reconnectedCallbacks = [];
            this.invocationId = 0;
            this.receivedHandshakeResponse = false;
            this.connectionState = HubConnectionState.Disconnected;
            this.connectionStarted = false;
            this.cachedPingMessage = this.protocol.writeMessage({ type: MessageType.Ping });
        }
        /** @internal */
        // Using a public static factory method means we can have a private constructor and an _internal_
        // create method that can be used by HubConnectionBuilder. An "internal" constructor would just
        // be stripped away and the '.d.ts' file would have no constructor, which is interpreted as a
        // public parameter-less constructor.
        HubConnection.create = function (connection, logger, protocol, reconnectPolicy) {
            return new HubConnection(connection, logger, protocol, reconnectPolicy);
        };
        Object.defineProperty(HubConnection.prototype, "state", {
            /** Indicates the state of the {@link HubConnection} to the server. */
            get: function () {
                return this.connectionState;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HubConnection.prototype, "connectionId", {
            /** Represents the connection id of the {@link HubConnection} on the server. The connection id will be null when the connection is either
             *  in the disconnected state or if the negotiation step was skipped.
             */
            get: function () {
                return this.connection ? (this.connection.connectionId || null) : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HubConnection.prototype, "baseUrl", {
            /** Indicates the url of the {@link HubConnection} to the server. */
            get: function () {
                return this.connection.baseUrl || "";
            },
            /**
             * Sets a new url for the HubConnection. Note that the url can only be changed when the connection is in either the Disconnected or
             * Reconnecting states.
             * @param {string} url The url to connect to.
             */
            set: function (url) {
                if (this.connectionState !== HubConnectionState.Disconnected && this.connectionState !== HubConnectionState.Reconnecting) {
                    throw new Error("The HubConnection must be in the Disconnected or Reconnecting state to change the url.");
                }
                if (!url) {
                    throw new Error("The HubConnection url must be a valid url.");
                }
                this.connection.baseUrl = url;
            },
            enumerable: true,
            configurable: true
        });
        /** Starts the connection.
         *
         * @returns {Promise<void>} A Promise that resolves when the connection has been successfully established, or rejects with an error.
         */
        HubConnection.prototype.start = function () {
            this.startPromise = this.startWithStateTransitions();
            return this.startPromise;
        };
        HubConnection.prototype.startWithStateTransitions = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                var e_1;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.connectionState !== HubConnectionState.Disconnected) {
                                return [2 /*return*/, Promise.reject(new Error("Cannot start a HubConnection that is not in the 'Disconnected' state."))];
                            }
                            this.connectionState = HubConnectionState.Connecting;
                            this.logger.log(LogLevel.Debug, "Starting HubConnection.");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.startInternal()];
                        case 2:
                            _a.sent();
                            this.connectionState = HubConnectionState.Connected;
                            this.connectionStarted = true;
                            this.logger.log(LogLevel.Debug, "HubConnection connected successfully.");
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            this.connectionState = HubConnectionState.Disconnected;
                            this.logger.log(LogLevel.Debug, "HubConnection failed to start successfully because of error '" + e_1 + "'.");
                            return [2 /*return*/, Promise.reject(e_1)];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        HubConnection.prototype.startInternal = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                var handshakePromise, handshakeRequest, e_2;
                var _this = this;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.stopDuringStartError = undefined;
                            this.receivedHandshakeResponse = false;
                            handshakePromise = new Promise(function (resolve, reject) {
                                _this.handshakeResolver = resolve;
                                _this.handshakeRejecter = reject;
                            });
                            return [4 /*yield*/, this.connection.start(this.protocol.transferFormat)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 5, , 7]);
                            handshakeRequest = {
                                protocol: this.protocol.name,
                                version: this.protocol.version,
                            };
                            this.logger.log(LogLevel.Debug, "Sending handshake request.");
                            return [4 /*yield*/, this.sendMessage(this.handshakeProtocol.writeHandshakeRequest(handshakeRequest))];
                        case 3:
                            _a.sent();
                            this.logger.log(LogLevel.Information, "Using HubProtocol '" + this.protocol.name + "'.");
                            // defensively cleanup timeout in case we receive a message from the server before we finish start
                            this.cleanupTimeout();
                            this.resetTimeoutPeriod();
                            this.resetKeepAliveInterval();
                            return [4 /*yield*/, handshakePromise];
                        case 4:
                            _a.sent();
                            // It's important to check the stopDuringStartError instead of just relying on the handshakePromise
                            // being rejected on close, because this continuation can run after both the handshake completed successfully
                            // and the connection was closed.
                            if (this.stopDuringStartError) {
                                // It's important to throw instead of returning a rejected promise, because we don't want to allow any state
                                // transitions to occur between now and the calling code observing the exceptions. Returning a rejected promise
                                // will cause the calling continuation to get scheduled to run later.
                                throw this.stopDuringStartError;
                            }
                            return [3 /*break*/, 7];
                        case 5:
                            e_2 = _a.sent();
                            this.logger.log(LogLevel.Debug, "Hub handshake failed with error '" + e_2 + "' during start(). Stopping HubConnection.");
                            this.cleanupTimeout();
                            this.cleanupPingTimer();
                            // HttpConnection.stop() should not complete until after the onclose callback is invoked.
                            // This will transition the HubConnection to the disconnected state before HttpConnection.stop() completes.
                            return [4 /*yield*/, this.connection.stop(e_2)];
                        case 6:
                            // HttpConnection.stop() should not complete until after the onclose callback is invoked.
                            // This will transition the HubConnection to the disconnected state before HttpConnection.stop() completes.
                            _a.sent();
                            throw e_2;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        /** Stops the connection.
         *
         * @returns {Promise<void>} A Promise that resolves when the connection has been successfully terminated, or rejects with an error.
         */
        HubConnection.prototype.stop = function () {
            return __awaiter$1(this, void 0, void 0, function () {
                var startPromise, e_3;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startPromise = this.startPromise;
                            this.stopPromise = this.stopInternal();
                            return [4 /*yield*/, this.stopPromise];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            // Awaiting undefined continues immediately
                            return [4 /*yield*/, startPromise];
                        case 3:
                            // Awaiting undefined continues immediately
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            e_3 = _a.sent();
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        HubConnection.prototype.stopInternal = function (error) {
            if (this.connectionState === HubConnectionState.Disconnected) {
                this.logger.log(LogLevel.Debug, "Call to HubConnection.stop(" + error + ") ignored because it is already in the disconnected state.");
                return Promise.resolve();
            }
            if (this.connectionState === HubConnectionState.Disconnecting) {
                this.logger.log(LogLevel.Debug, "Call to HttpConnection.stop(" + error + ") ignored because the connection is already in the disconnecting state.");
                return this.stopPromise;
            }
            this.connectionState = HubConnectionState.Disconnecting;
            this.logger.log(LogLevel.Debug, "Stopping HubConnection.");
            if (this.reconnectDelayHandle) {
                // We're in a reconnect delay which means the underlying connection is currently already stopped.
                // Just clear the handle to stop the reconnect loop (which no one is waiting on thankfully) and
                // fire the onclose callbacks.
                this.logger.log(LogLevel.Debug, "Connection stopped during reconnect delay. Done reconnecting.");
                clearTimeout(this.reconnectDelayHandle);
                this.reconnectDelayHandle = undefined;
                this.completeClose();
                return Promise.resolve();
            }
            this.cleanupTimeout();
            this.cleanupPingTimer();
            this.stopDuringStartError = error || new Error("The connection was stopped before the hub handshake could complete.");
            // HttpConnection.stop() should not complete until after either HttpConnection.start() fails
            // or the onclose callback is invoked. The onclose callback will transition the HubConnection
            // to the disconnected state if need be before HttpConnection.stop() completes.
            return this.connection.stop(error);
        };
        /** Invokes a streaming hub method on the server using the specified name and arguments.
         *
         * @typeparam T The type of the items returned by the server.
         * @param {string} methodName The name of the server method to invoke.
         * @param {any[]} args The arguments used to invoke the server method.
         * @returns {IStreamResult<T>} An object that yields results from the server as they are received.
         */
        HubConnection.prototype.stream = function (methodName) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _a = this.replaceStreamingParams(args), streams = _a[0], streamIds = _a[1];
            var invocationDescriptor = this.createStreamInvocation(methodName, args, streamIds);
            var promiseQueue;
            var subject = new Subject();
            subject.cancelCallback = function () {
                var cancelInvocation = _this.createCancelInvocation(invocationDescriptor.invocationId);
                delete _this.callbacks[invocationDescriptor.invocationId];
                return promiseQueue.then(function () {
                    return _this.sendWithProtocol(cancelInvocation);
                });
            };
            this.callbacks[invocationDescriptor.invocationId] = function (invocationEvent, error) {
                if (error) {
                    subject.error(error);
                    return;
                }
                else if (invocationEvent) {
                    // invocationEvent will not be null when an error is not passed to the callback
                    if (invocationEvent.type === MessageType.Completion) {
                        if (invocationEvent.error) {
                            subject.error(new Error(invocationEvent.error));
                        }
                        else {
                            subject.complete();
                        }
                    }
                    else {
                        subject.next((invocationEvent.item));
                    }
                }
            };
            promiseQueue = this.sendWithProtocol(invocationDescriptor)
                .catch(function (e) {
                subject.error(e);
                delete _this.callbacks[invocationDescriptor.invocationId];
            });
            this.launchStreams(streams, promiseQueue);
            return subject;
        };
        HubConnection.prototype.sendMessage = function (message) {
            this.resetKeepAliveInterval();
            return this.connection.send(message);
        };
        /**
         * Sends a js object to the server.
         * @param message The js object to serialize and send.
         */
        HubConnection.prototype.sendWithProtocol = function (message) {
            return this.sendMessage(this.protocol.writeMessage(message));
        };
        /** Invokes a hub method on the server using the specified name and arguments. Does not wait for a response from the receiver.
         *
         * The Promise returned by this method resolves when the client has sent the invocation to the server. The server may still
         * be processing the invocation.
         *
         * @param {string} methodName The name of the server method to invoke.
         * @param {any[]} args The arguments used to invoke the server method.
         * @returns {Promise<void>} A Promise that resolves when the invocation has been successfully sent, or rejects with an error.
         */
        HubConnection.prototype.send = function (methodName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _a = this.replaceStreamingParams(args), streams = _a[0], streamIds = _a[1];
            var sendPromise = this.sendWithProtocol(this.createInvocation(methodName, args, true, streamIds));
            this.launchStreams(streams, sendPromise);
            return sendPromise;
        };
        /** Invokes a hub method on the server using the specified name and arguments.
         *
         * The Promise returned by this method resolves when the server indicates it has finished invoking the method. When the promise
         * resolves, the server has finished invoking the method. If the server method returns a result, it is produced as the result of
         * resolving the Promise.
         *
         * @typeparam T The expected return type.
         * @param {string} methodName The name of the server method to invoke.
         * @param {any[]} args The arguments used to invoke the server method.
         * @returns {Promise<T>} A Promise that resolves with the result of the server method (if any), or rejects with an error.
         */
        HubConnection.prototype.invoke = function (methodName) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _a = this.replaceStreamingParams(args), streams = _a[0], streamIds = _a[1];
            var invocationDescriptor = this.createInvocation(methodName, args, false, streamIds);
            var p = new Promise(function (resolve, reject) {
                // invocationId will always have a value for a non-blocking invocation
                _this.callbacks[invocationDescriptor.invocationId] = function (invocationEvent, error) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    else if (invocationEvent) {
                        // invocationEvent will not be null when an error is not passed to the callback
                        if (invocationEvent.type === MessageType.Completion) {
                            if (invocationEvent.error) {
                                reject(new Error(invocationEvent.error));
                            }
                            else {
                                resolve(invocationEvent.result);
                            }
                        }
                        else {
                            reject(new Error("Unexpected message type: " + invocationEvent.type));
                        }
                    }
                };
                var promiseQueue = _this.sendWithProtocol(invocationDescriptor)
                    .catch(function (e) {
                    reject(e);
                    // invocationId will always have a value for a non-blocking invocation
                    delete _this.callbacks[invocationDescriptor.invocationId];
                });
                _this.launchStreams(streams, promiseQueue);
            });
            return p;
        };
        /** Registers a handler that will be invoked when the hub method with the specified method name is invoked.
         *
         * @param {string} methodName The name of the hub method to define.
         * @param {Function} newMethod The handler that will be raised when the hub method is invoked.
         */
        HubConnection.prototype.on = function (methodName, newMethod) {
            if (!methodName || !newMethod) {
                return;
            }
            methodName = methodName.toLowerCase();
            if (!this.methods[methodName]) {
                this.methods[methodName] = [];
            }
            // Preventing adding the same handler multiple times.
            if (this.methods[methodName].indexOf(newMethod) !== -1) {
                return;
            }
            this.methods[methodName].push(newMethod);
        };
        HubConnection.prototype.off = function (methodName, method) {
            if (!methodName) {
                return;
            }
            methodName = methodName.toLowerCase();
            var handlers = this.methods[methodName];
            if (!handlers) {
                return;
            }
            if (method) {
                var removeIdx = handlers.indexOf(method);
                if (removeIdx !== -1) {
                    handlers.splice(removeIdx, 1);
                    if (handlers.length === 0) {
                        delete this.methods[methodName];
                    }
                }
            }
            else {
                delete this.methods[methodName];
            }
        };
        /** Registers a handler that will be invoked when the connection is closed.
         *
         * @param {Function} callback The handler that will be invoked when the connection is closed. Optionally receives a single argument containing the error that caused the connection to close (if any).
         */
        HubConnection.prototype.onclose = function (callback) {
            if (callback) {
                this.closedCallbacks.push(callback);
            }
        };
        /** Registers a handler that will be invoked when the connection starts reconnecting.
         *
         * @param {Function} callback The handler that will be invoked when the connection starts reconnecting. Optionally receives a single argument containing the error that caused the connection to start reconnecting (if any).
         */
        HubConnection.prototype.onreconnecting = function (callback) {
            if (callback) {
                this.reconnectingCallbacks.push(callback);
            }
        };
        /** Registers a handler that will be invoked when the connection successfully reconnects.
         *
         * @param {Function} callback The handler that will be invoked when the connection successfully reconnects.
         */
        HubConnection.prototype.onreconnected = function (callback) {
            if (callback) {
                this.reconnectedCallbacks.push(callback);
            }
        };
        HubConnection.prototype.processIncomingData = function (data) {
            this.cleanupTimeout();
            if (!this.receivedHandshakeResponse) {
                data = this.processHandshakeResponse(data);
                this.receivedHandshakeResponse = true;
            }
            // Data may have all been read when processing handshake response
            if (data) {
                // Parse the messages
                var messages = this.protocol.parseMessages(data, this.logger);
                for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                    var message = messages_1[_i];
                    switch (message.type) {
                        case MessageType.Invocation:
                            this.invokeClientMethod(message);
                            break;
                        case MessageType.StreamItem:
                        case MessageType.Completion:
                            var callback = this.callbacks[message.invocationId];
                            if (callback) {
                                if (message.type === MessageType.Completion) {
                                    delete this.callbacks[message.invocationId];
                                }
                                callback(message);
                            }
                            break;
                        case MessageType.Ping:
                            // Don't care about pings
                            break;
                        case MessageType.Close:
                            this.logger.log(LogLevel.Information, "Close message received from server.");
                            var error = message.error ? new Error("Server returned an error on close: " + message.error) : undefined;
                            if (message.allowReconnect === true) {
                                // It feels wrong not to await connection.stop() here, but processIncomingData is called as part of an onreceive callback which is not async,
                                // this is already the behavior for serverTimeout(), and HttpConnection.Stop() should catch and log all possible exceptions.
                                // tslint:disable-next-line:no-floating-promises
                                this.connection.stop(error);
                            }
                            else {
                                // We cannot await stopInternal() here, but subsequent calls to stop() will await this if stopInternal() is still ongoing.
                                this.stopPromise = this.stopInternal(error);
                            }
                            break;
                        default:
                            this.logger.log(LogLevel.Warning, "Invalid message type: " + message.type + ".");
                            break;
                    }
                }
            }
            this.resetTimeoutPeriod();
        };
        HubConnection.prototype.processHandshakeResponse = function (data) {
            var _a;
            var responseMessage;
            var remainingData;
            try {
                _a = this.handshakeProtocol.parseHandshakeResponse(data), remainingData = _a[0], responseMessage = _a[1];
            }
            catch (e) {
                var message = "Error parsing handshake response: " + e;
                this.logger.log(LogLevel.Error, message);
                var error = new Error(message);
                this.handshakeRejecter(error);
                throw error;
            }
            if (responseMessage.error) {
                var message = "Server returned handshake error: " + responseMessage.error;
                this.logger.log(LogLevel.Error, message);
                var error = new Error(message);
                this.handshakeRejecter(error);
                throw error;
            }
            else {
                this.logger.log(LogLevel.Debug, "Server handshake complete.");
            }
            this.handshakeResolver();
            return remainingData;
        };
        HubConnection.prototype.resetKeepAliveInterval = function () {
            var _this = this;
            this.cleanupPingTimer();
            this.pingServerHandle = setTimeout(function () { return __awaiter$1(_this, void 0, void 0, function () {
                var _a;
                return __generator$1(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(this.connectionState === HubConnectionState.Connected)) return [3 /*break*/, 4];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.sendMessage(this.cachedPingMessage)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            // We don't care about the error. It should be seen elsewhere in the client.
                            // The connection is probably in a bad or closed state now, cleanup the timer so it stops triggering
                            this.cleanupPingTimer();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }, this.keepAliveIntervalInMilliseconds);
        };
        HubConnection.prototype.resetTimeoutPeriod = function () {
            var _this = this;
            if (!this.connection.features || !this.connection.features.inherentKeepAlive) {
                // Set the timeout timer
                this.timeoutHandle = setTimeout(function () { return _this.serverTimeout(); }, this.serverTimeoutInMilliseconds);
            }
        };
        HubConnection.prototype.serverTimeout = function () {
            // The server hasn't talked to us in a while. It doesn't like us anymore ... :(
            // Terminate the connection, but we don't need to wait on the promise. This could trigger reconnecting.
            // tslint:disable-next-line:no-floating-promises
            this.connection.stop(new Error("Server timeout elapsed without receiving a message from the server."));
        };
        HubConnection.prototype.invokeClientMethod = function (invocationMessage) {
            var _this = this;
            var methods = this.methods[invocationMessage.target.toLowerCase()];
            if (methods) {
                try {
                    methods.forEach(function (m) { return m.apply(_this, invocationMessage.arguments); });
                }
                catch (e) {
                    this.logger.log(LogLevel.Error, "A callback for the method " + invocationMessage.target.toLowerCase() + " threw error '" + e + "'.");
                }
                if (invocationMessage.invocationId) {
                    // This is not supported in v1. So we return an error to avoid blocking the server waiting for the response.
                    var message = "Server requested a response, which is not supported in this version of the client.";
                    this.logger.log(LogLevel.Error, message);
                    // We don't want to wait on the stop itself.
                    this.stopPromise = this.stopInternal(new Error(message));
                }
            }
            else {
                this.logger.log(LogLevel.Warning, "No client method with the name '" + invocationMessage.target + "' found.");
            }
        };
        HubConnection.prototype.connectionClosed = function (error) {
            this.logger.log(LogLevel.Debug, "HubConnection.connectionClosed(" + error + ") called while in state " + this.connectionState + ".");
            // Triggering this.handshakeRejecter is insufficient because it could already be resolved without the continuation having run yet.
            this.stopDuringStartError = this.stopDuringStartError || error || new Error("The underlying connection was closed before the hub handshake could complete.");
            // If the handshake is in progress, start will be waiting for the handshake promise, so we complete it.
            // If it has already completed, this should just noop.
            if (this.handshakeResolver) {
                this.handshakeResolver();
            }
            this.cancelCallbacksWithError(error || new Error("Invocation canceled due to the underlying connection being closed."));
            this.cleanupTimeout();
            this.cleanupPingTimer();
            if (this.connectionState === HubConnectionState.Disconnecting) {
                this.completeClose(error);
            }
            else if (this.connectionState === HubConnectionState.Connected && this.reconnectPolicy) {
                // tslint:disable-next-line:no-floating-promises
                this.reconnect(error);
            }
            else if (this.connectionState === HubConnectionState.Connected) {
                this.completeClose(error);
            }
            // If none of the above if conditions were true were called the HubConnection must be in either:
            // 1. The Connecting state in which case the handshakeResolver will complete it and stopDuringStartError will fail it.
            // 2. The Reconnecting state in which case the handshakeResolver will complete it and stopDuringStartError will fail the current reconnect attempt
            //    and potentially continue the reconnect() loop.
            // 3. The Disconnected state in which case we're already done.
        };
        HubConnection.prototype.completeClose = function (error) {
            var _this = this;
            if (this.connectionStarted) {
                this.connectionState = HubConnectionState.Disconnected;
                this.connectionStarted = false;
                try {
                    this.closedCallbacks.forEach(function (c) { return c.apply(_this, [error]); });
                }
                catch (e) {
                    this.logger.log(LogLevel.Error, "An onclose callback called with error '" + error + "' threw error '" + e + "'.");
                }
            }
        };
        HubConnection.prototype.reconnect = function (error) {
            return __awaiter$1(this, void 0, void 0, function () {
                var reconnectStartTime, previousReconnectAttempts, retryError, nextRetryDelay, e_4;
                var _this = this;
                return __generator$1(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            reconnectStartTime = Date.now();
                            previousReconnectAttempts = 0;
                            retryError = error !== undefined ? error : new Error("Attempting to reconnect due to a unknown error.");
                            nextRetryDelay = this.getNextRetryDelay(previousReconnectAttempts++, 0, retryError);
                            if (nextRetryDelay === null) {
                                this.logger.log(LogLevel.Debug, "Connection not reconnecting because the IRetryPolicy returned null on the first reconnect attempt.");
                                this.completeClose(error);
                                return [2 /*return*/];
                            }
                            this.connectionState = HubConnectionState.Reconnecting;
                            if (error) {
                                this.logger.log(LogLevel.Information, "Connection reconnecting because of error '" + error + "'.");
                            }
                            else {
                                this.logger.log(LogLevel.Information, "Connection reconnecting.");
                            }
                            if (this.onreconnecting) {
                                try {
                                    this.reconnectingCallbacks.forEach(function (c) { return c.apply(_this, [error]); });
                                }
                                catch (e) {
                                    this.logger.log(LogLevel.Error, "An onreconnecting callback called with error '" + error + "' threw error '" + e + "'.");
                                }
                                // Exit early if an onreconnecting callback called connection.stop().
                                if (this.connectionState !== HubConnectionState.Reconnecting) {
                                    this.logger.log(LogLevel.Debug, "Connection left the reconnecting state in onreconnecting callback. Done reconnecting.");
                                    return [2 /*return*/];
                                }
                            }
                            _a.label = 1;
                        case 1:
                            if (!(nextRetryDelay !== null)) return [3 /*break*/, 7];
                            this.logger.log(LogLevel.Information, "Reconnect attempt number " + previousReconnectAttempts + " will start in " + nextRetryDelay + " ms.");
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    _this.reconnectDelayHandle = setTimeout(resolve, nextRetryDelay);
                                })];
                        case 2:
                            _a.sent();
                            this.reconnectDelayHandle = undefined;
                            if (this.connectionState !== HubConnectionState.Reconnecting) {
                                this.logger.log(LogLevel.Debug, "Connection left the reconnecting state during reconnect delay. Done reconnecting.");
                                return [2 /*return*/];
                            }
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, this.startInternal()];
                        case 4:
                            _a.sent();
                            this.connectionState = HubConnectionState.Connected;
                            this.logger.log(LogLevel.Information, "HubConnection reconnected successfully.");
                            if (this.onreconnected) {
                                try {
                                    this.reconnectedCallbacks.forEach(function (c) { return c.apply(_this, [_this.connection.connectionId]); });
                                }
                                catch (e) {
                                    this.logger.log(LogLevel.Error, "An onreconnected callback called with connectionId '" + this.connection.connectionId + "; threw error '" + e + "'.");
                                }
                            }
                            return [2 /*return*/];
                        case 5:
                            e_4 = _a.sent();
                            this.logger.log(LogLevel.Information, "Reconnect attempt failed because of error '" + e_4 + "'.");
                            if (this.connectionState !== HubConnectionState.Reconnecting) {
                                this.logger.log(LogLevel.Debug, "Connection left the reconnecting state during reconnect attempt. Done reconnecting.");
                                return [2 /*return*/];
                            }
                            retryError = e_4 instanceof Error ? e_4 : new Error(e_4.toString());
                            nextRetryDelay = this.getNextRetryDelay(previousReconnectAttempts++, Date.now() - reconnectStartTime, retryError);
                            return [3 /*break*/, 6];
                        case 6: return [3 /*break*/, 1];
                        case 7:
                            this.logger.log(LogLevel.Information, "Reconnect retries have been exhausted after " + (Date.now() - reconnectStartTime) + " ms and " + previousReconnectAttempts + " failed attempts. Connection disconnecting.");
                            this.completeClose();
                            return [2 /*return*/];
                    }
                });
            });
        };
        HubConnection.prototype.getNextRetryDelay = function (previousRetryCount, elapsedMilliseconds, retryReason) {
            try {
                return this.reconnectPolicy.nextRetryDelayInMilliseconds({
                    elapsedMilliseconds: elapsedMilliseconds,
                    previousRetryCount: previousRetryCount,
                    retryReason: retryReason,
                });
            }
            catch (e) {
                this.logger.log(LogLevel.Error, "IRetryPolicy.nextRetryDelayInMilliseconds(" + previousRetryCount + ", " + elapsedMilliseconds + ") threw error '" + e + "'.");
                return null;
            }
        };
        HubConnection.prototype.cancelCallbacksWithError = function (error) {
            var callbacks = this.callbacks;
            this.callbacks = {};
            Object.keys(callbacks)
                .forEach(function (key) {
                var callback = callbacks[key];
                callback(null, error);
            });
        };
        HubConnection.prototype.cleanupPingTimer = function () {
            if (this.pingServerHandle) {
                clearTimeout(this.pingServerHandle);
            }
        };
        HubConnection.prototype.cleanupTimeout = function () {
            if (this.timeoutHandle) {
                clearTimeout(this.timeoutHandle);
            }
        };
        HubConnection.prototype.createInvocation = function (methodName, args, nonblocking, streamIds) {
            if (nonblocking) {
                return {
                    arguments: args,
                    streamIds: streamIds,
                    target: methodName,
                    type: MessageType.Invocation,
                };
            }
            else {
                var invocationId = this.invocationId;
                this.invocationId++;
                return {
                    arguments: args,
                    invocationId: invocationId.toString(),
                    streamIds: streamIds,
                    target: methodName,
                    type: MessageType.Invocation,
                };
            }
        };
        HubConnection.prototype.launchStreams = function (streams, promiseQueue) {
            var _this = this;
            if (streams.length === 0) {
                return;
            }
            // Synchronize stream data so they arrive in-order on the server
            if (!promiseQueue) {
                promiseQueue = Promise.resolve();
            }
            var _loop_1 = function (streamId) {
                streams[streamId].subscribe({
                    complete: function () {
                        promiseQueue = promiseQueue.then(function () { return _this.sendWithProtocol(_this.createCompletionMessage(streamId)); });
                    },
                    error: function (err) {
                        var message;
                        if (err instanceof Error) {
                            message = err.message;
                        }
                        else if (err && err.toString) {
                            message = err.toString();
                        }
                        else {
                            message = "Unknown error";
                        }
                        promiseQueue = promiseQueue.then(function () { return _this.sendWithProtocol(_this.createCompletionMessage(streamId, message)); });
                    },
                    next: function (item) {
                        promiseQueue = promiseQueue.then(function () { return _this.sendWithProtocol(_this.createStreamItemMessage(streamId, item)); });
                    },
                });
            };
            // We want to iterate over the keys, since the keys are the stream ids
            // tslint:disable-next-line:forin
            for (var streamId in streams) {
                _loop_1(streamId);
            }
        };
        HubConnection.prototype.replaceStreamingParams = function (args) {
            var streams = [];
            var streamIds = [];
            for (var i = 0; i < args.length; i++) {
                var argument = args[i];
                if (this.isObservable(argument)) {
                    var streamId = this.invocationId;
                    this.invocationId++;
                    // Store the stream for later use
                    streams[streamId] = argument;
                    streamIds.push(streamId.toString());
                    // remove stream from args
                    args.splice(i, 1);
                }
            }
            return [streams, streamIds];
        };
        HubConnection.prototype.isObservable = function (arg) {
            // This allows other stream implementations to just work (like rxjs)
            return arg && arg.subscribe && typeof arg.subscribe === "function";
        };
        HubConnection.prototype.createStreamInvocation = function (methodName, args, streamIds) {
            var invocationId = this.invocationId;
            this.invocationId++;
            return {
                arguments: args,
                invocationId: invocationId.toString(),
                streamIds: streamIds,
                target: methodName,
                type: MessageType.StreamInvocation,
            };
        };
        HubConnection.prototype.createCancelInvocation = function (id) {
            return {
                invocationId: id,
                type: MessageType.CancelInvocation,
            };
        };
        HubConnection.prototype.createStreamItemMessage = function (id, item) {
            return {
                invocationId: id,
                item: item,
                type: MessageType.StreamItem,
            };
        };
        HubConnection.prototype.createCompletionMessage = function (id, error, result) {
            if (error) {
                return {
                    error: error,
                    invocationId: id,
                    type: MessageType.Completion,
                };
            }
            return {
                invocationId: id,
                result: result,
                type: MessageType.Completion,
            };
        };
        return HubConnection;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    // 0, 2, 10, 30 second delays before reconnect attempts.
    var DEFAULT_RETRY_DELAYS_IN_MILLISECONDS = [0, 2000, 10000, 30000, null];
    /** @private */
    var DefaultReconnectPolicy = /** @class */ (function () {
        function DefaultReconnectPolicy(retryDelays) {
            this.retryDelays = retryDelays !== undefined ? retryDelays.concat([null]) : DEFAULT_RETRY_DELAYS_IN_MILLISECONDS;
        }
        DefaultReconnectPolicy.prototype.nextRetryDelayInMilliseconds = function (retryContext) {
            return this.retryDelays[retryContext.previousRetryCount];
        };
        return DefaultReconnectPolicy;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    // This will be treated as a bit flag in the future, so we keep it using power-of-two values.
    /** Specifies a specific HTTP transport type. */
    var HttpTransportType;
    (function (HttpTransportType) {
        /** Specifies no transport preference. */
        HttpTransportType[HttpTransportType["None"] = 0] = "None";
        /** Specifies the WebSockets transport. */
        HttpTransportType[HttpTransportType["WebSockets"] = 1] = "WebSockets";
        /** Specifies the Server-Sent Events transport. */
        HttpTransportType[HttpTransportType["ServerSentEvents"] = 2] = "ServerSentEvents";
        /** Specifies the Long Polling transport. */
        HttpTransportType[HttpTransportType["LongPolling"] = 4] = "LongPolling";
    })(HttpTransportType || (HttpTransportType = {}));
    /** Specifies the transfer format for a connection. */
    var TransferFormat;
    (function (TransferFormat) {
        /** Specifies that only text data will be transmitted over the connection. */
        TransferFormat[TransferFormat["Text"] = 1] = "Text";
        /** Specifies that binary data will be transmitted over the connection. */
        TransferFormat[TransferFormat["Binary"] = 2] = "Binary";
    })(TransferFormat || (TransferFormat = {}));

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    // Rough polyfill of https://developer.mozilla.org/en-US/docs/Web/API/AbortController
    // We don't actually ever use the API being polyfilled, we always use the polyfill because
    // it's a very new API right now.
    // Not exported from index.
    /** @private */
    var AbortController = /** @class */ (function () {
        function AbortController() {
            this.isAborted = false;
            this.onabort = null;
        }
        AbortController.prototype.abort = function () {
            if (!this.isAborted) {
                this.isAborted = true;
                if (this.onabort) {
                    this.onabort();
                }
            }
        };
        Object.defineProperty(AbortController.prototype, "signal", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbortController.prototype, "aborted", {
            get: function () {
                return this.isAborted;
            },
            enumerable: true,
            configurable: true
        });
        return AbortController;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$2 = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    // Not exported from 'index', this type is internal.
    /** @private */
    var LongPollingTransport = /** @class */ (function () {
        function LongPollingTransport(httpClient, accessTokenFactory, logger, logMessageContent) {
            this.httpClient = httpClient;
            this.accessTokenFactory = accessTokenFactory;
            this.logger = logger;
            this.pollAbort = new AbortController();
            this.logMessageContent = logMessageContent;
            this.running = false;
            this.onreceive = null;
            this.onclose = null;
        }
        Object.defineProperty(LongPollingTransport.prototype, "pollAborted", {
            // This is an internal type, not exported from 'index' so this is really just internal.
            get: function () {
                return this.pollAbort.aborted;
            },
            enumerable: true,
            configurable: true
        });
        LongPollingTransport.prototype.connect = function (url, transferFormat) {
            return __awaiter$2(this, void 0, void 0, function () {
                var pollOptions, token, pollUrl, response;
                return __generator$2(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Arg.isRequired(url, "url");
                            Arg.isRequired(transferFormat, "transferFormat");
                            Arg.isIn(transferFormat, TransferFormat, "transferFormat");
                            this.url = url;
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) Connecting.");
                            // Allow binary format on Node and Browsers that support binary content (indicated by the presence of responseType property)
                            if (transferFormat === TransferFormat.Binary &&
                                (typeof XMLHttpRequest !== "undefined" && typeof new XMLHttpRequest().responseType !== "string")) {
                                throw new Error("Binary protocols over XmlHttpRequest not implementing advanced features are not supported.");
                            }
                            pollOptions = {
                                abortSignal: this.pollAbort.signal,
                                headers: {},
                                timeout: 100000,
                            };
                            if (transferFormat === TransferFormat.Binary) {
                                pollOptions.responseType = "arraybuffer";
                            }
                            return [4 /*yield*/, this.getAccessToken()];
                        case 1:
                            token = _a.sent();
                            this.updateHeaderToken(pollOptions, token);
                            pollUrl = url + "&_=" + Date.now();
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) polling: " + pollUrl + ".");
                            return [4 /*yield*/, this.httpClient.get(pollUrl, pollOptions)];
                        case 2:
                            response = _a.sent();
                            if (response.statusCode !== 200) {
                                this.logger.log(LogLevel.Error, "(LongPolling transport) Unexpected response code: " + response.statusCode + ".");
                                // Mark running as false so that the poll immediately ends and runs the close logic
                                this.closeError = new HttpError(response.statusText || "", response.statusCode);
                                this.running = false;
                            }
                            else {
                                this.running = true;
                            }
                            this.receiving = this.poll(this.url, pollOptions);
                            return [2 /*return*/];
                    }
                });
            });
        };
        LongPollingTransport.prototype.getAccessToken = function () {
            return __awaiter$2(this, void 0, void 0, function () {
                return __generator$2(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.accessTokenFactory) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.accessTokenFactory()];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2: return [2 /*return*/, null];
                    }
                });
            });
        };
        LongPollingTransport.prototype.updateHeaderToken = function (request, token) {
            if (!request.headers) {
                request.headers = {};
            }
            if (token) {
                // tslint:disable-next-line:no-string-literal
                request.headers["Authorization"] = "Bearer " + token;
                return;
            }
            // tslint:disable-next-line:no-string-literal
            if (request.headers["Authorization"]) {
                // tslint:disable-next-line:no-string-literal
                delete request.headers["Authorization"];
            }
        };
        LongPollingTransport.prototype.poll = function (url, pollOptions) {
            return __awaiter$2(this, void 0, void 0, function () {
                var token, pollUrl, response, e_1;
                return __generator$2(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, , 8, 9]);
                            _a.label = 1;
                        case 1:
                            if (!this.running) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.getAccessToken()];
                        case 2:
                            token = _a.sent();
                            this.updateHeaderToken(pollOptions, token);
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            pollUrl = url + "&_=" + Date.now();
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) polling: " + pollUrl + ".");
                            return [4 /*yield*/, this.httpClient.get(pollUrl, pollOptions)];
                        case 4:
                            response = _a.sent();
                            if (response.statusCode === 204) {
                                this.logger.log(LogLevel.Information, "(LongPolling transport) Poll terminated by server.");
                                this.running = false;
                            }
                            else if (response.statusCode !== 200) {
                                this.logger.log(LogLevel.Error, "(LongPolling transport) Unexpected response code: " + response.statusCode + ".");
                                // Unexpected status code
                                this.closeError = new HttpError(response.statusText || "", response.statusCode);
                                this.running = false;
                            }
                            else {
                                // Process the response
                                if (response.content) {
                                    this.logger.log(LogLevel.Trace, "(LongPolling transport) data received. " + getDataDetail(response.content, this.logMessageContent) + ".");
                                    if (this.onreceive) {
                                        this.onreceive(response.content);
                                    }
                                }
                                else {
                                    // This is another way timeout manifest.
                                    this.logger.log(LogLevel.Trace, "(LongPolling transport) Poll timed out, reissuing.");
                                }
                            }
                            return [3 /*break*/, 6];
                        case 5:
                            e_1 = _a.sent();
                            if (!this.running) {
                                // Log but disregard errors that occur after stopping
                                this.logger.log(LogLevel.Trace, "(LongPolling transport) Poll errored after shutdown: " + e_1.message);
                            }
                            else {
                                if (e_1 instanceof TimeoutError) {
                                    // Ignore timeouts and reissue the poll.
                                    this.logger.log(LogLevel.Trace, "(LongPolling transport) Poll timed out, reissuing.");
                                }
                                else {
                                    // Close the connection with the error as the result.
                                    this.closeError = e_1;
                                    this.running = false;
                                }
                            }
                            return [3 /*break*/, 6];
                        case 6: return [3 /*break*/, 1];
                        case 7: return [3 /*break*/, 9];
                        case 8:
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) Polling complete.");
                            // We will reach here with pollAborted==false when the server returned a response causing the transport to stop.
                            // If pollAborted==true then client initiated the stop and the stop method will raise the close event after DELETE is sent.
                            if (!this.pollAborted) {
                                this.raiseOnClose();
                            }
                            return [7 /*endfinally*/];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        LongPollingTransport.prototype.send = function (data) {
            return __awaiter$2(this, void 0, void 0, function () {
                return __generator$2(this, function (_a) {
                    if (!this.running) {
                        return [2 /*return*/, Promise.reject(new Error("Cannot send until the transport is connected"))];
                    }
                    return [2 /*return*/, sendMessage(this.logger, "LongPolling", this.httpClient, this.url, this.accessTokenFactory, data, this.logMessageContent)];
                });
            });
        };
        LongPollingTransport.prototype.stop = function () {
            return __awaiter$2(this, void 0, void 0, function () {
                var deleteOptions, token;
                return __generator$2(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) Stopping polling.");
                            // Tell receiving loop to stop, abort any current request, and then wait for it to finish
                            this.running = false;
                            this.pollAbort.abort();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, , 5, 6]);
                            return [4 /*yield*/, this.receiving];
                        case 2:
                            _a.sent();
                            // Send DELETE to clean up long polling on the server
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) sending DELETE request to " + this.url + ".");
                            deleteOptions = {
                                headers: {},
                            };
                            return [4 /*yield*/, this.getAccessToken()];
                        case 3:
                            token = _a.sent();
                            this.updateHeaderToken(deleteOptions, token);
                            return [4 /*yield*/, this.httpClient.delete(this.url, deleteOptions)];
                        case 4:
                            _a.sent();
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) DELETE request sent.");
                            return [3 /*break*/, 6];
                        case 5:
                            this.logger.log(LogLevel.Trace, "(LongPolling transport) Stop finished.");
                            // Raise close event here instead of in polling
                            // It needs to happen after the DELETE request is sent
                            this.raiseOnClose();
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        LongPollingTransport.prototype.raiseOnClose = function () {
            if (this.onclose) {
                var logMessage = "(LongPolling transport) Firing onclose event.";
                if (this.closeError) {
                    logMessage += " Error: " + this.closeError;
                }
                this.logger.log(LogLevel.Trace, logMessage);
                this.onclose(this.closeError);
            }
        };
        return LongPollingTransport;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$3 = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /** @private */
    var ServerSentEventsTransport = /** @class */ (function () {
        function ServerSentEventsTransport(httpClient, accessTokenFactory, logger, logMessageContent, eventSourceConstructor) {
            this.httpClient = httpClient;
            this.accessTokenFactory = accessTokenFactory;
            this.logger = logger;
            this.logMessageContent = logMessageContent;
            this.eventSourceConstructor = eventSourceConstructor;
            this.onreceive = null;
            this.onclose = null;
        }
        ServerSentEventsTransport.prototype.connect = function (url, transferFormat) {
            return __awaiter$3(this, void 0, void 0, function () {
                var token;
                var _this = this;
                return __generator$3(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Arg.isRequired(url, "url");
                            Arg.isRequired(transferFormat, "transferFormat");
                            Arg.isIn(transferFormat, TransferFormat, "transferFormat");
                            this.logger.log(LogLevel.Trace, "(SSE transport) Connecting.");
                            // set url before accessTokenFactory because this.url is only for send and we set the auth header instead of the query string for send
                            this.url = url;
                            if (!this.accessTokenFactory) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.accessTokenFactory()];
                        case 1:
                            token = _a.sent();
                            if (token) {
                                url += (url.indexOf("?") < 0 ? "?" : "&") + ("access_token=" + encodeURIComponent(token));
                            }
                            _a.label = 2;
                        case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                                var opened = false;
                                if (transferFormat !== TransferFormat.Text) {
                                    reject(new Error("The Server-Sent Events transport only supports the 'Text' transfer format"));
                                    return;
                                }
                                var eventSource;
                                if (Platform.isBrowser || Platform.isWebWorker) {
                                    eventSource = new _this.eventSourceConstructor(url, { withCredentials: true });
                                }
                                else {
                                    // Non-browser passes cookies via the dictionary
                                    var cookies = _this.httpClient.getCookieString(url);
                                    eventSource = new _this.eventSourceConstructor(url, { withCredentials: true, headers: { Cookie: cookies } });
                                }
                                try {
                                    eventSource.onmessage = function (e) {
                                        if (_this.onreceive) {
                                            try {
                                                _this.logger.log(LogLevel.Trace, "(SSE transport) data received. " + getDataDetail(e.data, _this.logMessageContent) + ".");
                                                _this.onreceive(e.data);
                                            }
                                            catch (error) {
                                                _this.close(error);
                                                return;
                                            }
                                        }
                                    };
                                    eventSource.onerror = function (e) {
                                        var error = new Error(e.data || "Error occurred");
                                        if (opened) {
                                            _this.close(error);
                                        }
                                        else {
                                            reject(error);
                                        }
                                    };
                                    eventSource.onopen = function () {
                                        _this.logger.log(LogLevel.Information, "SSE connected to " + _this.url);
                                        _this.eventSource = eventSource;
                                        opened = true;
                                        resolve();
                                    };
                                }
                                catch (e) {
                                    reject(e);
                                    return;
                                }
                            })];
                    }
                });
            });
        };
        ServerSentEventsTransport.prototype.send = function (data) {
            return __awaiter$3(this, void 0, void 0, function () {
                return __generator$3(this, function (_a) {
                    if (!this.eventSource) {
                        return [2 /*return*/, Promise.reject(new Error("Cannot send until the transport is connected"))];
                    }
                    return [2 /*return*/, sendMessage(this.logger, "SSE", this.httpClient, this.url, this.accessTokenFactory, data, this.logMessageContent)];
                });
            });
        };
        ServerSentEventsTransport.prototype.stop = function () {
            this.close();
            return Promise.resolve();
        };
        ServerSentEventsTransport.prototype.close = function (e) {
            if (this.eventSource) {
                this.eventSource.close();
                this.eventSource = undefined;
                if (this.onclose) {
                    this.onclose(e);
                }
            }
        };
        return ServerSentEventsTransport;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$4 = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /** @private */
    var WebSocketTransport = /** @class */ (function () {
        function WebSocketTransport(httpClient, accessTokenFactory, logger, logMessageContent, webSocketConstructor) {
            this.logger = logger;
            this.accessTokenFactory = accessTokenFactory;
            this.logMessageContent = logMessageContent;
            this.webSocketConstructor = webSocketConstructor;
            this.httpClient = httpClient;
            this.onreceive = null;
            this.onclose = null;
        }
        WebSocketTransport.prototype.connect = function (url, transferFormat) {
            return __awaiter$4(this, void 0, void 0, function () {
                var token;
                var _this = this;
                return __generator$4(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Arg.isRequired(url, "url");
                            Arg.isRequired(transferFormat, "transferFormat");
                            Arg.isIn(transferFormat, TransferFormat, "transferFormat");
                            this.logger.log(LogLevel.Trace, "(WebSockets transport) Connecting.");
                            if (!this.accessTokenFactory) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.accessTokenFactory()];
                        case 1:
                            token = _a.sent();
                            if (token) {
                                url += (url.indexOf("?") < 0 ? "?" : "&") + ("access_token=" + encodeURIComponent(token));
                            }
                            _a.label = 2;
                        case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                                url = url.replace(/^http/, "ws");
                                var webSocket;
                                var cookies = _this.httpClient.getCookieString(url);
                                var opened = false;
                                if (Platform.isNode && cookies) {
                                    // Only pass cookies when in non-browser environments
                                    webSocket = new _this.webSocketConstructor(url, undefined, {
                                        headers: {
                                            Cookie: "" + cookies,
                                        },
                                    });
                                }
                                if (!webSocket) {
                                    // Chrome is not happy with passing 'undefined' as protocol
                                    webSocket = new _this.webSocketConstructor(url);
                                }
                                if (transferFormat === TransferFormat.Binary) {
                                    webSocket.binaryType = "arraybuffer";
                                }
                                // tslint:disable-next-line:variable-name
                                webSocket.onopen = function (_event) {
                                    _this.logger.log(LogLevel.Information, "WebSocket connected to " + url + ".");
                                    _this.webSocket = webSocket;
                                    opened = true;
                                    resolve();
                                };
                                webSocket.onerror = function (event) {
                                    var error = null;
                                    // ErrorEvent is a browser only type we need to check if the type exists before using it
                                    if (typeof ErrorEvent !== "undefined" && event instanceof ErrorEvent) {
                                        error = event.error;
                                    }
                                    else {
                                        error = new Error("There was an error with the transport.");
                                    }
                                    reject(error);
                                };
                                webSocket.onmessage = function (message) {
                                    _this.logger.log(LogLevel.Trace, "(WebSockets transport) data received. " + getDataDetail(message.data, _this.logMessageContent) + ".");
                                    if (_this.onreceive) {
                                        _this.onreceive(message.data);
                                    }
                                };
                                webSocket.onclose = function (event) {
                                    // Don't call close handler if connection was never established
                                    // We'll reject the connect call instead
                                    if (opened) {
                                        _this.close(event);
                                    }
                                    else {
                                        var error = null;
                                        // ErrorEvent is a browser only type we need to check if the type exists before using it
                                        if (typeof ErrorEvent !== "undefined" && event instanceof ErrorEvent) {
                                            error = event.error;
                                        }
                                        else {
                                            error = new Error("There was an error with the transport.");
                                        }
                                        reject(error);
                                    }
                                };
                            })];
                    }
                });
            });
        };
        WebSocketTransport.prototype.send = function (data) {
            if (this.webSocket && this.webSocket.readyState === this.webSocketConstructor.OPEN) {
                this.logger.log(LogLevel.Trace, "(WebSockets transport) sending data. " + getDataDetail(data, this.logMessageContent) + ".");
                this.webSocket.send(data);
                return Promise.resolve();
            }
            return Promise.reject("WebSocket is not in the OPEN state");
        };
        WebSocketTransport.prototype.stop = function () {
            if (this.webSocket) {
                // Manually invoke onclose callback inline so we know the HttpConnection was closed properly before returning
                // This also solves an issue where websocket.onclose could take 18+ seconds to trigger during network disconnects
                this.close(undefined);
            }
            return Promise.resolve();
        };
        WebSocketTransport.prototype.close = function (event) {
            // webSocket will be null if the transport did not start successfully
            if (this.webSocket) {
                // Clear websocket handlers because we are considering the socket closed now
                this.webSocket.onclose = function () { };
                this.webSocket.onmessage = function () { };
                this.webSocket.onerror = function () { };
                this.webSocket.close();
                this.webSocket = undefined;
            }
            this.logger.log(LogLevel.Trace, "(WebSockets transport) socket closed.");
            if (this.onclose) {
                if (event && (event.wasClean === false || event.code !== 1000)) {
                    this.onclose(new Error("WebSocket closed with status code: " + event.code + " (" + event.reason + ")."));
                }
                else {
                    this.onclose();
                }
            }
        };
        return WebSocketTransport;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$5 = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var MAX_REDIRECTS = 100;
    var WebSocketModule = null;
    var EventSourceModule = null;
    if (Platform.isNode && typeof require !== "undefined") {
        // In order to ignore the dynamic require in webpack builds we need to do this magic
        // @ts-ignore: TS doesn't know about these names
        var requireFunc$1 = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
        WebSocketModule = requireFunc$1("ws");
        EventSourceModule = requireFunc$1("eventsource");
    }
    /** @private */
    var HttpConnection = /** @class */ (function () {
        function HttpConnection(url, options) {
            if (options === void 0) { options = {}; }
            this.features = {};
            this.negotiateVersion = 1;
            Arg.isRequired(url, "url");
            this.logger = createLogger(options.logger);
            this.baseUrl = this.resolveUrl(url);
            options = options || {};
            options.logMessageContent = options.logMessageContent || false;
            if (!Platform.isNode && typeof WebSocket !== "undefined" && !options.WebSocket) {
                options.WebSocket = WebSocket;
            }
            else if (Platform.isNode && !options.WebSocket) {
                if (WebSocketModule) {
                    options.WebSocket = WebSocketModule;
                }
            }
            if (!Platform.isNode && typeof EventSource !== "undefined" && !options.EventSource) {
                options.EventSource = EventSource;
            }
            else if (Platform.isNode && !options.EventSource) {
                if (typeof EventSourceModule !== "undefined") {
                    options.EventSource = EventSourceModule;
                }
            }
            this.httpClient = options.httpClient || new DefaultHttpClient(this.logger);
            this.connectionState = "Disconnected" /* Disconnected */;
            this.connectionStarted = false;
            this.options = options;
            this.onreceive = null;
            this.onclose = null;
        }
        HttpConnection.prototype.start = function (transferFormat) {
            return __awaiter$5(this, void 0, void 0, function () {
                var message, message;
                return __generator$5(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            transferFormat = transferFormat || TransferFormat.Binary;
                            Arg.isIn(transferFormat, TransferFormat, "transferFormat");
                            this.logger.log(LogLevel.Debug, "Starting connection with transfer format '" + TransferFormat[transferFormat] + "'.");
                            if (this.connectionState !== "Disconnected" /* Disconnected */) {
                                return [2 /*return*/, Promise.reject(new Error("Cannot start an HttpConnection that is not in the 'Disconnected' state."))];
                            }
                            this.connectionState = "Connecting " /* Connecting */;
                            this.startInternalPromise = this.startInternal(transferFormat);
                            return [4 /*yield*/, this.startInternalPromise];
                        case 1:
                            _a.sent();
                            if (!(this.connectionState === "Disconnecting" /* Disconnecting */)) return [3 /*break*/, 3];
                            message = "Failed to start the HttpConnection before stop() was called.";
                            this.logger.log(LogLevel.Error, message);
                            // We cannot await stopPromise inside startInternal since stopInternal awaits the startInternalPromise.
                            return [4 /*yield*/, this.stopPromise];
                        case 2:
                            // We cannot await stopPromise inside startInternal since stopInternal awaits the startInternalPromise.
                            _a.sent();
                            return [2 /*return*/, Promise.reject(new Error(message))];
                        case 3:
                            if (this.connectionState !== "Connected" /* Connected */) {
                                message = "HttpConnection.startInternal completed gracefully but didn't enter the connection into the connected state!";
                                this.logger.log(LogLevel.Error, message);
                                return [2 /*return*/, Promise.reject(new Error(message))];
                            }
                            _a.label = 4;
                        case 4:
                            this.connectionStarted = true;
                            return [2 /*return*/];
                    }
                });
            });
        };
        HttpConnection.prototype.send = function (data) {
            if (this.connectionState !== "Connected" /* Connected */) {
                return Promise.reject(new Error("Cannot send data if the connection is not in the 'Connected' State."));
            }
            if (!this.sendQueue) {
                this.sendQueue = new TransportSendQueue(this.transport);
            }
            // Transport will not be null if state is connected
            return this.sendQueue.send(data);
        };
        HttpConnection.prototype.stop = function (error) {
            return __awaiter$5(this, void 0, void 0, function () {
                var _this = this;
                return __generator$5(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.connectionState === "Disconnected" /* Disconnected */) {
                                this.logger.log(LogLevel.Debug, "Call to HttpConnection.stop(" + error + ") ignored because the connection is already in the disconnected state.");
                                return [2 /*return*/, Promise.resolve()];
                            }
                            if (this.connectionState === "Disconnecting" /* Disconnecting */) {
                                this.logger.log(LogLevel.Debug, "Call to HttpConnection.stop(" + error + ") ignored because the connection is already in the disconnecting state.");
                                return [2 /*return*/, this.stopPromise];
                            }
                            this.connectionState = "Disconnecting" /* Disconnecting */;
                            this.stopPromise = new Promise(function (resolve) {
                                // Don't complete stop() until stopConnection() completes.
                                _this.stopPromiseResolver = resolve;
                            });
                            // stopInternal should never throw so just observe it.
                            return [4 /*yield*/, this.stopInternal(error)];
                        case 1:
                            // stopInternal should never throw so just observe it.
                            _a.sent();
                            return [4 /*yield*/, this.stopPromise];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        HttpConnection.prototype.stopInternal = function (error) {
            return __awaiter$5(this, void 0, void 0, function () {
                var e_1, e_2;
                return __generator$5(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Set error as soon as possible otherwise there is a race between
                            // the transport closing and providing an error and the error from a close message
                            // We would prefer the close message error.
                            this.stopError = error;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.startInternalPromise];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            if (!this.transport) return [3 /*break*/, 9];
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.transport.stop()];
                        case 6:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            e_2 = _a.sent();
                            this.logger.log(LogLevel.Error, "HttpConnection.transport.stop() threw error '" + e_2 + "'.");
                            this.stopConnection();
                            return [3 /*break*/, 8];
                        case 8:
                            this.transport = undefined;
                            return [3 /*break*/, 10];
                        case 9:
                            this.logger.log(LogLevel.Debug, "HttpConnection.transport is undefined in HttpConnection.stop() because start() failed.");
                            this.stopConnection();
                            _a.label = 10;
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        HttpConnection.prototype.startInternal = function (transferFormat) {
            return __awaiter$5(this, void 0, void 0, function () {
                var url, negotiateResponse, redirects, _loop_1, this_1, e_3;
                return __generator$5(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.baseUrl;
                            this.accessTokenFactory = this.options.accessTokenFactory;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 12, , 13]);
                            if (!this.options.skipNegotiation) return [3 /*break*/, 5];
                            if (!(this.options.transport === HttpTransportType.WebSockets)) return [3 /*break*/, 3];
                            // No need to add a connection ID in this case
                            this.transport = this.constructTransport(HttpTransportType.WebSockets);
                            // We should just call connect directly in this case.
                            // No fallback or negotiate in this case.
                            return [4 /*yield*/, this.startTransport(url, transferFormat)];
                        case 2:
                            // We should just call connect directly in this case.
                            // No fallback or negotiate in this case.
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3: throw new Error("Negotiation can only be skipped when using the WebSocket transport directly.");
                        case 4: return [3 /*break*/, 11];
                        case 5:
                            negotiateResponse = null;
                            redirects = 0;
                            _loop_1 = function () {
                                var accessToken_1;
                                return __generator$5(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this_1.getNegotiationResponse(url)];
                                        case 1:
                                            negotiateResponse = _a.sent();
                                            // the user tries to stop the connection when it is being started
                                            if (this_1.connectionState === "Disconnecting" /* Disconnecting */ || this_1.connectionState === "Disconnected" /* Disconnected */) {
                                                throw new Error("The connection was stopped during negotiation.");
                                            }
                                            if (negotiateResponse.error) {
                                                throw new Error(negotiateResponse.error);
                                            }
                                            if (negotiateResponse.ProtocolVersion) {
                                                throw new Error("Detected a connection attempt to an ASP.NET SignalR Server. This client only supports connecting to an ASP.NET Core SignalR Server. See https://aka.ms/signalr-core-differences for details.");
                                            }
                                            if (negotiateResponse.url) {
                                                url = negotiateResponse.url;
                                            }
                                            if (negotiateResponse.accessToken) {
                                                accessToken_1 = negotiateResponse.accessToken;
                                                this_1.accessTokenFactory = function () { return accessToken_1; };
                                            }
                                            redirects++;
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _a.label = 6;
                        case 6: return [5 /*yield**/, _loop_1()];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8:
                            if (negotiateResponse.url && redirects < MAX_REDIRECTS) return [3 /*break*/, 6];
                            _a.label = 9;
                        case 9:
                            if (redirects === MAX_REDIRECTS && negotiateResponse.url) {
                                throw new Error("Negotiate redirection limit exceeded.");
                            }
                            return [4 /*yield*/, this.createTransport(url, this.options.transport, negotiateResponse, transferFormat)];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11:
                            if (this.transport instanceof LongPollingTransport) {
                                this.features.inherentKeepAlive = true;
                            }
                            if (this.connectionState === "Connecting " /* Connecting */) {
                                // Ensure the connection transitions to the connected state prior to completing this.startInternalPromise.
                                // start() will handle the case when stop was called and startInternal exits still in the disconnecting state.
                                this.logger.log(LogLevel.Debug, "The HttpConnection connected successfully.");
                                this.connectionState = "Connected" /* Connected */;
                            }
                            return [3 /*break*/, 13];
                        case 12:
                            e_3 = _a.sent();
                            this.logger.log(LogLevel.Error, "Failed to start the connection: " + e_3);
                            this.connectionState = "Disconnected" /* Disconnected */;
                            this.transport = undefined;
                            return [2 /*return*/, Promise.reject(e_3)];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        HttpConnection.prototype.getNegotiationResponse = function (url) {
            return __awaiter$5(this, void 0, void 0, function () {
                var _a, headers, token, negotiateUrl, response, negotiateResponse, e_4;
                return __generator$5(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.accessTokenFactory) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.accessTokenFactory()];
                        case 1:
                            token = _b.sent();
                            if (token) {
                                headers = (_a = {},
                                    _a["Authorization"] = "Bearer " + token,
                                    _a);
                            }
                            _b.label = 2;
                        case 2:
                            negotiateUrl = this.resolveNegotiateUrl(url);
                            this.logger.log(LogLevel.Debug, "Sending negotiation request: " + negotiateUrl + ".");
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, this.httpClient.post(negotiateUrl, {
                                    content: "",
                                    headers: headers,
                                })];
                        case 4:
                            response = _b.sent();
                            if (response.statusCode !== 200) {
                                return [2 /*return*/, Promise.reject(new Error("Unexpected status code returned from negotiate " + response.statusCode))];
                            }
                            negotiateResponse = JSON.parse(response.content);
                            if (!negotiateResponse.negotiateVersion || negotiateResponse.negotiateVersion < 1) {
                                // Negotiate version 0 doesn't use connectionToken
                                // So we set it equal to connectionId so all our logic can use connectionToken without being aware of the negotiate version
                                negotiateResponse.connectionToken = negotiateResponse.connectionId;
                            }
                            return [2 /*return*/, negotiateResponse];
                        case 5:
                            e_4 = _b.sent();
                            this.logger.log(LogLevel.Error, "Failed to complete negotiation with the server: " + e_4);
                            return [2 /*return*/, Promise.reject(e_4)];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        HttpConnection.prototype.createConnectUrl = function (url, connectionToken) {
            if (!connectionToken) {
                return url;
            }
            return url + (url.indexOf("?") === -1 ? "?" : "&") + ("id=" + connectionToken);
        };
        HttpConnection.prototype.createTransport = function (url, requestedTransport, negotiateResponse, requestedTransferFormat) {
            return __awaiter$5(this, void 0, void 0, function () {
                var connectUrl, transportExceptions, transports, negotiate, _i, transports_1, endpoint, transportOrError, ex_1, ex_2, message;
                return __generator$5(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            connectUrl = this.createConnectUrl(url, negotiateResponse.connectionToken);
                            if (!this.isITransport(requestedTransport)) return [3 /*break*/, 2];
                            this.logger.log(LogLevel.Debug, "Connection was provided an instance of ITransport, using that directly.");
                            this.transport = requestedTransport;
                            return [4 /*yield*/, this.startTransport(connectUrl, requestedTransferFormat)];
                        case 1:
                            _a.sent();
                            this.connectionId = negotiateResponse.connectionId;
                            return [2 /*return*/];
                        case 2:
                            transportExceptions = [];
                            transports = negotiateResponse.availableTransports || [];
                            negotiate = negotiateResponse;
                            _i = 0, transports_1 = transports;
                            _a.label = 3;
                        case 3:
                            if (!(_i < transports_1.length)) return [3 /*break*/, 13];
                            endpoint = transports_1[_i];
                            transportOrError = this.resolveTransportOrError(endpoint, requestedTransport, requestedTransferFormat);
                            if (!(transportOrError instanceof Error)) return [3 /*break*/, 4];
                            // Store the error and continue, we don't want to cause a re-negotiate in these cases
                            transportExceptions.push(endpoint.transport + " failed: " + transportOrError);
                            return [3 /*break*/, 12];
                        case 4:
                            if (!this.isITransport(transportOrError)) return [3 /*break*/, 12];
                            this.transport = transportOrError;
                            if (!!negotiate) return [3 /*break*/, 9];
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.getNegotiationResponse(url)];
                        case 6:
                            negotiate = _a.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            ex_1 = _a.sent();
                            return [2 /*return*/, Promise.reject(ex_1)];
                        case 8:
                            connectUrl = this.createConnectUrl(url, negotiate.connectionToken);
                            _a.label = 9;
                        case 9:
                            _a.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, this.startTransport(connectUrl, requestedTransferFormat)];
                        case 10:
                            _a.sent();
                            this.connectionId = negotiate.connectionId;
                            return [2 /*return*/];
                        case 11:
                            ex_2 = _a.sent();
                            this.logger.log(LogLevel.Error, "Failed to start the transport '" + endpoint.transport + "': " + ex_2);
                            negotiate = undefined;
                            transportExceptions.push(endpoint.transport + " failed: " + ex_2);
                            if (this.connectionState !== "Connecting " /* Connecting */) {
                                message = "Failed to select transport before stop() was called.";
                                this.logger.log(LogLevel.Debug, message);
                                return [2 /*return*/, Promise.reject(new Error(message))];
                            }
                            return [3 /*break*/, 12];
                        case 12:
                            _i++;
                            return [3 /*break*/, 3];
                        case 13:
                            if (transportExceptions.length > 0) {
                                return [2 /*return*/, Promise.reject(new Error("Unable to connect to the server with any of the available transports. " + transportExceptions.join(" ")))];
                            }
                            return [2 /*return*/, Promise.reject(new Error("None of the transports supported by the client are supported by the server."))];
                    }
                });
            });
        };
        HttpConnection.prototype.constructTransport = function (transport) {
            switch (transport) {
                case HttpTransportType.WebSockets:
                    if (!this.options.WebSocket) {
                        throw new Error("'WebSocket' is not supported in your environment.");
                    }
                    return new WebSocketTransport(this.httpClient, this.accessTokenFactory, this.logger, this.options.logMessageContent || false, this.options.WebSocket);
                case HttpTransportType.ServerSentEvents:
                    if (!this.options.EventSource) {
                        throw new Error("'EventSource' is not supported in your environment.");
                    }
                    return new ServerSentEventsTransport(this.httpClient, this.accessTokenFactory, this.logger, this.options.logMessageContent || false, this.options.EventSource);
                case HttpTransportType.LongPolling:
                    return new LongPollingTransport(this.httpClient, this.accessTokenFactory, this.logger, this.options.logMessageContent || false);
                default:
                    throw new Error("Unknown transport: " + transport + ".");
            }
        };
        HttpConnection.prototype.startTransport = function (url, transferFormat) {
            var _this = this;
            this.transport.onreceive = this.onreceive;
            this.transport.onclose = function (e) { return _this.stopConnection(e); };
            return this.transport.connect(url, transferFormat);
        };
        HttpConnection.prototype.resolveTransportOrError = function (endpoint, requestedTransport, requestedTransferFormat) {
            var transport = HttpTransportType[endpoint.transport];
            if (transport === null || transport === undefined) {
                this.logger.log(LogLevel.Debug, "Skipping transport '" + endpoint.transport + "' because it is not supported by this client.");
                return new Error("Skipping transport '" + endpoint.transport + "' because it is not supported by this client.");
            }
            else {
                if (transportMatches(requestedTransport, transport)) {
                    var transferFormats = endpoint.transferFormats.map(function (s) { return TransferFormat[s]; });
                    if (transferFormats.indexOf(requestedTransferFormat) >= 0) {
                        if ((transport === HttpTransportType.WebSockets && !this.options.WebSocket) ||
                            (transport === HttpTransportType.ServerSentEvents && !this.options.EventSource)) {
                            this.logger.log(LogLevel.Debug, "Skipping transport '" + HttpTransportType[transport] + "' because it is not supported in your environment.'");
                            return new Error("'" + HttpTransportType[transport] + "' is not supported in your environment.");
                        }
                        else {
                            this.logger.log(LogLevel.Debug, "Selecting transport '" + HttpTransportType[transport] + "'.");
                            try {
                                return this.constructTransport(transport);
                            }
                            catch (ex) {
                                return ex;
                            }
                        }
                    }
                    else {
                        this.logger.log(LogLevel.Debug, "Skipping transport '" + HttpTransportType[transport] + "' because it does not support the requested transfer format '" + TransferFormat[requestedTransferFormat] + "'.");
                        return new Error("'" + HttpTransportType[transport] + "' does not support " + TransferFormat[requestedTransferFormat] + ".");
                    }
                }
                else {
                    this.logger.log(LogLevel.Debug, "Skipping transport '" + HttpTransportType[transport] + "' because it was disabled by the client.");
                    return new Error("'" + HttpTransportType[transport] + "' is disabled by the client.");
                }
            }
        };
        HttpConnection.prototype.isITransport = function (transport) {
            return transport && typeof (transport) === "object" && "connect" in transport;
        };
        HttpConnection.prototype.stopConnection = function (error) {
            var _this = this;
            this.logger.log(LogLevel.Debug, "HttpConnection.stopConnection(" + error + ") called while in state " + this.connectionState + ".");
            this.transport = undefined;
            // If we have a stopError, it takes precedence over the error from the transport
            error = this.stopError || error;
            this.stopError = undefined;
            if (this.connectionState === "Disconnected" /* Disconnected */) {
                this.logger.log(LogLevel.Debug, "Call to HttpConnection.stopConnection(" + error + ") was ignored because the connection is already in the disconnected state.");
                return;
            }
            if (this.connectionState === "Connecting " /* Connecting */) {
                this.logger.log(LogLevel.Warning, "Call to HttpConnection.stopConnection(" + error + ") was ignored because the connection hasn't yet left the in the connecting state.");
                return;
            }
            if (this.connectionState === "Disconnecting" /* Disconnecting */) {
                // A call to stop() induced this call to stopConnection and needs to be completed.
                // Any stop() awaiters will be scheduled to continue after the onclose callback fires.
                this.stopPromiseResolver();
            }
            if (error) {
                this.logger.log(LogLevel.Error, "Connection disconnected with error '" + error + "'.");
            }
            else {
                this.logger.log(LogLevel.Information, "Connection disconnected.");
            }
            if (this.sendQueue) {
                this.sendQueue.stop().catch(function (e) {
                    _this.logger.log(LogLevel.Error, "TransportSendQueue.stop() threw error '" + e + "'.");
                });
                this.sendQueue = undefined;
            }
            this.connectionId = undefined;
            this.connectionState = "Disconnected" /* Disconnected */;
            if (this.connectionStarted) {
                this.connectionStarted = false;
                try {
                    if (this.onclose) {
                        this.onclose(error);
                    }
                }
                catch (e) {
                    this.logger.log(LogLevel.Error, "HttpConnection.onclose(" + error + ") threw error '" + e + "'.");
                }
            }
        };
        HttpConnection.prototype.resolveUrl = function (url) {
            // startsWith is not supported in IE
            if (url.lastIndexOf("https://", 0) === 0 || url.lastIndexOf("http://", 0) === 0) {
                return url;
            }
            if (!Platform.isBrowser || !window.document) {
                throw new Error("Cannot resolve '" + url + "'.");
            }
            // Setting the url to the href propery of an anchor tag handles normalization
            // for us. There are 3 main cases.
            // 1. Relative path normalization e.g "b" -> "http://localhost:5000/a/b"
            // 2. Absolute path normalization e.g "/a/b" -> "http://localhost:5000/a/b"
            // 3. Networkpath reference normalization e.g "//localhost:5000/a/b" -> "http://localhost:5000/a/b"
            var aTag = window.document.createElement("a");
            aTag.href = url;
            this.logger.log(LogLevel.Information, "Normalizing '" + url + "' to '" + aTag.href + "'.");
            return aTag.href;
        };
        HttpConnection.prototype.resolveNegotiateUrl = function (url) {
            var index = url.indexOf("?");
            var negotiateUrl = url.substring(0, index === -1 ? url.length : index);
            if (negotiateUrl[negotiateUrl.length - 1] !== "/") {
                negotiateUrl += "/";
            }
            negotiateUrl += "negotiate";
            negotiateUrl += index === -1 ? "" : url.substring(index);
            if (negotiateUrl.indexOf("negotiateVersion") === -1) {
                negotiateUrl += index === -1 ? "?" : "&";
                negotiateUrl += "negotiateVersion=" + this.negotiateVersion;
            }
            return negotiateUrl;
        };
        return HttpConnection;
    }());
    function transportMatches(requestedTransport, actualTransport) {
        return !requestedTransport || ((actualTransport & requestedTransport) !== 0);
    }
    /** @private */
    var TransportSendQueue = /** @class */ (function () {
        function TransportSendQueue(transport) {
            this.transport = transport;
            this.buffer = [];
            this.executing = true;
            this.sendBufferedData = new PromiseSource();
            this.transportResult = new PromiseSource();
            this.sendLoopPromise = this.sendLoop();
        }
        TransportSendQueue.prototype.send = function (data) {
            this.bufferData(data);
            if (!this.transportResult) {
                this.transportResult = new PromiseSource();
            }
            return this.transportResult.promise;
        };
        TransportSendQueue.prototype.stop = function () {
            this.executing = false;
            this.sendBufferedData.resolve();
            return this.sendLoopPromise;
        };
        TransportSendQueue.prototype.bufferData = function (data) {
            if (this.buffer.length && typeof (this.buffer[0]) !== typeof (data)) {
                throw new Error("Expected data to be of type " + typeof (this.buffer) + " but was of type " + typeof (data));
            }
            this.buffer.push(data);
            this.sendBufferedData.resolve();
        };
        TransportSendQueue.prototype.sendLoop = function () {
            return __awaiter$5(this, void 0, void 0, function () {
                var transportResult, data, error_1;
                return __generator$5(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            return [4 /*yield*/, this.sendBufferedData.promise];
                        case 1:
                            _a.sent();
                            if (!this.executing) {
                                if (this.transportResult) {
                                    this.transportResult.reject("Connection stopped.");
                                }
                                return [3 /*break*/, 6];
                            }
                            this.sendBufferedData = new PromiseSource();
                            transportResult = this.transportResult;
                            this.transportResult = undefined;
                            data = typeof (this.buffer[0]) === "string" ?
                                this.buffer.join("") :
                                TransportSendQueue.concatBuffers(this.buffer);
                            this.buffer.length = 0;
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.transport.send(data)];
                        case 3:
                            _a.sent();
                            transportResult.resolve();
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _a.sent();
                            transportResult.reject(error_1);
                            return [3 /*break*/, 5];
                        case 5: return [3 /*break*/, 0];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        TransportSendQueue.concatBuffers = function (arrayBuffers) {
            var totalLength = arrayBuffers.map(function (b) { return b.byteLength; }).reduce(function (a, b) { return a + b; });
            var result = new Uint8Array(totalLength);
            var offset = 0;
            for (var _i = 0, arrayBuffers_1 = arrayBuffers; _i < arrayBuffers_1.length; _i++) {
                var item = arrayBuffers_1[_i];
                result.set(new Uint8Array(item), offset);
                offset += item.byteLength;
            }
            return result;
        };
        return TransportSendQueue;
    }());
    var PromiseSource = /** @class */ (function () {
        function PromiseSource() {
            var _this = this;
            this.promise = new Promise(function (resolve, reject) {
                var _a;
                return _a = [resolve, reject], _this.resolver = _a[0], _this.rejecter = _a[1], _a;
            });
        }
        PromiseSource.prototype.resolve = function () {
            this.resolver();
        };
        PromiseSource.prototype.reject = function (reason) {
            this.rejecter(reason);
        };
        return PromiseSource;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    var JSON_HUB_PROTOCOL_NAME = "json";
    /** Implements the JSON Hub Protocol. */
    var JsonHubProtocol = /** @class */ (function () {
        function JsonHubProtocol() {
            /** @inheritDoc */
            this.name = JSON_HUB_PROTOCOL_NAME;
            /** @inheritDoc */
            this.version = 1;
            /** @inheritDoc */
            this.transferFormat = TransferFormat.Text;
        }
        /** Creates an array of {@link @microsoft/signalr.HubMessage} objects from the specified serialized representation.
         *
         * @param {string} input A string containing the serialized representation.
         * @param {ILogger} logger A logger that will be used to log messages that occur during parsing.
         */
        JsonHubProtocol.prototype.parseMessages = function (input, logger) {
            // The interface does allow "ArrayBuffer" to be passed in, but this implementation does not. So let's throw a useful error.
            if (typeof input !== "string") {
                throw new Error("Invalid input for JSON hub protocol. Expected a string.");
            }
            if (!input) {
                return [];
            }
            if (logger === null) {
                logger = NullLogger.instance;
            }
            // Parse the messages
            var messages = TextMessageFormat.parse(input);
            var hubMessages = [];
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var message = messages_1[_i];
                var parsedMessage = JSON.parse(message);
                if (typeof parsedMessage.type !== "number") {
                    throw new Error("Invalid payload.");
                }
                switch (parsedMessage.type) {
                    case MessageType.Invocation:
                        this.isInvocationMessage(parsedMessage);
                        break;
                    case MessageType.StreamItem:
                        this.isStreamItemMessage(parsedMessage);
                        break;
                    case MessageType.Completion:
                        this.isCompletionMessage(parsedMessage);
                        break;
                    case MessageType.Ping:
                        // Single value, no need to validate
                        break;
                    case MessageType.Close:
                        // All optional values, no need to validate
                        break;
                    default:
                        // Future protocol changes can add message types, old clients can ignore them
                        logger.log(LogLevel.Information, "Unknown message type '" + parsedMessage.type + "' ignored.");
                        continue;
                }
                hubMessages.push(parsedMessage);
            }
            return hubMessages;
        };
        /** Writes the specified {@link @microsoft/signalr.HubMessage} to a string and returns it.
         *
         * @param {HubMessage} message The message to write.
         * @returns {string} A string containing the serialized representation of the message.
         */
        JsonHubProtocol.prototype.writeMessage = function (message) {
            return TextMessageFormat.write(JSON.stringify(message));
        };
        JsonHubProtocol.prototype.isInvocationMessage = function (message) {
            this.assertNotEmptyString(message.target, "Invalid payload for Invocation message.");
            if (message.invocationId !== undefined) {
                this.assertNotEmptyString(message.invocationId, "Invalid payload for Invocation message.");
            }
        };
        JsonHubProtocol.prototype.isStreamItemMessage = function (message) {
            this.assertNotEmptyString(message.invocationId, "Invalid payload for StreamItem message.");
            if (message.item === undefined) {
                throw new Error("Invalid payload for StreamItem message.");
            }
        };
        JsonHubProtocol.prototype.isCompletionMessage = function (message) {
            if (message.result && message.error) {
                throw new Error("Invalid payload for Completion message.");
            }
            if (!message.result && message.error) {
                this.assertNotEmptyString(message.error, "Invalid payload for Completion message.");
            }
            this.assertNotEmptyString(message.invocationId, "Invalid payload for Completion message.");
        };
        JsonHubProtocol.prototype.assertNotEmptyString = function (value, errorMessage) {
            if (typeof value !== "string" || value === "") {
                throw new Error(errorMessage);
            }
        };
        return JsonHubProtocol;
    }());

    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    var __assign$2 = (undefined && undefined.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    // tslint:disable:object-literal-sort-keys
    var LogLevelNameMapping = {
        trace: LogLevel.Trace,
        debug: LogLevel.Debug,
        info: LogLevel.Information,
        information: LogLevel.Information,
        warn: LogLevel.Warning,
        warning: LogLevel.Warning,
        error: LogLevel.Error,
        critical: LogLevel.Critical,
        none: LogLevel.None,
    };
    function parseLogLevel(name) {
        // Case-insensitive matching via lower-casing
        // Yes, I know case-folding is a complicated problem in Unicode, but we only support
        // the ASCII strings defined in LogLevelNameMapping anyway, so it's fine -anurse.
        var mapping = LogLevelNameMapping[name.toLowerCase()];
        if (typeof mapping !== "undefined") {
            return mapping;
        }
        else {
            throw new Error("Unknown log level: " + name);
        }
    }
    /** A builder for configuring {@link @microsoft/signalr.HubConnection} instances. */
    var HubConnectionBuilder = /** @class */ (function () {
        function HubConnectionBuilder() {
        }
        HubConnectionBuilder.prototype.configureLogging = function (logging) {
            Arg.isRequired(logging, "logging");
            if (isLogger(logging)) {
                this.logger = logging;
            }
            else if (typeof logging === "string") {
                var logLevel = parseLogLevel(logging);
                this.logger = new ConsoleLogger(logLevel);
            }
            else {
                this.logger = new ConsoleLogger(logging);
            }
            return this;
        };
        HubConnectionBuilder.prototype.withUrl = function (url, transportTypeOrOptions) {
            Arg.isRequired(url, "url");
            this.url = url;
            // Flow-typing knows where it's at. Since HttpTransportType is a number and IHttpConnectionOptions is guaranteed
            // to be an object, we know (as does TypeScript) this comparison is all we need to figure out which overload was called.
            if (typeof transportTypeOrOptions === "object") {
                this.httpConnectionOptions = __assign$2({}, this.httpConnectionOptions, transportTypeOrOptions);
            }
            else {
                this.httpConnectionOptions = __assign$2({}, this.httpConnectionOptions, { transport: transportTypeOrOptions });
            }
            return this;
        };
        /** Configures the {@link @microsoft/signalr.HubConnection} to use the specified Hub Protocol.
         *
         * @param {IHubProtocol} protocol The {@link @microsoft/signalr.IHubProtocol} implementation to use.
         */
        HubConnectionBuilder.prototype.withHubProtocol = function (protocol) {
            Arg.isRequired(protocol, "protocol");
            this.protocol = protocol;
            return this;
        };
        HubConnectionBuilder.prototype.withAutomaticReconnect = function (retryDelaysOrReconnectPolicy) {
            if (this.reconnectPolicy) {
                throw new Error("A reconnectPolicy has already been set.");
            }
            if (!retryDelaysOrReconnectPolicy) {
                this.reconnectPolicy = new DefaultReconnectPolicy();
            }
            else if (Array.isArray(retryDelaysOrReconnectPolicy)) {
                this.reconnectPolicy = new DefaultReconnectPolicy(retryDelaysOrReconnectPolicy);
            }
            else {
                this.reconnectPolicy = retryDelaysOrReconnectPolicy;
            }
            return this;
        };
        /** Creates a {@link @microsoft/signalr.HubConnection} from the configuration options specified in this builder.
         *
         * @returns {HubConnection} The configured {@link @microsoft/signalr.HubConnection}.
         */
        HubConnectionBuilder.prototype.build = function () {
            // If httpConnectionOptions has a logger, use it. Otherwise, override it with the one
            // provided to configureLogger
            var httpConnectionOptions = this.httpConnectionOptions || {};
            // If it's 'null', the user **explicitly** asked for null, don't mess with it.
            if (httpConnectionOptions.logger === undefined) {
                // If our logger is undefined or null, that's OK, the HttpConnection constructor will handle it.
                httpConnectionOptions.logger = this.logger;
            }
            // Now create the connection
            if (!this.url) {
                throw new Error("The 'HubConnectionBuilder.withUrl' method must be called before building the connection.");
            }
            var connection = new HttpConnection(this.url, httpConnectionOptions);
            return HubConnection.create(connection, this.logger || NullLogger.instance, this.protocol || new JsonHubProtocol(), this.reconnectPolicy);
        };
        return HubConnectionBuilder;
    }());
    function isLogger(logger) {
        return logger.log !== undefined;
    }

    /* node_modules\@sveltejs\svelte-virtual-list\VirtualList.svelte generated by Svelte v3.29.0 */
    const file$4 = "node_modules\\@sveltejs\\svelte-virtual-list\\VirtualList.svelte";
    const get_default_slot_changes = dirty => ({ item: dirty & /*visible*/ 16 });
    const get_default_slot_context = ctx => ({ item: /*row*/ ctx[23].data });

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (166:26) Missing template
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Missing template");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(166:26) Missing template",
    		ctx
    	});

    	return block;
    }

    // (164:2) {#each visible as row (row.index)}
    function create_each_block$2(key_1, ctx) {
    	let svelte_virtual_list_row;
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-1tqh76q");
    			add_location(svelte_virtual_list_row, file$4, 164, 3, 3469);
    			this.first = svelte_virtual_list_row;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_row, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svelte_virtual_list_row, null);
    			}

    			append_dev(svelte_virtual_list_row, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, visible*/ 4112) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_row);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(164:2) {#each visible as row (row.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let svelte_virtual_list_viewport;
    	let svelte_virtual_list_contents;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let svelte_virtual_list_viewport_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*visible*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[23].index;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[5] + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[6] + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-1tqh76q");
    			add_location(svelte_virtual_list_contents, file$4, 159, 1, 3313);
    			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-1tqh76q");
    			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[16].call(svelte_virtual_list_viewport));
    			add_location(svelte_virtual_list_viewport, file$4, 153, 0, 3167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_viewport, anchor);
    			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svelte_virtual_list_contents, null);
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[14](svelte_virtual_list_contents);
    			/*svelte_virtual_list_viewport_binding*/ ctx[15](svelte_virtual_list_viewport);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[16].bind(svelte_virtual_list_viewport));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$scope, visible*/ 4112) {
    				const each_value = /*visible*/ ctx[4];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			if (!current || dirty & /*top*/ 32) {
    				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[5] + "px");
    			}

    			if (!current || dirty & /*bottom*/ 64) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_viewport);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[14](null);
    			/*svelte_virtual_list_viewport_binding*/ ctx[15](null);
    			svelte_virtual_list_viewport_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VirtualList", slots, ['default']);
    	let { items } = $$props;
    	let { height = "100%" } = $$props;
    	let { itemHeight = undefined } = $$props;
    	let foo;
    	let { start = 0 } = $$props;
    	let { end = 0 } = $$props;

    	// local state
    	let height_map = [];

    	let rows;
    	let viewport;
    	let contents;
    	let viewport_height = 0;
    	let visible;
    	let mounted;
    	let top = 0;
    	let bottom = 0;
    	let average_height;

    	async function refresh(items, viewport_height, itemHeight) {
    		const { scrollTop } = viewport;
    		await tick(); // wait until the DOM is up to date
    		let content_height = top - scrollTop;
    		let i = start;

    		while (content_height < viewport_height && i < items.length) {
    			let row = rows[i - start];

    			if (!row) {
    				$$invalidate(9, end = i + 1);
    				await tick(); // render the newly visible row
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;
    			i += 1;
    		}

    		$$invalidate(9, end = i);
    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;
    		$$invalidate(6, bottom = remaining * average_height);
    		height_map.length = items.length;
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;
    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;
    		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;

    			if (y + row_height > scrollTop) {
    				$$invalidate(8, start = i);
    				$$invalidate(5, top = y);
    				break;
    			}

    			y += row_height;
    			i += 1;
    		}

    		while (i < items.length) {
    			y += height_map[i] || average_height;
    			i += 1;
    			if (y > scrollTop + viewport_height) break;
    		}

    		$$invalidate(9, end = i);
    		const remaining = items.length - end;
    		average_height = y / end;
    		while (i < items.length) height_map[i++] = average_height;
    		$$invalidate(6, bottom = remaining * average_height);

    		// prevent jumping if we scrolled up into unknown territory
    		if (start < old_start) {
    			await tick();
    			let expected_height = 0;
    			let actual_height = 0;

    			for (let i = start; i < old_start; i += 1) {
    				if (rows[i - start]) {
    					expected_height += height_map[i];
    					actual_height += itemHeight || rows[i - start].offsetHeight;
    				}
    			}

    			const d = actual_height - expected_height;
    			viewport.scrollTo(0, scrollTop + d);
    		}
    	} // TODO if we overestimated the space these
    	// rows would occupy we may need to add some

    	// more. maybe we can just call handle_scroll again?
    	// trigger initial refresh
    	onMount(() => {
    		rows = contents.getElementsByTagName("svelte-virtual-list-row");
    		$$invalidate(19, mounted = true);
    	});

    	const writable_props = ["items", "height", "itemHeight", "start", "end"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contents = $$value;
    			$$invalidate(2, contents);
    		});
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			viewport = $$value;
    			$$invalidate(1, viewport);
    		});
    	}

    	function svelte_virtual_list_viewport_elementresize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate(3, viewport_height);
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(10, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(11, itemHeight = $$props.itemHeight);
    		if ("start" in $$props) $$invalidate(8, start = $$props.start);
    		if ("end" in $$props) $$invalidate(9, end = $$props.end);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		items,
    		height,
    		itemHeight,
    		foo,
    		start,
    		end,
    		height_map,
    		rows,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		mounted,
    		top,
    		bottom,
    		average_height,
    		refresh,
    		handle_scroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(10, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(11, itemHeight = $$props.itemHeight);
    		if ("foo" in $$props) foo = $$props.foo;
    		if ("start" in $$props) $$invalidate(8, start = $$props.start);
    		if ("end" in $$props) $$invalidate(9, end = $$props.end);
    		if ("height_map" in $$props) height_map = $$props.height_map;
    		if ("rows" in $$props) rows = $$props.rows;
    		if ("viewport" in $$props) $$invalidate(1, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(2, contents = $$props.contents);
    		if ("viewport_height" in $$props) $$invalidate(3, viewport_height = $$props.viewport_height);
    		if ("visible" in $$props) $$invalidate(4, visible = $$props.visible);
    		if ("mounted" in $$props) $$invalidate(19, mounted = $$props.mounted);
    		if ("top" in $$props) $$invalidate(5, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(6, bottom = $$props.bottom);
    		if ("average_height" in $$props) average_height = $$props.average_height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, start, end*/ 1792) {
    			 $$invalidate(4, visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			}));
    		}

    		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 527368) {
    			// whenever `items` changes, invalidate the current heightmap
    			 if (mounted) refresh(items, viewport_height, itemHeight);
    		}
    	};

    	return [
    		height,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		start,
    		end,
    		items,
    		itemHeight,
    		$$scope,
    		slots,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_binding,
    		svelte_virtual_list_viewport_elementresize_handler
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			items: 10,
    			height: 0,
    			itemHeight: 11,
    			start: 8,
    			end: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[10] === undefined && !("items" in props)) {
    			console.warn("<VirtualList> was created without expected prop 'items'");
    		}
    	}

    	get items() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Comentarios\Comentarios.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$5 = "src\\components\\Comentarios\\Comentarios.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (61:8) {#if nuevosComentarios.length != 0}
    function create_if_block_1$2(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1_value = /*nuevosComentarios*/ ctx[2].length + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text("+ ");
    			t1 = text(t1_value);
    			add_location(span, file$5, 62, 16, 2023);
    			attr_dev(div, "class", "badge");
    			add_location(div, file$5, 61, 12, 1986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*cargarNuevosComentarios*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nuevosComentarios*/ 4 && t1_value !== (t1_value = /*nuevosComentarios*/ ctx[2].length + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(61:8) {#if nuevosComentarios.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (68:12) {#if comentarios.length > 0}
    function create_if_block$3(ctx) {
    	let a;
    	let i;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "fe fe-arrow-down");
    			add_location(i, file$5, 69, 16, 2345);
    			attr_dev(a, "href", a_href_value = "#" + /*comentarios*/ ctx[0][/*comentarios*/ ctx[0].length - 1].id + " ");
    			add_location(a, file$5, 68, 12, 2275);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*comentarios*/ 1 && a_href_value !== (a_href_value = "#" + /*comentarios*/ ctx[0][/*comentarios*/ ctx[0].length - 1].id + " ")) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(68:12) {#if comentarios.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#each comentarios as comentario (comentario.id)}
    function create_each_block$3(key_1, ctx) {
    	let li;
    	let comentario;
    	let updating_comentario;
    	let t;
    	let li_transition;
    	let current;

    	function comentario_comentario_binding(value) {
    		/*comentario_comentario_binding*/ ctx[5].call(null, value, /*comentario*/ ctx[9], /*each_value*/ ctx[10], /*comentario_index*/ ctx[11]);
    	}

    	let comentario_props = {
    		comentarios: /*comentarios*/ ctx[0],
    		comentariosDic: /*diccionarioComentarios*/ ctx[3]
    	};

    	if (/*comentario*/ ctx[9] !== void 0) {
    		comentario_props.comentario = /*comentario*/ ctx[9];
    	}

    	comentario = new Comentario({ props: comentario_props, $$inline: true });
    	binding_callbacks.push(() => bind(comentario, "comentario", comentario_comentario_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(comentario.$$.fragment);
    			t = space();
    			add_location(li, file$5, 76, 12, 2552);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(comentario, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const comentario_changes = {};
    			if (dirty & /*comentarios*/ 1) comentario_changes.comentarios = /*comentarios*/ ctx[0];
    			if (dirty & /*diccionarioComentarios*/ 8) comentario_changes.comentariosDic = /*diccionarioComentarios*/ ctx[3];

    			if (!updating_comentario && dirty & /*comentarios*/ 1) {
    				updating_comentario = true;
    				comentario_changes.comentario = /*comentario*/ ctx[9];
    				add_flush_callback(() => updating_comentario = false);
    			}

    			comentario.$set(comentario_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(comentario.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!li_transition) li_transition = create_bidirectional_transition(li, fly, { y: -50, duration: 250 }, true);
    					li_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(comentario.$$.fragment, local);

    			if (local) {
    				if (!li_transition) li_transition = create_bidirectional_transition(li, fly, { y: -50, duration: 250 }, false);
    				li_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(comentario);
    			if (detaching && li_transition) li_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(76:8) {#each comentarios as comentario (comentario.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let formulario;
    	let t0;
    	let div1;
    	let h3;
    	let t1;
    	let t2_value = /*comentarios*/ ctx[0].length + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div0;
    	let i;
    	let t6;
    	let t7;
    	let div2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	formulario = new Formulario({
    			props: { hilo: /*hilo*/ ctx[1] },
    			$$inline: true
    		});

    	let if_block0 = /*nuevosComentarios*/ ctx[2].length != 0 && create_if_block_1$2(ctx);
    	let if_block1 = /*comentarios*/ ctx[0].length > 0 && create_if_block$3(ctx);
    	let each_value = /*comentarios*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*comentario*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			create_component(formulario.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text("Comentarios (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			div0 = element("div");
    			i = element("i");
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$5, 58, 8, 1873);
    			attr_dev(i, "class", "fe fe-folder");
    			add_location(i, file$5, 66, 12, 2191);
    			attr_dev(div0, "class", "acciones-comentario");
    			add_location(div0, file$5, 65, 8, 2144);
    			attr_dev(div1, "class", "contador-comentarios panel");
    			add_location(div1, file$5, 57, 4, 1823);
    			attr_dev(div2, "class", "lista-comentarios");
    			add_location(div2, file$5, 74, 4, 2448);
    			attr_dev(div3, "class", "comentarios");
    			add_location(div3, file$5, 55, 0, 1766);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			mount_component(formulario, div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(h3, t3);
    			append_dev(div1, t4);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div0, t6);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const formulario_changes = {};
    			if (dirty & /*hilo*/ 2) formulario_changes.hilo = /*hilo*/ ctx[1];
    			formulario.$set(formulario_changes);
    			if ((!current || dirty & /*comentarios*/ 1) && t2_value !== (t2_value = /*comentarios*/ ctx[0].length + "")) set_data_dev(t2, t2_value);

    			if (/*nuevosComentarios*/ ctx[2].length != 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*comentarios*/ ctx[0].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*comentarios, diccionarioComentarios*/ 9) {
    				const each_value = /*comentarios*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div2, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formulario.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formulario.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(formulario);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Comentarios", slots, []);
    	let { hilo } = $$props;
    	let { comentarios } = $$props;
    	let nuevosComentarios = [];

    	function cargarNuevosComentarios() {
    		$$invalidate(0, comentarios = [...nuevosComentarios, ...comentarios]);
    		$$invalidate(2, nuevosComentarios = []);
    	}

    	let diccionarioRespuestas = {};
    	let diccionarioComentarios = {};

    	comentarios.forEach(c => {
    		$$invalidate(3, diccionarioComentarios[c.id] = c, diccionarioComentarios);
    		let tags = c.contenido.match(/#([A-Z0-9]{8})/g);
    		if (!tags) return;
    		let id = c.id;

    		for (const tag of tags) {
    			let otraId = tag.slice(1, 9);
    			if (!diccionarioRespuestas[otraId]) diccionarioRespuestas[otraId] = [];
    			diccionarioRespuestas[otraId].push(id);
    		}
    	});

    	comentarios.forEach(c => {
    		if (diccionarioRespuestas[c.id]) c.respuestas = [...diccionarioRespuestas[c.id]]; else c.respuestas = [];
    	});

    	function onComentarioCreado(comentario) {
    		comentario.respuestas = [];

    		// Añadir el restag a los comentarios tageados por este comentario
    		$$invalidate(2, nuevosComentarios = [comentario, ...nuevosComentarios]);
    	}

    	let connection = new HubConnectionBuilder().withUrl("/hub").build();
    	connection.on("NuevoComentario", onComentarioCreado);

    	connection.start().then(() => {
    		console.log("Conectadito");
    		return connection.invoke("SubscribirseAHilo", hilo.id);
    	}).catch(console.error);

    	const writable_props = ["hilo", "comentarios"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Comentarios> was created with unknown prop '${key}'`);
    	});

    	function comentario_comentario_binding(value, comentario, each_value, comentario_index) {
    		each_value[comentario_index] = value;
    		$$invalidate(0, comentarios);
    	}

    	$$self.$$set = $$props => {
    		if ("hilo" in $$props) $$invalidate(1, hilo = $$props.hilo);
    		if ("comentarios" in $$props) $$invalidate(0, comentarios = $$props.comentarios);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		blur,
    		fly,
    		Comentario,
    		Formulario,
    		HubConnectionBuilder,
    		globalStore,
    		onMount,
    		VirtualList,
    		hilo,
    		comentarios,
    		nuevosComentarios,
    		cargarNuevosComentarios,
    		diccionarioRespuestas,
    		diccionarioComentarios,
    		onComentarioCreado,
    		connection
    	});

    	$$self.$inject_state = $$props => {
    		if ("hilo" in $$props) $$invalidate(1, hilo = $$props.hilo);
    		if ("comentarios" in $$props) $$invalidate(0, comentarios = $$props.comentarios);
    		if ("nuevosComentarios" in $$props) $$invalidate(2, nuevosComentarios = $$props.nuevosComentarios);
    		if ("diccionarioRespuestas" in $$props) diccionarioRespuestas = $$props.diccionarioRespuestas;
    		if ("diccionarioComentarios" in $$props) $$invalidate(3, diccionarioComentarios = $$props.diccionarioComentarios);
    		if ("connection" in $$props) connection = $$props.connection;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		comentarios,
    		hilo,
    		nuevosComentarios,
    		diccionarioComentarios,
    		cargarNuevosComentarios,
    		comentario_comentario_binding
    	];
    }

    class Comentarios extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { hilo: 1, comentarios: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Comentarios",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*hilo*/ ctx[1] === undefined && !("hilo" in props)) {
    			console_1.warn("<Comentarios> was created without expected prop 'hilo'");
    		}

    		if (/*comentarios*/ ctx[0] === undefined && !("comentarios" in props)) {
    			console_1.warn("<Comentarios> was created without expected prop 'comentarios'");
    		}
    	}

    	get hilo() {
    		throw new Error("<Comentarios>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hilo(value) {
    		throw new Error("<Comentarios>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get comentarios() {
    		throw new Error("<Comentarios>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comentarios(value) {
    		throw new Error("<Comentarios>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Acciones.svelte generated by Svelte v3.29.0 */
    const file$6 = "src\\components\\Acciones.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let span0;
    	let i0;
    	let t0;
    	let span0_class_value;
    	let span0_r_id_value;
    	let t1;
    	let span1;
    	let i1;
    	let t2;
    	let span1_class_value;
    	let t3;
    	let span2;
    	let i2;
    	let t4;
    	let span2_class_value;
    	let span2_r_id_value;
    	let t5;
    	let span3;
    	let i3;
    	let t6;
    	let t7;
    	let span4;
    	let tiempo;
    	let current;
    	let mounted;
    	let dispose;

    	tiempo = new Tiempo({
    			props: { date: /*hilo*/ ctx[1].creacion },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			i0 = element("i");
    			t0 = text("Favorito");
    			t1 = space();
    			span1 = element("span");
    			i1 = element("i");
    			t2 = text("Seguido");
    			t3 = space();
    			span2 = element("span");
    			i2 = element("i");
    			t4 = text("Oculto");
    			t5 = space();
    			span3 = element("span");
    			i3 = element("i");
    			t6 = text("Denunciar");
    			t7 = space();
    			span4 = element("span");
    			create_component(tiempo.$$.fragment);
    			attr_dev(i0, "class", "fe fe-star");
    			add_location(i0, file$6, 23, 31, 967);
    			attr_dev(span0, "class", span0_class_value = /*acciones*/ ctx[0].favorito ? " naranja" : "fantasma");
    			attr_dev(span0, "r-accion", "favoritos");
    			attr_dev(span0, "r-id", span0_r_id_value = /*hilo*/ ctx[1].id);
    			add_location(span0, file$6, 22, 4, 840);
    			attr_dev(i1, "class", "fe fe-eye");
    			add_location(i1, file$6, 28, 8, 1142);
    			attr_dev(span1, "class", span1_class_value = /*acciones*/ ctx[0].seguido ? " naranja" : "fantasma");
    			attr_dev(span1, "r-accion", "seguidos");
    			add_location(span1, file$6, 26, 4, 1029);
    			attr_dev(i2, "class", "fe fe-eye-off");
    			add_location(i2, file$6, 32, 8, 1315);
    			attr_dev(span2, "class", span2_class_value = /*acciones*/ ctx[0].hideado ? " naranja" : "fantasma");
    			attr_dev(span2, "r-accion", "ocultos");
    			attr_dev(span2, "r-id", span2_r_id_value = /*hilo*/ ctx[1].id);
    			add_location(span2, file$6, 30, 4, 1187);
    			attr_dev(i3, "class", "fe fe-flag");
    			add_location(i3, file$6, 34, 11, 1370);
    			add_location(span3, file$6, 34, 4, 1363);
    			add_location(span4, file$6, 36, 4, 1418);
    			attr_dev(div, "class", "panel acciones");
    			add_location(div, file$6, 20, 0, 587);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, i0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, i1);
    			append_dev(span1, t2);
    			append_dev(div, t3);
    			append_dev(div, span2);
    			append_dev(span2, i2);
    			append_dev(span2, t4);
    			append_dev(div, t5);
    			append_dev(div, span3);
    			append_dev(span3, i3);
    			append_dev(span3, t6);
    			append_dev(div, t7);
    			append_dev(div, span4);
    			mount_component(tiempo, span4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*favoritear*/ ctx[4], false, false, false),
    					listen_dev(span1, "click", /*seguir*/ ctx[2], false, false, false),
    					listen_dev(span2, "click", /*ocultar*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*acciones*/ 1 && span0_class_value !== (span0_class_value = /*acciones*/ ctx[0].favorito ? " naranja" : "fantasma")) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (!current || dirty & /*hilo*/ 2 && span0_r_id_value !== (span0_r_id_value = /*hilo*/ ctx[1].id)) {
    				attr_dev(span0, "r-id", span0_r_id_value);
    			}

    			if (!current || dirty & /*acciones*/ 1 && span1_class_value !== (span1_class_value = /*acciones*/ ctx[0].seguido ? " naranja" : "fantasma")) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (!current || dirty & /*acciones*/ 1 && span2_class_value !== (span2_class_value = /*acciones*/ ctx[0].hideado ? " naranja" : "fantasma")) {
    				attr_dev(span2, "class", span2_class_value);
    			}

    			if (!current || dirty & /*hilo*/ 2 && span2_r_id_value !== (span2_r_id_value = /*hilo*/ ctx[1].id)) {
    				attr_dev(span2, "r-id", span2_r_id_value);
    			}

    			const tiempo_changes = {};
    			if (dirty & /*hilo*/ 2) tiempo_changes.date = /*hilo*/ ctx[1].creacion;
    			tiempo.$set(tiempo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tiempo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tiempo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tiempo);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Acciones", slots, []);
    	let { hilo } = $$props;
    	let { acciones } = $$props;

    	async function seguir() {
    		await RChanClient.agregar("seguidos", hilo.id);
    		$$invalidate(0, acciones.seguido = !acciones.seguido, acciones);
    	}

    	async function ocultar() {
    		await RChanClient.agregar("ocultos", hilo.id);
    		$$invalidate(0, acciones.hideado = !acciones.hideado, acciones);
    	}

    	async function favoritear() {
    		await RChanClient.agregar("favoritos", hilo.id);
    		$$invalidate(0, acciones.favorito = !acciones.favorito, acciones);
    	}

    	const writable_props = ["hilo", "acciones"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Acciones> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("hilo" in $$props) $$invalidate(1, hilo = $$props.hilo);
    		if ("acciones" in $$props) $$invalidate(0, acciones = $$props.acciones);
    	};

    	$$self.$capture_state = () => ({
    		Tiempo,
    		RChanClient,
    		hilo,
    		acciones,
    		seguir,
    		ocultar,
    		favoritear
    	});

    	$$self.$inject_state = $$props => {
    		if ("hilo" in $$props) $$invalidate(1, hilo = $$props.hilo);
    		if ("acciones" in $$props) $$invalidate(0, acciones = $$props.acciones);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [acciones, hilo, seguir, ocultar, favoritear];
    }

    class Acciones extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { hilo: 1, acciones: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Acciones",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*hilo*/ ctx[1] === undefined && !("hilo" in props)) {
    			console.warn("<Acciones> was created without expected prop 'hilo'");
    		}

    		if (/*acciones*/ ctx[0] === undefined && !("acciones" in props)) {
    			console.warn("<Acciones> was created without expected prop 'acciones'");
    		}
    	}

    	get hilo() {
    		throw new Error("<Acciones>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hilo(value) {
    		throw new Error("<Acciones>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get acciones() {
    		throw new Error("<Acciones>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set acciones(value) {
    		throw new Error("<Acciones>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var dataEjemplo = {
        "notificaciones": [{
            "id": "MQVNMT6ADJGPO8PTAORE",
            "conteo": 1,
            "hiloId": null,
            "hiloTitulo": "No lo so\u00F1eeeeeeeeeeeeeeeeeeeiiiiiiiiiiiiiiiiiiiiiiiiiiiiiieeeeeeeeeeeeeee",
            "hiloImagen": "/PC_8c0d1e39d514c1a80ba05429a7d13bb5.jpg",
            "comentarioId": "40RGRTKO",
            "tipo": 0
        }],
        "hilo": {
            "cantidadComentarios": 0,
            "nuevo": false,
            "titulo": "Tag2",
            "id": "940B12NCHU1S52BK60CE",
            "bump": "2020-10-15T03:51:25.585403-03:00",
            "categoriaId": 1,
            "contenido": "asf",
            "creacion": "2020-08-05T07:43:17.319978-03:00",
            "media": {
                "url": "69efd770865e658be890364e21293c2e.jpg",
                "vistaPrevia": "/P_69efd770865e658be890364e21293c2e.jpg",
                "vistaPreviaCuadrado": "/PC_69efd770865e658be890364e21293c2e.jpg",
                "hash": "69efd770865e658be890364e21293c2e",
                "tipo": 0,
                "esGif": false,
                "id": "69efd770865e658be890364e21293c2e",
                "creacion": "2020-08-05T07:43:17.610297-03:00"
            },
            "thumbnail": null
        },
        "comentarios": [{
            "id": "0HO76FYA",
            "contenido": "test",
            "creacion": "2020-10-15T03:51:25.505858-03:00",
            "esOp": false,
            "media": null,
            "color": "orange"
        }, {
            "id": "BNVN0BJW",
            "contenido": "\u003Ca href=\u0022#BRAUNR76\u0022 class=\u0022restag\u0022 r-id=\u0022 BRAUNR76\u0022\u003E\u0026gt;\u0026gt;BRAUNR76\u003C/a\u003E\u0026#xA;\u003Ca href=\u0022#CVZB08SG\u0022 class=\u0022restag\u0022 r-id=\u0022 CVZB08SG\u0022\u003E\u0026gt;\u0026gt;CVZB08SG\u003C/a\u003E\u0026#xA;",
            "creacion": "2020-10-15T03:38:36.095192-03:00",
            "esOp": false,
            "media": null,
            "color": "blue"
        }, {
            "id": "Y61VDNFD",
            "contenido": "pepestruilo",
            "creacion": "2020-10-15T03:38:03.603783-03:00",
            "esOp": false,
            "media": null,
            "color": "red"
        }, {
            "id": "BRAUNR76",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:19:37.019788-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "CVZB08SG",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:18:56.452466-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "C0BUPDPD",
            "contenido": "test",
            "creacion": "2020-08-08T07:18:45.08305-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "1JNGLI7V",
            "contenido": "asdfsadf",
            "creacion": "2020-08-08T07:18:43.403175-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "K5MPV1QH",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:18:39.453952-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "HO851GSZ",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:18:37.772-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "XIU3QUKC",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:18:36.767011-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "NUGKP06S",
            "contenido": "asf",
            "creacion": "2020-08-08T07:18:17.437132-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "YNY6PZ4K",
            "contenido": "asf",
            "creacion": "2020-08-08T07:18:16.439652-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "L9JZ2A66",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:18:15.101669-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "6WU00STM",
            "contenido": "v",
            "creacion": "2020-08-08T07:18:02.874949-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "ZH1A2JY5",
            "contenido": "v",
            "creacion": "2020-08-08T07:18:01.995266-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "V10K5A6L",
            "contenido": "v",
            "creacion": "2020-08-08T07:18:01.106969-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "1LEQPALA",
            "contenido": "v",
            "creacion": "2020-08-08T07:18:00.140541-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "LJ56SG0Y",
            "contenido": "set",
            "creacion": "2020-08-08T07:16:28.420492-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "69NJYF9Z",
            "contenido": "test",
            "creacion": "2020-08-08T07:16:26.155096-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "SBYBB6RM",
            "contenido": "test",
            "creacion": "2020-08-08T07:16:24.132865-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "B5M5AVPB",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:16:20.55429-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "HGTX9FSM",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:16:19.586562-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "VA3JLTC7",
            "contenido": "asdfasf",
            "creacion": "2020-08-08T07:16:18.580286-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "4KXFM16L",
            "contenido": "asdfasf",
            "creacion": "2020-08-08T07:16:16.763545-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "JNGCCC4Z",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:16:13.725145-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "E3K9JROL",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:15:57.66079-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "EN1SMZC3",
            "contenido": "as",
            "creacion": "2020-08-08T07:15:55.100267-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "3QGVJHYR",
            "contenido": "asdfasdf",
            "creacion": "2020-08-08T07:15:25.402605-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "WJAYRJF2",
            "contenido": "asf",
            "creacion": "2020-08-08T07:15:23.356-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "SKS7WDCO",
            "contenido": "asdfasdf",
            "creacion": "2020-08-08T07:15:17.323123-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "9ADRWTNF",
            "contenido": "asdfasdf",
            "creacion": "2020-08-08T07:15:13.570457-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "OL13MD0L",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:15:12.050709-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "NR82J2OB",
            "contenido": "asf",
            "creacion": "2020-08-08T07:15:10.109421-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "U4Y1TQGY",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:14:36.442893-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "VIRV7AAA",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:14:35.55644-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "427NFQCO",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:14:23.066562-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "GSLD1L4V",
            "contenido": "adsf",
            "creacion": "2020-08-08T07:14:20.884057-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "1CPZZEFK",
            "contenido": "as",
            "creacion": "2020-08-08T07:14:05.916005-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "MJ7WWKQ5",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:12:52.802804-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "2S1FLU5G",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:12:50.756203-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "LB0Q38F6",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:12:32.308065-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "9QO444WW",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:12:31.555008-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "U9Z066VN",
            "contenido": "asdfa",
            "creacion": "2020-08-08T07:12:30.347311-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "E3FWER1Y",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:12:19.484182-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "2NQOGD89",
            "contenido": "saf",
            "creacion": "2020-08-08T07:12:16.764129-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "XD7RVLAM",
            "contenido": "asas",
            "creacion": "2020-08-08T07:11:58.788553-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "A0S69QGA",
            "contenido": "assf",
            "creacion": "2020-08-08T07:10:09.994472-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "8LOS3KNL",
            "contenido": "asf",
            "creacion": "2020-08-08T07:10:08.73812-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "4GRC81MI",
            "contenido": "asf",
            "creacion": "2020-08-08T07:10:07.460058-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "87KZQO3V",
            "contenido": "asdf",
            "creacion": "2020-08-08T07:03:19.556327-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "1QCD8TAU",
            "contenido": "asd",
            "creacion": "2020-08-08T07:03:17.916277-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "1W8KVXG6",
            "contenido": "sad",
            "creacion": "2020-08-08T07:00:47.052352-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "TYY5O6AR",
            "contenido": "asdf",
            "creacion": "2020-08-08T06:56:53.282385-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "8GXJNBUF",
            "contenido": "asdf",
            "creacion": "2020-08-08T06:56:50.814569-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "F93FE2U8",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:48:56.474754-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "WOLA0WX0",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:48:51.946124-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "NT5J5EXG",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:48:47.859486-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "TOHHC1YE",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:48:40.307462-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "VO3VZ7X6",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:48:37.618534-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "6I3BOJF6",
            "contenido": "as",
            "creacion": "2020-08-08T04:48:33.809833-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "5VCHXVIW",
            "contenido": "as",
            "creacion": "2020-08-08T04:48:30.218668-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "AL5OU7NK",
            "contenido": "as",
            "creacion": "2020-08-08T04:48:25.437938-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "25BIJTYC",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:47:49.700187-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "C03058LL",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:47:41.343054-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "PIQIS8GJ",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:47:05.13168-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "570VQ0F6",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:46:58.043028-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "UDR52IAB",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:46:47.827262-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "BASSQE31",
            "contenido": "sadf",
            "creacion": "2020-08-08T04:45:22.218249-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "KBM0MKS4",
            "contenido": "asf",
            "creacion": "2020-08-08T04:45:20.458633-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "QVXVL0OR",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:18.842649-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "UVV51NR2",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:17.427528-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "X401J4YT",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:16.547557-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "PMZGGEMR",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:12.881911-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "WJWBQOE2",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:11.794829-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "8OSFNG5C",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:08.698132-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "5O31DCRZ",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:01.442932-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "8MXJ5825",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:45:01.378184-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "VBKUJKT4",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:44:20.097493-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "QQ0WGCW1",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:44:18.875878-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "C8GYS4NI",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:44:17.364572-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "FIBHD08O",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:44:14.979302-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "TLW8WD2C",
            "contenido": "asdfasdf",
            "creacion": "2020-08-08T04:44:12.650435-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "W4260J1A",
            "contenido": "adsfasdf",
            "creacion": "2020-08-08T04:44:10.961832-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "81O3R6G6",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:43:58.123397-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "BMB366IF",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:43:11.63691-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "EWMMQ98M",
            "contenido": "asf",
            "creacion": "2020-08-08T04:43:07.003623-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "KLEFP7X4",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:42:05.629041-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "BEUCUFU4",
            "contenido": "\u0026quot;\u0026lt;script\u0026gt;\u0026lt;img%20src=\u0026quot;1\u0026quot;%20onerror=\u0026quot;alert(\u0026#x27;XSS%20by%20Sh3ld0n\u0026#x27;)\u0026quot;\u0026gt;",
            "creacion": "2020-08-08T04:35:04.929416-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "7GG1U8QJ",
            "contenido": "\u0026quot;\u0026lt;script\u0026gt;\u0026lt;img%20src=\u0026quot;1\u0026quot;%20onerror=\u0026quot;alert(\u0026#x27;XSS%20by%20Sh3ld0n\u0026#x27;)\u0026quot;\u0026gt;",
            "creacion": "2020-08-08T04:34:50.804846-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "BGYDH5PH",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:30:40.266278-03:00",
            "esOp": false,
            "media": null,
            "color": "red"
        }, {
            "id": "EOAP7C90",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:30:09.242351-03:00",
            "esOp": false,
            "media": null,
            "color": "yellow"
        }, {
            "id": "HQT99CY3",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:29:53.358919-03:00",
            "esOp": false,
            "media": null,
            "color": "red"
        }, {
            "id": "7ENOTFCG",
            "contenido": "asfd",
            "creacion": "2020-08-08T04:29:50.32852-03:00",
            "esOp": false,
            "media": null,
            "color": "yellow"
        }, {
            "id": "79FJTQMU",
            "contenido": "safasf",
            "creacion": "2020-08-08T04:26:34.646944-03:00",
            "esOp": false,
            "media": null,
            "color": "blue"
        }, {
            "id": "ODK2TEET",
            "contenido": "asfasf",
            "creacion": "2020-08-08T04:26:33.375214-03:00",
            "esOp": false,
            "media": null,
            "color": "red"
        }, {
            "id": "XJ1D58N9",
            "contenido": "sasfasf",
            "creacion": "2020-08-08T04:26:32.331992-03:00",
            "esOp": false,
            "media": null,
            "color": "red"
        }, {
            "id": "5G0WCNE8",
            "contenido": "asdbfasdfb",
            "creacion": "2020-08-08T04:24:02.866052-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "2RNPTI4S",
            "contenido": "sabdfasdf",
            "creacion": "2020-08-08T04:24:00.128401-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "TMPHI0GT",
            "contenido": "asdfbasdfb",
            "creacion": "2020-08-08T04:23:58.689331-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "31WIUJ1F",
            "contenido": "asdbfasdfbabs",
            "creacion": "2020-08-08T04:23:57.369966-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "KDS71765",
            "contenido": "asdfbasdfb",
            "creacion": "2020-08-08T04:23:54.441718-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "JGJ4E9LN",
            "contenido": "asdbasdb",
            "creacion": "2020-08-08T04:23:52.921184-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "6TFU5SG8",
            "contenido": "asdfbasb",
            "creacion": "2020-08-08T04:23:51.633297-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "RHTB0VK6",
            "contenido": "asdbfasb",
            "creacion": "2020-08-08T04:23:50.433195-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "C8QWV2D9",
            "contenido": "asdfbafb",
            "creacion": "2020-08-08T04:23:49.201571-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "14IL1OLB",
            "contenido": "asbfdasbf",
            "creacion": "2020-08-08T04:23:47.977568-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "Y61EPEKS",
            "contenido": "dfbasbfa",
            "creacion": "2020-08-08T04:23:46.472893-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "2VFV6HUR",
            "contenido": "asdfba",
            "creacion": "2020-08-08T04:23:45.305435-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "CTYAZNKC",
            "contenido": "afbasd",
            "creacion": "2020-08-08T04:23:44.217125-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "DQB4QWXW",
            "contenido": "safb",
            "creacion": "2020-08-08T04:23:42.912095-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "N2JLW6HH",
            "contenido": "dnfg",
            "creacion": "2020-08-08T04:23:41.216993-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "YZVSGK32",
            "contenido": "rtbd",
            "creacion": "2020-08-08T04:23:39.608392-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "O8CM22J1",
            "contenido": "hdfg",
            "creacion": "2020-08-08T04:23:38.617172-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "2SZE7ZQ7",
            "contenido": "g fgh",
            "creacion": "2020-08-08T04:23:37.82542-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "5BN4KR00",
            "contenido": "sdf",
            "creacion": "2020-08-08T04:23:36.608147-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "LTRD810C",
            "contenido": "tsef",
            "creacion": "2020-08-08T04:23:35.952459-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "Z4H4MF1U",
            "contenido": "asd",
            "creacion": "2020-08-08T04:23:35.104235-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "UD5FMA0R",
            "contenido": "asd",
            "creacion": "2020-08-08T04:23:34.288625-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "KUO3OGKJ",
            "contenido": "ad",
            "creacion": "2020-08-08T04:23:33.434855-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "IOS7CSWK",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:23:06.19394-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "AXO9MGNO",
            "contenido": "sdf",
            "creacion": "2020-08-08T04:23:05.24808-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "X9KBBEXW",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:23:04.44326-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "DQCVHCB7",
            "contenido": "astest",
            "creacion": "2020-08-08T04:23:03.610347-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "54VWIMQW",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:23:01.441699-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "MJ0S3IGR",
            "contenido": "dfa",
            "creacion": "2020-08-08T04:23:00.408652-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "W0GSJQ1R",
            "contenido": "dfaasdf",
            "creacion": "2020-08-08T04:22:59.464073-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "WO6O1YF5",
            "contenido": "sdfasdf",
            "creacion": "2020-08-08T04:22:57.608817-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "C1E1JDZG",
            "contenido": "sdfasdf",
            "creacion": "2020-08-08T04:22:56.633523-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "W3571IW6",
            "contenido": "fa",
            "creacion": "2020-08-08T04:22:55.448114-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "Z2WYADR2",
            "contenido": "sdfasd",
            "creacion": "2020-08-08T04:22:54.568795-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "0R1YONDZ",
            "contenido": "fasd",
            "creacion": "2020-08-08T04:22:53.106046-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "V3CMLYF8",
            "contenido": "ast",
            "creacion": "2020-08-08T04:22:51.608362-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "J0Q6L6F1",
            "contenido": "asf",
            "creacion": "2020-08-08T04:22:48.320594-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "52MW6SMU",
            "contenido": "sf",
            "creacion": "2020-08-08T04:22:47.576209-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "3HT0ULQA",
            "contenido": "sfasf",
            "creacion": "2020-08-08T04:22:46.953954-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "L9NEXIF7",
            "contenido": "faf",
            "creacion": "2020-08-08T04:22:46.170313-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "BF3SRM0N",
            "contenido": "asf",
            "creacion": "2020-08-08T04:22:44.969803-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "G5PU68EX",
            "contenido": "asf",
            "creacion": "2020-08-08T04:22:43.888422-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "EMGOLY23",
            "contenido": "saf",
            "creacion": "2020-08-08T04:22:42.819284-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "TNORCEOW",
            "contenido": "tset",
            "creacion": "2020-08-08T04:22:20.866247-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "ZXWTSMDJ",
            "contenido": "tset",
            "creacion": "2020-08-08T04:22:16.30915-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "CH3YC102",
            "contenido": "tset",
            "creacion": "2020-08-08T04:22:13.282903-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "ZOI6RBZH",
            "contenido": "tset",
            "creacion": "2020-08-08T04:22:09.741232-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "P18TGD5I",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:22:00.360318-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "56DS10XG",
            "contenido": "asdfag",
            "creacion": "2020-08-08T04:21:55.600833-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "ZAV62UVK",
            "contenido": "asdgasdf",
            "creacion": "2020-08-08T04:21:48.513037-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "9GU3JAXU",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:21:43.392099-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "MK8RPV44",
            "contenido": "asgasdgh",
            "creacion": "2020-08-08T04:21:42.344708-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "I01TYXXS",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:21:41.152889-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "4TJHCC59",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:21:40.304146-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "4CKK3EVL",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:21:39.482788-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "N05LJTJL",
            "contenido": "asfdf",
            "creacion": "2020-08-08T04:21:38.465338-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "ZKLPQC1X",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:21:36.799925-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "OIRP5TKR",
            "contenido": "asdf\u0026#xA;\u0026#xA;",
            "creacion": "2020-08-08T04:21:35.847915-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "VD8LIL6D",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:21:32.809392-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "TSIQ4ADD",
            "contenido": "sdf",
            "creacion": "2020-08-08T04:21:31.714541-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "W1XYQUR0",
            "contenido": "dfas",
            "creacion": "2020-08-08T04:21:30.967528-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "M8G6N1Q3",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:21:30.146895-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "H4RO4RAD",
            "contenido": "dddddddddddddddddasdf",
            "creacion": "2020-08-08T04:21:29.415894-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "JFE7GD0H",
            "contenido": "Jeje",
            "creacion": "2020-08-08T04:20:59.609223-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "UOM4NCPY",
            "contenido": "\u003Ca href=\u0022#28HRW88K\u0022 class=\u0022restag\u0022 r-id=\u0022 28HRW88K\u0022\u003E\u0026gt;\u0026gt;28HRW88K\u003C/a\u003E\u0026#xA;asdf",
            "creacion": "2020-08-08T04:20:53.29718-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "HMLFG0Z0",
            "contenido": "\u003Ca href=\u0022#28HRW88K\u0022 class=\u0022restag\u0022 r-id=\u0022 28HRW88K\u0022\u003E\u0026gt;\u0026gt;28HRW88K\u003C/a\u003E\u0026#xA;",
            "creacion": "2020-08-08T04:20:39.324529-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "28HRW88K",
            "contenido": "gg",
            "creacion": "2020-08-08T04:19:04.1118-03:00",
            "esOp": true,
            "media": {
                "url": "69efd770865e658be890364e21293c2e.jpg",
                "vistaPrevia": "/P_69efd770865e658be890364e21293c2e.jpg",
                "vistaPreviaCuadrado": "/PC_69efd770865e658be890364e21293c2e.jpg",
                "hash": "69efd770865e658be890364e21293c2e",
                "tipo": 0,
                "esGif": false,
                "id": "69efd770865e658be890364e21293c2e",
                "creacion": "2020-08-05T07:43:17.610297-03:00"
            },
            "color": "red"
        }, {
            "id": "UMSHC3O5",
            "contenido": "test",
            "creacion": "2020-08-08T04:18:57.529463-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "CKINIZ7W",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:18:55.474984-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "AWZKNB8W",
            "contenido": "tese",
            "creacion": "2020-08-08T04:18:25.183913-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "OG1ZKZL3",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:18:22.885451-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "2SBPEWPY",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:18:21.656867-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "9SGM16BD",
            "contenido": "tres",
            "creacion": "2020-08-08T04:11:09.912031-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "RIXVYNXI",
            "contenido": "dos",
            "creacion": "2020-08-08T04:11:07.519799-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "SVPL0EIS",
            "contenido": "uno",
            "creacion": "2020-08-08T04:11:04.906041-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "A0SI6OCZ",
            "contenido": "tres",
            "creacion": "2020-08-08T04:10:55.872404-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "8JEHTAXW",
            "contenido": "dos",
            "creacion": "2020-08-08T04:10:53.460217-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "CQ6KKZAC",
            "contenido": "uno",
            "creacion": "2020-08-08T04:10:50.690348-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "EQFBFW4L",
            "contenido": "Tres",
            "creacion": "2020-08-08T04:09:36.216649-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "79VEV6DU",
            "contenido": "Dos",
            "creacion": "2020-08-08T04:09:34.239851-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "FLU0CUY8",
            "contenido": "Uno",
            "creacion": "2020-08-08T04:09:31.882528-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "VWFT16GO",
            "contenido": "tres",
            "creacion": "2020-08-08T04:08:46.808012-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "GYYQIRSX",
            "contenido": "dos",
            "creacion": "2020-08-08T04:08:44.143201-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "8EXKSD0Z",
            "contenido": "uno",
            "creacion": "2020-08-08T04:08:41.759763-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "3VER6QI1",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:08:31.944569-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "X5GM04DC",
            "contenido": "asf",
            "creacion": "2020-08-08T04:08:25.305449-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "OG1UIJGW",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:07:25.56063-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "IINNLGCV",
            "contenido": "asf",
            "creacion": "2020-08-08T04:06:42.546292-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "72I3O7I7",
            "contenido": "tata",
            "creacion": "2020-08-08T04:03:49.961086-03:00",
            "esOp": false,
            "media": null,
            "color": "red"
        }, {
            "id": "UA8ZC4MB",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:03:43.864584-03:00",
            "esOp": false,
            "media": null,
            "color": "yellow"
        }, {
            "id": "1KFZSE7C",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:03:17.232951-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "IYIM0Y4R",
            "contenido": "re",
            "creacion": "2020-08-08T04:03:15.87198-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "7MA38H8P",
            "contenido": "2",
            "creacion": "2020-08-08T04:03:12.112566-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "2QR2CCS0",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:03:05.793935-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "DRMY1EVA",
            "contenido": "as",
            "creacion": "2020-08-08T04:03:01.088629-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "D25H9ZAA",
            "contenido": "tsef",
            "creacion": "2020-08-08T04:02:39.240726-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "GGB1GTXP",
            "contenido": "as",
            "creacion": "2020-08-08T04:02:34.128855-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "H1KIH43Z",
            "contenido": "asfd",
            "creacion": "2020-08-08T04:01:45.176423-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "85DLFV63",
            "contenido": "s",
            "creacion": "2020-08-08T04:01:40.680741-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "V0BH998F",
            "contenido": "asdf",
            "creacion": "2020-08-08T04:01:33.528946-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "WYKYUNKZ",
            "contenido": "tset",
            "creacion": "2020-08-08T04:01:14.649668-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "9BXLU5Q0",
            "contenido": "Dos",
            "creacion": "2020-08-08T04:00:48.083425-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "2OSR8B79",
            "contenido": "Uno",
            "creacion": "2020-08-08T04:00:02.811756-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "UX6XPRHH",
            "contenido": "asdf",
            "creacion": "2020-08-08T03:23:33.223707-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "5E1KJ4FN",
            "contenido": "tset",
            "creacion": "2020-08-08T03:23:20.519987-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "A8JA24IC",
            "contenido": "saf",
            "creacion": "2020-08-08T03:09:21.424652-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "4O1QHLLL",
            "contenido": "\u003Ca href=\u0022#J7AT6EPW\u0022 class=\u0022restag\u0022 r-id=\u0022 J7AT6EPW\u0022\u003E\u0026gt;\u0026gt;J7AT6EPW\u003C/a\u003E\u0026#xA;asdf",
            "creacion": "2020-08-08T03:09:04.806296-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "80VJECHQ",
            "contenido": "asdf",
            "creacion": "2020-08-08T03:08:08.361841-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "TDS1AKLA",
            "contenido": "asdf",
            "creacion": "2020-08-08T03:08:05.684055-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "VSLKLKD8",
            "contenido": "asf",
            "creacion": "2020-08-08T03:07:59.629676-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "J7AT6EPW",
            "contenido": "tttt",
            "creacion": "2020-08-08T03:06:21.309643-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "MXXV964P",
            "contenido": "saf",
            "creacion": "2020-08-08T03:06:15.835831-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "QQU5SDFU",
            "contenido": "ttiti",
            "creacion": "2020-08-08T03:01:51.530083-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "NY3BNI4H",
            "contenido": "asdf",
            "creacion": "2020-08-08T03:01:43.590751-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "EDK862XH",
            "contenido": "asdf",
            "creacion": "2020-08-08T03:01:27.663684-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "HOL8HVF4",
            "contenido": "Naouno",
            "creacion": "2020-08-08T03:00:47.548276-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "OJZY9EMR",
            "contenido": "Naono",
            "creacion": "2020-08-08T03:00:31.32841-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "AO1EXGCM",
            "contenido": "tsdf",
            "creacion": "2020-08-08T03:00:14.576844-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "YYF49K5C",
            "contenido": "tset",
            "creacion": "2020-08-08T02:35:31.107393-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "OS29EI2E",
            "contenido": "test",
            "creacion": "2020-08-08T02:35:26.949193-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "WUMZXL5U",
            "contenido": "\u003Ca href=\u0022#4G97I606\u0022 class=\u0022restag\u0022 r-id=\u0022 4G97I606\u0022\u003E\u0026gt;\u0026gt;4G97I606\u003C/a\u003E\u0026#xA;ll",
            "creacion": "2020-08-06T04:39:41.710714-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "4G97I606",
            "contenido": "asdf",
            "creacion": "2020-08-05T23:25:18.003182-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "Q5H4GGEL",
            "contenido": "asdf",
            "creacion": "2020-08-05T23:25:15.996699-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "U19ONVBQ",
            "contenido": "sdfg",
            "creacion": "2020-08-05T23:25:06.454809-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "76GZW01Y",
            "contenido": "asdf",
            "creacion": "2020-08-05T23:25:02.368435-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "I91VKWD8",
            "contenido": "asdf",
            "creacion": "2020-08-05T23:24:48.96185-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "KPJLAD1I",
            "contenido": "test",
            "creacion": "2020-08-05T23:24:16.211295-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "8B4WQ07J",
            "contenido": "test",
            "creacion": "2020-08-05T21:27:21.927504-03:00",
            "esOp": false,
            "media": null,
            "color": "yellow"
        }, {
            "id": "L68J7DBZ",
            "contenido": "\u003Ca href=\u0022#JRX5J8BD\u0022 class=\u0022restag\u0022 r-id=\u0022 JRX5J8BD\u0022\u003E\u0026gt;\u0026gt;JRX5J8BD\u003C/a\u003E\u0026#xD;\u0026#xA;\u003Ca href=\u0022#Q2SQHP76\u0022 class=\u0022restag\u0022 r-id=\u0022 Q2SQHP76\u0022\u003E\u0026gt;\u0026gt;Q2SQHP76\u003C/a\u003E\u0026#xD;\u0026#xA;test",
            "creacion": "2020-08-05T21:13:01.75429-03:00",
            "esOp": false,
            "media": null,
            "color": "red"
        }, {
            "id": "JRX5J8BD",
            "contenido": "as",
            "creacion": "2020-08-05T21:12:40.313022-03:00",
            "esOp": true,
            "media": null,
            "color": "blue"
        }, {
            "id": "Q2SQHP76",
            "contenido": "\u003Ca href=\u0022#T9LDX464\u0022 class=\u0022restag\u0022 r-id=\u0022 T9LDX464\u0022\u003E\u0026gt;\u0026gt;T9LDX464\u003C/a\u003E\u0026#xA;\u003Ca href=\u0022#9XOBYAK5\u0022 class=\u0022restag\u0022 r-id=\u0022 9XOBYAK5\u0022\u003E\u0026gt;\u0026gt;9XOBYAK5\u003C/a\u003E\u0026#xA;",
            "creacion": "2020-08-05T21:11:50.155694-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }, {
            "id": "T9LDX464",
            "contenido": "\u003Ca href=\u0022#12345975\u0022 class=\u0022restag\u0022 r-id=\u0022 12345975\u0022\u003E\u0026gt;\u0026gt;12345975\u003C/a\u003E",
            "creacion": "2020-08-05T20:00:56.540751-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "9XOBYAK5",
            "contenido": "tet",
            "creacion": "2020-08-05T19:22:48.796092-03:00",
            "esOp": true,
            "media": null,
            "color": "orange"
        }, {
            "id": "TZO2KUHE",
            "contenido": "\u003Ca href=\u0022#8PH7S0PQ\u0022 class=\u0022restag\u0022 r-id=\u0022 8PH7S0PQ\u0022\u003E\u0026gt;\u0026gt;8PH7S0PQ\u003C/a\u003E\u0026#xA;test",
            "creacion": "2020-08-05T08:03:14.420215-03:00",
            "esOp": true,
            "media": null,
            "color": "yellow"
        }, {
            "id": "8PH7S0PQ",
            "contenido": "\u003Ca href=\u0022#UCQ582ME\u0022 class=\u0022restag\u0022 r-id=\u0022 UCQ582ME\u0022\u003E\u0026gt;\u0026gt;UCQ582ME\u003C/a\u003E\u0026#xA;\u003Ca href=\u0022#BHDYV74Z\u0022 class=\u0022restag\u0022 r-id=\u0022 BHDYV74Z\u0022\u003E\u0026gt;\u0026gt;BHDYV74Z\u003C/a\u003E\u0026#xA;A ver",
            "creacion": "2020-08-05T08:03:04.835844-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "UCQ582ME",
            "contenido": "\u003Ca href=\u0022#BHDYV74Z\u0022 class=\u0022restag\u0022 r-id=\u0022 BHDYV74Z\u0022\u003E\u0026gt;\u0026gt;BHDYV74Z\u003C/a\u003E\u0026#xA;1",
            "creacion": "2020-08-05T07:43:36.255684-03:00",
            "esOp": true,
            "media": null,
            "color": "green"
        }, {
            "id": "BHDYV74Z",
            "contenido": "Jijiriji",
            "creacion": "2020-08-05T07:43:30.846711-03:00",
            "esOp": true,
            "media": null,
            "color": "red"
        }],
        "acciones": {
            "usuarioId": null,
            "hiloId": null,
            "seguido": false,
            "favorito": false,
            "hideado": false,
            "id": null,
            "creacion": "2020-10-15T03:51:30.0904794-03:00"
        }
    };

    /* src\components\Dialogo.svelte generated by Svelte v3.29.0 */

    const { console: console_1$1 } = globals;
    const file$7 = "src\\components\\Dialogo.svelte";
    const get_body_slot_changes = dirty => ({});
    const get_body_slot_context = ctx => ({});
    const get_activador_slot_changes = dirty => ({});
    const get_activador_slot_context = ctx => ({});

    // (29:8) <Button >
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*textoActivador*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*textoActivador*/ 4) set_data_dev(t, /*textoActivador*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(29:8) <Button >",
    		ctx
    	});

    	return block;
    }

    // (28:28)           
    function fallback_block_1(ctx) {
    	let button;
    	let current;

    	button = new ye({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope, textoActivador*/ 8196) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(28:28)           ",
    		ctx
    	});

    	return block;
    }

    // (34:8) <div slot="title">
    function create_title_slot(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*titulo*/ ctx[1]);
    			attr_dev(div, "slot", "title");
    			add_location(div, file$7, 33, 8, 861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*titulo*/ 2) set_data_dev(t, /*titulo*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(34:8) <div slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (37:8) {#if exito}
    function create_if_block$4(ctx) {
    	let p;
    	let t_value = /*respuesta*/ ctx[4].mensaje + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "exito svelte-8jmc29");
    			add_location(p, file$7, 37, 12, 978);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*respuesta*/ 16 && t_value !== (t_value = /*respuesta*/ ctx[4].mensaje + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(37:8) {#if exito}",
    		ctx
    	});

    	return block;
    }

    // (46:12) <Button color="primary" on:click={()=> visible = false}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancelar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(46:12) <Button color=\\\"primary\\\" on:click={()=> visible = false}>",
    		ctx
    	});

    	return block;
    }

    // (47:12) <Button color="primary" on:click={ejecutarAccion}>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Aceptar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(47:12) <Button color=\\\"primary\\\" on:click={ejecutarAccion}>",
    		ctx
    	});

    	return block;
    }

    // (45:8) <div slot="actions" class="actions center">
    function create_actions_slot(ctx) {
    	let div;
    	let button0;
    	let t;
    	let button1;
    	let current;

    	button0 = new ye({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler_1*/ ctx[11]);

    	button1 = new ye({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*ejecutarAccion*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div, "slot", "actions");
    			attr_dev(div, "class", "actions center");
    			add_location(div, file$7, 44, 8, 1114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot.name,
    		type: "slot",
    		source: "(45:8) <div slot=\\\"actions\\\" class=\\\"actions center\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:4) <Dialog width="320" bind:visible={visible}>
    function create_default_slot$1(ctx) {
    	let t0;
    	let errorvalidacion;
    	let updating_error;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	function errorvalidacion_error_binding(value) {
    		/*errorvalidacion_error_binding*/ ctx[10].call(null, value);
    	}

    	let errorvalidacion_props = {};

    	if (/*error*/ ctx[5] !== void 0) {
    		errorvalidacion_props.error = /*error*/ ctx[5];
    	}

    	errorvalidacion = new ErrorValidacion({
    			props: errorvalidacion_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(errorvalidacion, "error", errorvalidacion_error_binding));
    	let if_block = /*exito*/ ctx[3] && create_if_block$4(ctx);
    	const body_slot_template = /*#slots*/ ctx[8].body;
    	const body_slot = create_slot(body_slot_template, ctx, /*$$scope*/ ctx[13], get_body_slot_context);

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(errorvalidacion.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			if (body_slot) body_slot.c();
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(errorvalidacion, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t2, anchor);

    			if (body_slot) {
    				body_slot.m(target, anchor);
    			}

    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const errorvalidacion_changes = {};

    			if (!updating_error && dirty & /*error*/ 32) {
    				updating_error = true;
    				errorvalidacion_changes.error = /*error*/ ctx[5];
    				add_flush_callback(() => updating_error = false);
    			}

    			errorvalidacion.$set(errorvalidacion_changes);

    			if (/*exito*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(t2.parentNode, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (body_slot) {
    				if (body_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(body_slot, body_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_body_slot_changes, get_body_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(errorvalidacion.$$.fragment, local);
    			transition_in(body_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(errorvalidacion.$$.fragment, local);
    			transition_out(body_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(errorvalidacion, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (body_slot) body_slot.d(detaching);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(33:4) <Dialog width=\\\"320\\\" bind:visible={visible}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let span;
    	let t;
    	let dialog;
    	let updating_visible;
    	let current;
    	let mounted;
    	let dispose;
    	const activador_slot_template = /*#slots*/ ctx[8].activador;
    	const activador_slot = create_slot(activador_slot_template, ctx, /*$$scope*/ ctx[13], get_activador_slot_context);
    	const activador_slot_or_fallback = activador_slot || fallback_block_1(ctx);

    	function dialog_visible_binding(value) {
    		/*dialog_visible_binding*/ ctx[12].call(null, value);
    	}

    	let dialog_props = {
    		width: "320",
    		$$slots: {
    			default: [create_default_slot$1],
    			actions: [create_actions_slot],
    			title: [create_title_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[0] !== void 0) {
    		dialog_props.visible = /*visible*/ ctx[0];
    	}

    	dialog = new pn({ props: dialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog, "visible", dialog_visible_binding));

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (activador_slot_or_fallback) activador_slot_or_fallback.c();
    			t = space();
    			create_component(dialog.$$.fragment);
    			add_location(span, file$7, 26, 0, 666);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (activador_slot_or_fallback) {
    				activador_slot_or_fallback.m(span, null);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(dialog, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (activador_slot) {
    				if (activador_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(activador_slot, activador_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_activador_slot_changes, get_activador_slot_context);
    				}
    			} else {
    				if (activador_slot_or_fallback && activador_slot_or_fallback.p && dirty & /*textoActivador*/ 4) {
    					activador_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			const dialog_changes = {};

    			if (dirty & /*$$scope, visible, respuesta, exito, error, titulo*/ 8251) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 1) {
    				updating_visible = true;
    				dialog_changes.visible = /*visible*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(activador_slot_or_fallback, local);
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activador_slot_or_fallback, local);
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (activador_slot_or_fallback) activador_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(dialog, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dialogo", slots, ['activador','body']);
    	let { titulo = "Accion" } = $$props;
    	let { accion = () => console.log("Accionado") } = $$props;
    	let { visible = false } = $$props;
    	let { textoActivador = "Accion" } = $$props;
    	let exito = false;
    	let respuesta = null;

    	async function ejecutarAccion() {
    		try {
    			$$invalidate(5, error = null);
    			$$invalidate(4, respuesta = (await accion()).data);
    			$$invalidate(3, exito = true);
    			setTimeout(() => $$invalidate(0, visible = false), 1000);
    		} catch(e) {
    			$$invalidate(5, error = e.response.data);
    		}
    	}

    	let error = null;
    	const writable_props = ["titulo", "accion", "visible", "textoActivador"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Dialogo> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, visible = true);

    	function errorvalidacion_error_binding(value) {
    		error = value;
    		$$invalidate(5, error);
    	}

    	const click_handler_1 = () => $$invalidate(0, visible = false);

    	function dialog_visible_binding(value) {
    		visible = value;
    		$$invalidate(0, visible);
    	}

    	$$self.$$set = $$props => {
    		if ("titulo" in $$props) $$invalidate(1, titulo = $$props.titulo);
    		if ("accion" in $$props) $$invalidate(7, accion = $$props.accion);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("textoActivador" in $$props) $$invalidate(2, textoActivador = $$props.textoActivador);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ErrorValidacion,
    		Dialog: pn,
    		Button: ye,
    		titulo,
    		accion,
    		visible,
    		textoActivador,
    		exito,
    		respuesta,
    		ejecutarAccion,
    		error
    	});

    	$$self.$inject_state = $$props => {
    		if ("titulo" in $$props) $$invalidate(1, titulo = $$props.titulo);
    		if ("accion" in $$props) $$invalidate(7, accion = $$props.accion);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("textoActivador" in $$props) $$invalidate(2, textoActivador = $$props.textoActivador);
    		if ("exito" in $$props) $$invalidate(3, exito = $$props.exito);
    		if ("respuesta" in $$props) $$invalidate(4, respuesta = $$props.respuesta);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		titulo,
    		textoActivador,
    		exito,
    		respuesta,
    		error,
    		ejecutarAccion,
    		accion,
    		slots,
    		click_handler,
    		errorvalidacion_error_binding,
    		click_handler_1,
    		dialog_visible_binding,
    		$$scope
    	];
    }

    class Dialogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			titulo: 1,
    			accion: 7,
    			visible: 0,
    			textoActivador: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialogo",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get titulo() {
    		throw new Error("<Dialogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titulo(value) {
    		throw new Error("<Dialogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accion() {
    		throw new Error("<Dialogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accion(value) {
    		throw new Error("<Dialogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Dialogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Dialogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textoActivador() {
    		throw new Error("<Dialogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textoActivador(value) {
    		throw new Error("<Dialogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.0 */
    const file$8 = "src\\App.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (38:2) {#if $globalStore.usuario.esMod}
    function create_if_block$5(ctx) {
    	let div;
    	let dialogo0;
    	let t0;
    	let dialogo1;
    	let t1;
    	let dialogo2;
    	let current;

    	dialogo0 = new Dialogo({
    			props: {
    				textoActivador: "Sticky",
    				titulo: "Configurar Sticky",
    				accion: /*dialogs*/ ctx[3].sticky.accion,
    				$$slots: { body: [create_body_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	dialogo1 = new Dialogo({
    			props: {
    				textoActivador: "Categoria",
    				titulo: "Cambiar categoria",
    				accion: /*func*/ ctx[10],
    				$$slots: { body: [create_body_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	dialogo2 = new Dialogo({
    			props: {
    				textoActivador: "Eliminar",
    				titulo: "Eliminar hilo",
    				accion: /*func_1*/ ctx[11],
    				$$slots: { body: [create_body_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(dialogo0.$$.fragment);
    			t0 = space();
    			create_component(dialogo1.$$.fragment);
    			t1 = space();
    			create_component(dialogo2.$$.fragment);
    			attr_dev(div, "class", "acciones-mod panel");
    			add_location(div, file$8, 38, 3, 1205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(dialogo0, div, null);
    			append_dev(div, t0);
    			mount_component(dialogo1, div, null);
    			append_dev(div, t1);
    			mount_component(dialogo2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dialogo0_changes = {};
    			if (dirty & /*dialogs*/ 8) dialogo0_changes.accion = /*dialogs*/ ctx[3].sticky.accion;

    			if (dirty & /*$$scope, dialogs*/ 262152) {
    				dialogo0_changes.$$scope = { dirty, ctx };
    			}

    			dialogo0.$set(dialogo0_changes);
    			const dialogo1_changes = {};
    			if (dirty & /*hilo, dialogs*/ 9) dialogo1_changes.accion = /*func*/ ctx[10];

    			if (dirty & /*$$scope, dialogs*/ 262152) {
    				dialogo1_changes.$$scope = { dirty, ctx };
    			}

    			dialogo1.$set(dialogo1_changes);
    			const dialogo2_changes = {};
    			if (dirty & /*hilo*/ 1) dialogo2_changes.accion = /*func_1*/ ctx[11];

    			if (dirty & /*$$scope*/ 262144) {
    				dialogo2_changes.$$scope = { dirty, ctx };
    			}

    			dialogo2.$set(dialogo2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialogo0.$$.fragment, local);
    			transition_in(dialogo1.$$.fragment, local);
    			transition_in(dialogo2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialogo0.$$.fragment, local);
    			transition_out(dialogo1.$$.fragment, local);
    			transition_out(dialogo2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(dialogo0);
    			destroy_component(dialogo1);
    			destroy_component(dialogo2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(38:2) {#if $globalStore.usuario.esMod}",
    		ctx
    	});

    	return block;
    }

    // (44:6) <Checkbox bind:checked={dialogs.sticky.global}>
    function create_default_slot_3$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Global";
    			add_location(span, file$8, 44, 7, 1491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(44:6) <Checkbox bind:checked={dialogs.sticky.global}>",
    		ctx
    	});

    	return block;
    }

    // (42:5) <div slot="body">
    function create_body_slot_2(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let checkbox;
    	let updating_checked;
    	let t2;
    	let p1;
    	let t4;
    	let textfield;
    	let updating_value;
    	let current;

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[7].call(null, value);
    	}

    	let checkbox_props = {
    		$$slots: { default: [create_default_slot_3$2] },
    		$$scope: { ctx }
    	};

    	if (/*dialogs*/ ctx[3].sticky.global !== void 0) {
    		checkbox_props.checked = /*dialogs*/ ctx[3].sticky.global;
    	}

    	checkbox = new Ne({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, "checked", checkbox_checked_binding));

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[8].call(null, value);
    	}

    	let textfield_props = {
    		autocomplete: "off",
    		label: "Importancia",
    		type: "number",
    		required: true,
    		message: ""
    	};

    	if (/*dialogs*/ ctx[3].sticky.importancia !== void 0) {
    		textfield_props.value = /*dialogs*/ ctx[3].sticky.importancia;
    	}

    	textfield = new Ve({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, "value", textfield_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "(Los stickies no globales solo aparecen en su categoria)";
    			t1 = space();
    			create_component(checkbox.$$.fragment);
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "(Un sticky de importancia 2 sale primero que un sticky de importancia 1 )";
    			t4 = space();
    			create_component(textfield.$$.fragment);
    			add_location(p0, file$8, 42, 6, 1366);
    			add_location(p1, file$8, 46, 6, 1535);
    			attr_dev(div, "slot", "body");
    			add_location(div, file$8, 41, 5, 1342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			mount_component(checkbox, div, null);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(div, t4);
    			mount_component(textfield, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				checkbox_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_checked && dirty & /*dialogs*/ 8) {
    				updating_checked = true;
    				checkbox_changes.checked = /*dialogs*/ ctx[3].sticky.global;
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*dialogs*/ 8) {
    				updating_value = true;
    				textfield_changes.value = /*dialogs*/ ctx[3].sticky.importancia;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(checkbox);
    			destroy_component(textfield);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot_2.name,
    		type: "slot",
    		source: "(42:5) <div slot=\\\"body\\\">",
    		ctx
    	});

    	return block;
    }

    // (64:7) {#each config.categorias as c}
    function create_each_block$4(ctx) {
    	let option;
    	let t_value = /*c*/ ctx[15].nombre + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*c*/ ctx[15].id;
    			option.value = option.__value;
    			add_location(option, file$8, 64, 7, 2267);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(64:7) {#each config.categorias as c}",
    		ctx
    	});

    	return block;
    }

    // (60:5) <div slot="body">
    function create_body_slot_1(ctx) {
    	let div;
    	let span;
    	let t0;
    	let select;
    	let option;
    	let mounted;
    	let dispose;
    	let each_value = config.categorias;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Categoría";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "asp-validation-for", "CategoriaId");
    			add_location(span, file$8, 60, 6, 2014);
    			option.__value = "-1";
    			option.value = option.__value;
    			option.selected = "selected";
    			option.disabled = "disabled";
    			add_location(option, file$8, 62, 7, 2144);
    			attr_dev(select, "name", "categoria");
    			if (/*dialogs*/ ctx[3].categoria.categoriaId === void 0) add_render_callback(() => /*select_change_handler*/ ctx[9].call(select));
    			add_location(select, file$8, 61, 6, 2067);
    			attr_dev(div, "slot", "body");
    			add_location(div, file$8, 59, 5, 1990);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t0);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*dialogs*/ ctx[3].categoria.categoriaId);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config*/ 0) {
    				each_value = config.categorias;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*dialogs, config*/ 8) {
    				select_option(select, /*dialogs*/ ctx[3].categoria.categoriaId);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot_1.name,
    		type: "slot",
    		source: "(60:5) <div slot=\\\"body\\\">",
    		ctx
    	});

    	return block;
    }

    // (72:5) <div slot="body">
    function create_body_slot(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "¿Estas seguro de que queres domar el hilo?";
    			attr_dev(div, "slot", "body");
    			add_location(div, file$8, 71, 5, 2492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot.name,
    		type: "slot",
    		source: "(72:5) <div slot=\\\"body\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let a0;
    	let t1;
    	let a1;
    	let t2;
    	let t3_value = config.getCategoriaById(/*hilo*/ ctx[0].categoriaId).nombre + "";
    	let t3;
    	let a1_href_value;
    	let t4;
    	let acciones_1;
    	let updating_hilo;
    	let updating_acciones;
    	let t5;
    	let t6;
    	let div2;
    	let a2;
    	let img;
    	let img_src_value;
    	let a2_href_value;
    	let t7;
    	let h1;
    	let t8_value = /*hilo*/ ctx[0].titulo + "";
    	let t8;
    	let t9;
    	let div1;
    	let t10_value = /*hilo*/ ctx[0].contenido + "";
    	let t10;
    	let t11;
    	let comentarios_1;
    	let updating_comentarios;
    	let div4_r_id_value;
    	let current;

    	function acciones_1_hilo_binding(value) {
    		/*acciones_1_hilo_binding*/ ctx[5].call(null, value);
    	}

    	function acciones_1_acciones_binding(value) {
    		/*acciones_1_acciones_binding*/ ctx[6].call(null, value);
    	}

    	let acciones_1_props = {};

    	if (/*hilo*/ ctx[0] !== void 0) {
    		acciones_1_props.hilo = /*hilo*/ ctx[0];
    	}

    	if (/*acciones*/ ctx[2] !== void 0) {
    		acciones_1_props.acciones = /*acciones*/ ctx[2];
    	}

    	acciones_1 = new Acciones({ props: acciones_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(acciones_1, "hilo", acciones_1_hilo_binding));
    	binding_callbacks.push(() => bind(acciones_1, "acciones", acciones_1_acciones_binding));
    	let if_block = /*$globalStore*/ ctx[4].usuario.esMod && create_if_block$5(ctx);

    	function comentarios_1_comentarios_binding(value) {
    		/*comentarios_1_comentarios_binding*/ ctx[12].call(null, value);
    	}

    	let comentarios_1_props = { hilo: /*hilo*/ ctx[0] };

    	if (/*comentarios*/ ctx[1] !== void 0) {
    		comentarios_1_props.comentarios = /*comentarios*/ ctx[1];
    	}

    	comentarios_1 = new Comentarios({
    			props: comentarios_1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(comentarios_1, "comentarios", comentarios_1_comentarios_binding));

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Roxed";
    			t1 = space();
    			a1 = element("a");
    			t2 = text("/");
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(acciones_1.$$.fragment);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			div2 = element("div");
    			a2 = element("a");
    			img = element("img");
    			t7 = space();
    			h1 = element("h1");
    			t8 = text(t8_value);
    			t9 = space();
    			div1 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			create_component(comentarios_1.$$.fragment);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$8, 32, 3, 971);
    			attr_dev(a1, "href", a1_href_value = "/" + config.getCategoriaById(/*hilo*/ ctx[0].categoriaId).nombreCorto);
    			add_location(a1, file$8, 33, 3, 996);
    			attr_dev(div0, "class", "panel");
    			add_location(div0, file$8, 31, 2, 948);
    			if (img.src !== (img_src_value = /*hilo*/ ctx[0].media.vistaPrevia)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "srcset", "");
    			add_location(img, file$8, 81, 4, 2680);
    			attr_dev(a2, "class", "imagen");
    			attr_dev(a2, "href", a2_href_value = "/" + /*hilo*/ ctx[0].media.url);
    			add_location(a2, file$8, 80, 3, 2632);
    			add_location(h1, file$8, 83, 3, 2747);
    			attr_dev(div1, "class", "texto");
    			add_location(div1, file$8, 84, 3, 2773);
    			attr_dev(div2, "class", "cuerpo");
    			add_location(div2, file$8, 79, 2, 2608);
    			attr_dev(div3, "class", "contenido");
    			add_location(div3, file$8, 30, 1, 922);
    			attr_dev(div4, "class", "hilo-completo");
    			attr_dev(div4, "r-id", div4_r_id_value = /*hilo*/ ctx[0].id);
    			add_location(div4, file$8, 29, 0, 878);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			append_dev(a1, t2);
    			append_dev(a1, t3);
    			append_dev(div3, t4);
    			mount_component(acciones_1, div3, null);
    			append_dev(div3, t5);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, a2);
    			append_dev(a2, img);
    			append_dev(div2, t7);
    			append_dev(div2, h1);
    			append_dev(h1, t8);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, t10);
    			append_dev(div4, t11);
    			mount_component(comentarios_1, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*hilo*/ 1) && t3_value !== (t3_value = config.getCategoriaById(/*hilo*/ ctx[0].categoriaId).nombre + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*hilo*/ 1 && a1_href_value !== (a1_href_value = "/" + config.getCategoriaById(/*hilo*/ ctx[0].categoriaId).nombreCorto)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			const acciones_1_changes = {};

    			if (!updating_hilo && dirty & /*hilo*/ 1) {
    				updating_hilo = true;
    				acciones_1_changes.hilo = /*hilo*/ ctx[0];
    				add_flush_callback(() => updating_hilo = false);
    			}

    			if (!updating_acciones && dirty & /*acciones*/ 4) {
    				updating_acciones = true;
    				acciones_1_changes.acciones = /*acciones*/ ctx[2];
    				add_flush_callback(() => updating_acciones = false);
    			}

    			acciones_1.$set(acciones_1_changes);

    			if (/*$globalStore*/ ctx[4].usuario.esMod) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$globalStore*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div3, t6);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*hilo*/ 1 && img.src !== (img_src_value = /*hilo*/ ctx[0].media.vistaPrevia)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*hilo*/ 1 && a2_href_value !== (a2_href_value = "/" + /*hilo*/ ctx[0].media.url)) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if ((!current || dirty & /*hilo*/ 1) && t8_value !== (t8_value = /*hilo*/ ctx[0].titulo + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*hilo*/ 1) && t10_value !== (t10_value = /*hilo*/ ctx[0].contenido + "")) set_data_dev(t10, t10_value);
    			const comentarios_1_changes = {};
    			if (dirty & /*hilo*/ 1) comentarios_1_changes.hilo = /*hilo*/ ctx[0];

    			if (!updating_comentarios && dirty & /*comentarios*/ 2) {
    				updating_comentarios = true;
    				comentarios_1_changes.comentarios = /*comentarios*/ ctx[1];
    				add_flush_callback(() => updating_comentarios = false);
    			}

    			comentarios_1.$set(comentarios_1_changes);

    			if (!current || dirty & /*hilo*/ 1 && div4_r_id_value !== (div4_r_id_value = /*hilo*/ ctx[0].id)) {
    				attr_dev(div4, "r-id", div4_r_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(acciones_1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(comentarios_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(acciones_1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(comentarios_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(acciones_1);
    			if (if_block) if_block.d();
    			destroy_component(comentarios_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $globalStore;
    	validate_store(globalStore, "globalStore");
    	component_subscribe($$self, globalStore, $$value => $$invalidate(4, $globalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let data = window.data || dataEjemplo;
    	let { hilo, comentarios, acciones } = data;

    	let dialogs = {
    		sticky: {
    			global: true,
    			importancia: 1,
    			async accion() {
    				return await RChanClient.añadirSticky(hilo.id, dialogs.sticky.global, dialogs.sticky.importancia);
    			}
    		},
    		categoria: { categoriaId: hilo.categoriaId }
    	};

    	let selected = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function acciones_1_hilo_binding(value) {
    		hilo = value;
    		$$invalidate(0, hilo);
    	}

    	function acciones_1_acciones_binding(value) {
    		acciones = value;
    		$$invalidate(2, acciones);
    	}

    	function checkbox_checked_binding(value) {
    		dialogs.sticky.global = value;
    		$$invalidate(3, dialogs);
    	}

    	function textfield_value_binding(value) {
    		dialogs.sticky.importancia = value;
    		$$invalidate(3, dialogs);
    	}

    	function select_change_handler() {
    		dialogs.categoria.categoriaId = select_value(this);
    		$$invalidate(3, dialogs);
    	}

    	const func = () => RChanClient.cambiarCategoria(hilo.id, dialogs.categoria.categoriaId);
    	const func_1 = () => RChanClient.borrarHilo(hilo.id);

    	function comentarios_1_comentarios_binding(value) {
    		comentarios = value;
    		$$invalidate(1, comentarios);
    	}

    	$$self.$capture_state = () => ({
    		Comentarios,
    		Acciones,
    		dataEjemplo,
    		Tiempo,
    		Button: ye,
    		Dialog: pn,
    		Checkbox: Ne,
    		Textfield: Ve,
    		config,
    		RChanClient,
    		ErrorValidacion,
    		globalStore,
    		Dialogo,
    		data,
    		hilo,
    		comentarios,
    		acciones,
    		dialogs,
    		selected,
    		$globalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) data = $$props.data;
    		if ("hilo" in $$props) $$invalidate(0, hilo = $$props.hilo);
    		if ("comentarios" in $$props) $$invalidate(1, comentarios = $$props.comentarios);
    		if ("acciones" in $$props) $$invalidate(2, acciones = $$props.acciones);
    		if ("dialogs" in $$props) $$invalidate(3, dialogs = $$props.dialogs);
    		if ("selected" in $$props) selected = $$props.selected;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hilo,
    		comentarios,
    		acciones,
    		dialogs,
    		$globalStore,
    		acciones_1_hilo_binding,
    		acciones_1_acciones_binding,
    		checkbox_checked_binding,
    		textfield_value_binding,
    		select_change_handler,
    		func,
    		func_1,
    		comentarios_1_comentarios_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Hilos\FormularioHilo.svelte generated by Svelte v3.29.0 */

    const { console: console_1$2 } = globals;
    const file$9 = "src\\components\\Hilos\\FormularioHilo.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (50:0) {#if mostrar}
    function create_if_block$6(ctx) {
    	let div2;
    	let form;
    	let input0;
    	let t0;
    	let span0;
    	let t1;
    	let div0;
    	let t2;
    	let span1;
    	let div0_style_value;
    	let t3;
    	let span2;
    	let t4;
    	let input1;
    	let t5;
    	let span3;
    	let t6;
    	let select;
    	let option;
    	let t8;
    	let span4;
    	let t9;
    	let textarea;
    	let t10;
    	let errorvalidacion;
    	let t11;
    	let div1;
    	let button0;
    	let t12;
    	let button1;
    	let t13;
    	let input2;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*archivo*/ ctx[4] && create_if_block_1$3(ctx);
    	let each_value = config.categorias;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	errorvalidacion = new ErrorValidacion({
    			props: { error: /*error*/ ctx[7] },
    			$$inline: true
    		});

    	button0 = new ye({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler_1*/ ctx[16]);

    	button1 = new ye({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*crear*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			span0 = element("span");
    			t1 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			span1 = element("span");
    			t3 = space();
    			span2 = element("span");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			span3 = element("span");
    			t6 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Categoría";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			span4 = element("span");
    			t9 = space();
    			textarea = element("textarea");
    			t10 = space();
    			create_component(errorvalidacion.$$.fragment);
    			t11 = space();
    			div1 = element("div");
    			create_component(button0.$$.fragment);
    			t12 = space();
    			create_component(button1.$$.fragment);
    			t13 = space();
    			input2 = element("input");
    			attr_dev(input0, "name", "archivo");
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "id", "hilo-input");
    			set_style(input0, "position", "absolute");
    			set_style(input0, "top", "-1000px");
    			add_location(input0, file$9, 56, 8, 1453);
    			attr_dev(span0, "asp-validation-for", "Archivo");
    			add_location(span0, file$9, 66, 8, 1713);
    			attr_dev(span1, "class", "fe fe-upload ico-btn");
    			add_location(span1, file$9, 71, 12, 2032);
    			attr_dev(div0, "class", "video-preview");

    			attr_dev(div0, "style", div0_style_value = /*archivo*/ ctx[4]
    			? `background:url(${/*archivoBlob*/ ctx[5]})`
    			: "");

    			add_location(div0, file$9, 67, 8, 1765);
    			attr_dev(span2, "asp-validation-for", "Titulo");
    			add_location(span2, file$9, 74, 8, 2133);
    			attr_dev(input1, "name", "titulo");
    			attr_dev(input1, "placeholder", "Titulo");
    			add_location(input1, file$9, 75, 8, 2184);
    			attr_dev(span3, "asp-validation-for", "CategoriaId");
    			add_location(span3, file$9, 77, 8, 2258);
    			option.__value = "-1";
    			option.value = option.__value;
    			option.selected = "selected";
    			option.disabled = "disabled";
    			add_location(option, file$9, 79, 12, 2377);
    			attr_dev(select, "name", "categoria");
    			if (/*categoria*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[14].call(select));
    			add_location(select, file$9, 78, 8, 2314);
    			attr_dev(span4, "asp-validation-for", "Contenido");
    			add_location(span4, file$9, 85, 8, 2610);
    			attr_dev(textarea, "name", "contenido");
    			attr_dev(textarea, "placeholder", "Escribi un redactazo...");
    			add_location(textarea, file$9, 86, 8, 2665);
    			attr_dev(input2, "type", "submit");
    			set_style(input2, "display", "none");
    			add_location(input2, file$9, 94, 12, 3110);
    			set_style(div1, "display", "flex");
    			set_style(div1, "justify-content", "flex-end");
    			add_location(div1, file$9, 91, 8, 2881);
    			attr_dev(form, "id", "crear-hilo-form");
    			attr_dev(form, "class", "formulario crear-hilo panel");
    			add_location(form, file$9, 51, 4, 1319);
    			attr_dev(div2, "class", "sombra");
    			set_style(div2, "position", "fixed");
    			set_style(div2, "left", "0");
    			set_style(div2, "top", "0");
    			add_location(div2, file$9, 50, 0, 1177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, form);
    			append_dev(form, input0);
    			/*input0_binding*/ ctx[11](input0);
    			append_dev(form, t0);
    			append_dev(form, span0);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(form, t3);
    			append_dev(form, span2);
    			append_dev(form, t4);
    			append_dev(form, input1);
    			set_input_value(input1, /*titulo*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, span3);
    			append_dev(form, t6);
    			append_dev(form, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*categoria*/ ctx[2]);
    			append_dev(form, t8);
    			append_dev(form, span4);
    			append_dev(form, t9);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*contenido*/ ctx[3]);
    			append_dev(form, t10);
    			mount_component(errorvalidacion, form, null);
    			append_dev(form, t11);
    			append_dev(form, div1);
    			mount_component(button0, div1, null);
    			append_dev(div1, t12);
    			mount_component(button1, div1, null);
    			append_dev(div1, t13);
    			append_dev(div1, input2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*actualizarArchivo*/ ctx[9], false, false, false),
    					listen_dev(span1, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[13]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[14]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[15]),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[10]), false, true, false),
    					listen_dev(div2, "click", self$1(/*click_handler_2*/ ctx[17]), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*archivo*/ ctx[4]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					if_block.m(div0, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*archivo, archivoBlob*/ 48 && div0_style_value !== (div0_style_value = /*archivo*/ ctx[4]
    			? `background:url(${/*archivoBlob*/ ctx[5]})`
    			: "")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty & /*titulo*/ 2 && input1.value !== /*titulo*/ ctx[1]) {
    				set_input_value(input1, /*titulo*/ ctx[1]);
    			}

    			if (dirty & /*config*/ 0) {
    				each_value = config.categorias;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*categoria, config*/ 4) {
    				select_option(select, /*categoria*/ ctx[2]);
    			}

    			if (dirty & /*contenido*/ 8) {
    				set_input_value(textarea, /*contenido*/ ctx[3]);
    			}

    			const errorvalidacion_changes = {};
    			if (dirty & /*error*/ 128) errorvalidacion_changes.error = /*error*/ ctx[7];
    			errorvalidacion.$set(errorvalidacion_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(errorvalidacion.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { y: -50, duration: 250 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(errorvalidacion.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { y: -50, duration: 250 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*input0_binding*/ ctx[11](null);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			destroy_component(errorvalidacion);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(50:0) {#if mostrar}",
    		ctx
    	});

    	return block;
    }

    // (69:12) {#if !archivo}
    function create_if_block_1$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Subi una imagen o un video para crear el hilo";
    			attr_dev(span, "class", "descripcion");
    			set_style(span, "position", "absolute");
    			add_location(span, file$9, 69, 16, 1895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(69:12) {#if !archivo}",
    		ctx
    	});

    	return block;
    }

    // (81:12) {#each config.categorias as c}
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*c*/ ctx[19].nombre + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*c*/ ctx[19].id;
    			option.value = option.__value;
    			add_location(option, file$9, 81, 16, 2516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(81:12) {#each config.categorias as c}",
    		ctx
    	});

    	return block;
    }

    // (93:12) <Button color="primary" on:click={() => mostrar = false}>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancelar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(93:12) <Button color=\\\"primary\\\" on:click={() => mostrar = false}>",
    		ctx
    	});

    	return block;
    }

    // (94:12) <Button color="primary" on:click={crear}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Crear");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(94:12) <Button color=\\\"primary\\\" on:click={crear}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*mostrar*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*mostrar*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*mostrar*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FormularioHilo", slots, []);
    	let { mostrar = false } = $$props;
    	let titulo = "";
    	let categoria = "-1";
    	let contenido = "";
    	let archivo = null;
    	let archivoBlob = null;
    	let input = null;
    	let error = null;

    	async function crear() {
    		console.log("creando");

    		try {
    			let r = await RChanClient.crearHilo(titulo, categoria, contenido, archivo);

    			if (r.status == 201) {
    				window.location.replace(r.headers.location);
    			}
    		} catch(e) {
    			$$invalidate(7, error = e.response.data);
    		}
    	}

    	function actualizarArchivo() {
    		if (input.files && input.files[0]) {
    			var reader = new FileReader();

    			reader.onload = function (e) {
    				$$invalidate(5, archivoBlob = e.target.result);
    				$$invalidate(4, archivo = input.files[0]);
    			};

    			reader.readAsDataURL(input.files[0]);
    		}
    	}

    	function removerArchivo() {
    		$$invalidate(4, archivo = null);
    		$$invalidate(5, archivoBlob = null);
    		$$invalidate(6, input.value = "", input);
    	}

    	const writable_props = ["mostrar"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<FormularioHilo> was created with unknown prop '${key}'`);
    	});

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(6, input);
    		});
    	}

    	const click_handler = () => input.click();

    	function input1_input_handler() {
    		titulo = this.value;
    		$$invalidate(1, titulo);
    	}

    	function select_change_handler() {
    		categoria = select_value(this);
    		$$invalidate(2, categoria);
    	}

    	function textarea_input_handler() {
    		contenido = this.value;
    		$$invalidate(3, contenido);
    	}

    	const click_handler_1 = () => $$invalidate(0, mostrar = false);
    	const click_handler_2 = () => $$invalidate(0, mostrar = false);

    	$$self.$$set = $$props => {
    		if ("mostrar" in $$props) $$invalidate(0, mostrar = $$props.mostrar);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		blur,
    		fly,
    		Button: ye,
    		Ripple: he,
    		config,
    		RChanClient,
    		ErrorValidacion,
    		mostrar,
    		titulo,
    		categoria,
    		contenido,
    		archivo,
    		archivoBlob,
    		input,
    		error,
    		crear,
    		actualizarArchivo,
    		removerArchivo
    	});

    	$$self.$inject_state = $$props => {
    		if ("mostrar" in $$props) $$invalidate(0, mostrar = $$props.mostrar);
    		if ("titulo" in $$props) $$invalidate(1, titulo = $$props.titulo);
    		if ("categoria" in $$props) $$invalidate(2, categoria = $$props.categoria);
    		if ("contenido" in $$props) $$invalidate(3, contenido = $$props.contenido);
    		if ("archivo" in $$props) $$invalidate(4, archivo = $$props.archivo);
    		if ("archivoBlob" in $$props) $$invalidate(5, archivoBlob = $$props.archivoBlob);
    		if ("input" in $$props) $$invalidate(6, input = $$props.input);
    		if ("error" in $$props) $$invalidate(7, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		mostrar,
    		titulo,
    		categoria,
    		contenido,
    		archivo,
    		archivoBlob,
    		input,
    		error,
    		crear,
    		actualizarArchivo,
    		submit_handler,
    		input0_binding,
    		click_handler,
    		input1_input_handler,
    		select_change_handler,
    		textarea_input_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class FormularioHilo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { mostrar: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormularioHilo",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get mostrar() {
    		throw new Error("<FormularioHilo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mostrar(value) {
    		throw new Error("<FormularioHilo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Notificaciones.svelte generated by Svelte v3.29.0 */

    const { console: console_1$3 } = globals;
    const file$a = "src\\components\\Notificaciones.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (27:4) {#if notificaciones.length != 0}
    function create_if_block_2$1(ctx) {
    	let div;
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(/*totalNotificaciones*/ ctx[2]);
    			add_location(span, file$a, 28, 12, 934);
    			attr_dev(div, "class", "noti-cont");
    			set_style(div, "position", "absolute");
    			add_location(div, file$a, 27, 8, 869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*totalNotificaciones*/ 4) set_data_dev(t, /*totalNotificaciones*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(27:4) {#if notificaciones.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if mostrar}
    function create_if_block$7(ctx) {
    	let ul;
    	let t0;
    	let li;
    	let ul_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*notificaciones*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			li = element("li");
    			li.textContent = "Limpiar todas";
    			attr_dev(li, "class", "noti");
    			set_style(li, "justify-content", "center");
    			add_location(li, file$a, 49, 12, 1827);
    			attr_dev(ul, "class", "notis panel drop-menu abs lista-nav menu1");
    			add_location(ul, file$a, 34, 8, 1052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t0);
    			append_dev(ul, li);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li, "click", /*limpiar*/ ctx[3], false, false, false),
    					listen_dev(ul, "mouseleave", /*mouseleave_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notificaciones*/ 1) {
    				each_value = /*notificaciones*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!ul_transition) ul_transition = create_bidirectional_transition(ul, fly, { x: -50, duration: 150 }, true);
    				ul_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!ul_transition) ul_transition = create_bidirectional_transition(ul, fly, { x: -50, duration: 150 }, false);
    			ul_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching && ul_transition) ul_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(34:4) {#if mostrar}",
    		ctx
    	});

    	return block;
    }

    // (44:24) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let t0_value = /*n*/ ctx[6].conteo + "";
    	let t0;
    	let t1;
    	let t2_value = /*n*/ ctx[6].comentarioId + "";
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" Respondieron a tu comentario : ");
    			t2 = text(t2_value);
    			add_location(span, file$a, 44, 28, 1641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notificaciones*/ 1 && t0_value !== (t0_value = /*n*/ ctx[6].conteo + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*notificaciones*/ 1 && t2_value !== (t2_value = /*n*/ ctx[6].comentarioId + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(44:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:24) {#if n.tipo == 0}
    function create_if_block_1$4(ctx) {
    	let span;
    	let t0_value = /*n*/ ctx[6].conteo + "";
    	let t0;
    	let t1;
    	let t2_value = /*n*/ ctx[6].hiloTitulo + "";
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" Nuevos Comentarios en : ");
    			t2 = text(t2_value);
    			add_location(span, file$a, 42, 28, 1516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notificaciones*/ 1 && t0_value !== (t0_value = /*n*/ ctx[6].conteo + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*notificaciones*/ 1 && t2_value !== (t2_value = /*n*/ ctx[6].hiloTitulo + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(42:24) {#if n.tipo == 0}",
    		ctx
    	});

    	return block;
    }

    // (38:12) {#each notificaciones as n}
    function create_each_block$6(ctx) {
    	let a;
    	let li;
    	let img;
    	let img_src_value;
    	let t;
    	let a_href_value;

    	function select_block_type(ctx, dirty) {
    		if (/*n*/ ctx[6].tipo == 0) return create_if_block_1$4;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			li = element("li");
    			img = element("img");
    			t = space();
    			if_block.c();
    			if (img.src !== (img_src_value = /*n*/ ctx[6].hiloImagen)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$a, 40, 24, 1410);
    			attr_dev(li, "class", "noti");
    			add_location(li, file$a, 39, 20, 1367);
    			attr_dev(a, "href", a_href_value = "/Notificacion/" + /*n*/ ctx[6].id + "?hiloId=" + /*n*/ ctx[6].hiloId + "&comentarioId=" + /*n*/ ctx[6].comentarioId);
    			add_location(a, file$a, 38, 16, 1266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, li);
    			append_dev(li, img);
    			append_dev(li, t);
    			if_block.m(li, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notificaciones*/ 1 && img.src !== (img_src_value = /*n*/ ctx[6].hiloImagen)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, null);
    				}
    			}

    			if (dirty & /*notificaciones*/ 1 && a_href_value !== (a_href_value = "/Notificacion/" + /*n*/ ctx[6].id + "?hiloId=" + /*n*/ ctx[6].hiloId + "&comentarioId=" + /*n*/ ctx[6].comentarioId)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(38:12) {#each notificaciones as n}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let span1;
    	let span0;
    	let t0;
    	let ripple;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*notificaciones*/ ctx[0].length != 0 && create_if_block_2$1(ctx);
    	ripple = new he({ $$inline: true });
    	let if_block1 = /*mostrar*/ ctx[1] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(ripple.$$.fragment);
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span0, "class", "fe fe-bell");
    			set_style(span0, "padding", "12px");
    			add_location(span0, file$a, 23, 4, 693);
    			attr_dev(span1, "class", "nav-boton drop-btn");
    			set_style(span1, "display", "flex");
    			set_style(span1, "align-items", "center");
    			set_style(span1, "postition", "relative");
    			set_style(span1, "margin-right", "6px");
    			add_location(span1, file$a, 22, 0, 573);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			if (if_block0) if_block0.m(span0, null);
    			append_dev(span0, t0);
    			mount_component(ripple, span0, null);
    			append_dev(span1, t1);
    			if (if_block1) if_block1.m(span1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span0, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*notificaciones*/ ctx[0].length != 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(span0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*mostrar*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*mostrar*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(span1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (if_block0) if_block0.d();
    			destroy_component(ripple);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Notificaciones", slots, []);
    	let { notificaciones } = $$props;
    	let mostrar = false;

    	async function limpiar() {
    		try {
    			await RChanClient.limpiarNotificaciones();
    		} catch(error) {
    			console.log(error);
    			return;
    		}

    		$$invalidate(0, notificaciones = []);
    		$$invalidate(1, mostrar = false);
    	}

    	const writable_props = ["notificaciones"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Notificaciones> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, mostrar = !mostrar && totalNotificaciones != 0);
    	const mouseleave_handler = () => $$invalidate(1, mostrar = false);

    	$$self.$$set = $$props => {
    		if ("notificaciones" in $$props) $$invalidate(0, notificaciones = $$props.notificaciones);
    	};

    	$$self.$capture_state = () => ({
    		RChanClient,
    		fade,
    		blur,
    		fly,
    		Ripple: he,
    		notificaciones,
    		mostrar,
    		limpiar,
    		totalNotificaciones
    	});

    	$$self.$inject_state = $$props => {
    		if ("notificaciones" in $$props) $$invalidate(0, notificaciones = $$props.notificaciones);
    		if ("mostrar" in $$props) $$invalidate(1, mostrar = $$props.mostrar);
    		if ("totalNotificaciones" in $$props) $$invalidate(2, totalNotificaciones = $$props.totalNotificaciones);
    	};

    	let totalNotificaciones;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*notificaciones*/ 1) {
    			 $$invalidate(2, totalNotificaciones = notificaciones.map(n => n.conteo).reduce((c, n) => c += n, 0));
    		}
    	};

    	return [
    		notificaciones,
    		mostrar,
    		totalNotificaciones,
    		limpiar,
    		click_handler,
    		mouseleave_handler
    	];
    }

    class Notificaciones extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { notificaciones: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notificaciones",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*notificaciones*/ ctx[0] === undefined && !("notificaciones" in props)) {
    			console_1$3.warn("<Notificaciones> was created without expected prop 'notificaciones'");
    		}
    	}

    	get notificaciones() {
    		throw new Error("<Notificaciones>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notificaciones(value) {
    		throw new Error("<Notificaciones>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\MenuPrincipal.svelte generated by Svelte v3.29.0 */
    const file$b = "src\\components\\MenuPrincipal.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[12] = list;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (29:12) {#if usuario.estaAutenticado}
    function create_if_block_4$1(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*usuario*/ ctx[3].userName + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("Hola ");
    			t1 = text(t1_value);
    			t2 = text("!");
    			set_style(span, "display", "block");
    			set_style(span, "text-align", "center");
    			add_location(span, file$b, 29, 12, 932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*usuario*/ 8 && t1_value !== (t1_value = /*usuario*/ ctx[3].userName + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(29:12) {#if usuario.estaAutenticado}",
    		ctx
    	});

    	return block;
    }

    // (37:12) {:else}
    function create_else_block$2(ctx) {
    	let li;
    	let icon;
    	let t;
    	let ripple;
    	let current;
    	let mounted;
    	let dispose;
    	ripple = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			li = element("li");
    			icon = element("icon");
    			t = text(" Salir  ");
    			create_component(ripple.$$.fragment);
    			attr_dev(icon, "class", "fe fe-log-out");
    			add_location(icon, file$b, 37, 74, 1456);
    			add_location(li, file$b, 37, 16, 1398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, icon);
    			append_dev(li, t);
    			mount_component(ripple, li, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*click_handler_2*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(ripple);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(37:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:12) {#if !usuario.estaAutenticado}
    function create_if_block_3$1(ctx) {
    	let li0;
    	let icon0;
    	let t0;
    	let ripple0;
    	let t1;
    	let li1;
    	let icon1;
    	let t2;
    	let ripple1;
    	let current;
    	let mounted;
    	let dispose;
    	ripple0 = new he({ $$inline: true });
    	ripple1 = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			li0 = element("li");
    			icon0 = element("icon");
    			t0 = text(" Iniciar Sesion  ");
    			create_component(ripple0.$$.fragment);
    			t1 = space();
    			li1 = element("li");
    			icon1 = element("icon");
    			t2 = text(" Registrarse  ");
    			create_component(ripple1.$$.fragment);
    			attr_dev(icon0, "class", "fe fe-log-in");
    			add_location(icon0, file$b, 34, 67, 1174);
    			add_location(li0, file$b, 34, 12, 1119);
    			attr_dev(icon1, "class", "fe fe-user");
    			add_location(icon1, file$b, 35, 70, 1305);
    			add_location(li1, file$b, 35, 12, 1247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li0, anchor);
    			append_dev(li0, icon0);
    			append_dev(li0, t0);
    			mount_component(ripple0, li0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, li1, anchor);
    			append_dev(li1, icon1);
    			append_dev(li1, t2);
    			mount_component(ripple1, li1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(li1, "click", /*click_handler_1*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple0.$$.fragment, local);
    			transition_in(ripple1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple0.$$.fragment, local);
    			transition_out(ripple1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li0);
    			destroy_component(ripple0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(li1);
    			destroy_component(ripple1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(34:12) {#if !usuario.estaAutenticado}",
    		ctx
    	});

    	return block;
    }

    // (47:12) {#if mostrarCategorias}
    function create_if_block_2$2(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_transition;
    	let current;
    	let each_value = /*categorias*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*c*/ ctx[11].id;
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$b, 47, 16, 1957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*categorias*/ 4) {
    				const each_value = /*categorias*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$7, null, get_each_context$7);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -50, duration: 150 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -50, duration: 150 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(47:12) {#if mostrarCategorias}",
    		ctx
    	});

    	return block;
    }

    // (49:20) {#each categorias as c (c.id)}
    function create_each_block$7(key_1, ctx) {
    	let li;
    	let icon;
    	let t0;
    	let t1_value = /*c*/ ctx[11].nombre + "";
    	let t1;
    	let t2;
    	let span;
    	let checkbox;
    	let updating_checked;
    	let t3;
    	let ripple;
    	let current;

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[9].call(null, value, /*c*/ ctx[11]);
    	}

    	let checkbox_props = { right: true };

    	if (/*c*/ ctx[11].activa !== void 0) {
    		checkbox_props.checked = /*c*/ ctx[11].activa;
    	}

    	checkbox = new Ne({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, "checked", checkbox_checked_binding));
    	ripple = new he({ $$inline: true });

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			icon = element("icon");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			create_component(checkbox.$$.fragment);
    			t3 = space();
    			create_component(ripple.$$.fragment);
    			attr_dev(icon, "class", "fe fe-circle");
    			add_location(icon, file$b, 50, 26, 2104);
    			set_style(span, "width", "fit-content");
    			set_style(span, "margin-left", "auto");
    			add_location(span, file$b, 51, 24, 2170);
    			add_location(li, file$b, 50, 20, 2098);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, icon);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, span);
    			mount_component(checkbox, span, null);
    			append_dev(li, t3);
    			mount_component(ripple, li, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*categorias*/ 4) && t1_value !== (t1_value = /*c*/ ctx[11].nombre + "")) set_data_dev(t1, t1_value);
    			const checkbox_changes = {};

    			if (!updating_checked && dirty & /*categorias*/ 4) {
    				updating_checked = true;
    				checkbox_changes.checked = /*c*/ ctx[11].activa;
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			transition_in(ripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(checkbox);
    			destroy_component(ripple);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(49:20) {#each categorias as c (c.id)}",
    		ctx
    	});

    	return block;
    }

    // (73:12) {#if $globalStore.usuario.esMod}
    function create_if_block_1$5(ctx) {
    	let a;
    	let li;
    	let icon;
    	let t;
    	let ripple;
    	let current;
    	ripple = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			a = element("a");
    			li = element("li");
    			icon = element("icon");
    			t = text(" Moderacion  ");
    			create_component(ripple.$$.fragment);
    			attr_dev(icon, "class", "fe fe-triangle");
    			add_location(icon, file$b, 74, 25, 3096);
    			add_location(li, file$b, 74, 20, 3091);
    			attr_dev(a, "href", "/Moderacion");
    			add_location(a, file$b, 73, 16, 3047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, li);
    			append_dev(li, icon);
    			append_dev(li, t);
    			mount_component(ripple, li, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(ripple);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(73:12) {#if $globalStore.usuario.esMod}",
    		ctx
    	});

    	return block;
    }

    // (78:12) {#if $globalStore.usuario.esAdmin}
    function create_if_block$8(ctx) {
    	let a;
    	let li;
    	let icon;
    	let t;
    	let ripple;
    	let current;
    	ripple = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			a = element("a");
    			li = element("li");
    			icon = element("icon");
    			t = text(" Administracion  ");
    			create_component(ripple.$$.fragment);
    			attr_dev(icon, "class", "fe fe-triangle");
    			add_location(icon, file$b, 79, 25, 3313);
    			add_location(li, file$b, 79, 20, 3308);
    			attr_dev(a, "href", "/Administracion");
    			add_location(a, file$b, 78, 16, 3260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, li);
    			append_dev(li, icon);
    			append_dev(li, t);
    			mount_component(ripple, li, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_component(ripple);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(78:12) {#if $globalStore.usuario.esAdmin}",
    		ctx
    	});

    	return block;
    }

    // (25:0) <Sidepanel left bind:visible={mostrar} disableScroll style="background: red">
    function create_default_slot$3(ctx) {
    	let section;
    	let div;
    	let h1;
    	let t1;
    	let t2;
    	let ul;
    	let current_block_type_index;
    	let if_block1;
    	let t3;
    	let li0;
    	let icon0;
    	let t4;
    	let span;
    	let t5;
    	let icon1;
    	let t6;
    	let ripple0;
    	let t7;
    	let t8;
    	let hr0;
    	let t9;
    	let a0;
    	let li1;
    	let icon2;
    	let t10;
    	let ripple1;
    	let t11;
    	let a1;
    	let li2;
    	let icon3;
    	let t12;
    	let ripple2;
    	let t13;
    	let a2;
    	let li3;
    	let icon4;
    	let t14;
    	let ripple3;
    	let t15;
    	let a3;
    	let li4;
    	let icon5;
    	let t16;
    	let ripple4;
    	let t17;
    	let hr1;
    	let t18;
    	let t19;
    	let t20;
    	let hr2;
    	let t21;
    	let li5;
    	let icon6;
    	let t22;
    	let ripple5;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*usuario*/ ctx[3].estaAutenticado && create_if_block_4$1(ctx);
    	const if_block_creators = [create_if_block_3$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*usuario*/ ctx[3].estaAutenticado) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	ripple0 = new he({ $$inline: true });
    	let if_block2 = /*mostrarCategorias*/ ctx[1] && create_if_block_2$2(ctx);
    	ripple1 = new he({ $$inline: true });
    	ripple2 = new he({ $$inline: true });
    	ripple3 = new he({ $$inline: true });
    	ripple4 = new he({ $$inline: true });
    	let if_block3 = /*$globalStore*/ ctx[4].usuario.esMod && create_if_block_1$5(ctx);
    	let if_block4 = /*$globalStore*/ ctx[4].usuario.esAdmin && create_if_block$8(ctx);
    	ripple5 = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "ROSED";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			ul = element("ul");
    			if_block1.c();
    			t3 = space();
    			li0 = element("li");
    			icon0 = element("icon");
    			t4 = text(" Categorias \r\n                ");
    			span = element("span");
    			t5 = space();
    			icon1 = element("icon");
    			t6 = space();
    			create_component(ripple0.$$.fragment);
    			t7 = space();
    			if (if_block2) if_block2.c();
    			t8 = space();
    			hr0 = element("hr");
    			t9 = space();
    			a0 = element("a");
    			li1 = element("li");
    			icon2 = element("icon");
    			t10 = text(" Creados  ");
    			create_component(ripple1.$$.fragment);
    			t11 = space();
    			a1 = element("a");
    			li2 = element("li");
    			icon3 = element("icon");
    			t12 = text(" Favoritos  ");
    			create_component(ripple2.$$.fragment);
    			t13 = space();
    			a2 = element("a");
    			li3 = element("li");
    			icon4 = element("icon");
    			t14 = text(" Seguidos  ");
    			create_component(ripple3.$$.fragment);
    			t15 = space();
    			a3 = element("a");
    			li4 = element("li");
    			icon5 = element("icon");
    			t16 = text(" Ocultos  ");
    			create_component(ripple4.$$.fragment);
    			t17 = space();
    			hr1 = element("hr");
    			t18 = space();
    			if (if_block3) if_block3.c();
    			t19 = space();
    			if (if_block4) if_block4.c();
    			t20 = space();
    			hr2 = element("hr");
    			t21 = space();
    			li5 = element("li");
    			icon6 = element("icon");
    			t22 = text(" Ajustes  ");
    			create_component(ripple5.$$.fragment);
    			add_location(h1, file$b, 27, 12, 861);
    			attr_dev(div, "class", "menu-principal-header");
    			add_location(div, file$b, 26, 8, 812);
    			attr_dev(icon0, "class", "fe fe-menu");
    			add_location(icon0, file$b, 40, 16, 1618);
    			set_style(span, "margin-left", "auto");
    			add_location(span, file$b, 41, 16, 1674);
    			attr_dev(icon1, "class", "fe fe-chevron-down");
    			set_style(icon1, "padding", "0");
    			set_style(icon1, "transform", "rotate(" + (/*mostrarCategorias*/ ctx[1] ? 180 : 0) + "deg)");
    			set_style(icon1, "transition", "all 0.2s ease 0s");
    			add_location(icon1, file$b, 43, 20, 1736);
    			add_location(li0, file$b, 39, 12, 1540);
    			add_location(hr0, file$b, 58, 12, 2439);
    			attr_dev(icon2, "class", "fe fe-target");
    			add_location(icon2, file$b, 60, 21, 2503);
    			add_location(li1, file$b, 60, 16, 2498);
    			attr_dev(a0, "href", "/Mis/Creados");
    			add_location(a0, file$b, 59, 12, 2457);
    			attr_dev(icon3, "class", "fe fe-star");
    			add_location(icon3, file$b, 63, 21, 2635);
    			add_location(li2, file$b, 63, 16, 2630);
    			attr_dev(a1, "href", "/Mis/Favoritos");
    			add_location(a1, file$b, 62, 12, 2587);
    			attr_dev(icon4, "class", "fe fe-eye");
    			add_location(icon4, file$b, 66, 21, 2766);
    			add_location(li3, file$b, 66, 16, 2761);
    			attr_dev(a2, "href", "/Mis/Seguidos");
    			add_location(a2, file$b, 65, 12, 2719);
    			attr_dev(icon5, "class", "fe fe-eye-off");
    			add_location(icon5, file$b, 69, 21, 2894);
    			add_location(li4, file$b, 69, 16, 2889);
    			attr_dev(a3, "href", "/Mis/Ocultos");
    			add_location(a3, file$b, 68, 12, 2848);
    			add_location(hr1, file$b, 71, 12, 2979);
    			add_location(hr2, file$b, 82, 12, 3429);
    			attr_dev(icon6, "class", "fe fe-settings");
    			add_location(icon6, file$b, 83, 17, 3452);
    			add_location(li5, file$b, 83, 12, 3447);
    			add_location(ul, file$b, 32, 8, 1057);
    			attr_dev(section, "class", "menu-principal");
    			add_location(section, file$b, 25, 4, 770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(section, t2);
    			append_dev(section, ul);
    			if_blocks[current_block_type_index].m(ul, null);
    			append_dev(ul, t3);
    			append_dev(ul, li0);
    			append_dev(li0, icon0);
    			append_dev(li0, t4);
    			append_dev(li0, span);
    			append_dev(li0, t5);
    			append_dev(li0, icon1);
    			append_dev(li0, t6);
    			mount_component(ripple0, li0, null);
    			append_dev(ul, t7);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(ul, t8);
    			append_dev(ul, hr0);
    			append_dev(ul, t9);
    			append_dev(ul, a0);
    			append_dev(a0, li1);
    			append_dev(li1, icon2);
    			append_dev(li1, t10);
    			mount_component(ripple1, li1, null);
    			append_dev(ul, t11);
    			append_dev(ul, a1);
    			append_dev(a1, li2);
    			append_dev(li2, icon3);
    			append_dev(li2, t12);
    			mount_component(ripple2, li2, null);
    			append_dev(ul, t13);
    			append_dev(ul, a2);
    			append_dev(a2, li3);
    			append_dev(li3, icon4);
    			append_dev(li3, t14);
    			mount_component(ripple3, li3, null);
    			append_dev(ul, t15);
    			append_dev(ul, a3);
    			append_dev(a3, li4);
    			append_dev(li4, icon5);
    			append_dev(li4, t16);
    			mount_component(ripple4, li4, null);
    			append_dev(ul, t17);
    			append_dev(ul, hr1);
    			append_dev(ul, t18);
    			if (if_block3) if_block3.m(ul, null);
    			append_dev(ul, t19);
    			if (if_block4) if_block4.m(ul, null);
    			append_dev(ul, t20);
    			append_dev(ul, hr2);
    			append_dev(ul, t21);
    			append_dev(ul, li5);
    			append_dev(li5, icon6);
    			append_dev(li5, t22);
    			mount_component(ripple5, li5, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li0, "click", /*click_handler_3*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*usuario*/ ctx[3].estaAutenticado) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(ul, t3);
    			}

    			if (!current || dirty & /*mostrarCategorias*/ 2) {
    				set_style(icon1, "transform", "rotate(" + (/*mostrarCategorias*/ ctx[1] ? 180 : 0) + "deg)");
    			}

    			if (/*mostrarCategorias*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*mostrarCategorias*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(ul, t8);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*$globalStore*/ ctx[4].usuario.esMod) {
    				if (if_block3) {
    					if (dirty & /*$globalStore*/ 16) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$5(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(ul, t19);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*$globalStore*/ ctx[4].usuario.esAdmin) {
    				if (if_block4) {
    					if (dirty & /*$globalStore*/ 16) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$8(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(ul, t20);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(ripple0.$$.fragment, local);
    			transition_in(if_block2);
    			transition_in(ripple1.$$.fragment, local);
    			transition_in(ripple2.$$.fragment, local);
    			transition_in(ripple3.$$.fragment, local);
    			transition_in(ripple4.$$.fragment, local);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(ripple5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(ripple0.$$.fragment, local);
    			transition_out(if_block2);
    			transition_out(ripple1.$$.fragment, local);
    			transition_out(ripple2.$$.fragment, local);
    			transition_out(ripple3.$$.fragment, local);
    			transition_out(ripple4.$$.fragment, local);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(ripple5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			destroy_component(ripple0);
    			if (if_block2) if_block2.d();
    			destroy_component(ripple1);
    			destroy_component(ripple2);
    			destroy_component(ripple3);
    			destroy_component(ripple4);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			destroy_component(ripple5);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(25:0) <Sidepanel left bind:visible={mostrar} disableScroll style=\\\"background: red\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let sidepanel;
    	let updating_visible;
    	let current;

    	function sidepanel_visible_binding(value) {
    		/*sidepanel_visible_binding*/ ctx[10].call(null, value);
    	}

    	let sidepanel_props = {
    		left: true,
    		disableScroll: true,
    		style: "background: red",
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	if (/*mostrar*/ ctx[0] !== void 0) {
    		sidepanel_props.visible = /*mostrar*/ ctx[0];
    	}

    	sidepanel = new Pn({ props: sidepanel_props, $$inline: true });
    	binding_callbacks.push(() => bind(sidepanel, "visible", sidepanel_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(sidepanel.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidepanel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidepanel_changes = {};

    			if (dirty & /*$$scope, $globalStore, categorias, mostrarCategorias, usuario*/ 16414) {
    				sidepanel_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*mostrar*/ 1) {
    				updating_visible = true;
    				sidepanel_changes.visible = /*mostrar*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			sidepanel.$set(sidepanel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidepanel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidepanel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidepanel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $globalStore;
    	validate_store(globalStore, "globalStore");
    	component_subscribe($$self, globalStore, $$value => $$invalidate(4, $globalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MenuPrincipal", slots, []);
    	let { mostrar = true } = $$props;
    	let mostrarCategorias = false;

    	let categorias = config.categorias.map(c => {
    		c.activa = $globalStore.categoriasActivas.includes(c.id);
    		c = c;
    		return c;
    	});

    	const writable_props = ["mostrar"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuPrincipal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(globalStore, $globalStore.mostrarLogin = true, $globalStore);
    	const click_handler_1 = () => set_store_value(globalStore, $globalStore.mostrarRegistro = true, $globalStore);
    	const click_handler_2 = () => set_store_value(globalStore, $globalStore.mostrarRegistro = true, $globalStore);
    	const click_handler_3 = () => $$invalidate(1, mostrarCategorias = !mostrarCategorias);

    	function checkbox_checked_binding(value, c) {
    		c.activa = value;
    		$$invalidate(2, categorias);
    	}

    	function sidepanel_visible_binding(value) {
    		mostrar = value;
    		$$invalidate(0, mostrar);
    	}

    	$$self.$$set = $$props => {
    		if ("mostrar" in $$props) $$invalidate(0, mostrar = $$props.mostrar);
    	};

    	$$self.$capture_state = () => ({
    		Ripple: he,
    		Sidepanel: Pn,
    		Checkbox: Ne,
    		derived,
    		fly,
    		config,
    		globalStore,
    		mostrar,
    		mostrarCategorias,
    		categorias,
    		usuario,
    		$globalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("mostrar" in $$props) $$invalidate(0, mostrar = $$props.mostrar);
    		if ("mostrarCategorias" in $$props) $$invalidate(1, mostrarCategorias = $$props.mostrarCategorias);
    		if ("categorias" in $$props) $$invalidate(2, categorias = $$props.categorias);
    		if ("usuario" in $$props) $$invalidate(3, usuario = $$props.usuario);
    	};

    	let usuario;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*categorias*/ 4) {
    			 set_store_value(globalStore, $globalStore.categoriasActivas = categorias.filter(c => c.activa).map(c => c.id), $globalStore);
    		}

    		if ($$self.$$.dirty & /*$globalStore*/ 16) {
    			 $$invalidate(3, usuario = $globalStore.usuario);
    		}
    	};

    	return [
    		mostrar,
    		mostrarCategorias,
    		categorias,
    		usuario,
    		$globalStore,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		checkbox_checked_binding,
    		sidepanel_visible_binding
    	];
    }

    class MenuPrincipal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { mostrar: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuPrincipal",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get mostrar() {
    		throw new Error("<MenuPrincipal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mostrar(value) {
    		throw new Error("<MenuPrincipal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FormularioLogin.svelte generated by Svelte v3.29.0 */

    const { console: console_1$4 } = globals;
    const file$c = "src\\components\\FormularioLogin.svelte";

    // (37:8) <div slot="title">
    function create_title_slot_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Ingresar";
    			attr_dev(div, "slot", "title");
    			add_location(div, file$c, 36, 8, 1016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(37:8) <div slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (59:12) <Button color="primary" on:click={login} >
    function create_default_slot_3$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Jeje ta bien");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(59:12) <Button color=\\\"primary\\\" on:click={login} >",
    		ctx
    	});

    	return block;
    }

    // (58:8) <div slot="actions" class="actions center">
    function create_actions_slot_1(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new ye({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*login*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "actions");
    			attr_dev(div, "class", "actions center");
    			add_location(div, file$c, 57, 8, 1521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot_1.name,
    		type: "slot",
    		source: "(58:8) <div slot=\\\"actions\\\" class=\\\"actions center\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:0) <Dialog width="290" bind:visible= {$globalStore.mostrarLogin}>
    function create_default_slot_2$2(ctx) {
    	let t0;
    	let textfield0;
    	let updating_value;
    	let t1;
    	let textfield1;
    	let updating_value_1;
    	let t2;
    	let errorvalidacion;
    	let t3;
    	let current;

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[6].call(null, value);
    	}

    	let textfield0_props = {
    		name: "Nick",
    		autocomplete: "off",
    		required: true,
    		label: "nick",
    		message: "Como te llamas tu?"
    	};

    	if (/*nick*/ ctx[0] !== void 0) {
    		textfield0_props.value = /*nick*/ ctx[0];
    	}

    	textfield0 = new Ve({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield0, "value", textfield0_value_binding));

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[7].call(null, value);
    	}

    	let textfield1_props = {
    		type: "password",
    		name: "Contraseña",
    		autocomplete: "off",
    		required: true,
    		label: "Contraseña",
    		message: "Gordo1234"
    	};

    	if (/*contraseña*/ ctx[1] !== void 0) {
    		textfield1_props.value = /*contraseña*/ ctx[1];
    	}

    	textfield1 = new Ve({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield1, "value", textfield1_value_binding));

    	errorvalidacion = new ErrorValidacion({
    			props: { error: /*error*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(textfield0.$$.fragment);
    			t1 = space();
    			create_component(textfield1.$$.fragment);
    			t2 = space();
    			create_component(errorvalidacion.$$.fragment);
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(textfield0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(textfield1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(errorvalidacion, target, anchor);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield0_changes = {};

    			if (!updating_value && dirty & /*nick*/ 1) {
    				updating_value = true;
    				textfield0_changes.value = /*nick*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*contraseña*/ 2) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*contraseña*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    			const errorvalidacion_changes = {};
    			if (dirty & /*error*/ 4) errorvalidacion_changes.error = /*error*/ ctx[2];
    			errorvalidacion.$set(errorvalidacion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			transition_in(errorvalidacion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(errorvalidacion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(textfield0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(textfield1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(errorvalidacion, detaching);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(36:0) <Dialog width=\\\"290\\\" bind:visible= {$globalStore.mostrarLogin}>",
    		ctx
    	});

    	return block;
    }

    // (65:4) <div slot="title">
    function create_title_slot$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Registrate";
    			attr_dev(div, "slot", "title");
    			add_location(div, file$c, 64, 4, 1757);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$1.name,
    		type: "slot",
    		source: "(65:4) <div slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (87:8) <Button  on:click={registrar} color="primary" >
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Jeje ta bien");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(87:8) <Button  on:click={registrar} color=\\\"primary\\\" >",
    		ctx
    	});

    	return block;
    }

    // (86:4) <div slot="actions" class="actions center">
    function create_actions_slot$1(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new ye({
    			props: {
    				color: "primary",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*registrar*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "actions");
    			attr_dev(div, "class", "actions center");
    			add_location(div, file$c, 85, 4, 2224);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot$1.name,
    		type: "slot",
    		source: "(86:4) <div slot=\\\"actions\\\" class=\\\"actions center\\\">",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Dialog width="290" bind:visible= {$globalStore.mostrarRegistro}>
    function create_default_slot$4(ctx) {
    	let t0;
    	let textfield0;
    	let updating_value;
    	let t1;
    	let textfield1;
    	let updating_value_1;
    	let t2;
    	let errorvalidacion;
    	let t3;
    	let current;

    	function textfield0_value_binding_1(value) {
    		/*textfield0_value_binding_1*/ ctx[9].call(null, value);
    	}

    	let textfield0_props = {
    		name: "Nick",
    		autocomplete: "off",
    		required: true,
    		label: "nick",
    		message: "Como te llamas tu?"
    	};

    	if (/*nick*/ ctx[0] !== void 0) {
    		textfield0_props.value = /*nick*/ ctx[0];
    	}

    	textfield0 = new Ve({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield0, "value", textfield0_value_binding_1));

    	function textfield1_value_binding_1(value) {
    		/*textfield1_value_binding_1*/ ctx[10].call(null, value);
    	}

    	let textfield1_props = {
    		type: "password",
    		name: "Contraseña",
    		autocomplete: "off",
    		required: true,
    		label: "Contraseña",
    		message: "Gordo1234"
    	};

    	if (/*contraseña*/ ctx[1] !== void 0) {
    		textfield1_props.value = /*contraseña*/ ctx[1];
    	}

    	textfield1 = new Ve({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield1, "value", textfield1_value_binding_1));

    	errorvalidacion = new ErrorValidacion({
    			props: { error: /*error*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(textfield0.$$.fragment);
    			t1 = space();
    			create_component(textfield1.$$.fragment);
    			t2 = space();
    			create_component(errorvalidacion.$$.fragment);
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(textfield0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(textfield1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(errorvalidacion, target, anchor);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield0_changes = {};

    			if (!updating_value && dirty & /*nick*/ 1) {
    				updating_value = true;
    				textfield0_changes.value = /*nick*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*contraseña*/ 2) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*contraseña*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    			const errorvalidacion_changes = {};
    			if (dirty & /*error*/ 4) errorvalidacion_changes.error = /*error*/ ctx[2];
    			errorvalidacion.$set(errorvalidacion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			transition_in(errorvalidacion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(errorvalidacion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(textfield0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(textfield1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(errorvalidacion, detaching);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(64:0) <Dialog width=\\\"290\\\" bind:visible= {$globalStore.mostrarRegistro}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let dialog0;
    	let updating_visible;
    	let t;
    	let dialog1;
    	let updating_visible_1;
    	let current;

    	function dialog0_visible_binding(value) {
    		/*dialog0_visible_binding*/ ctx[8].call(null, value);
    	}

    	let dialog0_props = {
    		width: "290",
    		$$slots: {
    			default: [create_default_slot_2$2],
    			actions: [create_actions_slot_1],
    			title: [create_title_slot_1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*$globalStore*/ ctx[3].mostrarLogin !== void 0) {
    		dialog0_props.visible = /*$globalStore*/ ctx[3].mostrarLogin;
    	}

    	dialog0 = new pn({ props: dialog0_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog0, "visible", dialog0_visible_binding));

    	function dialog1_visible_binding(value) {
    		/*dialog1_visible_binding*/ ctx[11].call(null, value);
    	}

    	let dialog1_props = {
    		width: "290",
    		$$slots: {
    			default: [create_default_slot$4],
    			actions: [create_actions_slot$1],
    			title: [create_title_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*$globalStore*/ ctx[3].mostrarRegistro !== void 0) {
    		dialog1_props.visible = /*$globalStore*/ ctx[3].mostrarRegistro;
    	}

    	dialog1 = new pn({ props: dialog1_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog1, "visible", dialog1_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(dialog0.$$.fragment);
    			t = space();
    			create_component(dialog1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(dialog1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dialog0_changes = {};

    			if (dirty & /*$$scope, error, contraseña, nick*/ 4103) {
    				dialog0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*$globalStore*/ 8) {
    				updating_visible = true;
    				dialog0_changes.visible = /*$globalStore*/ ctx[3].mostrarLogin;
    				add_flush_callback(() => updating_visible = false);
    			}

    			dialog0.$set(dialog0_changes);
    			const dialog1_changes = {};

    			if (dirty & /*$$scope, error, contraseña, nick*/ 4103) {
    				dialog1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty & /*$globalStore*/ 8) {
    				updating_visible_1 = true;
    				dialog1_changes.visible = /*$globalStore*/ ctx[3].mostrarRegistro;
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			dialog1.$set(dialog1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog0.$$.fragment, local);
    			transition_in(dialog1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog0.$$.fragment, local);
    			transition_out(dialog1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(dialog1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $globalStore;
    	validate_store(globalStore, "globalStore");
    	component_subscribe($$self, globalStore, $$value => $$invalidate(3, $globalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FormularioLogin", slots, []);
    	let { nick = "" } = $$props;
    	let { contraseña = "" } = $$props;
    	let error = null;

    	async function registrar() {
    		try {
    			await RChanClient.registrase(nick, contraseña);
    		} catch(e) {
    			console.log(e);
    			$$invalidate(2, error = e.response.data);
    			return;
    		}

    		window.location = "/";
    		location.reload();
    	}

    	async function login() {
    		try {
    			await RChanClient.logearse(nick, contraseña);
    		} catch(e) {
    			console.log(e);
    			console.log(e.response);
    			$$invalidate(2, error = e.response.data);
    			return;
    		}

    		window.location = "/";
    		location.reload();
    	}

    	const writable_props = ["nick", "contraseña"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<FormularioLogin> was created with unknown prop '${key}'`);
    	});

    	function textfield0_value_binding(value) {
    		nick = value;
    		$$invalidate(0, nick);
    	}

    	function textfield1_value_binding(value) {
    		contraseña = value;
    		$$invalidate(1, contraseña);
    	}

    	function dialog0_visible_binding(value) {
    		$globalStore.mostrarLogin = value;
    		globalStore.set($globalStore);
    	}

    	function textfield0_value_binding_1(value) {
    		nick = value;
    		$$invalidate(0, nick);
    	}

    	function textfield1_value_binding_1(value) {
    		contraseña = value;
    		$$invalidate(1, contraseña);
    	}

    	function dialog1_visible_binding(value) {
    		$globalStore.mostrarRegistro = value;
    		globalStore.set($globalStore);
    	}

    	$$self.$$set = $$props => {
    		if ("nick" in $$props) $$invalidate(0, nick = $$props.nick);
    		if ("contraseña" in $$props) $$invalidate(1, contraseña = $$props.contraseña);
    	};

    	$$self.$capture_state = () => ({
    		Dialog: pn,
    		Textfield: Ve,
    		Button: ye,
    		globalStore,
    		RChanClient,
    		ErrorValidacion,
    		nick,
    		contraseña,
    		error,
    		registrar,
    		login,
    		$globalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("nick" in $$props) $$invalidate(0, nick = $$props.nick);
    		if ("contraseña" in $$props) $$invalidate(1, contraseña = $$props.contraseña);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nick,
    		contraseña,
    		error,
    		$globalStore,
    		registrar,
    		login,
    		textfield0_value_binding,
    		textfield1_value_binding,
    		dialog0_visible_binding,
    		textfield0_value_binding_1,
    		textfield1_value_binding_1,
    		dialog1_visible_binding
    	];
    }

    class FormularioLogin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { nick: 0, contraseña: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormularioLogin",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get nick() {
    		throw new Error("<FormularioLogin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nick(value) {
    		throw new Error("<FormularioLogin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contraseña() {
    		throw new Error("<FormularioLogin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contraseña(value) {
    		throw new Error("<FormularioLogin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\MensajeRotativo.svelte generated by Svelte v3.29.0 */
    const file$d = "src\\components\\MensajeRotativo.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;
    	let span0;
    	let t0;
    	let span0_resize_listener;
    	let t1;
    	let span1;
    	let t2;
    	let div1_resize_listener;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(/*texto*/ ctx[0]);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(/*texto*/ ctx[0]);
    			attr_dev(span0, "class", "rt1 svelte-1lcfwcs");
    			add_render_callback(() => /*span0_elementresize_handler*/ ctx[7].call(span0));
    			add_location(span0, file$d, 34, 8, 1024);
    			attr_dev(span1, "class", "rt2 svelte-1lcfwcs");
    			add_location(span1, file$d, 35, 8, 1111);
    			attr_dev(div0, "class", "mensaje-rotativo svelte-1lcfwcs");
    			set_style(div0, "--width", /*textWidth*/ ctx[1] + "px");
    			set_style(div0, "--duracion", /*duracion*/ ctx[5] + "s");
    			add_location(div0, file$d, 33, 4, 928);
    			attr_dev(div1, "class", "container svelte-1lcfwcs");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[9].call(div1));
    			add_location(div1, file$d, 32, 0, 874);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			/*span0_binding*/ ctx[6](span0);
    			span0_resize_listener = add_resize_listener(span0, /*span0_elementresize_handler*/ ctx[7].bind(span0));
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			/*span1_binding*/ ctx[8](span1);
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[9].bind(div1));
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*texto*/ 1) set_data_dev(t0, /*texto*/ ctx[0]);
    			if (dirty & /*texto*/ 1) set_data_dev(t2, /*texto*/ ctx[0]);

    			if (dirty & /*textWidth*/ 2) {
    				set_style(div0, "--width", /*textWidth*/ ctx[1] + "px");
    			}

    			if (dirty & /*duracion*/ 32) {
    				set_style(div0, "--duracion", /*duracion*/ ctx[5] + "s");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*span0_binding*/ ctx[6](null);
    			span0_resize_listener();
    			/*span1_binding*/ ctx[8](null);
    			div1_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MensajeRotativo", slots, []);

    	let { texto = `¿por favor. necesito ayuda. acabo de discutir con mi mujer, y de la bronca, le arroje el monitor en la cabeza..?
quedo en el piso

estoy desesperado..

no se que hacer.. 

el monitor  prende..pero  se ve con una raya al medio

necesito ayuda urgente.

Actualización:
pido solucion para el monitor. como hago para que funcione bien. no es mio. y no pienso regalar el que eestoy utilizando para escribir por aqui` } = $$props;

    	let textWidth = 0;
    	let rt1;
    	let rt2;
    	let width = 100;
    	let duracion = 100;
    	const writable_props = ["texto"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MensajeRotativo> was created with unknown prop '${key}'`);
    	});

    	function span0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			rt1 = $$value;
    			$$invalidate(2, rt1);
    		});
    	}

    	function span0_elementresize_handler() {
    		textWidth = this.offsetWidth;
    		$$invalidate(1, textWidth);
    	}

    	function span1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			rt2 = $$value;
    			$$invalidate(3, rt2);
    		});
    	}

    	function div1_elementresize_handler() {
    		width = this.offsetWidth;
    		$$invalidate(4, width);
    	}

    	$$self.$$set = $$props => {
    		if ("texto" in $$props) $$invalidate(0, texto = $$props.texto);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		texto,
    		textWidth,
    		rt1,
    		rt2,
    		width,
    		duracion
    	});

    	$$self.$inject_state = $$props => {
    		if ("texto" in $$props) $$invalidate(0, texto = $$props.texto);
    		if ("textWidth" in $$props) $$invalidate(1, textWidth = $$props.textWidth);
    		if ("rt1" in $$props) $$invalidate(2, rt1 = $$props.rt1);
    		if ("rt2" in $$props) $$invalidate(3, rt2 = $$props.rt2);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("duracion" in $$props) $$invalidate(5, duracion = $$props.duracion);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width, rt1, rt2*/ 28) {
    			 if (width && rt1 && rt2) {
    				$$invalidate(5, duracion = width / 25);
    				rt1.classList.remove("rt1");
    				rt2.classList.remove("rt2");

    				setTimeout(
    					() => {
    						rt1.classList.add("rt1");
    						rt2.classList.add("rt2");
    					},
    					50
    				);
    			}
    		}
    	};

    	return [
    		texto,
    		textWidth,
    		rt1,
    		rt2,
    		width,
    		duracion,
    		span0_binding,
    		span0_elementresize_handler,
    		span1_binding,
    		div1_elementresize_handler
    	];
    }

    class MensajeRotativo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { texto: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MensajeRotativo",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get texto() {
    		throw new Error("<MensajeRotativo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set texto(value) {
    		throw new Error("<MensajeRotativo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Navbar.svelte generated by Svelte v3.29.0 */
    const file$e = "src\\components\\Navbar.svelte";

    // (63:12) {:else}
    function create_else_block$3(ctx) {
    	let span1;
    	let ripple;
    	let t;
    	let span0;
    	let current;
    	let mounted;
    	let dispose;
    	ripple = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			create_component(ripple.$$.fragment);
    			t = space();
    			span0 = element("span");
    			attr_dev(span0, "class", "fe fe-user svelte-1to1iv0");
    			add_location(span0, file$e, 65, 16, 2440);
    			attr_dev(span1, "class", "nav-boton svelte-1to1iv0");
    			add_location(span1, file$e, 63, 12, 2322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			mount_component(ripple, span1, null);
    			append_dev(span1, t);
    			append_dev(span1, span0);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span1, "click", /*click_handler_1*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			destroy_component(ripple);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(63:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:12) {#if $globalStore.usuario.estaAutenticado}
    function create_if_block$9(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(61:12) {#if $globalStore.usuario.estaAutenticado}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let header;
    	let div2;
    	let span0;
    	let icon;
    	let t0;
    	let ripple0;
    	let t1;
    	let a;
    	let h3;
    	let t3;
    	let ripple1;
    	let t4;
    	let mensajerotativo;
    	let t5;
    	let div1;
    	let div0;
    	let t6;
    	let t7;
    	let current_block_type_index;
    	let if_block;
    	let t8;
    	let span3;
    	let span1;
    	let t10;
    	let span2;
    	let t11;
    	let ripple2;
    	let t12;
    	let formulariohilo;
    	let updating_mostrar;
    	let t13;
    	let menuprincipal;
    	let updating_mostrar_1;
    	let t14;
    	let formulariologin;
    	let current;
    	let mounted;
    	let dispose;
    	ripple0 = new he({ $$inline: true });
    	ripple1 = new he({ $$inline: true });
    	mensajerotativo = new MensajeRotativo({ $$inline: true });
    	const if_block_creators = [create_if_block$9, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$globalStore*/ ctx[3].usuario.estaAutenticado) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	ripple2 = new he({ $$inline: true });

    	function formulariohilo_mostrar_binding(value) {
    		/*formulariohilo_mostrar_binding*/ ctx[7].call(null, value);
    	}

    	let formulariohilo_props = {};

    	if (/*mostrarFormularioHilo*/ ctx[2] !== void 0) {
    		formulariohilo_props.mostrar = /*mostrarFormularioHilo*/ ctx[2];
    	}

    	formulariohilo = new FormularioHilo({
    			props: formulariohilo_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(formulariohilo, "mostrar", formulariohilo_mostrar_binding));

    	function menuprincipal_mostrar_binding(value) {
    		/*menuprincipal_mostrar_binding*/ ctx[8].call(null, value);
    	}

    	let menuprincipal_props = {};

    	if (/*mostrarMenu*/ ctx[1] !== void 0) {
    		menuprincipal_props.mostrar = /*mostrarMenu*/ ctx[1];
    	}

    	menuprincipal = new MenuPrincipal({
    			props: menuprincipal_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(menuprincipal, "mostrar", menuprincipal_mostrar_binding));
    	formulariologin = new FormularioLogin({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			div2 = element("div");
    			span0 = element("span");
    			icon = element("icon");
    			t0 = space();
    			create_component(ripple0.$$.fragment);
    			t1 = space();
    			a = element("a");
    			h3 = element("h3");
    			h3.textContent = "ROSED";
    			t3 = space();
    			create_component(ripple1.$$.fragment);
    			t4 = space();
    			create_component(mensajerotativo.$$.fragment);
    			t5 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t6 = text(/*notificaciones*/ ctx[0]);
    			t7 = space();
    			if_block.c();
    			t8 = space();
    			span3 = element("span");
    			span1 = element("span");
    			span1.textContent = "Crear Hilo";
    			t10 = space();
    			span2 = element("span");
    			t11 = space();
    			create_component(ripple2.$$.fragment);
    			t12 = space();
    			create_component(formulariohilo.$$.fragment);
    			t13 = space();
    			create_component(menuprincipal.$$.fragment);
    			t14 = space();
    			create_component(formulariologin.$$.fragment);
    			attr_dev(icon, "class", "fe fe-menu svelte-1to1iv0");
    			add_location(icon, file$e, 20, 12, 764);
    			attr_dev(span0, "class", "svelte-1to1iv0");
    			add_location(span0, file$e, 19, 8, 700);
    			add_location(h3, file$e, 24, 12, 866);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-1to1iv0");
    			add_location(a, file$e, 23, 8, 840);
    			attr_dev(div0, "class", "debug notdi-debug");
    			add_location(div0, file$e, 57, 12, 2086);
    			attr_dev(div1, "class", "nav-botones svelte-1to1iv0");
    			set_style(div1, "position", "relative");
    			add_location(div1, file$e, 29, 8, 957);
    			set_style(span1, "width", "max-content");
    			set_style(span1, "margin-right", "6px");
    			add_location(span1, file$e, 72, 12, 2671);
    			attr_dev(span2, "class", "fe fe-plus svelte-1to1iv0");
    			add_location(span2, file$e, 73, 12, 2753);
    			attr_dev(span3, "class", "nav-boton crear-hilo-boton svelte-1to1iv0");
    			add_location(span3, file$e, 71, 8, 2570);
    			attr_dev(div2, "class", "nav-principal svelte-1to1iv0");
    			add_location(div2, file$e, 18, 4, 663);
    			add_location(header, file$e, 17, 0, 649);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div2);
    			append_dev(div2, span0);
    			append_dev(span0, icon);
    			append_dev(span0, t0);
    			mount_component(ripple0, span0, null);
    			append_dev(div2, t1);
    			append_dev(div2, a);
    			append_dev(a, h3);
    			append_dev(a, t3);
    			mount_component(ripple1, a, null);
    			append_dev(div2, t4);
    			mount_component(mensajerotativo, div2, null);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t6);
    			append_dev(div1, t7);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div2, t8);
    			append_dev(div2, span3);
    			append_dev(span3, span1);
    			append_dev(span3, t10);
    			append_dev(span3, span2);
    			append_dev(span3, t11);
    			mount_component(ripple2, span3, null);
    			append_dev(div2, t12);
    			mount_component(formulariohilo, div2, null);
    			append_dev(div2, t13);
    			mount_component(menuprincipal, div2, null);
    			append_dev(div2, t14);
    			mount_component(formulariologin, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(span3, "click", /*click_handler_2*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*notificaciones*/ 1) set_data_dev(t6, /*notificaciones*/ ctx[0]);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}

    			const formulariohilo_changes = {};

    			if (!updating_mostrar && dirty & /*mostrarFormularioHilo*/ 4) {
    				updating_mostrar = true;
    				formulariohilo_changes.mostrar = /*mostrarFormularioHilo*/ ctx[2];
    				add_flush_callback(() => updating_mostrar = false);
    			}

    			formulariohilo.$set(formulariohilo_changes);
    			const menuprincipal_changes = {};

    			if (!updating_mostrar_1 && dirty & /*mostrarMenu*/ 2) {
    				updating_mostrar_1 = true;
    				menuprincipal_changes.mostrar = /*mostrarMenu*/ ctx[1];
    				add_flush_callback(() => updating_mostrar_1 = false);
    			}

    			menuprincipal.$set(menuprincipal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple0.$$.fragment, local);
    			transition_in(ripple1.$$.fragment, local);
    			transition_in(mensajerotativo.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(ripple2.$$.fragment, local);
    			transition_in(formulariohilo.$$.fragment, local);
    			transition_in(menuprincipal.$$.fragment, local);
    			transition_in(formulariologin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple0.$$.fragment, local);
    			transition_out(ripple1.$$.fragment, local);
    			transition_out(mensajerotativo.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(ripple2.$$.fragment, local);
    			transition_out(formulariohilo.$$.fragment, local);
    			transition_out(menuprincipal.$$.fragment, local);
    			transition_out(formulariologin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(ripple0);
    			destroy_component(ripple1);
    			destroy_component(mensajerotativo);
    			if_blocks[current_block_type_index].d();
    			destroy_component(ripple2);
    			destroy_component(formulariohilo);
    			destroy_component(menuprincipal);
    			destroy_component(formulariologin);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $globalStore;
    	validate_store(globalStore, "globalStore");
    	component_subscribe($$self, globalStore, $$value => $$invalidate(3, $globalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	let { notificaciones = window.notificaciones || [] } = $$props;
    	let mostrarMenu = false;
    	let mostrarFormularioHilo = false;
    	let mostrarCategorias = false;
    	let mostrarNotificaciones = false;
    	const writable_props = ["notificaciones"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, mostrarMenu = !mostrarMenu);
    	const click_handler_1 = () => set_store_value(globalStore, $globalStore.mostrarLogin = true, $globalStore);
    	const click_handler_2 = () => $$invalidate(2, mostrarFormularioHilo = true);

    	function formulariohilo_mostrar_binding(value) {
    		mostrarFormularioHilo = value;
    		$$invalidate(2, mostrarFormularioHilo);
    	}

    	function menuprincipal_mostrar_binding(value) {
    		mostrarMenu = value;
    		$$invalidate(1, mostrarMenu);
    	}

    	$$self.$$set = $$props => {
    		if ("notificaciones" in $$props) $$invalidate(0, notificaciones = $$props.notificaciones);
    	};

    	$$self.$capture_state = () => ({
    		Ripple: he,
    		config,
    		FormularioHilo,
    		Notificaciones,
    		MenuPrincipal,
    		FormularioLogin,
    		globalStore,
    		MensajeRotativo,
    		notificaciones,
    		mostrarMenu,
    		mostrarFormularioHilo,
    		mostrarCategorias,
    		mostrarNotificaciones,
    		$globalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("notificaciones" in $$props) $$invalidate(0, notificaciones = $$props.notificaciones);
    		if ("mostrarMenu" in $$props) $$invalidate(1, mostrarMenu = $$props.mostrarMenu);
    		if ("mostrarFormularioHilo" in $$props) $$invalidate(2, mostrarFormularioHilo = $$props.mostrarFormularioHilo);
    		if ("mostrarCategorias" in $$props) mostrarCategorias = $$props.mostrarCategorias;
    		if ("mostrarNotificaciones" in $$props) mostrarNotificaciones = $$props.mostrarNotificaciones;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		notificaciones,
    		mostrarMenu,
    		mostrarFormularioHilo,
    		$globalStore,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		formulariohilo_mostrar_binding,
    		menuprincipal_mostrar_binding
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { notificaciones: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get notificaciones() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notificaciones(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class MediaType
    {
        static Imagen = 0
        static Video = 1
        static Youtube = 2
    }

    /* src\icons\more-vertical.svg generated by Svelte v3.29.0 */

    const file$f = "src\\icons\\more-vertical.svg";

    function create_fragment$f(ctx) {
    	let svg;
    	let circle0;
    	let circle1;
    	let circle2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			circle2 = svg_element("circle");
    			attr_dev(circle0, "cx", "12");
    			attr_dev(circle0, "cy", "12");
    			attr_dev(circle0, "r", "1");
    			add_location(circle0, file$f, 0, 219, 219);
    			attr_dev(circle1, "cx", "12");
    			attr_dev(circle1, "cy", "5");
    			attr_dev(circle1, "r", "1");
    			add_location(circle1, file$f, 0, 258, 258);
    			attr_dev(circle2, "cx", "12");
    			attr_dev(circle2, "cy", "19");
    			attr_dev(circle2, "r", "1");
    			add_location(circle2, file$f, 0, 296, 296);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", "feather feather-more-vertical");
    			add_location(svg, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle0);
    			append_dev(svg, circle1);
    			append_dev(svg, circle2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("More_vertical", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<More_vertical> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class More_vertical extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "More_vertical",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\components\Hilos\HiloPreview.svelte generated by Svelte v3.29.0 */

    const { console: console_1$5 } = globals;
    const file$g = "src\\components\\Hilos\\HiloPreview.svelte";

    // (66:12) <Icon>
    function create_default_slot_1$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = More_vertical;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = More_vertical)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(66:12) <Icon>",
    		ctx
    	});

    	return block;
    }

    // (65:8) <Button icon color="white" style="margin-left: auto;"  on:click={()=> mostrarMenu = !mostrarMenu}>
    function create_default_slot$5(ctx) {
    	let icon;
    	let current;

    	icon = new Me({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(65:8) <Button icon color=\\\"white\\\" style=\\\"margin-left: auto;\\\"  on:click={()=> mostrarMenu = !mostrarMenu}>",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if mostrarMenu}
    function create_if_block_7(ctx) {
    	let ul;
    	let li0;
    	let t0_value = (/*visible*/ ctx[2] ? "Ocultar" : "Mostrar") + "";
    	let t0;
    	let t1;
    	let ripple0;
    	let t2;
    	let li1;
    	let t3;
    	let ripple1;
    	let t4;
    	let ul_transition;
    	let current;
    	let mounted;
    	let dispose;
    	ripple0 = new he({ $$inline: true });
    	ripple1 = new he({ $$inline: true });
    	let if_block = /*$globalStore*/ ctx[4].usuario.esMod && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(ripple0.$$.fragment);
    			t2 = space();
    			li1 = element("li");
    			t3 = text("Reportar ");
    			create_component(ripple1.$$.fragment);
    			t4 = space();
    			if (if_block) if_block.c();
    			attr_dev(li0, "class", "svelte-1rwnnyc");
    			add_location(li0, file$g, 69, 16, 1879);
    			attr_dev(li1, "class", "svelte-1rwnnyc");
    			add_location(li1, file$g, 70, 16, 1963);
    			attr_dev(ul, "class", "menu-hilo svelte-1rwnnyc");
    			add_location(ul, file$g, 68, 12, 1764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t0);
    			append_dev(li0, t1);
    			mount_component(ripple0, li0, null);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, t3);
    			mount_component(ripple1, li1, null);
    			append_dev(ul, t4);
    			if (if_block) if_block.m(ul, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*toggle*/ ctx[7], false, false, false),
    					listen_dev(ul, "mouseleave", /*mouseleave_handler*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*visible*/ 4) && t0_value !== (t0_value = (/*visible*/ ctx[2] ? "Ocultar" : "Mostrar") + "")) set_data_dev(t0, t0_value);

    			if (/*$globalStore*/ ctx[4].usuario.esMod) {
    				if (if_block) {
    					if (dirty & /*$globalStore*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(ul, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple0.$$.fragment, local);
    			transition_in(ripple1.$$.fragment, local);
    			transition_in(if_block);

    			if (local) {
    				add_render_callback(() => {
    					if (!ul_transition) ul_transition = create_bidirectional_transition(ul, fly, { x: -100 }, true);
    					ul_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple0.$$.fragment, local);
    			transition_out(ripple1.$$.fragment, local);
    			transition_out(if_block);

    			if (local) {
    				if (!ul_transition) ul_transition = create_bidirectional_transition(ul, fly, { x: -100 }, false);
    				ul_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_component(ripple0);
    			destroy_component(ripple1);
    			if (if_block) if_block.d();
    			if (detaching && ul_transition) ul_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(68:8) {#if mostrarMenu}",
    		ctx
    	});

    	return block;
    }

    // (72:16) {#if $globalStore.usuario.esMod}
    function create_if_block_8(ctx) {
    	let li;
    	let t;
    	let ripple;
    	let current;
    	ripple = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text("Eliminar ");
    			create_component(ripple.$$.fragment);
    			attr_dev(li, "class", "svelte-1rwnnyc");
    			add_location(li, file$g, 72, 20, 2062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    			mount_component(ripple, li, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(ripple);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(72:16) {#if $globalStore.usuario.esMod}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#if visible}
    function create_if_block$a(ctx) {
    	let a;
    	let t0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let div2;
    	let t2;
    	let t3;
    	let div0;
    	let t4_value = /*categorias*/ ctx[5][/*hilo*/ ctx[0].categoriaId - 1].nombreCorto + "";
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div1;
    	let t9_value = /*hilo*/ ctx[0].cantidadComentarios + "";
    	let t9;
    	let t10;
    	let h3;
    	let t11_value = /*hilo*/ ctx[0].titulo + "";
    	let t11;
    	let a_href_value;
    	let a__bind_id_value;
    	let a_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*destellando*/ ctx[1] && create_if_block_6$1(ctx);
    	let if_block1 = /*hilo*/ ctx[0].sticky > 0 && create_if_block_5$1(ctx);
    	let if_block2 = /*hilo*/ ctx[0].nuevo && create_if_block_4$2(ctx);
    	let if_block3 = /*media*/ ctx[6].tipo == MediaType.Video && create_if_block_3$2(ctx);
    	let if_block4 = /*media*/ ctx[6].tipo == MediaType.Youtube && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			div0 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			if (if_block4) if_block4.c();
    			t7 = space();
    			t8 = space();
    			div1 = element("div");
    			t9 = text(t9_value);
    			t10 = space();
    			h3 = element("h3");
    			t11 = text(t11_value);
    			if (img.src !== (img_src_value = /*media*/ ctx[6].vistaPreviaCuadrado)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*hilo*/ ctx[0].titulo);
    			attr_dev(img, "class", "imghilo");
    			add_location(img, file$g, 84, 12, 2490);
    			attr_dev(div0, "class", "info svelte-1rwnnyc");
    			add_location(div0, file$g, 88, 16, 2913);
    			attr_dev(div1, "class", "info svelte-1rwnnyc");
    			add_location(div1, file$g, 93, 16, 3397);
    			attr_dev(div2, "class", "infos");
    			add_location(div2, file$g, 85, 12, 2577);
    			add_location(h3, file$g, 97, 12, 3501);
    			attr_dev(a, "href", a_href_value = "/Hilo/" + /*hilo*/ ctx[0].id);
    			attr_dev(a, "class", "hilo-in");
    			attr_dev(a, ":bind:id", a__bind_id_value = /*hilo*/ ctx[0].id);
    			add_location(a, file$g, 79, 8, 2189);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block0) if_block0.m(a, null);
    			append_dev(a, t0);
    			append_dev(a, img);
    			append_dev(a, t1);
    			append_dev(a, div2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t2);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div0);
    			append_dev(div0, t4);
    			append_dev(div2, t5);
    			if (if_block3) if_block3.m(div2, null);
    			append_dev(div2, t6);
    			if (if_block4) if_block4.m(div2, null);
    			append_dev(div2, t7);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, t9);
    			append_dev(a, t10);
    			append_dev(a, h3);
    			append_dev(h3, t11);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*destellando*/ ctx[1]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_6$1(ctx);
    					if_block0.c();
    					if_block0.m(a, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*hilo*/ 1 && img_alt_value !== (img_alt_value = /*hilo*/ ctx[0].titulo)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (/*hilo*/ ctx[0].sticky > 0) {
    				if (if_block1) {
    					if (dirty & /*hilo*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_5$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*hilo*/ ctx[0].nuevo) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_4$2(ctx);
    					if_block2.c();
    					if_block2.m(div2, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if ((!current || dirty & /*hilo*/ 1) && t4_value !== (t4_value = /*categorias*/ ctx[5][/*hilo*/ ctx[0].categoriaId - 1].nombreCorto + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*hilo*/ 1) && t9_value !== (t9_value = /*hilo*/ ctx[0].cantidadComentarios + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*hilo*/ 1) && t11_value !== (t11_value = /*hilo*/ ctx[0].titulo + "")) set_data_dev(t11, t11_value);

    			if (!current || dirty & /*hilo*/ 1 && a_href_value !== (a_href_value = "/Hilo/" + /*hilo*/ ctx[0].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*hilo*/ 1 && a__bind_id_value !== (a__bind_id_value = /*hilo*/ ctx[0].id)) {
    				attr_dev(a, ":bind:id", a__bind_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			if (local) {
    				add_render_callback(() => {
    					if (!a_transition) a_transition = create_bidirectional_transition(a, fly, { duration: 1000 }, true);
    					a_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);

    			if (local) {
    				if (!a_transition) a_transition = create_bidirectional_transition(a, fly, { duration: 1000 }, false);
    				a_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (detaching && a_transition) a_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(79:4) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (82:12) {#if destellando}
    function create_if_block_6$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "destello");
    			add_location(div, file$g, 82, 16, 2429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(82:12) {#if destellando}",
    		ctx
    	});

    	return block;
    }

    // (87:16) {#if hilo.sticky > 0}
    function create_if_block_5$1(ctx) {
    	let div;
    	let icon;
    	let current;

    	icon = new Me({
    			props: {
    				size: "17",
    				path: "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon.$$.fragment);
    			attr_dev(div, "class", "info sticky-info svelte-1rwnnyc");
    			add_location(div, file$g, 86, 38, 2636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(87:16) {#if hilo.sticky > 0}",
    		ctx
    	});

    	return block;
    }

    // (88:16) {#if hilo.nuevo}
    function create_if_block_4$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "NUEVO";
    			attr_dev(div, "class", "info svelte-1rwnnyc");
    			set_style(div, "background", "#18222D");
    			add_location(div, file$g, 87, 33, 2834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(88:16) {#if hilo.nuevo}",
    		ctx
    	});

    	return block;
    }

    // (90:16) {#if media.tipo == MediaType.Video}
    function create_if_block_3$2(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			attr_dev(span, "class", "fe fe-play");
    			add_location(span, file$g, 89, 97, 3091);
    			attr_dev(div, "class", "info svelte-1rwnnyc");
    			set_style(div, "background", "#18222D");
    			add_location(div, file$g, 89, 52, 3046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(90:16) {#if media.tipo == MediaType.Video}",
    		ctx
    	});

    	return block;
    }

    // (91:16) {#if media.tipo == MediaType.Youtube}
    function create_if_block_2$3(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			attr_dev(span, "class", "fe fe-play");
    			add_location(span, file$g, 90, 99, 3235);
    			attr_dev(div, "class", "info svelte-1rwnnyc");
    			set_style(div, "background", "#fa2717");
    			add_location(div, file$g, 90, 54, 3190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(91:16) {#if media.tipo == MediaType.Youtube}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let li;
    	let div;
    	let button;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;

    	button = new ye({
    			props: {
    				icon: true,
    				color: "white",
    				style: "margin-left: auto;",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[9]);
    	let if_block0 = /*mostrarMenu*/ ctx[3] && create_if_block_7(ctx);
    	let if_block1 = /*visible*/ ctx[2] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			create_component(button.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "");
    			set_style(div, "top", "0");
    			set_style(div, "right", "0");
    			set_style(div, "z-index", "232");
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "column");
    			set_style(div, "position", "absolute");
    			add_location(div, file$g, 57, 4, 1391);
    			attr_dev(li, "class", "hilo");
    			add_location(li, file$g, 54, 0, 1315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			mount_component(button, div, null);
    			append_dev(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(li, t1);
    			if (if_block1) if_block1.m(li, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "mouseleave", /*mouseleave_handler_1*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*mostrarMenu*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*mostrarMenu*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*visible*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*visible*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(li, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(button);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $globalStore;
    	validate_store(globalStore, "globalStore");
    	component_subscribe($$self, globalStore, $$value => $$invalidate(4, $globalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HiloPreview", slots, []);
    	let { hilo } = $$props;
    	let categorias = config.categorias;
    	let media = hilo.media;
    	let destellando = false;
    	let visible = true;
    	let mostrarMenu = false;
    	let recienCargado = true;

    	function destellar(cantidadComentarios) {
    		if (recienCargado) {
    			recienCargado = false;
    			return;
    		}

    		$$invalidate(1, destellando = true);
    		setTimeout(() => $$invalidate(1, destellando = false), 2000);
    	}

    	async function toggle() {
    		$$invalidate(2, visible = !visible);

    		if ($globalStore.usuario.estaAutenticado) {
    			await RChanClient.agregar("ocultos", hilo.id);
    		}
    	}

    	// setInterval(() => {
    	//     hilo.cantidadComentarios+=1
    	// }, Math.random() * 5000 + 4000);
    	function onClick(e) {
    		console.log(e.target.nodeName);

    		if (e.target.nodeName == "A" || e.target.nodeName == "H3") {
    			window.location = `/Hilo/${hilo.id}`;
    		}
    	}

    	console.log(hilo);
    	console.log(hilo.categoriaId);
    	const writable_props = ["hilo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<HiloPreview> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(3, mostrarMenu = !mostrarMenu);
    	const mouseleave_handler = () => $$invalidate(3, mostrarMenu = false);
    	const mouseleave_handler_1 = () => $$invalidate(3, mostrarMenu = false);

    	$$self.$$set = $$props => {
    		if ("hilo" in $$props) $$invalidate(0, hilo = $$props.hilo);
    	};

    	$$self.$capture_state = () => ({
    		Menu: kn,
    		Ripple: he,
    		Button: ye,
    		Icon: Me,
    		config,
    		globalStore,
    		MediaType,
    		fly,
    		more: More_vertical,
    		RChanClient,
    		hilo,
    		categorias,
    		media,
    		destellando,
    		visible,
    		mostrarMenu,
    		recienCargado,
    		destellar,
    		toggle,
    		onClick,
    		cantidadComentarios,
    		$globalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("hilo" in $$props) $$invalidate(0, hilo = $$props.hilo);
    		if ("categorias" in $$props) $$invalidate(5, categorias = $$props.categorias);
    		if ("media" in $$props) $$invalidate(6, media = $$props.media);
    		if ("destellando" in $$props) $$invalidate(1, destellando = $$props.destellando);
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    		if ("mostrarMenu" in $$props) $$invalidate(3, mostrarMenu = $$props.mostrarMenu);
    		if ("recienCargado" in $$props) recienCargado = $$props.recienCargado;
    		if ("cantidadComentarios" in $$props) $$invalidate(13, cantidadComentarios = $$props.cantidadComentarios);
    	};

    	let cantidadComentarios;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hilo*/ 1) {
    			 $$invalidate(13, cantidadComentarios = hilo.cantidadComentarios);
    		}

    		if ($$self.$$.dirty & /*cantidadComentarios*/ 8192) {
    			 destellar();
    		}
    	};

    	return [
    		hilo,
    		destellando,
    		visible,
    		mostrarMenu,
    		$globalStore,
    		categorias,
    		media,
    		toggle,
    		onClick,
    		click_handler,
    		mouseleave_handler,
    		mouseleave_handler_1
    	];
    }

    class HiloPreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { hilo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HiloPreview",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*hilo*/ ctx[0] === undefined && !("hilo" in props)) {
    			console_1$5.warn("<HiloPreview> was created without expected prop 'hilo'");
    		}
    	}

    	get hilo() {
    		throw new Error("<HiloPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hilo(value) {
    		throw new Error("<HiloPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Hilos\HiloList.svelte generated by Svelte v3.29.0 */

    const { console: console_1$6 } = globals;
    const file$h = "src\\components\\Hilos\\HiloList.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (51:4) {#if nuevoshilos.length > 0}
    function create_if_block$b(ctx) {
    	let div;
    	let icon;
    	let t0;
    	let t1_value = /*nuevoshilos*/ ctx[1].length + "";
    	let t1;
    	let t2;

    	let t3_value = (/*nuevoshilos*/ ctx[1].length == 1
    	? "hilo nuevo"
    	: "hilos nuevos") + "";

    	let t3;
    	let t4;
    	let ripple;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	ripple = new he({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			icon = element("icon");
    			t0 = text(" \r\n            Cargar ");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(ripple.$$.fragment);
    			attr_dev(icon, "class", "fe fe-rotate-cw");
    			set_style(icon, "margin-right", "8px");
    			add_location(icon, file$h, 52, 12, 1622);
    			attr_dev(div, "class", "cargar-nuevos-hilos");
    			add_location(div, file$h, 51, 8, 1526);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, icon);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			mount_component(ripple, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*cargarNuevos*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*nuevoshilos*/ 2) && t1_value !== (t1_value = /*nuevoshilos*/ ctx[1].length + "")) set_data_dev(t1, t1_value);

    			if ((!current || dirty & /*nuevoshilos*/ 2) && t3_value !== (t3_value = (/*nuevoshilos*/ ctx[1].length == 1
    			? "hilo nuevo"
    			: "hilos nuevos") + "")) set_data_dev(t3, t3_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(ripple);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(51:4) {#if nuevoshilos.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (58:4) {#each hiloList.hilos as hilo (hilo.id)}
    function create_each_block$8(key_1, ctx) {
    	let first;
    	let hilopreview;
    	let updating_hilo;
    	let current;

    	function hilopreview_hilo_binding(value) {
    		/*hilopreview_hilo_binding*/ ctx[3].call(null, value, /*hilo*/ ctx[8], /*each_value*/ ctx[9], /*hilo_index*/ ctx[10]);
    	}

    	let hilopreview_props = {};

    	if (/*hilo*/ ctx[8] !== void 0) {
    		hilopreview_props.hilo = /*hilo*/ ctx[8];
    	}

    	hilopreview = new HiloPreview({ props: hilopreview_props, $$inline: true });
    	binding_callbacks.push(() => bind(hilopreview, "hilo", hilopreview_hilo_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(hilopreview.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(hilopreview, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const hilopreview_changes = {};

    			if (!updating_hilo && dirty & /*hiloList*/ 1) {
    				updating_hilo = true;
    				hilopreview_changes.hilo = /*hilo*/ ctx[8];
    				add_flush_callback(() => updating_hilo = false);
    			}

    			hilopreview.$set(hilopreview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hilopreview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hilopreview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(hilopreview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(58:4) {#each hiloList.hilos as hilo (hilo.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let ul;
    	let t;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*nuevoshilos*/ ctx[1].length > 0 && create_if_block$b(ctx);
    	let each_value = /*hiloList*/ ctx[0].hilos;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*hilo*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context$8, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "hilo-list");
    			add_location(ul, file$h, 49, 0, 1460);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			if (if_block) if_block.m(ul, null);
    			append_dev(ul, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*nuevoshilos*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*nuevoshilos*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(ul, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*hiloList*/ 1) {
    				const each_value = /*hiloList*/ ctx[0].hilos;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$8, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$8, null, get_each_context$8);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $globalStore;
    	validate_store(globalStore, "globalStore");
    	component_subscribe($$self, globalStore, $$value => $$invalidate(4, $globalStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HiloList", slots, []);
    	let { hiloList } = $$props;
    	let nuevoshilos = [];
    	let connection = new HubConnectionBuilder().withUrl("/hub").build();
    	connection.on("HiloCreado", onHiloCreado);
    	connection.on("HiloComentado", onHiloComentado);

    	connection.start().then(() => {
    		console.log("Conectado");
    		return connection.invoke("SubscribirAHome");
    	}).catch(console.error);

    	// Test destello
    	// setInterval(() => {
    	//     hiloList.hilos[2].cantidadComentarios += 1
    	// }, 4000);
    	function onHiloCreado(hilo) {
    		if ($globalStore.categoriasActivas.includes(hilo.categoriaId)) {
    			$$invalidate(1, nuevoshilos = [hilo, ...nuevoshilos]);
    		}
    	}

    	function onHiloComentado(id, comentario) {
    		let hiloComentado = hiloList.hilos.filter(h => h.id == id);

    		if (hiloComentado.length != 0) {
    			hiloComentado[0].cantidadComentarios += 1;
    		}

    		$$invalidate(0, hiloList);
    	}

    	function cargarNuevos() {
    		$$invalidate(0, hiloList.hilos = [...nuevoshilos, ...hiloList.hilos], hiloList);
    		window.document.body.scrollTop = 0;
    		window.document.documentElement.scrollTop = 0;
    		$$invalidate(1, nuevoshilos = []);
    	}

    	const writable_props = ["hiloList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<HiloList> was created with unknown prop '${key}'`);
    	});

    	function hilopreview_hilo_binding(value, hilo, each_value, hilo_index) {
    		each_value[hilo_index] = value;
    		$$invalidate(0, hiloList);
    	}

    	$$self.$$set = $$props => {
    		if ("hiloList" in $$props) $$invalidate(0, hiloList = $$props.hiloList);
    	};

    	$$self.$capture_state = () => ({
    		HiloPreview,
    		globalStore,
    		Ripple: he,
    		fly,
    		HubConnectionBuilder,
    		hiloList,
    		nuevoshilos,
    		connection,
    		onHiloCreado,
    		onHiloComentado,
    		cargarNuevos,
    		$globalStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("hiloList" in $$props) $$invalidate(0, hiloList = $$props.hiloList);
    		if ("nuevoshilos" in $$props) $$invalidate(1, nuevoshilos = $$props.nuevoshilos);
    		if ("connection" in $$props) connection = $$props.connection;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hiloList, nuevoshilos, cargarNuevos, hilopreview_hilo_binding];
    }

    class HiloList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { hiloList: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HiloList",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*hiloList*/ ctx[0] === undefined && !("hiloList" in props)) {
    			console_1$6.warn("<HiloList> was created without expected prop 'hiloList'");
    		}
    	}

    	get hiloList() {
    		throw new Error("<HiloList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hiloList(value) {
    		throw new Error("<HiloList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Administracion\Administracion.svelte generated by Svelte v3.29.0 */

    const { console: console_1$7 } = globals;
    const file$i = "src\\components\\Administracion\\Administracion.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (43:97) <Button on:click={() => añadir(nick, "admin")}>
    function create_default_slot_3$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Añadir");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(43:97) <Button on:click={() => añadir(nick, \\\"admin\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (46:62) <Button on:click={() => eliminar(a.id, "admin")}>
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Eliminar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(46:62) <Button on:click={() => eliminar(a.id, \\\"admin\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (45:16) {#each model.admins as a (a.id)}
    function create_each_block_1$1(key_1, ctx) {
    	let li;
    	let t0_value = /*a*/ ctx[13].userName + "";
    	let t0;
    	let t1;
    	let span;
    	let button;
    	let current;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[7](/*a*/ ctx[13], ...args);
    	}

    	button = new ye({
    			props: {
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler_1);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "class", "sep svelte-1ugtj2x");
    			add_location(span, file$i, 45, 37, 1441);
    			add_location(li, file$i, 45, 20, 1424);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);
    			mount_component(button, li, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(45:16) {#each model.admins as a (a.id)}",
    		ctx
    	});

    	return block;
    }

    // (51:76) <Button on:click={() => añadir(nick, "mod")}>
    function create_default_slot_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Añadir");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(51:76) <Button on:click={() => añadir(nick, \\\"mod\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (54:62) <Button on:click={() => eliminar(m.id, "mod")}>
    function create_default_slot$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Eliminar");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(54:62) <Button on:click={() => eliminar(m.id, \\\"mod\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (53:16) {#each model.mods as m (m.id)}
    function create_each_block$9(key_1, ctx) {
    	let li;
    	let t0_value = /*m*/ ctx[10].userName + "";
    	let t0;
    	let t1;
    	let span;
    	let button;
    	let current;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[9](/*m*/ ctx[10], ...args);
    	}

    	button = new ye({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler_3);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "class", "sep svelte-1ugtj2x");
    			add_location(span, file$i, 53, 37, 1928);
    			add_location(li, file$i, 53, 20, 1911);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);
    			mount_component(button, li, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(53:16) {#each model.mods as m (m.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let main;
    	let section;
    	let h3;
    	let t1;
    	let errorvalidacion;
    	let t2;
    	let div;
    	let ul;
    	let li0;
    	let t4;
    	let li1;
    	let input0;
    	let t5;
    	let button0;
    	let t6;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t7;
    	let hr;
    	let t8;
    	let li2;
    	let t10;
    	let li3;
    	let input1;
    	let t11;
    	let button1;
    	let t12;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;

    	errorvalidacion = new ErrorValidacion({
    			props: { error: /*error*/ ctx[0] },
    			$$inline: true
    		});

    	button0 = new ye({
    			props: {
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[6]);
    	let each_value_1 = /*model*/ ctx[2].admins;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*a*/ ctx[13].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$1(key, child_ctx));
    	}

    	button1 = new ye({
    			props: {
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_2*/ ctx[8]);
    	let each_value = /*model*/ ctx[2].mods;
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*m*/ ctx[10].id;
    	validate_each_keys(ctx, each_value, get_each_context$9, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Equipo";
    			t1 = space();
    			create_component(errorvalidacion.$$.fragment);
    			t2 = space();
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Admninistradores";
    			t4 = space();
    			li1 = element("li");
    			input0 = element("input");
    			t5 = space();
    			create_component(button0.$$.fragment);
    			t6 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			hr = element("hr");
    			t8 = space();
    			li2 = element("li");
    			li2.textContent = "Moderadores(medz)";
    			t10 = space();
    			li3 = element("li");
    			input1 = element("input");
    			t11 = space();
    			create_component(button1.$$.fragment);
    			t12 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$i, 36, 8, 969);
    			attr_dev(li0, "class", "header svelte-1ugtj2x");
    			add_location(li0, file$i, 40, 16, 1091);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Id o nick del usuario");
    			add_location(input0, file$i, 42, 20, 1190);
    			attr_dev(li1, "class", "noback");
    			add_location(li1, file$i, 41, 16, 1149);
    			add_location(hr, file$i, 47, 16, 1580);
    			attr_dev(li2, "class", "header svelte-1ugtj2x");
    			add_location(li2, file$i, 48, 16, 1602);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Id o nick del usuario");
    			add_location(input1, file$i, 50, 20, 1702);
    			attr_dev(li3, "class", "noback");
    			add_location(li3, file$i, 49, 16, 1661);
    			add_location(ul, file$i, 39, 12, 1068);
    			attr_dev(div, "class", "menu");
    			add_location(div, file$i, 38, 8, 1036);
    			set_style(section, "max-width", "400px");
    			add_location(section, file$i, 35, 4, 925);
    			attr_dev(main, "class", "administracion svelte-1ugtj2x");
    			add_location(main, file$i, 34, 0, 890);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, h3);
    			append_dev(section, t1);
    			mount_component(errorvalidacion, section, null);
    			append_dev(section, t2);
    			append_dev(section, div);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, input0);
    			set_input_value(input0, /*nick*/ ctx[1]);
    			append_dev(li1, t5);
    			mount_component(button0, li1, null);
    			append_dev(ul, t6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(ul, t7);
    			append_dev(ul, hr);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(ul, t10);
    			append_dev(ul, li3);
    			append_dev(li3, input1);
    			append_dev(li3, t11);
    			mount_component(button1, li3, null);
    			append_dev(ul, t12);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const errorvalidacion_changes = {};
    			if (dirty & /*error*/ 1) errorvalidacion_changes.error = /*error*/ ctx[0];
    			errorvalidacion.$set(errorvalidacion_changes);

    			if (dirty & /*nick*/ 2 && input0.value !== /*nick*/ ctx[1]) {
    				set_input_value(input0, /*nick*/ ctx[1]);
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);

    			if (dirty & /*eliminar, model*/ 12) {
    				const each_value_1 = /*model*/ ctx[2].admins;
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, ul, outro_and_destroy_block, create_each_block_1$1, t7, get_each_context_1$1);
    				check_outros();
    			}

    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (dirty & /*eliminar, model*/ 12) {
    				const each_value = /*model*/ ctx[2].mods;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$9, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, ul, outro_and_destroy_block, create_each_block$9, null, get_each_context$9);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(errorvalidacion.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(button1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(errorvalidacion.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(button1.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(errorvalidacion);
    			destroy_component(button0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_component(button1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Administracion", slots, []);
    	let model = window.model;
    	let error = null;
    	let nick = "";

    	async function eliminar(nick, rol) {
    		try {
    			let res = await RChanClient.removerRol(nick, rol);
    			console.log(res);
    			alert(res.data.mensaje);
    		} catch(e) {
    			console.log(e.resposne);
    			$$invalidate(0, error = e.response.data);
    			return;
    		}
    	}

    	async function añadir(nick, rol) {
    		try {
    			let res = await RChanClient.añadirRol(nick, rol);
    			console.log(res);
    			alert(res.data.mensaje);
    		} catch(e) {
    			console.log(e.resposne);
    			$$invalidate(0, error = e.response.data);
    			return;
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<Administracion> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		nick = this.value;
    		$$invalidate(1, nick);
    	}

    	const click_handler = () => añadir(nick, "admin");
    	const click_handler_1 = a => eliminar(a.id, "admin");
    	const click_handler_2 = () => añadir(nick, "mod");
    	const click_handler_3 = m => eliminar(m.id, "mod");

    	$$self.$capture_state = () => ({
    		Button: ye,
    		RChanClient,
    		ErrorValidacion,
    		model,
    		error,
    		nick,
    		eliminar,
    		añadir
    	});

    	$$self.$inject_state = $$props => {
    		if ("model" in $$props) $$invalidate(2, model = $$props.model);
    		if ("error" in $$props) $$invalidate(0, error = $$props.error);
    		if ("nick" in $$props) $$invalidate(1, nick = $$props.nick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		error,
    		nick,
    		model,
    		eliminar,
    		añadir,
    		input0_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Administracion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Administracion",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    // const app = new App({
    // 	target: document.body,
    // 	props: {
    // 		name: 'world'
    // 	}
    // });
    if(document.querySelector("#svelte"))
    {
    	const app1 = new App({
    		target: document.querySelector("#svelte"),
    		props: {
    		}
    	});
    }

    const navbar = new Navbar({
    	
    	target: document.querySelector("#svelte-navbar")
    });

    if(document.querySelector("#svelte-index")){
    	const hiloList = new HiloList({
    		target: document.querySelector("#svelte-index"),
    		props: {
    			hiloList: window.hiloList
    		}
    	});
    }
    if(document.querySelector("#svelte-administracion")){
    	const hiloList = new Administracion({
    		target: document.querySelector("#svelte-administracion"),
    		props: {
    			// hiloList: window.hiloList
    		}
    	});
    }

    var app$1 = app;

    return app$1;

}());
//# sourceMappingURL=bundle.js.map
