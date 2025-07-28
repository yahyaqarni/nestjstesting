import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('App E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Register', () => {
      it('should register a new user', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            name: 'Test User',
            email: 'test13@gmail.com',
            password: 'test123/',
          })
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('should login an existing user', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'test@gmail.com',
            password: 'test123/',
          })
          .expectStatus(200)
        })
      });
  });
});
