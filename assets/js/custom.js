document.addEventListener("DOMContentLoaded", function () {
  var productTabs = document.querySelectorAll(".product-tab");
  var productPanels = document.querySelectorAll(".product-tab-content .tab-pane");
  var whySlider = document.querySelector("[data-why-slider]");
  var whyTrack = whySlider ? whySlider.querySelector(".why-track") : null;
  var whyCards = whyTrack ? whyTrack.querySelectorAll(".reason-card") : [];
  var whyProgress = document.querySelector("[data-why-progress]");
  var uspItems = Array.prototype.slice.call(document.querySelectorAll(".usp-item"));
  var capabilitySlider = document.querySelector("[data-capability-slider]");
  var capabilityTrack = capabilitySlider ? capabilitySlider.querySelector(".capability-grid") : null;
  var videoSlider = document.querySelector("[data-video-slider]");
  var videoCards = videoSlider ? Array.prototype.slice.call(videoSlider.querySelectorAll(".video-card")) : [];
  var faqToggles = document.querySelectorAll(".faq-toggle");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".top-nav .nav-link"));
  var navSections = navLinks.map(function (link) {
    var href = link.getAttribute("href");
    var section = href ? document.querySelector(href) : null;

    if (!section) {
      return null;
    }

    return {
      link: link,
      section: section
    };
  }).filter(Boolean);

  if (navSections.length) {
    function setActiveNavLink(activeLink) {
      navLinks.forEach(function (link) {
        link.classList.toggle("active", link === activeLink);
      });
    }

    function updateActiveNavByScroll() {
      var headerOffset = 96;
      var activeLine = headerOffset + 8;
      var activeSection = null;
      var nearestSection = navSections[0];
      var nearestDistance = Infinity;

      navSections.forEach(function (item) {
        var rect = item.section.getBoundingClientRect();
        var distance = Math.abs(rect.top - activeLine);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestSection = item;
        }

        if (rect.top <= activeLine && rect.bottom > activeLine) {
          activeSection = item;
        }
      });

      setActiveNavLink((activeSection || nearestSection).link);
    }

    navSections.forEach(function (item) {
      item.link.addEventListener("click", function () {
        setActiveNavLink(item.link);
      });
    });

    window.addEventListener("scroll", updateActiveNavByScroll, { passive: true });
    window.addEventListener("resize", updateActiveNavByScroll);
    updateActiveNavByScroll();
  }

  if (productTabs.length && productPanels.length) {
    function activateProductTab(targetId) {
      productTabs.forEach(function (tab) {
        var isActive = tab.getAttribute("href") === targetId;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      productPanels.forEach(function (panel) {
        var isActive = "#" + panel.id === targetId;
        panel.classList.toggle("show", isActive);
        panel.classList.toggle("active", isActive);
      });
    }

    productTabs.forEach(function (tab) {
      tab.addEventListener("click", function (event) {
        event.preventDefault();
        activateProductTab(tab.getAttribute("href"));
      });
    });
  }

  if (faqToggles.length) {
    function setFaqState(toggle, shouldOpen) {
      var targetId = toggle.getAttribute("data-target");
      var target = targetId ? document.querySelector(targetId) : null;

      if (!target) {
        return;
      }

      toggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      toggle.classList.toggle("collapsed", !shouldOpen);
      target.classList.toggle("show", shouldOpen);
    }

    faqToggles.forEach(function (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();

        var isOpen = toggle.getAttribute("aria-expanded") === "true";

        faqToggles.forEach(function (otherToggle) {
          setFaqState(otherToggle, false);
        });

        setFaqState(toggle, !isOpen);
      });
    });
  }

  if (uspItems.length) {
    function playUspPreview(item) {
      var previewVideo = item.querySelector(".usp-preview-media");

      if (!previewVideo) {
        return;
      }

      if (previewVideo.readyState === 0) {
        previewVideo.load();
      }

      var playPromise = previewVideo.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function pauseUspPreview(item) {
      var previewVideo = item.querySelector(".usp-preview-media");

      if (!previewVideo) {
        return;
      }

      previewVideo.pause();
      previewVideo.currentTime = 0;
    }

    uspItems.forEach(function (item, index) {
      item.addEventListener("mouseenter", function () {
        uspItems.forEach(function (otherItem) {
          if (otherItem !== item) {
            pauseUspPreview(otherItem);
          }
        });

        playUspPreview(item);
      });

      item.addEventListener("mouseleave", function () {
        if (index !== 0) {
          pauseUspPreview(item);
        }
      });

      item.addEventListener("focusin", function () {
        uspItems.forEach(function (otherItem) {
          if (otherItem !== item) {
            pauseUspPreview(otherItem);
          }
        });

        playUspPreview(item);
      });

      item.addEventListener("focusout", function () {
        if (index !== 0) {
          pauseUspPreview(item);
        }
      });
    });

    playUspPreview(uspItems[0]);
  }

  if (whySlider && whyTrack && whyCards.length && whyProgress) {
    var isWhyDragging = false;
    var whyDragStartX = 0;
    var whyDragStartScroll = 0;

    function whyVisibleCards() {
      if (window.innerWidth <= 767.98) {
        return 1;
      }

      return 3;
    }

    function updateWhySlider() {
      var visibleCards = whyVisibleCards();
      var progressWidth = whyCards.length > 0 ? (visibleCards / whyCards.length) * 100 : 100;
      var maxScroll = Math.max(whySlider.scrollWidth - whySlider.clientWidth, 0);
      var progressTravel = 100 - progressWidth;
      var progressOffset = maxScroll > 0 ? (whySlider.scrollLeft / maxScroll) * progressTravel : 0;

      whyProgress.style.width = progressWidth + "%";
      whyProgress.style.transform = "translateX(" + progressOffset + "%)";
    }

    whySlider.addEventListener("scroll", updateWhySlider, { passive: true });

    whySlider.addEventListener("wheel", function (event) {
      if (window.innerWidth > 767.98 && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        whySlider.scrollBy({
          left: event.deltaY,
          behavior: "smooth"
        });
      }
    }, { passive: false });

    whySlider.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      isWhyDragging = true;
      whyDragStartX = event.clientX;
      whyDragStartScroll = whySlider.scrollLeft;
      whySlider.classList.add("is-dragging");
      whySlider.setPointerCapture(event.pointerId);
    });

    whySlider.addEventListener("pointermove", function (event) {
      if (!isWhyDragging) {
        return;
      }

      whySlider.scrollLeft = whyDragStartScroll - (event.clientX - whyDragStartX);
    });

    function stopWhyDrag(event) {
      if (!isWhyDragging) {
        return;
      }

      isWhyDragging = false;
      whySlider.classList.remove("is-dragging");

      if (event) {
        whySlider.releasePointerCapture(event.pointerId);
      }
    }

    whySlider.addEventListener("pointerup", stopWhyDrag);
    whySlider.addEventListener("pointercancel", stopWhyDrag);
    whySlider.addEventListener("pointerleave", function (event) {
      if (event.pointerType !== "mouse") {
        return;
      }

      stopWhyDrag(event);
    });

    window.addEventListener("resize", updateWhySlider);

    updateWhySlider();
  }

  if (capabilitySlider && capabilityTrack) {
    var isCapabilityDragging = false;
    var capabilityDragStartX = 0;
    var capabilityDragStartScroll = 0;
    var capabilitySuppressClick = false;

    capabilitySlider.addEventListener("wheel", function (event) {
      if (window.innerWidth <= 767.98) {
        return;
      }

      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        capabilitySlider.scrollLeft += event.deltaY;
      }
    }, { passive: false });

    capabilitySlider.addEventListener("pointerdown", function (event) {
      if (window.innerWidth <= 767.98) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      isCapabilityDragging = true;
      capabilitySuppressClick = false;
      capabilityDragStartX = event.clientX;
      capabilityDragStartScroll = capabilitySlider.scrollLeft;
      capabilitySlider.classList.add("is-dragging");
      capabilitySlider.setPointerCapture(event.pointerId);
    });

    capabilitySlider.addEventListener("pointermove", function (event) {
      if (!isCapabilityDragging) {
        return;
      }

      var deltaX = event.clientX - capabilityDragStartX;

      if (Math.abs(deltaX) > 4) {
        capabilitySuppressClick = true;
      }

      capabilitySlider.scrollLeft = capabilityDragStartScroll - deltaX;
    });

    function stopCapabilityDrag(event) {
      if (!isCapabilityDragging) {
        return;
      }

      isCapabilityDragging = false;
      capabilitySlider.classList.remove("is-dragging");

      if (event) {
        capabilitySlider.releasePointerCapture(event.pointerId);
      }
    }

    capabilitySlider.addEventListener("pointerup", stopCapabilityDrag);
    capabilitySlider.addEventListener("pointercancel", stopCapabilityDrag);
    capabilitySlider.addEventListener("pointerleave", function (event) {
      if (event.pointerType !== "mouse") {
        return;
      }

      stopCapabilityDrag(event);
    });

    capabilityTrack.addEventListener("click", function (event) {
      if (!capabilitySuppressClick) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      capabilitySuppressClick = false;
    }, true);
  }

  if (videoSlider && videoCards.length) {
    var videoIndex = 0;
    var videoDragStartX = 0;
    var videoDragDeltaX = 0;
    var isVideoDragging = false;
    var videoSuppressClick = false;

    function updateVideoSlider() {
      videoCards.forEach(function (card, index) {
        var media = card.querySelector("video");
        card.classList.remove("is-prev", "is-active", "is-next");

        if (index === videoIndex) {
          card.classList.add("is-active");
        } else if (index === (videoIndex - 1 + videoCards.length) % videoCards.length) {
          card.classList.add("is-prev");
        } else if (index === (videoIndex + 1) % videoCards.length) {
          card.classList.add("is-next");
        } else {
          card.classList.add("is-next");
        }

        if (media && index !== videoIndex) {
          media.pause();
          card.classList.remove("is-playing");
        }
      });
    }

    function goToVideo(nextIndex) {
      if (nextIndex < 0) {
        videoIndex = videoCards.length - 1;
      } else if (nextIndex >= videoCards.length) {
        videoIndex = 0;
      } else {
        videoIndex = nextIndex;
      }

      updateVideoSlider();
    }

    videoCards.forEach(function (card, index) {
      var playButton = card.querySelector("[data-video-play]");
      var media = card.querySelector("video");

      card.addEventListener("click", function () {
        if (videoSuppressClick) {
          videoSuppressClick = false;
          return;
        }

        if (index !== videoIndex) {
          goToVideo(index);
        }
      });

      if (playButton && media) {
        playButton.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          goToVideo(index);
          media.setAttribute("controls", "controls");

          if (media.readyState === 0) {
            media.load();
          }

          var playPromise = media.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              media.load();
              media.play();
            });
          }
        });

        media.addEventListener("play", function () {
          card.classList.add("is-playing");
        });

        media.addEventListener("pause", function () {
          if (!media.ended) {
            card.classList.remove("is-playing");
          }
        });

        media.addEventListener("ended", function () {
          card.classList.remove("is-playing");
        });
      }
    });

    videoSlider.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      isVideoDragging = true;
      videoDragStartX = event.clientX;
      videoDragDeltaX = 0;
      videoSuppressClick = false;
    });

    videoSlider.addEventListener("pointermove", function (event) {
      if (!isVideoDragging) {
        return;
      }

      videoDragDeltaX = event.clientX - videoDragStartX;
    });

    function stopVideoDrag() {
      if (!isVideoDragging) {
        return;
      }

      if (videoDragDeltaX <= -40) {
        goToVideo(videoIndex + 1);
        videoSuppressClick = true;
      } else if (videoDragDeltaX >= 40) {
        goToVideo(videoIndex - 1);
        videoSuppressClick = true;
      }

      isVideoDragging = false;
      videoDragDeltaX = 0;
    }

    videoSlider.addEventListener("pointerup", stopVideoDrag);
    videoSlider.addEventListener("pointercancel", stopVideoDrag);
    videoSlider.addEventListener("pointerleave", function (event) {
      if (!isVideoDragging || event.pointerType !== "mouse") {
        return;
      }

      stopVideoDrag();
    });

    videoSlider.addEventListener("touchstart", function (event) {
      videoDragStartX = event.changedTouches[0].clientX;
      videoDragDeltaX = 0;
    }, { passive: true });

    videoSlider.addEventListener("touchmove", function (event) {
      videoDragDeltaX = event.changedTouches[0].clientX - videoDragStartX;
    }, { passive: true });

    videoSlider.addEventListener("touchend", function () {
      if (videoDragDeltaX <= -40) {
        goToVideo(videoIndex + 1);
        videoSuppressClick = true;
      } else if (videoDragDeltaX >= 40) {
        goToVideo(videoIndex - 1);
        videoSuppressClick = true;
      }
      videoDragDeltaX = 0;
      isVideoDragging = false;
    });

    videoSlider.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    videoCards.forEach(function (card) {
      card.addEventListener("dragstart", function (event) {
        event.preventDefault();
      });
    });

    updateVideoSlider();
  }
});
