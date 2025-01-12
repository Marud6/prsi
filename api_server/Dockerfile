FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3006

# Start the server using nodemon, configured to watch the specific file
CMD ["npm", "start","--host"]
