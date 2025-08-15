
document.addEventListener("DOMContentLoaded", () => {
    const presetScrollBar = document.getElementById("presetScrollBar");
    const categoryScrollBar = document.getElementById("categoryScrollBar");
    const buttonContainer = document.querySelector(".scrollable-buttons");

    const presets = [
        { name: "Default", action: applyDefaultPreset },
        { name: "Remove", action: applyunderwear },
		{ name: "Bunny", action: applyBunnyPreset },
    ];

    const categories = [
'bottomunderwear1', 'bottomunderwear2', 'bottomunderwear3',
'topunderwear1', 'topunderwear2', 'topunderwear3', 'stocking1', 'stocking3',
'onepiece1', 'onepiece3',
'socks1', 'socks2', 'socks3',
'boxers1', 'boxers2', 'boxers3',
'sweatshirt1', 'sweatshirt2', 'sweatshirt3',
'shoes1', 'shoes2', 'shoes3',
'pants1', 'pants2', 'pants3',
'skirt1', 'skirt2', 'skirt3',
'top1', 'top2', 'top3',
'dress1', 'dress2', 'dress3',
'jacket1', 'jacket2', 'jacket3', 'dress1w',
'bunnysuitbow1', 'bunnysuitbow2', 'bunnysuitbow3',
'dress2w',
'dress3w',
'skirt1w',
'skirt2w',
'skirt3w',
'accessories1', 'accessories2', 'accessories3',
'hat1', 'hat2', 'hat3',
'mask1', 'mask2', 'mask3',
'bow1', 'bow2', 'bow3'
    ];

    function generatePresetButtons() {
        presetScrollBar.innerHTML = "";
        presets.forEach(preset => {
            const presetButton = document.createElement("button");
            presetButton.textContent = preset.name;
            presetButton.classList.add("preset-button");
            presetButton.onclick = preset.action;
            presetScrollBar.appendChild(presetButton);
        });
    }

    function generateCategoryButtons() {
        categoryScrollBar.innerHTML = "";
        categories.forEach(cat => {
            const tab = document.createElement("button");
            tab.textContent = cat;
            tab.classList.add("preset-button");
            tab.onclick = () => showCategoryButtons(cat);
            categoryScrollBar.appendChild(tab);
        });
    }

    function showCategoryButtons(categoryName) {
        buttonContainer.innerHTML = "";

        const items = document.querySelectorAll(`img.${categoryName}`);
        items.forEach(item => {
            const buttonWrap = document.createElement('div');
            buttonWrap.classList.add('button-wrap');

            const button = document.createElement("img");
            button.src = item.src.replace(".png", "b.png");
            button.classList.add("item-button");
            button.onclick = () => toggleVisibility(item.id, categoryName);
            buttonWrap.appendChild(button);

            const colorButton = document.createElement("button");
            colorButton.textContent = "🎨";
            colorButton.classList.add("color-change-button");
            colorButton.onclick = (e) => {
                e.stopPropagation();
                if (item.style.visibility === "hidden") toggleVisibility(item.id, categoryName);
                showColorPicker(item.id);
            };
            buttonWrap.appendChild(colorButton);

            buttonContainer.appendChild(buttonWrap);
        });
    }

    generatePresetButtons();
    generateCategoryButtons();

    // Scroll behavior for each bar
    [presetScrollBar, categoryScrollBar].forEach(scrollEl => {
        scrollEl.addEventListener("wheel", (evt) => {
            if (evt.deltaY !== 0) {
                evt.preventDefault();
                scrollEl.scrollLeft += evt.deltaY;
            }
        }, { passive: false });
    });
});
function enableDragScroll(scrollElement) {
    let isDown = false;
    let startX;
    let scrollLeft;

    scrollElement.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollElement.classList.add('dragging');
        startX = e.pageX - scrollElement.offsetLeft;
        scrollLeft = scrollElement.scrollLeft;
    });

    scrollElement.addEventListener('mouseleave', () => {
        isDown = false;
        scrollElement.classList.remove('dragging');
    });

    scrollElement.addEventListener('mouseup', () => {
        isDown = false;
        scrollElement.classList.remove('dragging');
    });

    scrollElement.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollElement.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed
        scrollElement.scrollLeft = scrollLeft - walk;
    });
}

// Enable drag scrolling on load
document.addEventListener("DOMContentLoaded", () => {
    const presetScroll = document.getElementById("presetScrollBar");
    const categoryScroll = document.getElementById("categoryScrollBar");

    if (presetScroll) enableDragScroll(presetScroll);
    if (categoryScroll) enableDragScroll(categoryScroll);
});