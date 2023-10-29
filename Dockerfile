#Thiết lập cho local development
FROM node:16-alpine as development

WORKDIR /usr/src/api-web

COPY package*.json .

RUN npm install 

COPY . .

# #Chay lenh build de tao production
# RUN npm run build

#Xay dung production
FROM node:16-alpine as production

#Set NODE_ENV bien moi truong
ENV NODE_ENV=production

WORKDIR /usr/src/api-web

COPY package*.json .

RUN npm install ci --only=production

COPY . .

# #Khoi dong server su dung production build
CMD ["node", "/src/index.js"]