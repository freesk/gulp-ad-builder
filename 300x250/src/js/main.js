function init() {

  var tl = new TimelineMax({
    paused: true
  });
  var banner = document.getElementById('banner');
  var replay = document.getElementById('replay');
  var screen = document.getElementById('screen');

  function start() {
    screen.style.display = "none";
    tl.play();
  }

  var canvas2 = document.getElementById('canvas-for-net');
  var ctx2 = canvas2.getContext('2d');

  var canvas = document.getElementById('canvas-for-lines');
  var ctx = canvas.getContext('2d');
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  // draw the net
  var stepRight = 28 * 2;
  var stepDown = 42 * 2;

  ctx2.fillStyle = "rgba(255, 255, 255, 0.6)";

  var i;
  var canvasWidth2 = canvas.width * 2;
  var canvasHeight2 = canvas.height * 2;

  for (i = 0; i < canvasWidth2 / stepRight; i++) {
    ctx2.fillRect(i * stepRight, 0, 1, canvasHeight2);
  }

  for (i = 0; i < canvasHeight2 / stepDown; i++) {
    ctx2.fillRect(0, i * stepDown, canvasWidth2, 1);
  }

  var linesGlob = [];

  function callLinesAnimation() {
    linesGlob = createSequenceOfLines(15);
    linesGlob.forEach(function(line) {
      var xPaddingLeft = 0;
      var xPaddingRight = 0;
      var yPaddingTop = 40;
      var yPaddingBottom = 20;
      line.y = randomIntFromInterval(yPaddingTop, canvasHeight - yPaddingBottom);

      var arr = [-1, 1];

      var direction = arr[randomIntFromInterval(0, 1)];

      var x1;
      var x2;

      if (direction < 1) {
        x2 = randomIntFromInterval(xPaddingLeft, canvasWidth / 2);
        x1 = randomIntFromInterval(canvasWidth / 2, canvasWidth - xPaddingRight);
      } else {
        x1 = randomIntFromInterval(xPaddingLeft, canvasWidth / 2);
        x2 = randomIntFromInterval(canvasWidth / 2, canvasWidth - xPaddingRight);
      }

      animateObject(line, x1, x2);
    });
  }

  function canvasLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // save current state
    ctx.save();

    linesGlob.forEach(function(line) {
      ctx.fillStyle = "rgba(255, 255, 255, " + line.opacity + ")";
      ctx.fillRect(line.x, line.y, line.width, line.height);
    });

    // restore the transform
    ctx.restore();
  }

  TweenLite.ticker.addEventListener("tick", canvasLoop);

  function animateObject(obj, from, to) {
    obj.x = from;
    obj.opacity = 0;

    var diff = Math.abs(Math.abs(to) - Math.abs(from));

    var delay = 0;

    var duration = 1.5;

    var opacityIn = duration / 4;
    var opacityOut = opacityIn;
    var toOpacity = randomFloatFromInterval(0.4, 0.9);
    TweenMax.to(obj, duration, {
      delay: delay,
      x: to,
      ease: Power2.easeOut
    })

    TweenMax.to(obj, opacityIn, {
      delay: delay,
      opacity: toOpacity,
      onComplete: function() {
        TweenMax.to(obj, opacityIn, {
          delay: duration - opacityIn - opacityOut,
          opacity: 0
        });
      }
    });
  }

  function getRandomRect() {
    var n = randomFloatFromInterval(2.5, 4);
    var width = randomIntFromInterval(10, 25) * n;
    var height = 1.5 * n;
    return ({
      width: width,
      height: height
    });
  }

  function createSequenceOfLines(numberOfLines) {
    var array = [];

    for (var i = 0; i < numberOfLines; i++)
      array.push(getRandomRect());

    return array;
  }

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randomFloatFromInterval(min, max) {
    return (Math.random() * (max - min) + min).toFixed(4);
  }

  var userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.indexOf('safari') != -1) {
    if (userAgent.indexOf('chrome') > -1) {
      // browser is chrome
    } else if ((userAgent.indexOf('opera') > -1) || (userAgent.indexOf('opr') > -1)) {
      // browser is opera
    } else {
      banner.classList.add("safari");
    }
  }

  function callShimmer() {
    var tl = new TimelineMax({
      paused: false
    });
    tl.to('#canvas-for-net', 0.1, {
      opacity: 1
    }, "+=0");
    tl.to('#canvas-for-net', 0.05, {
      opacity: 0
    }, "+=0.1");
    return tl;
  }

  tl.call(function() {
      // for anything that lives outside the timeline

    }, [], this)

    .addLabel('scene-1', '+=0.1')

    .to('.photo-1', 6, {
      y: -0,
      x: -160,
      ease: Linear.easeNone
    }, 'scene-1')
    .fromTo('#banner', 0.8, {
      autoAlpha: 0
    }, {
      autoAlpha: 1
    }, 'scene-1')

    .fromTo('.sprite-text-make', 0.8, {
        x: -300,
        ease: Power3.easeOut
      }, {
        x: 0,
        ease: Power3.easeOut
      },
      'scene-1+=0.3')

    .fromTo('.sprite-text-make-outline', 0.8, {
        x: 300,
        ease: Power3.easeOut
      }, {
        x: 0,
        ease: Power3.easeOut
      },
      'scene-1+=0.3')

    .to('.sprite-text-make', 0.8, {
        x: 300,
        ease: Power3.easeIn
      },
      'scene-1+=1.8')

    .to('.sprite-text-make-outline', 0.8, {
        x: -300,
        ease: Power3.easeIn
      },
      'scene-1+=1.8')

    .call(callLinesAnimation, [], null, 'scene-1+=0.4')
    .add(callShimmer(), 'scene-1+=0.6')
    .add(callShimmer(), 'scene-1+=0.9')

    .from('.text-make-underline', 0.5, {
      y: 100
    }, 'scene-1+=0.3')

    .addLabel('scene-2', '-=3.5')

    .call(callLinesAnimation, [], null, 'scene-2+=0.2')
    .add(callShimmer(), 'scene-2+=0.4')
    .add(callShimmer(), 'scene-2+=0.7')

    .fromTo('.sprite-text-life', 0.8, {
        y: -250,
        ease: Power3.easeOut
      }, {
        y: 0,
        ease: Power3.easeOut
      },
      'scene-2+=0.2')

    .fromTo('.sprite-text-life-outline', 0.8, {
        y: 250,
        ease: Power3.easeOut
      }, {
        y: 0,
        ease: Power3.easeOut
      },
      'scene-2+=0.2')

    .to('.text-make-underline', 0.8, {
      y: -60,
      ease: Power3.easeInOut
    }, 'scene-2+=0.2')

    .set('.text-make-underline', {
      opacity: 0
    }, 'scene-2+=1')
    .set('.sprite-text-life', {
      className: '+=underlined'
    }, 'scene-2+=1')

    .addLabel('scene-2-5', '-=1.8')

    .fromTo('.photo-2', 0.8, {
      y: 270,
      scale: 1.1,
      ease: Power3.easeInOut
    }, {
      y: 10,
      scale: 1.1,
      ease: Power3.easeInOut,
      onComplete: function() {
        TweenMax.to('.photo-2', 5, {
          y: -10,
          ease: Linear.easeNone
        })
      }
    }, 'scene-2-5')

    .set('.photo-2', {
      className: '+=animate'
    }, 'scene-2-5')

    .to('.sprite-text-life', 0.8, {
        y: 96,
        ease: Power3.easeInOut
      },
      'scene-2-5')

    .to('.sprite-text-life-outline', 0.8, {
        y: -250,
        ease: Power3.easeIn
      },
      'scene-2-5')

    .addLabel('scene-3', '-=1.4')

    .fromTo('.sprite-text-happen', 0.8, {
        y: -250,
        ease: Power3.easeOut
      }, {
        y: 0,
        ease: Power3.easeOut
      },
      'scene-3')

    .fromTo('.sprite-text-happen-outline', 0.8, {
        y: 250,
        ease: Power3.easeOut
      }, {
        y: 0,
        ease: Power3.easeOut
      },
      'scene-3')

    .to('.sprite-text-happen', 0.8, {
        y: 250,
        ease: Power3.easeIn
      },
      'scene-3+=1.5')

    .to('.sprite-text-happen-outline', 0.8, {
        y: -250,
        ease: Power3.easeIn
      },
      'scene-3+=1.5')

    .fromTo('.text-happen-underline', 1.5, {
        x: -400
      }, {
        x: 400
      },
      'scene-3')

    .call(callLinesAnimation, [], null, 'scene-3+=0.2')
    .add(callShimmer(), 'scene-3+=0.4')
    .add(callShimmer(), 'scene-3+=0.7')

    .addLabel('scene-4', '-=0.2')

    .from('.photo-3', 0.6, {
      y: 254
    }, 'scene-4')

    .addLabel('scene-5', '-=0.2')

    .from('.sprite-image-car', 0.6, {
      y: -20,
      x: -200,
      scale: 0.8,
      ease: Power3.easeOut
    }, 'scene-5')
    .from('#cta', 0.4, {
      y: 30,
      ease: Power1.easeOut
    }, 'scene-5+=0.4')
    .from('.sprite-text-offer', 0.4, {
      x: 100,
      ease: Power1.easeOut
    }, 'scene-5')
    .from('.sprite-text-end-date', 0.4, {
      autoAlpha: 0
    }, 'scene-5+=0.2')
    .from('.sprite-image-badge', 0.4, {
      autoAlpha: 0
    }, 'scene-5+=0.2')

    .from('#se-logo', 0.3, {
      autoAlpha: 0,
      y: 40
    }, 'scene-5')

    .from('.text-cover', 0.7, {
      height: 0,
      ease: Power1.easeOut
    }, 'scene-5+=0.3')
    .from('.sprite-image-se-logo-toyota-logo', 0.6, {
      y: 20,
      autoAlpha: 0
    }, 'scene-5+=0.3')
    .from('.sprite-image-se-logo-sales-event', 0.6, {
      y: -20,
      autoAlpha: 0
    }, 'scene-5+=0.3')

    // trigger CTA in-out animation
    .call(onMouseOver, [], this, "+=0.5")
    .call(onMouseOut, [], this, "+=0.6")

    // show the replay icon
    .from(replay, 0.5, {
      autoAlpha: 0
    }, "+=0.5")

  function onMouseOver() {

    TweenMax.to('.sprite-text-click-here', 0.3, {
      scale: 0.92
    })
    TweenMax.to('.sprite-text-click-here', 0.3, {
      scale: 1.00,
      overwrite: false,
      delay: 0.3
    })

    TweenMax.to('.sprite-text-for-details', 0.3, {
      autoAlpha: 0,
      scale: 0.85,
      delay: 0.1
    });
    TweenMax.staggerTo('.sprite-image-arrow', 0.25, {
      autoAlpha: 1
    }, 0.05);
    TweenMax.staggerTo('.sprite-image-arrow', 0.25, {
        autoAlpha: 0,
        delay: 0.25,
        overwrite: false
      },
      0.05);
    TweenMax.to('.sprite-text-for-details', 0.3, {
      scale: 1.0,
      autoAlpha: 1,
      overflow: false,
      delay: 0.95
    })
    banner.classList.add('active');
  }

  function onMouseOut() {
    banner.classList.remove('active');
  }

  if (!isMobilePlatform()) {
    banner.addEventListener("mouseout", function() {
      onMouseOut();
    });
    banner.addEventListener("mouseover", function() {
      onMouseOver();
    });
    replay.addEventListener("mouseout", function() {
      replay.classList.remove("active");
    });
    replay.addEventListener("mouseover", function() {
      replay.classList.add("active");
    });
  }

  banner.addEventListener("click", function() {
    EB.clickthrough();
  });

  replay.addEventListener("click", function() {
    location.reload();
  });

  start();

}
