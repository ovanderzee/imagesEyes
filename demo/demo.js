// start server for localhost at port 8 with npm start
let eyeDropApi
let eyeDropDiameter = 11

const firstImage = document.querySelector('figure img')
const allImages = document.querySelectorAll('figure img')
const allButtons = document.querySelectorAll('figure button')
const aside = document.querySelector('aside')

const xyCoordinateNode = document.getElementById('xy-coordinate')
const rgbSampleNode = document.getElementById('rgb-sample')
const rgbValueNode = document.getElementById('rgb-value')
const modelNode = document.getElementById('color-model')
const profileNode = document.getElementById('color-profile')

const mouseMoveHandler = function (event) {
    let domRect = this.getBoundingClientRect()
    let scaleX = this.clientWidth / this.naturalWidth
    let scaleY = this.clientHeight / this.naturalHeight
    let mouseX = event.x - domRect.x
    let mouseY = event.y - domRect.y
    let imgX = Math.floor(mouseX / scaleX)
    let imgY = Math.floor(mouseY / scaleY)
    xyCoordinateNode.textContent = `${imgX}, ${imgY}`
    // let color = eyeDropApi.getDropColor(imgX, imgY, eyeDropDiameter)
    let color = eyeDropApi.getPixelColor(imgX, imgY)
    rgbSampleNode.style.background = `rgba(${color.join()})`
    rgbValueNode.textContent = JSON.stringify( color )
}

const clearDashboard = function () {
    xyCoordinateNode.textContent = ''
    rgbSampleNode.style.background = 'transparent'
    rgbValueNode.textContent = ''
    modelNode.textContent = ''
    profileNode.textContent = ''
}

const eyeDropLoader = async function () {
    clearDashboard()
    let t0 = new Date()
    eyeDropApi = await imageEyes(this.src)
    this.addEventListener('mousemove', mouseMoveHandler)
    let t1 = new Date()
    console.log(`loading ${this.src} (${eyeDropApi.imageMemoryUsage()}) took ${(t1 - t0) / 1000} seconds`)
}

allImages.forEach((img) => {
    if (img === firstImage) {
        eyeDropLoader.call(firstImage)
    }
    img.addEventListener('mouseenter', async function () {
        eyeDropLoader.call(img)
        modelNode.textContent = await eyeDropApi.getColorModel()
        profileNode.textContent = await eyeDropApi.getColorProfile()
    })
})

const buildMetaDataView = async function(type) {
    if (!eyeDropApi) return
    const viewQuery = {}
    viewQuery[type] = true
    const metaObj = await eyeDropApi.getMetaData(viewQuery)
    let metaTable = document.createElement('table')
    for (let prop in metaObj) {
        if (
            typeof metaObj[prop] === 'string' ||
            typeof metaObj[prop] === 'number' ||
            metaObj[prop] instanceof Date
        ) {
            metaTable.innerHTML += `<tr><td>${prop}</th><td>${metaObj[prop]}</td></tr>`
        } else {
            let value = JSON.stringify(metaObj[prop])
            if (value) value = value.replace(/([,;])/g, '$1 ')
            metaTable.innerHTML += `<tr><td>${prop}</th><td>${value}</td></tr>`
        }
    }
    aside.innerHTML = ''
    aside.appendChild(metaTable)
}

aside.addEventListener('click', function() {
    aside.innerHTML = ''
})

document.querySelectorAll('.exif-btn').forEach(button => {
    button.addEventListener('click', function() {
        buildMetaDataView('exif')
    })
})

document.querySelectorAll('.gps-btn').forEach(button => {
    button.addEventListener('click', function() {
        buildMetaDataView('gps')
    })
})

document.querySelectorAll('.basic-btn').forEach(button => {
    button.addEventListener('click', function() {
        buildMetaDataView('ifd0')
    })
})

document.querySelectorAll('.icc-btn').forEach(button => {
    button.addEventListener('click', function() {
        buildMetaDataView('icc')
    })
})

document.querySelectorAll('.iptc-btn').forEach(button => {
    button.addEventListener('click', function() {
        buildMetaDataView('iptc')
    })
})

document.querySelectorAll('.xmp-btn').forEach(button => {
    button.addEventListener('click', function() {
        buildMetaDataView('xmp')
    })
})
