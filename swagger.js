require("dotenv").config();
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || 8000;

const swaggerAutogen = require("swagger-autogen")();
const packageJson = require("./package.json");

const document = {
  info: {
    version: packageJson.version,
    title: packageJson.title,
    description: packageJson.description,
    termsOfService: "https://github.com/Tech-Sync",
    contact: {
      name: packageJson.author,
      url: "https://github.com/Tech-Sync",
      email: "alidrl26@gmail.com",
    },
    license: { name: packageJson.license },
  },
  host: `${HOST}:$${PORT}`,
  basePath: "/",
  schemes: ["http", "https"],
  // JWT Settings:
  securityDefinitions: {
    JWT: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Entry Your AccessToken (JWT) for Login. Example: <b>Bearer <i>...token...<i></b>",
    },
  },
  security: [{ JWT: true }],
  defination:{
    "/auth/login": {
			email: {
				type: "String",
				required: true
			},
			password: {
				type: "String",
				required: true
			},
		},
    "/auth/register": {
			firstName: {
				type: "String",
				required: true
			},
			lastName: {
				type: "String",
				required: true
			},
			nrcNo: {
				type: "Number",
				required: true
			},
			phoneNO: {
				type: "Number",
				required: true
			},
			role: {
				type: "Number",
				required: true
			},
			email: {
				type: "String",
				required: true
			},
			password: {
				type: "String",
				required: true
			},
			isActive: {
				type: "Boolean",
				required: true
			},
			isVerified: {
				type: "Boolean",
				required: true
			},
			emailToken: {
				type: "String",
				required: false
			},
		},
		"/auth/refresh": {
			"token.refresh": {
				description: "{ token: { refresh: ... } }",
				type: "String",
				required: true
			}
		},
		"User": require('./src/models/user').schema.obj,
		"Material": require('./src/models/material').schema.obj,
		"Firm": require('./src/models/firm').schema.obj,
		"Purchase": require('./src/models/purchase').schema.obj,
		"PurchaseAccount": require('./src/models/account').schema.obj,
		"Sale": require('./src/models/sale').schema.obj,
		"Production": require('./src/models/production').schema.obj,
		"Product": require('./src/models/product').schema.obj,
		"Vehicle": require('./src/models/vehicle').schema.obj,
		"Delivery": require('./src/models/delivery').schema.obj,
		"SaleAccount": require('./src/models/saleAccount').schema.obj,
  }
};

const routes = ["./index.js"];
const outputFile = "./swagger.json";


// Create JSON file
swaggerAutogen(outputFile, routes, document);
