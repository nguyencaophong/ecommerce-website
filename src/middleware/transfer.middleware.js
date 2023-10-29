const fs = require('fs');
const multer = require('multer');
const path = require('path');
const maxSize = 5 * 1024 * 1024;
const { SGODWEB_UPLOAD } = require('process').env;

const getMediaDir = (dir) => {
  new Promise((resolve, reject) =>
    fs.readdir(dir, (err, files) => (err ? reject(err) : resolve(files))),
  );
};

const FIELD_NAME_UPLOAD = {
  IMAGE_MESSAGES: 'messages', // field of image request
  IMAGE_AVATAR: 'avatar', // field of image request
  IMAGE_NEWS: 'imageNews',
  IMAGE_COMMON: 'imageCommon',
  IMAGE_COURSE: 'imageCourse',
  IMAGE_SLIDE: 'imageSlide',
  IMAGE_LOGO: 'imageLogo',
  IMAGE_LICENSE: 'imageLicense',
  IMAGE_TYPE_SLIDE: 'imageTypeSlide',
};

const destination = {
  [FIELD_NAME_UPLOAD.IMAGE_MESSAGES]: 'messages',
  [FIELD_NAME_UPLOAD.IMAGE_AVATAR]: 'avatars',
  [FIELD_NAME_UPLOAD.IMAGE_NEWS]: 'news',
  [FIELD_NAME_UPLOAD.IMAGE_COMMON]: 'commons',
  [FIELD_NAME_UPLOAD.IMAGE_COURSE]: 'courses',
  [FIELD_NAME_UPLOAD.IMAGE_SLIDE]: 'slides',
  [FIELD_NAME_UPLOAD.IMAGE_LOGO]: 'logos',
  [FIELD_NAME_UPLOAD.IMAGE_LICENSE]: 'licenses',
  [FIELD_NAME_UPLOAD.IMAGE_TYPE_SLIDE]: 'type-slides',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rootPathUploadDir = path.resolve(
      __dirname,
      `../../${SGODWEB_UPLOAD}/images/${destination[file.fieldname]}`,
    );
    if (!fs.existsSync(`${rootPathUploadDir}`)) {
      fs.mkdirSync(rootPathUploadDir, { recursive: true });
    }
    cb(null, rootPathUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    cb(null, true);
  } else {
    cb(
      new HttpException(
        `Unsupported file type ${extname(file.originalname)}`,
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: maxSize },
});
module.exports = { upload, destination, FIELD_NAME_UPLOAD };
