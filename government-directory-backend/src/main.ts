import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173,http://localhost:8081,http://localhost:19006"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: allowedOrigins, credentials: false });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  const swagger = new DocumentBuilder()
    .setTitle("Government Officer Directory API")
    .setDescription(
      "Multi-department directory API matching the supplied MongoDB architecture.",
    )
    .setVersion("1.1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, swagger),
  );
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, process.env.HOST || "0.0.0.0");
  console.log(
    `Government Directory API listening on http://localhost:${port}/api/v1`,
  );
}
bootstrap();
