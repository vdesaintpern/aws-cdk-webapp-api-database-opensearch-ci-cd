FROM public.ecr.aws/bitnami/node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build 

EXPOSE 80
CMD [ "node", "." ]