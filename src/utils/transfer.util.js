const fs = require('fs');
const convertor = require('./converter.util');
const path = require('path');
const { destination } = require('../middleware/transfer.middleware');
const { SGODWEB_UPLOAD } = require('process').env;

const rootPathUploadDir = path.resolve(__dirname, `../../${SGODWEB_UPLOAD}`);

const deleteFile = function (filePath) {
  if (filePath) {
    const path = `${rootPathUploadDir}${filePath}`;
    console.log(path);
    fs.rmSync(path, { force: true });
  }
  return 0;
};

const deleteImageFile = function (filePath) {
  if (filePath) {
    fs.unlink(`${rootPathUploadDir}/${filePath}`, (err) => {
      if (err) return 0;
    });
  }
};

/**
 *
 * function delete multiple file
 * with mode is file => delete array object ( each object is file )
 * with mode is array => delete array string ( with string is path file)
 */
// ** delete multiple image file
const deleteMulFile = function (files, mode = 'file') {
  switch (mode) {
  case 'file':
    files.forEach((file) => {
      const path = `${rootPathUploadDir}${file.path}`;
      fs.rmSync(path, { force: true });
    });
    break;
  case 'array':
    files.forEach((file) => {
      const path = `${rootPathUploadDir}${file}`;
      fs.rmSync(path, { force: true });
    });
    break;
  default:
    break;
  }
};

const uploadMultipleFile = function (files) {
  const filesPath = [];
  if (files && files.length > 0) {
    files.map((file) => {
      const path = `/images/${destination[file.fieldname]}/${file.filename}`;
      filesPath.push(path);
    });
  }
  return filesPath;
};

const uploadSingleFile = function (file) {
  if (file) {
    return `/images/${destination[file.fieldname]}/${file.filename}`;
  }
};

const updateMultipleFile = function (files, filesOdl) {
  if (files?.length == 0) {
    return filesOdl;
  }
};

const updateAvatar = function (file, avatarOld) {
  if (avatarOld) {
    fs.rmSync(`${rootPathUploadDir}/${avatarOld}`, { recursive: true });
  }
  return `/${convertor.formatImgPath(file.path)}`;
};

const updateSingleFile = function (file, imageOld) {
  if (!file) {
    return imageOld;
  }
  fs.rmSync(`${rootPathUploadDir}/${imageOld}`, {
    recursive: true,
    force: true,
  });
  return `/images/${destination[file.fieldname]}/${file.filename}`;
};

const renameFile = function (filePath, newPath) {
  const path = `${rootPathUploadDir}${newPath}`;
  fs.rename(filePath, path, (err) => {
    if (err) {
      return 0;
    }
  });
};

const execImageFile = function (image, itemDetail, editMode) {
  // ** case update image path of item detail is not image file
  if (!image) {
    switch (editMode) {
      case 'true':
        return itemDetail.image;
      case 'delete': {
        fs.rmSync(
          `${convertor.rootPath}/${SGODWEB_UPLOAD}/${itemDetail.image}`,
          { force: true },
        );
        return 0;
      }
      default:
        break;
    }
  } else {
    // ** case update-create image of item detail
    let formatImageUrl = convertor.formatImgPath(image.path);
    const pathReplace = `${convertor.rootPath}/${SGODWEB_UPLOAD}/${
      destination[image.fieldname]
    }${formatImageUrl}`;
    switch (editMode) {
      case 'false': {
        fs.rename(image.path, pathReplace, (err) => {
          if (err) {
            return 0;
          }
        });
        return formatImageUrl;
      }
      case 'true': {
        fs.rename(image.path, pathReplace, (err) => {
          if (err) {
            return 0;
          }
        });
        fs.rmSync(
          typeof itemDetail === 'object'
            ? `${convertor.rootPath}/${SGODWEB_UPLOAD}/${itemDetail.image}`
            : `${convertor.rootPath}/${SGODWEB_UPLOAD}/${itemDetail}`,
          { force: true },
        );
        return formatImageUrl;
      }
      case 'updatecourse': {
        fs.rename(image.path, pathReplace, (err) => {
          if (err) {
            return 0;
          }
        });
        if (!itemDetail.image.includes('course-default')) {
          fs.rmSync(
            `${convertor.rootPath}/${SGODWEB_UPLOAD}/${itemDetail.image}`,
            { force: true },
          );
        }
        return formatImageUrl;
      }
      default:
        break;
    }
  }
};

module.exports = {
  deleteFile,
  deleteImageFile,
  deleteMulFile,
  execImageFile,
  renameFile,
  updateMultipleFile,
  uploadMultipleFile,
  updateAvatar,
  updateSingleFile,
  uploadSingleFile,
};
