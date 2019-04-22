(function() {

  // Easing function used for `translateX` animation
  // From: https://gist.github.com/gre/1650294
  function easeOutQuad (t) {
    return t * (2 - t)
  }

  // Returns a random number (integer) between `min` and `max`
  function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Returns a random number as well, but it could be negative also
  function randomPositiveOrNegative (min, max) {
    return random(min, max) * (Math.random() > 0.5 ? 1 : -1)
  }

  // Set CSS `tranform` property for an element
  function setTransform (el, transform) {
    el.style.transform = transform
    el.style.WebkitTransform = transform
  }

  // Current scroll position
  var current = 0
  // Target scroll position
  var target = 0
  // Ease or speed for moving from `current` to `target`
  var ease = 0.075
  // Utility variables for `requestAnimationFrame`
  var rafId = undefined
  var rafActive = false
  // Container element
  var container = document.querySelector('.container')
  // Array with `.image` elements
  var images = Array.prototype.slice.call(document.querySelectorAll('.image'))
  // Variables for storing dimmensions
  var windowWidth, containerHeight, imageHeight

  // Variables for specifying transform parameters and limits
  var rotateXMaxList = []
  var rotateYMaxList = []
  var translateXMax = -200

  // Popullating the `rotateXMaxList` and `rotateYMaxList` with random values
  images.forEach(function () {
    rotateXMaxList.push(randomPositiveOrNegative(20, 40))
    rotateYMaxList.push(randomPositiveOrNegative(20, 60))
  })

  // The `fakeScroll` is an element to make the page scrollable
  // Here we are creating it and appending it to the `body`
  var fakeScroll = document.createElement('div')
  fakeScroll.className = 'fake-scroll'
  document.body.appendChild(fakeScroll)
  // In the `setupAnimation` function (below) we will set the `height` properly

  // Geeting dimmensions and setting up all for animation
  function setupAnimation () {
    // Updating dimmensions
    windowWidth = window.innerWidth
    containerHeight = container.getBoundingClientRect().height
    imageHeight = containerHeight / (windowWidth > 760 ? images.length / 2 : images.length)
    // Set `height` for the fake scroll element
    fakeScroll.style.height = containerHeight + 'px'
    // Start the animation, if it is not running already
    startAnimation()
  }

  // Update scroll `target`, and start the animation if it is not running already
  function updateScroll () {
    target = window.scrollY || window.pageYOffset
    startAnimation()
  }

  // Start the animation, if it is not running already
  function startAnimation () {
    if (!rafActive) {
      rafActive = true
      rafId = requestAnimationFrame(updateAnimation)
    }
  }

  // Do calculations and apply CSS `transform`s accordingly
  function updateAnimation () {
    // Difference between `target` and `current` scroll position
    var diff = target - current
    // `delta` is the value for adding to the `current` scroll position
    // If `diff < 0.1`, make `delta = 0`, so the animation would not be endless
    var delta = Math.abs(diff) < 0.1 ? 0 : diff * ease

    if (delta) { // If `delta !== 0`
      // Update `current` scroll position
      current += delta
      // Round value for better performance
      current = parseFloat(current.toFixed(2))
      // Call `update` again, using `requestAnimationFrame`
      rafId = requestAnimationFrame(updateAnimation)
    } else { // If `delta === 0`
      // Update `current`, and finish the animation loop
      current = target
      rafActive = false
      cancelAnimationFrame(rafId)
    }

    // Update images
    updateAnimationImages()

    // Set the CSS `transform` corresponding to the custom scroll effect
    setTransform(container, 'translateY('+ -current +'px)')
  }

  // Calculate the CSS `transform` values for each `image`, given the `current` scroll position
  function updateAnimationImages () {
    // This value is the `ratio` between `current` scroll position and image's `height`
    var ratio = current / imageHeight
    // Some variables for using in the loop
    var intersectionRatioIndex, intersectionRatioValue, intersectionRatio
    var rotateX, rotateXMax, rotateY, rotateYMax, translateX

    // For each `image` element, make calculations and set CSS `transform` accordingly
    images.forEach(function (image, index) {
      // Calculating the `intersectionRatio`, similar to the value provided by
      // the IntersectionObserver API
      intersectionRatioIndex = windowWidth > 760 ? parseInt(index / 2) : index
      intersectionRatioValue = ratio - intersectionRatioIndex
      intersectionRatio = Math.max(0, 1 - Math.abs(intersectionRatioValue))
      // Calculate the `rotateX` value for the current `image`
      rotateXMax = rotateXMaxList[index]
      rotateX = rotateXMax - (rotateXMax * intersectionRatio)
      rotateX = rotateX.toFixed(2)
      // Calculate the `rotateY` value for the current `image`
      rotateYMax = rotateYMaxList[index]
      rotateY = rotateYMax - (rotateYMax * intersectionRatio)
      rotateY = rotateY.toFixed(2)
      // Calculate the `translateX` value for the current `image`
      if (windowWidth > 760) {
        translateX = translateXMax - (translateXMax * easeOutQuad(intersectionRatio))
        translateX = translateX.toFixed(2)
      } else {
        translateX = 0
      }
      // Invert `rotateX` and `rotateY` values in case the image is below the center of the viewport
      // Also update `translateX` value, to achieve an alternating effect
      if (intersectionRatioValue < 0) {
        rotateX = -rotateX
        rotateY = -rotateY
        translateX = index % 2 ? -translateX : 0
      } else {
        translateX = index % 2 ? 0 : translateX
      }
      // Set the CSS `transform`, using calculated values
      setTransform(image, 'perspective(500px) translateX('+ translateX +'px) rotateX('+ rotateX +'deg) rotateY('+ rotateY +'deg)')
    })
  }

  // Listen for `resize` event to recalculate dimmensions
  window.addEventListener('resize', setupAnimation)
  // Listen for `scroll` event to update `target` scroll position
  window.addEventListener('scroll', updateScroll)

  // Initial setup
  setupAnimation()

})()
