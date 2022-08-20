export function pascalToSnake(object: never) {
  Object.keys(object).forEach((oldKey) => {
    // Key is already formatted correctly
    if (oldKey === oldKey.toLowerCase()) {
      return;
    }

    const newKey = oldKey.split(/\.?(?=[A-Z])/).join("_").toLowerCase();
    delete Object.assign(object, { [newKey]: object[oldKey] })[oldKey];
  });

  return object;
}

export function kebabToSnake(object: never) {
  Object.keys(object).forEach((oldKey) => {
    const newKey = oldKey.replaceAll("-", "_");
    delete Object.assign(object, { [newKey]: object[oldKey] })[oldKey];
  });

  return object;
}
