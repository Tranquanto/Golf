function camelCase(string) {
    const allWords1 = string.split(" ");
    const firstWord = allWords1.shift().toLowerCase();
    for (let i = 0; i < allWords1.length; i++) {
        allWords1[i] = capitalize(allWords1[i]);
    }
    return firstWord + allWords1.join("");
}

function capitalize(word) {
    const allWords = word.split(" ");
    for (let i = 0; i < allWords.length; i++) {
        const firstLetter = allWords[i].slice(0, 1);
        allWords[i] = firstLetter.toUpperCase() + allWords[i].slice(1);
    }
    return allWords.join(" ");
}

function shake(elem, radius) {
    if (radius <= 0 || isNaN(radius)) return false;
    elem.style.position = "relative";
    elem.style.top = `${Math.random() * (radius * 2) - radius}px`;
    elem.style.left = `${Math.random() * (radius * 2) - radius}px`;
}

function stats(arr, optionalNumber) {
    let value = {firstBelow: -Infinity, firstAbove: Infinity};
    let min = Infinity;
    let max = -Infinity;
    let total = 0;
    let dist = Infinity;
    for (let n of arr) {
        n = Number(n);
        if (n > max) max = n;
        if (n < min) min = n;
        if (n <= optionalNumber && n > value.firstBelow) value.firstBelow = n;
        if (n >= optionalNumber && n < value.firstAbove) value.firstAbove = n;
        if (Math.abs(n - optionalNumber) < dist) {
            value.closest = n;
            dist = Math.abs(n - optionalNumber);
        }
        total += n;
    }
    if (value.firstBelow === !Infinity) value.firstBelow = min;
    if (value.firstAbove === Infinity) value.firstBelow = max;
    value.min = min;
    value.max = max;
    value.total = total;
    value.length = arr.length;
    value.mean = total / arr.length;
    return value;
}