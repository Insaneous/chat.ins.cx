# Use the official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Create a new Expo app
RUN npx create-expo-app@latest . --yes

# Copy package.json and package-lock.json (if available)
COPY . .

# Install dependencies
RUN npm install

# Expose the port your app runs on (change if needed)
EXPOSE 8081

# Start the app
CMD ["npm", "run", "start"]