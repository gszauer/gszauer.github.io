"use strict";

var typedSignals  = {}

typedSignals.SignalConnections = typedSignals.Signal = typedSignals.CollectorWhile0 = typedSignals.CollectorUntil0 = typedSignals.CollectorLast = typedSignals.CollectorArray = typedSignals.Collector = void 0;

class Collector {

    /**

     * Create a new collector.

     *

     * @param signal The signal to emit.

     */

    constructor(signal) {

        // eslint-disable-next-line dot-notation

        this.emit = (...args) => {

            // eslint-disable-next-line dot-notation

            signal["emitCollecting"](this, args);

        };

    }

}

Object.defineProperty(typedSignals, "Collector", { enumerable: true, get: function () { return Collector; } });

class CollectorArray extends Collector {

    constructor() {

        super(...arguments);

        this.result = [];

    }

    handleResult(result) {

        this.result.push(result);

        return true;

    }

    /**

     * Get the list of results from the signal handlers.

     */

    getResult() {

        return this.result;

    }

    /**

     * Reset the result

     */

    reset() {

        this.result.length = 0;

    }

}

Object.defineProperty(typedSignals, "CollectorArray", { enumerable: true, get: function () { return CollectorArray; } });

class CollectorLast extends Collector {

    handleResult(result) {

        this.result = result;

        return true;

    }

    /**

     * Get the result of the last signal handler.

     */

    getResult() {

        return this.result;

    }

    /**

     * Reset the result

     */

    reset() {

        delete this.result;

    }

}

Object.defineProperty(typedSignals, "CollectorLast", { enumerable: true, get: function () { return CollectorLast; } });

class CollectorUntil0 extends Collector {

    constructor() {

        super(...arguments);

        this.result = false;

    }

    handleResult(result) {

        this.result = result;

        return this.result;

    }

    /**

     * Get the result of the last signal handler.

     */

    getResult() {

        return this.result;

    }

    /**

     * Reset the result

     */

    reset() {

        this.result = false;

    }

}

Object.defineProperty(typedSignals, "CollectorUntil0", { enumerable: true, get: function () { return CollectorUntil0; } });

class CollectorWhile0 extends Collector {

    constructor() {

        super(...arguments);

        this.result = false;

    }

    handleResult(result) {

        this.result = result;

        return !this.result;

    }

    /**

     * Get the result of the last signal handler.

     */

    getResult() {

        return this.result;

    }

    /**

     * Reset the result

     */

    reset() {

        this.result = false;

    }

}

Object.defineProperty(typedSignals, "CollectorWhile0", { enumerable: true, get: function () { return CollectorWhile0; } });

const headOptions = { order: 0, isPublic: true, onUnlink() { } };

class SignalConnectionImpl {

    /**

     * @param link The actual link of the connection.

     */

    constructor(link) {

        this.link = link;

    }

    disconnect() {

        return this.link.unlink();

    }

    set enabled(enable) {

        this.link.setEnabled(enable);

    }

    get enabled() {

        return this.link.isEnabled();

    }

}

class SignalLink {

    constructor(prev, next, options) {

        this.enabled = true;

        this.newLink = false;

        this.prev = prev !== null && prev !== void 0 ? prev : this;

        this.next = next !== null && next !== void 0 ? next : this;

        this.order = options.order;

        this.isPublic = options.isPublic;

        this.callback = options.callback;

        this.onUnlink = options.onUnlink;

    }

    isEnabled() {

        return this.enabled && !this.newLink;

    }

    setEnabled(flag) {

        this.enabled = flag;

    }

    unlink() {

        if (this.callback) {

            delete this.callback;

            this.next.prev = this.prev;

            this.prev.next = this.next;

            this.onUnlink();

            return true;

        }

        return false;

    }

    insert(options) {

        const { order } = options;

        let after = this.prev;

        while (after !== this) {

            if (after.order <= order)

                break;

            after = after.prev;

        }

        const link = new SignalLink(after, after.next, options);

        after.next = link;

        link.next.prev = link;

        return link;

    }

}

class Signal {

    constructor() {

        this.head = new SignalLink(null, null, headOptions);

        this.hasNewLinks = false;

        this.emitDepth = 0;

        this.connectionsCount = 0;

        this.onUnlink = () => {

            this.connectionsCount--;

        };

    }

    /**

     * @returns The number of connections on this signal.

     */

    getConnectionsCount() {

        return this.connectionsCount;

    }

    /**

     * @returns true if this signal has connections.

     */

    hasConnections() {

        return this.connectionsCount > 0;

    }

    /**

     * Subscribe to this signal.

     *

     * @param callback This callback will be run when emit() is called.

     * @param options Configure options for the connection

     */

    connect(callback, { order = 0, isPublic = true } = {}) {

        this.connectionsCount++;

        const link = this.head.insert({ callback, order, isPublic, onUnlink: this.onUnlink });

        if (this.emitDepth > 0) {

            this.hasNewLinks = true;

            link.newLink = true;

        }

        return new SignalConnectionImpl(link);

    }

    /**

     * Unsubscribe from this signal with the original callback instance.

     * While you can use this method, the SignalConnection returned by connect() will not be updated!

     *

     * @param callback The callback you passed to connect().

     */

    disconnect(callback) {

        for (let link = this.head.next; link !== this.head; link = link.next) {

            if (link.callback === callback) {

                link.unlink();

                return true;

            }

        }

        return false;

    }

    /**

     * Disconnect all handlers from this signal event.

     */

    disconnectAll() {

        let { next } = this.head;

        while (next !== this.head) {

            if (next.isPublic) {

                next.unlink();

            }

            next = next.next;

        }

    }

    /**

     * Publish this signal event (call all handlers).

     */

    emit(...args) {

        this.emitDepth++;

        for (let link = this.head.next; link !== this.head; link = link.next) {

            if (link.isEnabled() && link.callback)

                link.callback.apply(null, args);

        }

        this.emitDepth--;

        this.unsetNewLink();

    }

    emitCollecting(collector, args) {

        this.emitDepth++;

        for (let link = this.head.next; link !== this.head; link = link.next) {

            if (link.isEnabled() && link.callback) {

                const result = link.callback.apply(null, args);

                if (!collector.handleResult(result))

                    break;

            }

        }

        this.emitDepth--;

        this.unsetNewLink();

    }

    unsetNewLink() {

        if (this.hasNewLinks && this.emitDepth === 0) {

            for (let link = this.head.next; link !== this.head; link = link.next)

                link.newLink = false;

            this.hasNewLinks = false;

        }

    }

}

Object.defineProperty(typedSignals, "Signal", { enumerable: true, get: function () { return Signal; } });

class SignalConnections {

    constructor() {

        this.list = [];

    }

    /**

     * Add a connection to the list.

     * @param connection

     */

    add(connection) {

        this.list.push(connection);

    }

    /**

     * Disconnect all connections in the list and empty the list.

     */

    disconnectAll() {

        for (const connection of this.list) {

            connection.disconnect();

        }

        this.list = [];

    }

    /**

     * @returns The number of connections in this list.

     */

    getCount() {

        return this.list.length;

    }

    /**

     * @returns true if this list is empty.

     */

    isEmpty() {

        return this.list.length === 0;

    }

}

Object.defineProperty(typedSignals, "SignalConnections", { enumerable: true, get: function () { return SignalConnections; } });