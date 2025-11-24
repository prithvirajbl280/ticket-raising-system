# ------------ STAGE 1: BUILD ----------
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Copy project
COPY . .

# Build the project (skip tests for faster CI)
RUN gradle build -x test


# ------------ STAGE 2: RUNTIME ----------
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Railway dynamically assigns the port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT}"]
