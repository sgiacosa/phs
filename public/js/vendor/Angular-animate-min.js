﻿/*
 AngularJS v1.4.3
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (F, t, W) {
    'use strict'; function ua(a, b, c) { if (!a) throw ngMinErr("areq", b || "?", c || "required"); return a } function va(a, b) { if (!a && !b) return ""; if (!a) return b; if (!b) return a; X(a) && (a = a.join(" ")); X(b) && (b = b.join(" ")); return a + " " + b } function Ea(a) { var b = {}; a && (a.to || a.from) && (b.to = a.to, b.from = a.from); return b } function ba(a, b, c) { var d = ""; a = X(a) ? a : a && U(a) && a.length ? a.split(/\s+/) : []; u(a, function (a, s) { a && 0 < a.length && (d += 0 < s ? " " : "", d += c ? b + a : a + b) }); return d } function Fa(a) {
        if (a instanceof G) switch (a.length) {
            case 0: return [];
            case 1: if (1 === a[0].nodeType) return a; break; default: return G(ka(a))
        } if (1 === a.nodeType) return G(a)
    } function ka(a) { if (!a[0]) return a; for (var b = 0; b < a.length; b++) { var c = a[b]; if (1 == c.nodeType) return c } } function Ga(a, b, c) { u(b, function (b) { a.addClass(b, c) }) } function Ha(a, b, c) { u(b, function (b) { a.removeClass(b, c) }) } function ha(a) { return function (b, c) { c.addClass && (Ga(a, b, c.addClass), c.addClass = null); c.removeClass && (Ha(a, b, c.removeClass), c.removeClass = null) } } function ia(a) {
        a = a || {}; if (!a.$$prepared) {
            var b = a.domOperation ||
            H; a.domOperation = function () { a.$$domOperationFired = !0; b(); b = H }; a.$$prepared = !0
        } return a
    } function ca(a, b) { wa(a, b); xa(a, b) } function wa(a, b) { b.from && (a.css(b.from), b.from = null) } function xa(a, b) { b.to && (a.css(b.to), b.to = null) } function R(a, b, c) { var d = (b.addClass || "") + " " + (c.addClass || ""), e = (b.removeClass || "") + " " + (c.removeClass || ""); a = Ia(a.attr("class"), d, e); ya(b, c); b.addClass = a.addClass ? a.addClass : null; b.removeClass = a.removeClass ? a.removeClass : null; return b } function Ia(a, b, c) {
        function d(a) {
            U(a) && (a = a.split(" "));
            var b = {}; u(a, function (a) { a.length && (b[a] = !0) }); return b
        } var e = {}; a = d(a); b = d(b); u(b, function (a, b) { e[b] = 1 }); c = d(c); u(c, function (a, b) { e[b] = 1 === e[b] ? null : -1 }); var s = { addClass: "", removeClass: "" }; u(e, function (b, c) { var d, e; 1 === b ? (d = "addClass", e = !a[c]) : -1 === b && (d = "removeClass", e = a[c]); e && (s[d].length && (s[d] += " "), s[d] += c) }); return s
    } function z(a) { return a instanceof t.element ? a[0] : a } function za(a, b, c) {
        var d = Object.create(null), e = a.getComputedStyle(b) || {}; u(c, function (a, b) {
            var c = e[a]; if (c) {
                var k = c.charAt(0);
                if ("-" === k || "+" === k || 0 <= k) c = Ja(c); 0 === c && (c = null); d[b] = c
            }
        }); return d
    } function Ja(a) { var b = 0; a = a.split(/\s*,\s*/); u(a, function (a) { "s" == a.charAt(a.length - 1) && (a = a.substring(0, a.length - 1)); a = parseFloat(a) || 0; b = b ? Math.max(a, b) : a }); return b } function la(a) { return 0 === a || null != a } function Aa(a, b) { var c = O, d = a + "s"; b ? c += "Duration" : d += " linear all"; return [c, d] } function ja(a, b) { var c = b ? "-" + b + "s" : ""; da(a, [ea, c]); return [ea, c] } function ma(a, b) { var c = b ? "paused" : "", d = V + "PlayState"; da(a, [d, c]); return [d, c] } function da(a,
    b) { a.style[b[0]] = b[1] } function Ba() { var a = Object.create(null); return { flush: function () { a = Object.create(null) }, count: function (b) { return (b = a[b]) ? b.total : 0 }, get: function (b) { return (b = a[b]) && b.value }, put: function (b, c) { a[b] ? a[b].total++ : a[b] = { total: 1, value: c } } } } var H = t.noop, ya = t.extend, G = t.element, u = t.forEach, X = t.isArray, U = t.isString, na = t.isObject, Ka = t.isUndefined, La = t.isDefined, Ca = t.isFunction, oa = t.isElement, O, pa, V, qa; F.ontransitionend === W && F.onwebkittransitionend !== W ? (O = "WebkitTransition", pa = "webkitTransitionEnd transitionend") :
    (O = "transition", pa = "transitionend"); F.onanimationend === W && F.onwebkitanimationend !== W ? (V = "WebkitAnimation", qa = "webkitAnimationEnd animationend") : (V = "animation", qa = "animationend"); var ra = V + "Delay", sa = V + "Duration", ea = O + "Delay"; F = O + "Duration"; var Ma = { transitionDuration: F, transitionDelay: ea, transitionProperty: O + "Property", animationDuration: sa, animationDelay: ra, animationIterationCount: V + "IterationCount" }, Na = { transitionDuration: F, transitionDelay: ea, animationDuration: sa, animationDelay: ra }; t.module("ngAnimate",
    []).directive("ngAnimateChildren", [function () { return function (a, b, c) { a = c.ngAnimateChildren; t.isString(a) && 0 === a.length ? b.data("$$ngAnimateChildren", !0) : c.$observe("ngAnimateChildren", function (a) { b.data("$$ngAnimateChildren", "on" === a || "true" === a) }) } }]).factory("$$rAFMutex", ["$$rAF", function (a) { return function () { var b = !1; a(function () { b = !0 }); return function (c) { b ? c() : a(c) } } }]).factory("$$rAFScheduler", ["$$rAF", function (a) {
        function b(a) { d.push([].concat(a)); c() } function c() {
            if (d.length) {
                for (var b = [], n =
                0; n < d.length; n++) { var h = d[n]; h.shift()(); h.length && b.push(h) } d = b; e || a(function () { e || c() })
            }
        } var d = [], e; b.waitUntilQuiet = function (b) { e && e(); e = a(function () { e = null; b(); c() }) }; return b
    }]).factory("$$AnimateRunner", ["$q", "$$rAFMutex", function (a, b) {
        function c(a) { this.setHost(a); this._doneCallbacks = []; this._runInAnimationFrame = b(); this._state = 0 } c.chain = function (a, b) { function c() { if (n === a.length) b(!0); else a[n](function (a) { !1 === a ? b(!1) : (n++, c()) }) } var n = 0; c() }; c.all = function (a, b) {
            function c(s) {
                h = h && s; ++n ===
                a.length && b(h)
            } var n = 0, h = !0; u(a, function (a) { a.done(c) })
        }; c.prototype = {
            setHost: function (a) { this.host = a || {} }, done: function (a) { 2 === this._state ? a() : this._doneCallbacks.push(a) }, progress: H, getPromise: function () { if (!this.promise) { var b = this; this.promise = a(function (a, c) { b.done(function (b) { !1 === b ? c() : a() }) }) } return this.promise }, then: function (a, b) { return this.getPromise().then(a, b) }, "catch": function (a) { return this.getPromise()["catch"](a) }, "finally": function (a) { return this.getPromise()["finally"](a) }, pause: function () {
                this.host.pause &&
                this.host.pause()
            }, resume: function () { this.host.resume && this.host.resume() }, end: function () { this.host.end && this.host.end(); this._resolve(!0) }, cancel: function () { this.host.cancel && this.host.cancel(); this._resolve(!1) }, complete: function (a) { var b = this; 0 === b._state && (b._state = 1, b._runInAnimationFrame(function () { b._resolve(a) })) }, _resolve: function (a) { 2 !== this._state && (u(this._doneCallbacks, function (b) { b(a) }), this._doneCallbacks.length = 0, this._state = 2) }
        }; return c
    }]).provider("$$animateQueue", ["$animateProvider",
    function (a) {
        function b(a, b, c, h) { return d[a].some(function (a) { return a(b, c, h) }) } function c(a, b) { a = a || {}; var c = 0 < (a.addClass || "").length, d = 0 < (a.removeClass || "").length; return b ? c && d : c || d } var d = this.rules = { skip: [], cancel: [], join: [] }; d.join.push(function (a, b, d) { return !b.structural && c(b.options) }); d.skip.push(function (a, b, d) { return !b.structural && !c(b.options) }); d.skip.push(function (a, b, c) { return "leave" == c.event && b.structural }); d.skip.push(function (a, b, c) { return c.structural && !b.structural }); d.cancel.push(function (a,
        b, c) { return c.structural && b.structural }); d.cancel.push(function (a, b, c) { return 2 === c.state && b.structural }); d.cancel.push(function (a, b, c) { a = b.options; c = c.options; return a.addClass && a.addClass === c.removeClass || a.removeClass && a.removeClass === c.addClass }); this.$get = ["$$rAF", "$rootScope", "$rootElement", "$document", "$$HashMap", "$$animation", "$$AnimateRunner", "$templateRequest", "$$jqLite", function (d, s, n, h, k, D, A, Z, I) {
            function w(a, b) {
                var c = z(a), f = [], m = l[b]; m && u(m, function (a) { a.node.contains(c) && f.push(a.callback) });
                return f
            } function B(a, b, c, f) { d(function () { u(w(b, a), function (a) { a(b, c, f) }) }) } function r(a, S, p) {
                function d(b, c, f, p) { B(c, a, f, p); b.progress(c, f, p) } function g(b) { Da(a, p); ca(a, p); p.domOperation(); l.complete(!b) } var P, E; if (a = Fa(a)) P = z(a), E = a.parent(); p = ia(p); var l = new A; if (!P) return g(), l; X(p.addClass) && (p.addClass = p.addClass.join(" ")); X(p.removeClass) && (p.removeClass = p.removeClass.join(" ")); p.from && !na(p.from) && (p.from = null); p.to && !na(p.to) && (p.to = null); var e = [P.className, p.addClass, p.removeClass].join(" ");
                if (!v(e)) return g(), l; var M = 0 <= ["enter", "move", "leave"].indexOf(S), h = !x || L.get(P), e = !h && m.get(P) || {}, k = !!e.state; h || k && 1 == e.state || (h = !ta(a, E, S)); if (h) return g(), l; M && K(a); h = { structural: M, element: a, event: S, close: g, options: p, runner: l }; if (k) {
                    if (b("skip", a, h, e)) { if (2 === e.state) return g(), l; R(a, e.options, p); return e.runner } if (b("cancel", a, h, e)) 2 === e.state ? e.runner.end() : e.structural ? e.close() : R(a, h.options, e.options); else if (b("join", a, h, e)) if (2 === e.state) R(a, p, {}); else return S = h.event = e.event, p = R(a,
                    e.options, h.options), l
                } else R(a, p, {}); (k = h.structural) || (k = "animate" === h.event && 0 < Object.keys(h.options.to || {}).length || c(h.options)); if (!k) return g(), C(a), l; M && f(E); var r = (e.counter || 0) + 1; h.counter = r; ga(a, 1, h); s.$$postDigest(function () {
                    var b = m.get(P), v = !b, b = b || {}, e = a.parent() || [], E = 0 < e.length && ("animate" === b.event || b.structural || c(b.options)); if (v || b.counter !== r || !E) { v && (Da(a, p), ca(a, p)); if (v || M && b.event !== S) p.domOperation(), l.end(); E || C(a) } else S = !b.structural && c(b.options, !0) ? "setClass" : b.event,
                    b.structural && f(e), ga(a, 2), b = D(a, S, b.options), b.done(function (b) { g(!b); (b = m.get(P)) && b.counter === r && C(z(a)); d(l, S, "close", {}) }), l.setHost(b), d(l, S, "start", {})
                }); return l
            } function K(a) { a = z(a).querySelectorAll("[data-ng-animate]"); u(a, function (a) { var b = parseInt(a.getAttribute("data-ng-animate")), c = m.get(a); switch (b) { case 2: c.runner.end(); case 1: c && m.remove(a) } }) } function C(a) { a = z(a); a.removeAttribute("data-ng-animate"); m.remove(a) } function E(a, b) { return z(a) === z(b) } function f(a) {
                a = z(a); do {
                    if (!a || 1 !==
                    a.nodeType) break; var b = m.get(a); if (b) { var f = a; !b.structural && c(b.options) && (2 === b.state && b.runner.end(), C(f)) } a = a.parentNode
                } while (1)
            } function ta(a, b, c) { var f = c = !1, d = !1, v; for ((a = a.data("$ngAnimatePin")) && (b = a) ; b && b.length;) { f || (f = E(b, n)); a = b[0]; if (1 !== a.nodeType) break; var e = m.get(a) || {}; d || (d = e.structural || L.get(a)); if (Ka(v) || !0 === v) a = b.data("$$ngAnimateChildren"), La(a) && (v = a); if (d && !1 === v) break; f || (f = E(b, n), f || (a = b.data("$ngAnimatePin")) && (b = a)); c || (c = E(b, g)); b = b.parent() } return (!d || v) && f && c } function ga(a,
            b, c) { c = c || {}; c.state = b; a = z(a); a.setAttribute("data-ng-animate", b); c = (b = m.get(a)) ? ya(b, c) : c; m.put(a, c) } var m = new k, L = new k, x = null, M = s.$watch(function () { return 0 === Z.totalPendingRequests }, function (a) { a && (M(), s.$$postDigest(function () { s.$$postDigest(function () { null === x && (x = !0) }) })) }), g = G(h[0].body), l = {}, P = a.classNameFilter(), v = P ? function (a) { return P.test(a) } : function () { return !0 }, Da = ha(I); return {
                on: function (a, b, c) { b = ka(b); l[a] = l[a] || []; l[a].push({ node: b, callback: c }) }, off: function (a, b, c) {
                    function f(a,
                    b, c) { var d = ka(b); return a.filter(function (a) { return !(a.node === d && (!c || a.callback === c)) }) } var d = l[a]; d && (l[a] = 1 === arguments.length ? null : f(d, b, c))
                }, pin: function (a, b) { ua(oa(a), "element", "not an element"); ua(oa(b), "parentElement", "not an element"); a.data("$ngAnimatePin", b) }, push: function (a, b, c, f) { c = c || {}; c.domOperation = f; return r(a, b, c) }, enabled: function (a, b) { var c = arguments.length; if (0 === c) b = !!x; else if (oa(a)) { var f = z(a), d = L.get(f); 1 === c ? b = !d : (b = !!b) ? d && L.remove(f) : L.put(f, !0) } else b = x = !!a; return b }
            }
        }]
    }]).provider("$$animation",
    ["$animateProvider", function (a) {
        function b(a) { return a.data("$$animationRunner") } var c = this.drivers = []; this.$get = ["$$jqLite", "$rootScope", "$injector", "$$AnimateRunner", "$$rAFScheduler", function (a, e, s, n, h) {
            var k = [], D = ha(a), A = 0, Z = 0, I = []; return function (w, B, r) {
                function K(a) { a = a.hasAttribute("ng-animate-ref") ? [a] : a.querySelectorAll("[ng-animate-ref]"); var b = []; u(a, function (a) { var c = a.getAttribute("ng-animate-ref"); c && c.length && b.push(a) }); return b } function C(a) {
                    var b = [], c = {}; u(a, function (a, f) {
                        var d = z(a.element),
                        m = 0 <= ["enter", "move"].indexOf(a.event), d = a.structural ? K(d) : []; if (d.length) { var g = m ? "to" : "from"; u(d, function (a) { var b = a.getAttribute("ng-animate-ref"); c[b] = c[b] || {}; c[b][g] = { animationID: f, element: G(a) } }) } else b.push(a)
                    }); var f = {}, d = {}; u(c, function (c, m) {
                        var g = c.from, e = c.to; if (g && e) {
                            var l = a[g.animationID], h = a[e.animationID], x = g.animationID.toString(); if (!d[x]) {
                                var B = d[x] = {
                                    structural: !0, beforeStart: function () { l.beforeStart(); h.beforeStart() }, close: function () { l.close(); h.close() }, classes: E(l.classes, h.classes),
                                    from: l, to: h, anchors: []
                                }; B.classes.length ? b.push(B) : (b.push(l), b.push(h))
                            } d[x].anchors.push({ out: g.element, "in": e.element })
                        } else g = g ? g.animationID : e.animationID, e = g.toString(), f[e] || (f[e] = !0, b.push(a[g]))
                    }); return b
                } function E(a, b) { a = a.split(" "); b = b.split(" "); for (var c = [], f = 0; f < a.length; f++) { var d = a[f]; if ("ng-" !== d.substring(0, 3)) for (var g = 0; g < b.length; g++) if (d === b[g]) { c.push(d); break } } return c.join(" ") } function f(a) { for (var b = c.length - 1; 0 <= b; b--) { var f = c[b]; if (s.has(f) && (f = s.get(f)(a))) return f } }
                function ta(a, c) { a.from && a.to ? (b(a.from.element).setHost(c), b(a.to.element).setHost(c)) : b(a.element).setHost(c) } function ga() { var a = b(w); !a || "leave" === B && r.$$domOperationFired || a.end() } function m(b) { w.off("$destroy", ga); w.removeData("$$animationRunner"); D(w, r); ca(w, r); r.domOperation(); g && a.removeClass(w, g); w.removeClass("ng-animate"); x.complete(!b) } r = ia(r); var L = 0 <= ["enter", "move", "leave"].indexOf(B), x = new n({ end: function () { m() }, cancel: function () { m(!0) } }); if (!c.length) return m(), x; w.data("$$animationRunner",
                x); var M = va(w.attr("class"), va(r.addClass, r.removeClass)), g = r.tempClasses; g && (M += " " + g, r.tempClasses = null); var l; L || (l = A, A += 1); k.push({ element: w, classes: M, event: B, classBasedIndex: l, structural: L, options: r, beforeStart: function () { w.addClass("ng-animate"); g && a.addClass(w, g) }, close: m }); w.on("$destroy", ga); if (1 < k.length) return x; e.$$postDigest(function () {
                    Z = A; A = 0; I.length = 0; var a = []; u(k, function (c) { b(c.element) && a.push(c) }); k.length = 0; u(C(a), function (a) {
                        function c() {
                            a.beforeStart(); var d, g = a.close, e = a.anchors ?
                            a.from.element || a.to.element : a.element; b(e) && z(e).parentNode && (e = f(a)) && (d = e.start); d ? (d = d(), d.done(function (a) { g(!a) }), ta(a, d)) : g()
                        } a.structural ? c() : (I.push({ node: z(a.element), fn: c }), a.classBasedIndex === Z - 1 && (I = I.sort(function (a, b) { return b.node.contains(a.node) }).map(function (a) { return a.fn }), h(I)))
                    })
                }); return x
            }
        }]
    }]).provider("$animateCss", ["$animateProvider", function (a) {
        var b = Ba(), c = Ba(); this.$get = ["$window", "$$jqLite", "$$AnimateRunner", "$timeout", "$document", "$sniffer", "$$rAFScheduler", function (a,
        e, s, n, h, k, D) {
            function A(a, b) { var c = a.parentNode; return (c.$$ngAnimateParentKey || (c.$$ngAnimateParentKey = ++r)) + "-" + a.getAttribute("class") + "-" + b } function Z(h, f, B, k) { var m; 0 < b.count(B) && (m = c.get(B), m || (f = ba(f, "-stagger"), e.addClass(h, f), m = za(a, h, k), m.animationDuration = Math.max(m.animationDuration, 0), m.transitionDuration = Math.max(m.transitionDuration, 0), e.removeClass(h, f), c.put(B, m))); return m || {} } function I(a) {
                C.push(a); D.waitUntilQuiet(function () {
                    b.flush(); c.flush(); for (var a = K.offsetWidth + 1, d = 0; d <
                    C.length; d++) C[d](a); C.length = 0
                })
            } function w(c, f, e) { f = b.get(e); f || (f = za(a, c, Ma), "infinite" === f.animationIterationCount && (f.animationIterationCount = 1)); b.put(e, f); c = f; e = c.animationDelay; f = c.transitionDelay; c.maxDelay = e && f ? Math.max(e, f) : e || f; c.maxDuration = Math.max(c.animationDuration * c.animationIterationCount, c.transitionDuration); return c } var B = ha(e), r = 0, K = z(h).body, C = []; return function (a, c) {
                function d() { m() } function h() { m(!0) } function m(b) {
                    if (!(K || C && D)) {
                        K = !0; D = !1; e.removeClass(a, Y); e.removeClass(a,
                        W); ma(g, !1); ja(g, !1); u(l, function (a) { g.style[a[0]] = "" }); B(a, c); ca(a, c); if (c.onDone) c.onDone(); p && p.complete(!b)
                    }
                } function L(a) { q.blockTransition && ja(g, a); q.blockKeyframeAnimation && ma(g, !!a) } function x() { p = new s({ end: d, cancel: h }); m(); return { $$willAnimate: !1, start: function () { return p }, end: d } } function M() {
                    function b() {
                        if (!K) {
                            L(!1); u(l, function (a) { g.style[a[0]] = a[1] }); B(a, c); e.addClass(a, W); if (q.recalculateTimingStyles) {
                                fa = g.className + " " + Y; $ = A(g, fa); y = w(g, fa, $); Q = y.maxDelay; H = Math.max(Q, 0); J = y.maxDuration;
                                if (0 === J) { m(); return } q.hasTransitions = 0 < y.transitionDuration; q.hasAnimations = 0 < y.animationDuration
                            } if (q.applyTransitionDelay || q.applyAnimationDelay) { Q = "boolean" !== typeof c.delay && la(c.delay) ? parseFloat(c.delay) : Q; H = Math.max(Q, 0); var k; q.applyTransitionDelay && (y.transitionDelay = Q, k = [ea, Q + "s"], l.push(k), g.style[k[0]] = k[1]); q.applyAnimationDelay && (y.animationDelay = Q, k = [ra, Q + "s"], l.push(k), g.style[k[0]] = k[1]) } F = 1E3 * H; G = 1E3 * J; if (c.easing) {
                                var r = c.easing; q.hasTransitions && (k = O + "TimingFunction", l.push([k,
                                r]), g.style[k] = r); q.hasAnimations && (k = V + "TimingFunction", l.push([k, r]), g.style[k] = r)
                            } y.transitionDuration && p.push(pa); y.animationDuration && p.push(qa); x = Date.now(); a.on(p.join(" "), h); n(d, F + 1.5 * G); xa(a, c)
                        }
                    } function d() { m() } function h(a) { a.stopPropagation(); var b = a.originalEvent || a; a = b.$manualTimeStamp || b.timeStamp || Date.now(); b = parseFloat(b.elapsedTime.toFixed(3)); Math.max(a - x, 0) >= F && b >= J && (C = !0, m()) } if (!K) if (g.parentNode) {
                        var x, p = [], k = function (a) {
                            if (C) D && a && (D = !1, m()); else if (D = !a, y.animationDuration) if (a =
                            ma(g, D), D) l.push(a); else { var b = l, c = b.indexOf(a); 0 <= a && b.splice(c, 1) }
                        }, r = 0 < U && (y.transitionDuration && 0 === T.transitionDuration || y.animationDuration && 0 === T.animationDuration) && Math.max(T.animationDelay, T.transitionDelay); r ? n(b, Math.floor(r * U * 1E3), !1) : b(); t.resume = function () { k(!0) }; t.pause = function () { k(!1) }
                    } else m()
                } var g = z(a); if (!g || !g.parentNode) return x(); c = ia(c); var l = [], r = a.attr("class"), v = Ea(c), K, D, C, p, t, H, F, J, G; if (0 === c.duration || !k.animations && !k.transitions) return x(); var aa = c.event && X(c.event) ?
                c.event.join(" ") : c.event, R = "", N = ""; aa && c.structural ? R = ba(aa, "ng-", !0) : aa && (R = aa); c.addClass && (N += ba(c.addClass, "-add")); c.removeClass && (N.length && (N += " "), N += ba(c.removeClass, "-remove")); c.applyClassesEarly && N.length && (B(a, c), N = ""); var Y = [R, N].join(" ").trim(), fa = r + " " + Y, W = ba(Y, "-active"), r = v.to && 0 < Object.keys(v.to).length; if (!(0 < (c.keyframeStyle || "").length || r || Y)) return x(); var $, T; 0 < c.stagger ? (v = parseFloat(c.stagger), T = { transitionDelay: v, animationDelay: v, transitionDuration: 0, animationDuration: 0 }) :
                ($ = A(g, fa), T = Z(g, Y, $, Na)); e.addClass(a, Y); c.transitionStyle && (v = [O, c.transitionStyle], da(g, v), l.push(v)); 0 <= c.duration && (v = 0 < g.style[O].length, v = Aa(c.duration, v), da(g, v), l.push(v)); c.keyframeStyle && (v = [V, c.keyframeStyle], da(g, v), l.push(v)); var U = T ? 0 <= c.staggerIndex ? c.staggerIndex : b.count($) : 0; (aa = 0 === U) && ja(g, 9999); var y = w(g, fa, $), Q = y.maxDelay; H = Math.max(Q, 0); J = y.maxDuration; var q = {}; q.hasTransitions = 0 < y.transitionDuration; q.hasAnimations = 0 < y.animationDuration; q.hasTransitionAll = q.hasTransitions &&
                "all" == y.transitionProperty; q.applyTransitionDuration = r && (q.hasTransitions && !q.hasTransitionAll || q.hasAnimations && !q.hasTransitions); q.applyAnimationDuration = c.duration && q.hasAnimations; q.applyTransitionDelay = la(c.delay) && (q.applyTransitionDuration || q.hasTransitions); q.applyAnimationDelay = la(c.delay) && q.hasAnimations; q.recalculateTimingStyles = 0 < N.length; if (q.applyTransitionDuration || q.applyAnimationDuration) J = c.duration ? parseFloat(c.duration) : J, q.applyTransitionDuration && (q.hasTransitions = !0, y.transitionDuration =
                J, v = 0 < g.style[O + "Property"].length, l.push(Aa(J, v))), q.applyAnimationDuration && (q.hasAnimations = !0, y.animationDuration = J, l.push([sa, J + "s"])); if (0 === J && !q.recalculateTimingStyles) return x(); null == c.duration && 0 < y.transitionDuration && (q.recalculateTimingStyles = q.recalculateTimingStyles || aa); F = 1E3 * H; G = 1E3 * J; c.skipBlocking || (q.blockTransition = 0 < y.transitionDuration, q.blockKeyframeAnimation = 0 < y.animationDuration && 0 < T.animationDelay && 0 === T.animationDuration); wa(a, c); q.blockTransition || ja(g, !1); L(J); return {
                    $$willAnimate: !0,
                    end: d, start: function () { if (!K) return t = { end: d, cancel: h, resume: null, pause: null }, p = new s(t), I(M), p }
                }
            }
        }]
    }]).provider("$$animateCssDriver", ["$$animationProvider", function (a) {
        a.drivers.push("$$animateCssDriver"); this.$get = ["$animateCss", "$rootScope", "$$AnimateRunner", "$rootElement", "$document", "$sniffer", function (a, c, d, e, s, n) {
            function h(a) { return a.replace(/\bng-\S+\b/g, "") } function k(a, b) { U(a) && (a = a.split(" ")); U(b) && (b = b.split(" ")); return a.filter(function (a) { return -1 === b.indexOf(a) }).join(" ") } function D(c,
            e, A) {
                function D(a) { var b = {}, c = z(a).getBoundingClientRect(); u(["width", "height", "top", "left"], function (a) { var d = c[a]; switch (a) { case "top": d += I.scrollTop; break; case "left": d += I.scrollLeft } b[a] = Math.floor(d) + "px" }); return b } function s() { var c = h(A.attr("class") || ""), d = k(c, t), c = k(t, c), d = a(n, { to: D(A), addClass: "ng-anchor-in " + d, removeClass: "ng-anchor-out " + c, delay: !0 }); return d.$$willAnimate ? d : null } function f() { n.remove(); e.removeClass("ng-animate-shim"); A.removeClass("ng-animate-shim") } var n = G(z(e).cloneNode(!0)),
                t = h(n.attr("class") || ""); e.addClass("ng-animate-shim"); A.addClass("ng-animate-shim"); n.addClass("ng-anchor"); w.append(n); var m; c = function () { var c = a(n, { addClass: "ng-anchor-out", delay: !0, from: D(e) }); return c.$$willAnimate ? c : null }(); if (!c && (m = s(), !m)) return f(); var L = c || m; return { start: function () { function a() { c && c.end() } var b, c = L.start(); c.done(function () { c = null; if (!m && (m = s())) return c = m.start(), c.done(function () { c = null; f(); b.complete() }), c; f(); b.complete() }); return b = new d({ end: a, cancel: a }) } }
            } function A(a,
            b, c, e) { var h = t(a), f = t(b), k = []; u(e, function (a) { (a = D(c, a.out, a["in"])) && k.push(a) }); if (h || f || 0 !== k.length) return { start: function () { function a() { u(b, function (a) { a.end() }) } var b = []; h && b.push(h.start()); f && b.push(f.start()); u(k, function (a) { b.push(a.start()) }); var c = new d({ end: a, cancel: a }); d.all(b, function (a) { c.complete(a) }); return c } } } function t(c) {
                var d = c.element, e = c.options || {}; c.structural ? (e.structural = e.applyClassesEarly = !0, e.event = c.event, "leave" === e.event && (e.onDone = e.domOperation)) : e.event = null;
                c = a(d, e); return c.$$willAnimate ? c : null
            } if (!n.animations && !n.transitions) return H; var I = z(s).body; c = z(e); var w = G(I.parentNode === c ? I : c); return function (a) { return a.from && a.to ? A(a.from, a.to, a.classes, a.anchors) : t(a) }
        }]
    }]).provider("$$animateJs", ["$animateProvider", function (a) {
        this.$get = ["$injector", "$$AnimateRunner", "$$rAFMutex", "$$jqLite", function (b, c, d, e) {
            function s(c) {
                c = X(c) ? c : c.split(" "); for (var d = [], e = {}, A = 0; A < c.length; A++) {
                    var n = c[A], s = a.$$registeredAnimations[n]; s && !e[n] && (d.push(b.get(s)), e[n] =
                    !0)
                } return d
            } var n = ha(e); return function (a, b, d, e) {
                function t() { e.domOperation(); n(a, e) } function z(a, b, d, e, g) { switch (d) { case "animate": b = [b, e.from, e.to, g]; break; case "setClass": b = [b, r, K, g]; break; case "addClass": b = [b, r, g]; break; case "removeClass": b = [b, K, g]; break; default: b = [b, g] } b.push(e); if (a = a.apply(a, b)) if (Ca(a.start) && (a = a.start()), a instanceof c) a.done(g); else if (Ca(a)) return a; return H } function w(a, b, d, e, g) {
                    var f = []; u(e, function (e) {
                        var h = e[g]; h && f.push(function () {
                            var e, g, f = !1, l = function (a) {
                                f ||
                                (f = !0, (g || H)(a), e.complete(!a))
                            }; e = new c({ end: function () { l() }, cancel: function () { l(!0) } }); g = z(h, a, b, d, function (a) { l(!1 === a) }); return e
                        })
                    }); return f
                } function B(a, b, d, e, g) {
                    var f = w(a, b, d, e, g); if (0 === f.length) { var h, k; "beforeSetClass" === g ? (h = w(a, "removeClass", d, e, "beforeRemoveClass"), k = w(a, "addClass", d, e, "beforeAddClass")) : "setClass" === g && (h = w(a, "removeClass", d, e, "removeClass"), k = w(a, "addClass", d, e, "addClass")); h && (f = f.concat(h)); k && (f = f.concat(k)) } if (0 !== f.length) return function (a) {
                        var b = []; f.length &&
                        u(f, function (a) { b.push(a()) }); b.length ? c.all(b, a) : a(); return function (a) { u(b, function (b) { a ? b.cancel() : b.end() }) }
                    }
                } 3 === arguments.length && na(d) && (e = d, d = null); e = ia(e); d || (d = a.attr("class") || "", e.addClass && (d += " " + e.addClass), e.removeClass && (d += " " + e.removeClass)); var r = e.addClass, K = e.removeClass, C = s(d), E, f; if (C.length) { var F, G; "leave" == b ? (G = "leave", F = "afterLeave") : (G = "before" + b.charAt(0).toUpperCase() + b.substr(1), F = b); "enter" !== b && "move" !== b && (E = B(a, b, e, C, G)); f = B(a, b, e, C, F) } if (E || f) return {
                    start: function () {
                        function b(c) {
                            n =
                            !0; t(); ca(a, e); g.complete(c)
                        } var d, k = []; E && k.push(function (a) { d = E(a) }); k.length ? k.push(function (a) { t(); a(!0) }) : t(); f && k.push(function (a) { d = f(a) }); var n = !1, g = new c({ end: function () { n || ((d || H)(void 0), b(void 0)) }, cancel: function () { n || ((d || H)(!0), b(!0)) } }); c.chain(k, b); return g
                    }
                }
            }
        }]
    }]).provider("$$animateJsDriver", ["$$animationProvider", function (a) {
        a.drivers.push("$$animateJsDriver"); this.$get = ["$$animateJs", "$$AnimateRunner", function (a, c) {
            function d(c) { return a(c.element, c.event, c.classes, c.options) }
            return function (a) { if (a.from && a.to) { var b = d(a.from), n = d(a.to); if (b || n) return { start: function () { function a() { return function () { u(d, function (a) { a.end() }) } } var d = []; b && d.push(b.start()); n && d.push(n.start()); c.all(d, function (a) { e.complete(a) }); var e = new c({ end: a(), cancel: a() }); return e } } } else return d(a) }
        }]
    }])
})(window, window.angular);
//# sourceMappingURL=angular-animate.min.js.map
