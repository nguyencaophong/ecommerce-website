const apiRoot = require('app-root-path');
const { genRandomChars } = require('./generator.util')
module.exports.rootPath = apiRoot
  .toString()
  .split("/")
  .splice(0, apiRoot.toString().split("/").length - 1)
  .toString()
  .replace(/,/g, "/");

module.exports.capitalize = (text) =>
  text.length > 0 ? text[0].toUpperCase() + text.slice(1) : text;

module.exports.toFile = (filename, elements = filename.split(/\./)) => ({
  name: filename.slice(
    0,
    filename.length - elements[elements.length - 1].length - 1
  ),
  extension: filename.slice(
    filename.length - elements[elements.length - 1].length - 1
  ),
});

module.exports.formatImgPath = function (urlImage) {
  let imgPath = urlImage.trim();
  if (imgPath.includes("\\") || imgPath.includes("/")) {
    imgPath = urlImage.replace(/\\/g, "/");
    imgPath = imgPath.split("/");
    imgPath = imgPath[imgPath.length - 1];
  }
  imgPath = imgPath.replace(/\s/g, "-");
  return `/images/${imgPath}`;
};

module.exports.formatDate = (d) => {
  let date = d.getDate();
  let month = d.getMonth();
  const year = d.getFullYear();
  if (date < 10) {
    date = `0${date}`.toString();
  }
  if (month < 10) {
    month = `0${month + 1}`.toString();
  }
  return `${year}-${month}-${date}`;
};

module.exports.formatKeyword = function (item) {
  let key;
  typeof item === "string"
    ? (key = item
      .replace(/[|&;$%@"<>()+,]/g, "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase())
    : (key = item
      .toString()
      .replace(/[|&;$%@"<>()+,]/g, "")
      .replace(/\s+/g, "")
      .trim()
      .toUpperCase());
  return key;
};

module.exports.removeAccent = (str)  => {
  return str
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

module.exports.formatSlug = (name,options) => {
  let nameWithoutAccent = this.removeAccent(name);
  const slug = `${
    nameWithoutAccent.includes(" ")
      ? `${nameWithoutAccent.trim().split(" ").join("-")}`
      : nameWithoutAccent
  }`;
  if(options)
  {
    const regex = /^[a-zA-Z0-9!@#$%^&*_+;':"\\|,.<>\/?]+$/;
    let randomStr = Array.from({length:5},genRandomChars).join('');
    while(!regex.test(randomStr)) {
      randomStr = Array.from({length:5},genRandomChars).join('')
    }
    const date = new Date();
    return `${slug}-${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}-${
      options.isEdit ? options.oldSlug.slice(-5) : randomStr
    }`;
  }
  return slug;
  
}
