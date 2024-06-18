function transformKeysToLowercase(obj) {
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            let lowercaseKey = key.toLowerCase();
            const value = obj[key];

            if (key.toLowerCase() === 'created_at' || key.toLocaleLowerCase() === 'date' || key.toLowerCase() === 'birth_date' || key.toLowerCase() === 'start' || key.toLowerCase() === 'end' ) {
                newObj[lowercaseKey] = value;
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                newObj[lowercaseKey] = transformKeysToLowercase(value);
            } else if (Array.isArray(value)) {
                newObj[lowercaseKey] = value.map(item => transformKeysToLowercase(item));
            } else {
                newObj[lowercaseKey] = value;
            }
        }
    }
    return newObj;
}

module.exports = {
    transformKeysToLowercase
}
