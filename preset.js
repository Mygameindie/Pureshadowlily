// Common hidden categories (all items to hide by default in presets)
const commonHiddenCategories = [
'bottomunderwear1', 'bottomunderwear2', 'bottomunderwear3',
'topunderwear1', 'topunderwear2', 'topunderwear3',
'onepiece1', 'onepiece3',
'socks1', 'socks2', 'socks3', 'stocking1', 'stocking3',
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

// 🎯 Template: create a new preset easily using this
function applyDefaultPreset() {
    // Hide all clothing items first
    hideSpecificCategories(commonHiddenCategories);

    // Show underwear tops
    showItem("topunderwear1_1.png", "topunderwear1");
    showItem("topunderwear3_1.png", "topunderwear3");

    // Show all bottom underwear
    showItem("bottomunderwear1_1.png", "bottomunderwear1");
    showItem("bottomunderwear2_1.png", "bottomunderwear2");
    showItem("bottomunderwear3_1.png", "bottomunderwear3");

    // Show boxers2
    showItem("boxers2_1.png", "boxers2");

    // Show dresses
    showItem("dress1_1.png", "dress1");
    showItem("dress2_1.png", "dress2");
    showItem("dress3_1.png", "dress3");

    // Show accessories
    showItem("bow1_1.png", "bow1");
    showItem("hat2_1.png", "hat1");
}

function applyunderwear() {
    // Hide all clothing items first
    hideSpecificCategories(commonHiddenCategories);

    // Show underwear tops
    showItem("topunderwear1_1.png", "topunderwear1");
    showItem("topunderwear3_1.png", "topunderwear3");

    // Show all bottom underwear
    showItem("bottomunderwear1_1.png", "bottomunderwear1");
    showItem("bottomunderwear2_1.png", "bottomunderwear2");
    showItem("bottomunderwear3_1.png", "bottomunderwear3");

    // Show boxers2
    showItem("boxers2_1.png", "boxers2");
}

function applyBunnyPreset() {
    // Hide all clothing items first
    hideSpecificCategories(commonHiddenCategories);

    showItem("boxers2_1.png", "boxers2");
    showItem("bunnysuitbow1_1.png", "bunnysuitbow1");
    showItem("bunnysuitbow3_1.png", "bunnysuitbow3");
    showItem("hat1_1.png", "hat1");
    showItem("hat2_2.png", "hat2");
    showItem("hat3_1.png", "hat3");
    showItem("jacket2_1.png", "jacket2");
    showItem("onepiece1_1.png", "onepiece1");
    showItem("onepiece3_1.png", "onepiece3");
    showItem("pants2_1.png", "pants2");
    showItem("shoes1_1.png", "shoes1");
    showItem("shoes2_1.png", "shoes2");
    showItem("shoes3_1.png", "shoes3");
    showItem("stocking1_1.png", "stocking1");
    showItem("stocking3_1.png", "stocking3");
}
// ✅ Shared showItem function for consistent item display
function showItem(itemId, categoryName) {
    const selectedItem = document.getElementById(itemId);
    if (selectedItem) {
        selectedItem.style.visibility = "visible";       // Force visibility
        selectedItem.style.display = "block";            // Ensure it's not hidden
        selectedItem.style.position = "absolute";        // Keep absolute positioning
        selectedItem.style.left = "0";                   // Align left
        selectedItem.style.top = "0";                    // Align top
        selectedItem.style.zIndex = getZIndex(categoryName); // Correct layering
    } else {
        console.warn(`Item not found: ${itemId} in category ${categoryName}`);
    }
}