
let mouseMoved = false;
let currentGridWidth = 0; // Default size
let currentGridHeight = 0; // Default size

window.onload = updateGrid; // On page load, create the default grid.

function updateGrid() {
    const container = document.getElementById('drawingArea');
    const newGridWidth = parseInt(document.getElementById('gridWidth').value);
    const newGridHeight = parseInt(document.getElementById('gridHeight').value);
    
    container.style.gridTemplateColumns = `repeat(${newGridWidth}, 20px)`;

    // If we're reducing the number of columns
    if (newGridWidth < currentGridWidth) {
        for (let row = 1; row <= newGridHeight; row++) {
            for (let col = currentGridWidth; col > newGridWidth; col--) {
                removeGridItem(row, col);
            }
        }
    }

    // If we're reducing the number of rows
    if (newGridHeight < currentGridHeight) {
        for (let col = 1; col <= newGridWidth; col++) {
            for (let row = currentGridHeight; row > newGridHeight; row--) {
                removeGridItem(row, col);
            }
        }
    }

    // If we're increasing the number of columns
    if (newGridWidth > currentGridWidth) {
        for (let row = 1; row <= currentGridHeight; row++) {  // Update only existing rows
            for (let col = currentGridWidth + 1; col <= newGridWidth; col++) {
                const gridItem = createGridItem();
                gridItem.style.gridColumnStart = col;
                gridItem.style.gridRowStart = row;
                container.appendChild(gridItem);
            }
        }
    }

    // If we're increasing the number of rows
    if (newGridHeight > currentGridHeight) {
        for (let col = 1; col <= newGridWidth; col++) {
            for (let row = currentGridHeight + 1; row <= newGridHeight; row++) {
                const gridItem = createGridItem();
                gridItem.style.gridColumnStart = col;
                gridItem.style.gridRowStart = row;
                container.appendChild(gridItem);
            }
        }
    }

    currentGridWidth = newGridWidth;
    currentGridHeight = newGridHeight;
    updateCArrayDisplay();
}


function removeGridItem(row, col) {
    const items = document.querySelectorAll(`.gridItem[style*="grid-row-start: ${row};"][style*="grid-column-start: ${col};"]`);
    items.forEach(item => item.remove());
}

function createGridItem() {
    const gridItem = document.createElement('div');
    gridItem.className = 'gridItem';

    gridItem.addEventListener('mousedown', handleMouseDown);
    gridItem.addEventListener('mouseup', handleMouseUp);
    gridItem.addEventListener('mouseover', handleMouseOver);

    return gridItem;
}

let cellChanged = false;


let isDrawing = false;
let toggleToState = null;

function handleMouseDown(e) {
    if (e.target.id === 'outputArray') return;
    
    if (e.target.classList.contains('gridItem')) {
        isDrawing = true;

        // Toggle the current cell and remember the state
        toggleToState = !e.target.classList.contains('toggled');
        setGridItemState(e.target, toggleToState);
        
        updateCArrayDisplay();
    }
}

function handleMouseUp(e) {
    isDrawing = false;
    toggleToState = null;
    updateCArrayDisplay();
}

function handleMouseOver(e) {
    if (isDrawing && e.target.classList.contains('gridItem')) {
        setGridItemState(e.target, toggleToState);
    }
}

function setGridItemState(item, state) {
    if (state) {
        item.classList.add('toggled');
    } else {
        item.classList.remove('toggled');
    }
}


function clearGrid() {
    const gridItems = document.querySelectorAll('.gridItem.toggled');
    gridItems.forEach(item => item.classList.remove('toggled'));
		updateCArrayDisplay();
}

function generateBitmapArray() {
const gridItems = Array.from(document.querySelectorAll('.gridItem'))
    .filter(item => item.nodeType === Node.ELEMENT_NODE && item.classList.contains('gridItem'))
    .sort((a, b) => {
        const rowA = parseInt(a.style.gridRowStart);
        const colA = parseInt(a.style.gridColumnStart);
        const rowB = parseInt(b.style.gridRowStart);
        const colB = parseInt(b.style.gridColumnStart);
        
        if (rowA !== rowB) return rowA - rowB;
        return colA - colB;
    });
		console.log(gridItems.length)
    let byteVal = 0;
    let currentBit = 7;
    let arrayHex = [];
    let arrayBinary = [];
    let bytesPerRow = Math.ceil(currentGridWidth / 8);
    let currentByteCount = 0;

    
let byteRowCounter = 0;  // To keep track of bytes added in the current row
currentBit = 7;          // Start with the MSB (leftmost bit)

gridItems.forEach((item, index) => {
    if (item.classList.contains('toggled')) {
        byteVal |= (1 << currentBit);
    }
    currentBit--;

    if (currentBit < 0 || (index + 1) % currentGridWidth == 0 || index == gridItems.length - 1) {
        arrayHex.push(byteVal);
        arrayBinary.push('0b' + byteVal.toString(2).padStart(8, '0'));
        currentBit = 7;
        byteVal = 0;
        byteRowCounter++;
    }

    if ((index + 1) % currentGridWidth == 0) {
        while (byteRowCounter < bytesPerRow) {
            arrayHex.push(0);
            arrayBinary.push('0b00000000');
            byteRowCounter++;
        }
        byteRowCounter = 0; // Reset for the next row
    }
});




    
    return {
        hexArray: arrayHex,
        binaryArray: arrayBinary
    };
}





function updateCArrayDisplay() {
    const { hexArray, binaryArray } = generateBitmapArray();

    let hexTextArray = hexArray.map((value, index) => {
        return `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;
    });

    let binaryTextArray = binaryArray.map((value) => {
        return `${value}`;
    });
    
const bytesPerRow = Math.ceil(currentGridWidth / 8); // Calculate the number of bytes per row

let hexText = "\\\\Hex Array:\nunsigned char bitmap_array[] = {\n\t\t";
hexTextArray.forEach((value, index) => {
    hexText += value;
    if ((index + 1) % bytesPerRow === 0 && index !== hexTextArray.length - 1) {
        hexText += ',\n\t\t';
    } else if (index !== hexTextArray.length - 1) {
        hexText += ', ';
    }
});
hexText += "\n\t\t}";

let binaryText = "\\\\Binary Array:\nunsigned char bitmap_array[] = {\n\t\t";
binaryTextArray.forEach((value, index) => {
    binaryText += value;
    if ((index + 1) % bytesPerRow === 0 && index !== binaryTextArray.length - 1) {
        binaryText += ',\n\t\t';
    } else if (index !== binaryTextArray.length - 1) {
        binaryText += ', ';
    }
});
binaryText += "\n\t\t}";



    document.getElementById('outputArrayHex').textContent = hexText;
    document.getElementById('outputArrayBinary').textContent = binaryText;
}

// For user interactions outside the cells
document.addEventListener("mouseup", () => {
    isDrawing = false;
    mouseMoved = false;
});

document.getElementById('updateGridBtn').addEventListener('click', updateGrid);
document.getElementById('clearGridBtn').addEventListener('click', clearGrid);
document.addEventListener('dragstart', function (e) {
    e.preventDefault();
});
