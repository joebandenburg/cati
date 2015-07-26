export function deviceSize(width) {
    if (isXlarge(width)) return "xlarge";
    if (isLarge(width)) return "large";
    if (isMedium(width)) return "medium";
    if (isSmall(width)) return "small";
    return "xsmall";
}

export function isXlarge(width) {
    return width > 1920;
}

export function isLarge(width) {
    return width > 1280;
}

export function isMedium(width) {
    return width > 960;
}

export function isSmall(width) {
    return width > 600;
}

export function isXsmall(width) {
    return width <= 600;
}

export function columnCount(width) {
    if (width > 840) return 12;
    if (width > 600) return 8;
    return 4;
}
export function gutterWidth(width) {
    if (width > 960) return 24;
    return 16;
}

export function columnWidth(width) {
    return (width - gutterWidth(width)) / columnCount(width) - gutterWidth(width);
}

export function calcWidth(width, desiredColumnCount) {
    if (desiredColumnCount >= columnCount(width)) {
        return "100%";
    }
    return columnWidth(width) * desiredColumnCount + gutterWidth(width) * (desiredColumnCount - 1);
}