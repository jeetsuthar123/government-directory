import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  // app.enableCors({ origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(','), credentials: true });
  app.enableCors({
    origin: "*",
    credentials: true,
  });
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
  await app.listen(port);
  console.log(
    `Government Directory API listening on http://localhost:${port}/api/v1`,
  );
}
bootstrap();
