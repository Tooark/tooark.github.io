/* ============================================
   Tooark — Shape Shifter FX  (v5 — mobile fixes + scroll fade)
   Baseado em: https://github.com/kennethcachia/Shape-Shifter (MIT)
   
   v5 — Mudancas:
     - Resize/rotacao robusto: debounce 150ms, escuta orientationchange + visualViewport
     - adjust() agora reaplica a ultima shape (memoria) apos redimensionar
     - Fade-on-scroll: opacidade do canvas reduz conforme usuario rola
     - Suporte a 100dvh (dynamic viewport height) — fix iOS address bar
   
   Mantido da v4:
     - Canvas fullscreen fixo
     - Gradient primary -> accent
     - Sequencia i18n-aware
     - Mouse repulsion (window-wide)
     - Comando #infinity (DevOps)
     - Page Visibility pausa
     - prefers-reduced-motion
============================================ */
(function () {
  'use strict';

  var ShapeFX = {};

  // --- Config -----------------------------------------------------
  var CONFIG = {
    canvasSelector: '#bgCanvas',
    colorStart: { r: 245, g: 158, b: 11 },
    colorEnd: { r: 16, g: 185, b: 129 },
    gap: 14,
    gapMobile: 4,
    dotScale: 0.4, // raio da bolinha = gap * dotScale (desktop: 14 * 0.36 ≈ 5)
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    stepDelay: 2500,
    repelRadius: 70,
    repelForce: 0.25,
    fallbackSequence: 'Tooark|DevOps|Code|#infinity 45',
    // v5: Fade on scroll
    fadeScrollStart: 0, // px — onde comeca a reduzir
    fadeScrollEnd: 800, // px — onde estabiliza no minimo
    fadeMinFactor: 0.3, // multiplicador minimo (nao some totalmente)
    // v5: Debounce de resize
    resizeDebounce: 150,
  };

  var mouse = { x: -9999, y: -9999, active: false };
  // v5: memoria da ultima shape — re-aplicada em resize/rotacao
  var lastShape = null;
  // v5: opacidade base lida do CSS (preserva o valor configurado)
  var baseOpacity = null;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function mixColor(t) {
    return {
      r: Math.round(lerp(CONFIG.colorStart.r, CONFIG.colorEnd.r, t)),
      g: Math.round(lerp(CONFIG.colorStart.g, CONFIG.colorEnd.g, t)),
      b: Math.round(lerp(CONFIG.colorStart.b, CONFIG.colorEnd.b, t)),
    };
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // Raio base da bolinha, proporcional ao gap atual (menor no mobile)
  function dotRadius() {
    return ShapeFX.ShapeBuilder.getGap() * CONFIG.dotScale;
  }

  // --- Drawing ----------------------------------------------------
  ShapeFX.Drawing = (function () {
    var canvas,
      context,
      renderFn,
      running = true;
    var raf =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function (cb) {
        return window.setTimeout(cb, 1000 / 60);
      };

    return {
      init: function (sel) {
        canvas = document.querySelector(sel);
        if (!canvas) return false;
        context = canvas.getContext('2d');
        // v5: captura opacidade base do CSS uma unica vez
        var computed = window.getComputedStyle(canvas);
        baseOpacity = parseFloat(computed.opacity) || 0.25;
        this.adjust();
        return true;
      },
      getCanvas: function () {
        return canvas;
      },
      adjust: function () {
        if (!canvas || !context) return;
        // v5: usa innerWidth/Height (que respeita 100dvh quando suportado)
        var w = window.innerWidth;
        var h = window.innerHeight;
        var dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      },
      loop: function (fn) {
        renderFn = renderFn || fn;
        if (running && canvas && context) {
          context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
          renderFn();
        }
        raf.call(window, this.loop.bind(this));
      },
      pause: function () {
        running = false;
      },
      resume: function () {
        running = true;
      },
      getArea: function () {
        if (!canvas) {
          return { w: window.innerWidth, h: window.innerHeight };
        }
        return { w: canvas.clientWidth, h: canvas.clientHeight };
      },
      drawCircle: function (p, c) {
        if (!context) return;
        context.fillStyle = c.render();
        context.beginPath();
        context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
        context.fill();
      },
    };
  })();

  // --- Helpers ----------------------------------------------------
  ShapeFX.Point = function (a) {
    this.x = a.x;
    this.y = a.y;
    this.z = a.z;
    this.a = a.a;
    this.h = a.h;
  };
  ShapeFX.Color = function (r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  };
  ShapeFX.Color.prototype.render = function () {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
  };

  // --- Dot --------------------------------------------------------
  ShapeFX.Dot = function (x, y) {
    this.p = new ShapeFX.Point({ x: x, y: y, z: dotRadius(), a: 1, h: 0 });
    this.e = 0.07;
    this.s = true;
    this.c = new ShapeFX.Color(
      CONFIG.colorStart.r,
      CONFIG.colorStart.g,
      CONFIG.colorStart.b,
      this.p.a,
    );
    this.t = this.clone();
    this.q = [];
    this.jitter = (Math.random() - 0.5) * 0.08;
  };
  ShapeFX.Dot.prototype = {
    clone: function () {
      return new ShapeFX.Point({
        x: this.x,
        y: this.y,
        z: this.z,
        a: this.a,
        h: this.h,
      });
    },
    _updateColor: function () {
      var area = ShapeFX.Drawing.getArea();
      var t = Math.max(0, Math.min(1, this.p.x / area.w + this.jitter));
      var c = mixColor(t);
      this.c.r = c.r;
      this.c.g = c.g;
      this.c.b = c.b;
    },
    _draw: function () {
      this._updateColor();
      this.c.a = this.p.a;
      ShapeFX.Drawing.drawCircle(this.p, this.c);
    },
    _moveTowards: function (n) {
      var dx = this.p.x - n.x,
        dy = this.p.y - n.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      var e = this.e * d;
      if (this.p.h === -1) {
        this.p.x = n.x;
        this.p.y = n.y;
        return true;
      }
      if (d > 1) {
        this.p.x -= (dx / d) * e;
        this.p.y -= (dy / d) * e;
      } else {
        if (this.p.h > 0) {
          this.p.h--;
        } else {
          return true;
        }
      }
      return false;
    },
    _applyMouseRepulsion: function () {
      if (!mouse.active) return;
      var dx = this.p.x - mouse.x;
      var dy = this.p.y - mouse.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONFIG.repelRadius && d > 0.001) {
        var force = (1 - d / CONFIG.repelRadius) * CONFIG.repelForce;
        this.p.x += (dx / d) * force * CONFIG.repelRadius;
        this.p.y += (dy / d) * force * CONFIG.repelRadius;
      }
    },
    _update: function () {
      if (this._moveTowards(this.t)) {
        var p = this.q.shift();
        if (p) {
          this.t.x = p.x || this.p.x;
          this.t.y = p.y || this.p.y;
          this.t.z = p.z || this.p.z;
          this.t.a = p.a || this.p.a;
          this.p.h = p.h || 0;
        } else if (this.s) {
          this.p.x -= Math.sin(Math.random() * 3.142);
          this.p.y -= Math.sin(Math.random() * 3.142);
        } else {
          this.move(
            new ShapeFX.Point({
              x: this.p.x + Math.random() * 50 - 25,
              y: this.p.y + Math.random() * 50 - 25,
            }),
          );
        }
      }
      this._applyMouseRepulsion();
      this.p.a = Math.max(0.1, this.p.a - (this.p.a - this.t.a) * 0.05);
      this.p.z = Math.max(1, this.p.z - (this.p.z - this.t.z) * 0.05);
    },
    distanceTo: function (n) {
      var dx = this.p.x - n.x,
        dy = this.p.y - n.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    move: function (p, avoidStatic) {
      if (!avoidStatic || this.distanceTo(p) > 1) this.q.push(p);
    },
    render: function () {
      this._update();
      this._draw();
    },
  };

  // --- ShapeBuilder ----------------------------------------------
  ShapeFX.ShapeBuilder = (function () {
    var gap = CONFIG.gap;
    var shapeCanvas = document.createElement('canvas');
    var ctx = shapeCanvas.getContext('2d');
    var fontSize = 400;

    function fit() {
      gap = window.innerWidth < 768 ? CONFIG.gapMobile : CONFIG.gap;
      var area = ShapeFX.Drawing.getArea();
      shapeCanvas.width = Math.max(gap, Math.floor(area.w / gap) * gap);
      shapeCanvas.height = Math.max(gap, Math.floor(area.h / gap) * gap);
      ctx.fillStyle = 'red';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
    }

    function processCanvas() {
      var pixels = ctx.getImageData(
        0,
        0,
        shapeCanvas.width,
        shapeCanvas.height,
      ).data;
      var dots = [],
        x = 0,
        y = 0;
      var fx = shapeCanvas.width,
        fy = shapeCanvas.height,
        w = 0,
        h = 0;
      for (var p = 0; p < pixels.length; p += 4 * gap) {
        if (pixels[p + 3] > 0) {
          dots.push(new ShapeFX.Point({ x: x, y: y }));
          w = x > w ? x : w;
          h = y > h ? y : h;
          fx = x < fx ? x : fx;
          fy = y < fy ? y : fy;
        }
        x += gap;
        if (x >= shapeCanvas.width) {
          x = 0;
          y += gap;
          p += gap * 4 * shapeCanvas.width;
        }
      }
      return { dots: dots, w: w + fx, h: h + fy };
    }

    function setFontSize(s) {
      ctx.font = 'bold ' + s + 'px ' + CONFIG.fontFamily;
    }
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return {
      refit: fit,
      // v5: expoe gap atual para debug/coordenacao
      getGap: function () {
        return gap;
      },
      letter: function (l) {
        var s = 0;
        setFontSize(fontSize);
        s = Math.min(
          fontSize,
          (shapeCanvas.width / ctx.measureText(l).width) * 0.8 * fontSize,
          (shapeCanvas.height / fontSize) * (isNumber(l) ? 1 : 0.45) * fontSize,
        );
        setFontSize(s);
        ctx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        ctx.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2);
        return processCanvas();
      },
      circle: function (d) {
        var r = Math.max(0, d) / 2;
        ctx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        ctx.beginPath();
        ctx.arc(r * gap, r * gap, r * gap, 0, 2 * Math.PI, false);
        ctx.fill();
        return processCanvas();
      },
      rectangle: function (w, h) {
        var dots = [],
          width = gap * w,
          height = gap * h;
        for (var y = 0; y < height; y += gap)
          for (var x = 0; x < width; x += gap)
            dots.push(new ShapeFX.Point({ x: x, y: y }));
        return { dots: dots, w: width, h: height };
      },
      infinity: function (size) {
        size = Math.max(20, Math.min(size || 40, 60));
        var w = size * gap;
        var h = (size / 2.2) * gap;
        var thickness = Math.max(gap * 2.2, size * gap * 0.12);

        if (
          shapeCanvas.width < w + gap * 2 ||
          shapeCanvas.height < h + gap * 2
        ) {
          fit();
        }

        ctx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'red';

        ctx.beginPath();
        var cx = w / 2;
        var cy = h / 2;
        var a = w / 2 - thickness / 2;
        var steps = 240;
        for (var i = 0; i <= steps; i++) {
          var t = (i / steps) * 2 * Math.PI;
          var x = cx + a * Math.cos(t);
          var y = cy + ((h / 2) * Math.sin(2 * t)) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        return processCanvas();
      },
    };
  })();

  // --- Shape ------------------------------------------------------
  ShapeFX.Shape = (function () {
    var dots = [],
      width = 0,
      height = 0,
      cx = 0,
      cy = 0;
    function compensate() {
      var a = ShapeFX.Drawing.getArea();
      cx = a.w / 2 - width / 2;
      cy = a.h / 2 - height / 2;
    }
    return {
      switchShape: function (n, fast) {
        var a = ShapeFX.Drawing.getArea();
        width = n.w;
        height = n.h;
        compensate();
        if (n.dots.length > dots.length) {
          var size = n.dots.length - dots.length;
          for (var d = 1; d <= size; d++)
            dots.push(new ShapeFX.Dot(a.w / 2, a.h / 2));
        }
        var d = 0,
          i = 0;
        // Raio base proporcional ao gap — bolinhas menores no mobile
        var r = dotRadius();
        // v5: precisamos clonar n.dots porque o original e mutado (slice) abaixo
        // e queremos preservar a forma para re-aplicar em resize
        while (n.dots.length > 0) {
          i = Math.floor(Math.random() * n.dots.length);
          dots[d].e = fast ? 0.25 : dots[d].s ? 0.14 : 0.11;
          if (dots[d].s) {
            dots[d].move(
              new ShapeFX.Point({
                z: Math.random() * r * 4 + r * 2,
                a: Math.random(),
                h: 18,
              }),
            );
          } else {
            dots[d].move(
              new ShapeFX.Point({
                z: Math.random() * r + r,
                h: fast ? 18 : 30,
              }),
            );
          }
          dots[d].s = true;
          dots[d].move(
            new ShapeFX.Point({
              x: n.dots[i].x + cx,
              y: n.dots[i].y + cy,
              a: 1,
              z: r,
              h: 0,
            }),
          );
          n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1));
          d++;
        }
        for (var k = d; k < dots.length; k++) {
          if (dots[k].s) {
            dots[k].move(
              new ShapeFX.Point({
                z: Math.random() * r * 4 + r * 2,
                a: Math.random(),
                h: 20,
              }),
            );
            dots[k].s = false;
            dots[k].e = 0.04;
            dots[k].move(
              new ShapeFX.Point({
                x: Math.random() * a.w,
                y: Math.random() * a.h,
                a: 0.3,
                z: Math.random() * r * 0.8,
                h: 0,
              }),
            );
          }
        }
      },
      render: function () {
        for (var d = 0; d < dots.length; d++) dots[d].render();
      },
    };
  })();

  // --- Mini parser de comandos -----------------------------------
  function getAction(v) {
    v = v && v.split(' ')[0];
    return v && v[0] === '#' && v.substring(1);
  }
  function getValue(v) {
    return v && v.split(' ')[1];
  }

  var sequenceTimer = null;

  // v5: builder factory — retorna funcao que reconstroi a shape do zero
  // Necessario porque switchShape mutates n.dots
  function buildShape(command) {
    var action = getAction(command);
    var value = getValue(command);
    switch (action) {
      case 'rectangle':
        var p = value && value.split('x');
        p = p && p.length === 2 ? p : [40, 20];
        return ShapeFX.ShapeBuilder.rectangle(
          Math.min(60, parseInt(p[0])),
          Math.min(40, parseInt(p[1])),
        );
      case 'circle':
        var dia = Math.min(parseInt(value) || 30, 50);
        return ShapeFX.ShapeBuilder.circle(dia);
      case 'infinity':
        var sz = Math.min(parseInt(value) || 40, 60);
        return ShapeFX.ShapeBuilder.infinity(sz);
      default:
        return ShapeFX.ShapeBuilder.letter(command);
    }
  }

  function runSequence(seq) {
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      sequenceTimer = null;
    }
    var items = seq.split('|'),
      idx = 0;
    function next() {
      var current = items[idx % items.length];
      // v5: salva o comando atual (string) para re-aplicar em resize
      lastShape = current;
      ShapeFX.Shape.switchShape(buildShape(current));
      idx++;
      sequenceTimer = setTimeout(next, CONFIG.stepDelay);
    }
    next();
  }

  // --- i18n integration ------------------------------------------
  function getCurrentSequence() {
    try {
      var i18n = window.TooarkI18n;
      var locale =
        (document.documentElement.lang || 'pt').toLowerCase().indexOf('en') ===
        0
          ? 'en'
          : 'pt';
      if (
        i18n &&
        i18n.messages &&
        i18n.messages[locale] &&
        i18n.messages[locale].hero &&
        i18n.messages[locale].hero.shapeSequence
      ) {
        return i18n.messages[locale].hero.shapeSequence;
      }
    } catch (e) {
      /* noop */
    }
    return CONFIG.fallbackSequence;
  }

  function watchLocaleChanges() {
    if (!('MutationObserver' in window)) return;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].type === 'attributes' && muts[i].attributeName === 'lang') {
          runSequence(getCurrentSequence());
          break;
        }
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
  }

  // --- Mouse handlers (window-wide) ------------------------------
  function bindMouse() {
    function onMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onTouch(e) {
      if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('mouseleave', onLeave, { passive: true });
    window.addEventListener('touchend', onLeave, { passive: true });
  }

  // --- Page Visibility -------------------------------------------
  function bindVisibility() {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        ShapeFX.Drawing.pause();
      } else {
        ShapeFX.Drawing.resume();
      }
    });
  }

  // --- v5: Resize/rotacao robusto --------------------------------
  function bindResize() {
    var debounceTimer = null;

    function doAdjust() {
      ShapeFX.Drawing.adjust();
      ShapeFX.ShapeBuilder.refit();
      // Re-aplica a ultima shape para reposicionar os dots
      if (lastShape) {
        ShapeFX.Shape.switchShape(buildShape(lastShape), true);
      }
    }

    function scheduleAdjust() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doAdjust, CONFIG.resizeDebounce);
    }

    window.addEventListener('resize', scheduleAdjust);
    window.addEventListener('orientationchange', scheduleAdjust);

    // iOS: visualViewport reage a address bar show/hide e zoom
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleAdjust);
    }
  }

  // --- v5: Fade on scroll ----------------------------------------
  function bindScrollFade() {
    var canvas = ShapeFX.Drawing.getCanvas();
    if (!canvas) return;

    var ticking = false;

    function updateOpacity() {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var range = CONFIG.fadeScrollEnd - CONFIG.fadeScrollStart;
      var progress = clamp((scrollY - CONFIG.fadeScrollStart) / range, 0, 1);
      // factor: 1.0 (topo) -> fadeMinFactor (ao final do range)
      var factor = 1 - progress * (1 - CONFIG.fadeMinFactor);
      var finalOpacity = (baseOpacity != null ? baseOpacity : 0.25) * factor;
      canvas.style.opacity = finalOpacity.toFixed(3);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateOpacity);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Aplica imediatamente (caso a pagina ja esteja com scroll)
    updateOpacity();
  }

  // --- Init -------------------------------------------------------
  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!ShapeFX.Drawing.init(CONFIG.canvasSelector)) return;

    ShapeFX.ShapeBuilder.refit();

    bindMouse();
    bindVisibility();
    bindResize();
    bindScrollFade();
    watchLocaleChanges();

    ShapeFX.Drawing.loop(function () {
      ShapeFX.Shape.render();
    });
    runSequence(getCurrentSequence());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
