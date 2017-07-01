function loaded() {
  var screen_wrapper = document.querySelectorAll('.screens-wrap')[0],
    screens = document.querySelectorAll('.screen'),
    tour_component = document.querySelectorAll('.tour-component')[0],
    next = document.querySelector('.arrow.next'),
    prev = document.querySelector('.arrow.prev'),
    pages = document.querySelectorAll('.page'),
    paginator = document.querySelectorAll('.paginator')[0],
    index = 0,
    screen_width = document.body.clientWidth - 300

  updateScreenWidth()
  window.onresize = updateScreenWidth

  next.addEventListener('click', function () {
    if (index == screens.length-1) return
    index++
    updateScreen(0)
    updateClass()
    updateIndicator()
  })

  prev.addEventListener('click', function () {
    if (index < 1) return
    index--
    updateScreen()
    updateClass()
    updateIndicator()
  })

  paginator.addEventListener('click', function (e) {
    if (e.target.className != 'page') {
      return
    }
    index = [].indexOf.call(pages, e.target)
    updateScreen()
    updateClass()
    updateIndicator()
  })

  function updateScreenWidth() {
    screen_width = document.body.clientWidth - 300
    screen_wrapper.style.width = screen_width * 5 + 'px'
    for (var i = 0; i < screens.length; ++i) {
      screens[i].style.width = screen_width + 'px'
    }
    updateScreen()
    updateClass()
    updateIndicator()
  }

  function updateScreen() {
    screen_wrapper.style.webkitTransform = 'translateX(-' + (screen_width * index) + 'px)'
    screen_wrapper.style.transform = 'translateX(-' + (screen_width * index) + 'px)'
  }

  function updateClass() {
    if (index == screens.length-1) {
      tour_component.classList.add('last')
      tour_component.classList.remove('first')
    } else if (index < 1) {
      tour_component.classList.add('first')
      tour_component.classList.remove('last')
    } else {
      tour_component.classList.remove('first')
      tour_component.classList.remove('last')
    }
  }

  function updateIndicator() {
    for (var i = 0; i < pages.length; ++i) {
      if (i == index) {
        pages[i].classList.add('active')
      } else {
        pages[i].classList.remove('active')
      }
    }
  }
}

//document.addEventListener('DOMContentLoaded', loaded)
