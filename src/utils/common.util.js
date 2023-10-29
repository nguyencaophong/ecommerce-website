module.exports.findINDEX = (arrayItem, i) => {
  const findIndex = arrayItem.findIndex((item) => item._id.toString() === i);
  if (findIndex === -1) {
    throw new Error(`Invalid id ${i} value !`);
  }
  return findIndex;
};

module.exports.deleteItem = (arrayItem, index) => {
  const findIndex1 = arrayItem.findIndex(
    (item) => item._id.toString() === index
  );
  if (findIndex1 === -1) {
    throw new Error(`Invalid id ${index} value !`);
  } else {
    arrayItem.splice(findIndex1, 1);
  }
  return arrayItem;
};