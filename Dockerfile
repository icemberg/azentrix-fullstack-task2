# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY task-management-systemf/package*.json ./
RUN npm install
COPY task-management-systemf/ ./
RUN npm run build

# Stage 2: Build the Spring Boot Backend (with Frontend bundled)
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-build
WORKDIR /app/backend
COPY task-management-system/pom.xml ./
# Download dependencies to cache them
RUN mvn dependency:go-offline -B
COPY task-management-system/src ./src
# Copy the compiled frontend files into the Spring Boot static resources folder
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Create the minimal production image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Create a non-root user for better security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=backend-build /app/backend/target/*.jar app.jar

# Enforce the production profile as requested
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
