# Node.js Auth APIs with Testing

This repository contains a Node.js application that serves authentication APIs and includes testing. The application provides endpoints for user registration, login, logout and authentication.

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Getting Started

To get started with the application, follow these steps:

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/your-username/nodejs-auth-api.git
   ```

2. Change to the project directory:

   ```bash
   cd nodejs-auth-api
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up the environment variables:

   - Create a `.env` file in the root of the project.
   - Define the following variables in the `.env` file:

     ```
        DATABASE_URL=
        DATABASE_PASSWORD=
        PORT=
        NODE_ENV=

        JWT_SECRET=
        JWT_EXPIRES_IN=
        JWT_COOKIE_EXPIRES_IN=
        PORT=3000
     ```

5. Run the application:

   ```bash
   npm start
   ```

   This will start the server on `http://localhost:3000`.

## API Endpoints

The application provides the following API endpoints:

- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - User login and token generation
- `GET /api/v1/users/logout` - User Logout (requires authentication)
- `GET /api/v1/protected` - Protected route (requires authentication)
- `GET /api/v1/products/list` - Can be accessed by admin or supervisor (requires authentication)
- `DELETE /api/v1/products/delete` - Can be accessed by admin only (requires authentication)

Please find the exported postman collection [Here](/postman_collection.json)

## Testing

The application includes automated tests using [Jest](https://jestjs.io/). To run the tests, follow these steps:

1. Ensure you have completed the setup steps mentioned above.

2. Set up the environment variables:

   - Create a `test.env` file in the root of the project.
   - Define the same variables thats exists in `.env` and  file.

3. Run the tests:

   ```bash
   npm test
   ```

   The tests will execute, and the results will be displayed in the console.

## TODO
- Social Media login
- Refresh token api 
- Send welcome email 
- Build a frond-end app that consume back-end apis 

## Contributing

If you want to contribute to this project, please follow these steps:

1. Fork the repository on GitHub.

2. Clone your forked repository to your local machine:

   ```bash
   git clone https://github.com/your-username/nodejs-auth-api.git
   ```

3. Create a new branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. Make your changes and commit them:

   ```bash
   git commit -m "Add your commit message here"
   ```

5. Push your changes to your forked repository:

   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a pull request on the original repository.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use and modify the code as per the terms of the license.