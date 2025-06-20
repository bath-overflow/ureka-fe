# Step 1: Build React application  
FROM node:20-alpine as builder  

# Set working directory  
WORKDIR /app  

# Copy package.json and package-lock.json  
COPY package.json package-lock.json ./  

# Install dependencies  
RUN npm install  

# Copy React app source code  
COPY . ./  

# Build the React app  
RUN npm run build  

# Step 2: Serve React app using vite preview  
FROM node:20-alpine as production

WORKDIR /app

# Copy built files and dependencies from builder
COPY --from=builder /app /app

# Expose port 3000
EXPOSE 3000

# Start the app using vite preview on port 3000
CMD ["npx", "vite", "preview", "--host", "--port", "3000"]  
