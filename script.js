// Check if user is logged in
document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = localStorage.getItem("loggedInUser")

  // If not logged in, redirect to login page
  if (!loggedInUser) {
    window.location.href = "login.html"
    return
  }

  // Display username
  document.getElementById("username-display").textContent = loggedInUser

  // Set up logout functionality
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser")
    window.location.href = "login.html"
  })

  // Initialize the media gallery from localStorage
  loadMediaGallery()

  // Set up event listeners
  document.getElementById("upload-form").addEventListener("submit", handleMediaUpload)

  // Set up file input preview
  document.getElementById("media-file").addEventListener("change", (event) => {
    const file = event.target.files[0]
    if (!file) return

    const previewElement = document.getElementById("upload-preview")
    previewElement.innerHTML = "" // Clear placeholder

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img")
      img.src = URL.createObjectURL(file)
      previewElement.appendChild(img)
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video")
      video.src = URL.createObjectURL(file)
      video.controls = true
      video.muted = true
      previewElement.appendChild(video)
    }
  })

  // Set up filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      // Add active class to clicked button
      this.classList.add("active")
      // Filter the gallery
      filterGallery(this.getAttribute("data-filter"))
    })
  })

  // Set up modal close button
  document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("modal-media-container").innerHTML = ""
    document.getElementById("media-modal").style.display = "none"
  })

  // Close modal when clicking outside of content
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("media-modal")
    if (event.target === modal) {
      document.getElementById("modal-media-container").innerHTML = ""
      modal.style.display = "none"
    }
  })
})

// Handle media upload
function handleMediaUpload(event) {
  event.preventDefault()

  const titleInput = document.getElementById("media-title")
  const fileInput = document.getElementById("media-file")

  const title = titleInput.value.trim()
  const file = fileInput.files[0]

  if (!title || !file) {
    alert("Please provide both a title and a file.")
    return
  }

  // Check if it's an image or video
  const fileType = file.type.startsWith("image/") ? "image" : "video"

  // Read the file as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    // Create a new media item
    const mediaItem = {
      id: Date.now().toString(),
      title: title,
      type: fileType,
      dataUrl: e.target.result,
      dateAdded: new Date().toISOString(),
      username: localStorage.getItem("loggedInUser"),
    }

    // Save to localStorage
    saveMediaItem(mediaItem)

    // Add to gallery
    addMediaToGallery(mediaItem)

    // Reset form
    titleInput.value = ""
    fileInput.value = ""

    // Hide empty gallery message if visible
    document.querySelector(".empty-gallery")?.remove()
  }

  reader.readAsDataURL(file)
}

// Save media item to localStorage
function saveMediaItem(mediaItem) {
  const username = localStorage.getItem("loggedInUser")
  const mediaItems = JSON.parse(localStorage.getItem(`mediaGallery_${username}`)) || []
  mediaItems.push(mediaItem)
  localStorage.setItem(`mediaGallery_${username}`, JSON.stringify(mediaItems))
}

// Load media gallery from localStorage
function loadMediaGallery() {
  const username = localStorage.getItem("loggedInUser")
  const mediaItems = JSON.parse(localStorage.getItem(`mediaGallery_${username}`)) || []

  if (mediaItems.length === 0) {
    // Show empty gallery message
    return
  }

  // Hide empty gallery message
  document.querySelector(".empty-gallery")?.remove()

  // Add each media item to the gallery
  mediaItems.forEach((item) => {
    addMediaToGallery(item)
  })
}

