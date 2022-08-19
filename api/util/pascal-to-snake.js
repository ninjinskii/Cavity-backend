export default function (object) {
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
