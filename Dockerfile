# Set the base image to Node.js LTS
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . ./

# Build the Next.js app
RUN npm run build

# Expose port 3000 in the container
EXPOSE 3000

# Run the app
CMD [ "npm", "start" ]