// Add media item to gallery
function addMediaToGallery(mediaItem) {
  const gallery = document.getElementById("media-gallery")

  // Create media item element
  const mediaElement = document.createElement("div")
  mediaElement.className = `media-item ${mediaItem.type}-item loading`
  mediaElement.dataset.type = mediaItem.type
  mediaElement.dataset.id = mediaItem.id

  // Create preview container (initially empty for loading state)
  const previewContainer = document.createElement("div")
  previewContainer.className = "media-preview"

  // Create info section
  const infoElement = document.createElement("div")
  infoElement.className = "media-info"

  const titleElement = document.createElement("h3")
  titleElement.className = "media-title"
  titleElement.textContent = mediaItem.title

  const typeElement = document.createElement("p")
  typeElement.className = "media-type"
  typeElement.textContent = mediaItem.type.charAt(0).toUpperCase() + mediaItem.type.slice(1)

  const deleteButton = document.createElement("button")
  deleteButton.className = "delete-btn"
  deleteButton.textContent = "Delete"
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation()
    deleteMediaItem(mediaItem.id)
  })

  // Assemble the media item
  infoElement.appendChild(titleElement)
  infoElement.appendChild(typeElement)
  infoElement.appendChild(deleteButton)

  mediaElement.appendChild(previewContainer)
  mediaElement.appendChild(infoElement)

  // Add to gallery first (to show loading state)
  gallery.appendChild(mediaElement)

  // Create and load the actual preview element
  let previewElement
  if (mediaItem.type === "image") {
    previewElement = document.createElement("img")
    previewElement.onload = () => {
      mediaElement.classList.remove("loading")
    }
    previewElement.src = mediaItem.dataUrl
    previewElement.alt = mediaItem.title
  } else {
    previewElement = document.createElement("video")
    previewElement.onloadeddata = () => {
      mediaElement.classList.remove("loading")
    }
    previewElement.src = mediaItem.dataUrl
    previewElement.muted = true
  }

  previewElement.className = "media-preview"

  // Replace the loading placeholder with the actual media
  previewContainer.appendChild(previewElement)

  // Add click event to open modal
  mediaElement.addEventListener("click", () => {
    openMediaModal(mediaItem)
  })
}

// Open media modal
function openMediaModal(mediaItem) {
  const modal = document.getElementById("media-modal")
  const modalTitle = document.getElementById("modal-title")
  const modalMediaContainer = document.getElementById("modal-media-container")

  // Set title
  modalTitle.textContent = mediaItem.title

  // Clear previous content
  modalMediaContainer.innerHTML = ""

  // Add media
  if (mediaItem.type === "image") {
    const img = document.createElement("img")
    img.src = mediaItem.dataUrl
    img.alt = mediaItem.title
    modalMediaContainer.appendChild(img)
  } else {
    const video = document.createElement("video")
    video.src = mediaItem.dataUrl
    video.controls = true
    video.autoplay = true
    modalMediaContainer.appendChild(video)
  }

  // Show modal
  modal.style.display = "block"
}

// Delete media item
function deleteMediaItem(id) {
  if (confirm("Are you sure you want to delete this item?")) {
    const username = localStorage.getItem("loggedInUser")
    // Remove from localStorage
    let mediaItems = JSON.parse(localStorage.getItem(`mediaGallery_${username}`)) || []
    mediaItems = mediaItems.filter((item) => item.id !== id)
    localStorage.setItem(`mediaGallery_${username}`, JSON.stringify(mediaItems))

    // Remove from DOM
    const mediaElement = document.querySelector(`.media-item[data-id="${id}"]`)
    if (mediaElement) {
      mediaElement.remove()
    }

    // Show empty gallery message if no items left
    if (mediaItems.length === 0) {
      const gallery = document.getElementById("media-gallery")
      const emptyMessage = document.createElement("div")
      emptyMessage.className = "empty-gallery"
      emptyMessage.innerHTML = `
        <div class="placeholder-gallery">
          <div class="placeholder-item">
            <div class="placeholder-image"></div>
            <div class="placeholder-text"></div>
          </div>
          <div class="placeholder-item">
            <div class="placeholder-image"></div>
            <div class="placeholder-text"></div>
          </div>
          <div class="placeholder-item">
            <div class="placeholder-image"></div>
            <div class="placeholder-text"></div>
          </div>
        </div>
        <p>Your gallery is empty. Add some media to get started!</p>
      `
      gallery.appendChild(emptyMessage)
    }
  }
}

// Filter gallery
function filterGallery(filterType) {
  const mediaItems = document.querySelectorAll(".media-item")

  mediaItems.forEach((item) => {
    if (filterType === "all" || item.dataset.type === filterType) {
      item.style.display = "block"
    } else {
      item.style.display = "none"
    }
  })
}

