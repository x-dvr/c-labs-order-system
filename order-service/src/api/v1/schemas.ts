import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

export default (app: FastifyInstance) => {
  app.addSchema({
    $id: 'OrderItem',
    type: 'object',
    required: ['itemID', 'productID', 'quantity', 'itemPrice'],
    properties: {
      itemID: {
        type: 'string',
        description: 'Identifier of the order item',
      },
      productID: {
        type: 'string',
        description: 'Identifier of the product',
      },
      quantity: {
        type: 'number',
        description: 'Quantity of the product',
      },
      itemPrice: {
        type: 'number',
        description: 'Quantity of the product',
      }
    }
  });

  app.addSchema({
    $id: 'Person',
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City Name',
      },
      country: {
        type: 'string',
        description: 'Name of the Country',
      },
      extensionFields: {
        type: 'object',
        description: 'Arbitrary json key value pairs'
      },
      firstName: {
        type: 'string',
        description: 'First Name of the Person',
      },
      houseNumber: {
        type: 'string',
        description: 'House Number',
      },
      id: {
        type: 'string',
        description: 'Unique MongoDB identifier',
      },
      lastName: {
        type: 'string',
        description: 'Last Name of the Person',
      },
      streetAddress: {
        type: 'string',
        description: 'Street name w/o house number',
      },
      zip: {
        type: 'string',
        description: 'House Number',
      }
    }
  });

  app.addSchema({
    $id: 'Order',
    type: 'object',
    properties: {
      orderID: {
        type: 'string',
        description: 'Unique identifier',
      },
      orderDate: {
        type: 'string',
        description: 'Date of Order Capture',
      },
      soldTo: {
        description: 'Person whom the order was sold to',
        $ref: 'Person#'
      },
      billTo: {
        description: 'Person whom the order will be billed to',
        $ref: 'Person#'
      },
      shipTo: {
        description: 'Person whom the order will be shipped to',
        $ref: 'Person#'
      },
      orderValue: {
        description: 'Value of the Order incl. taxes',
        type: 'number',
      },
      taxValue: {
        description: 'Total taxes of the Order',
        type: 'number',
      },
      currencyCode: {
        type: 'string',
        description: 'Order Currency',
      },
      items: {
        type: 'array',
        items: {
          $ref: 'OrderItem#'
        }
      }
    }
  });

  app.addSchema({
    $id: 'InputOrder',
    type: 'object',
    required: ['orderDate', 'soldToID', 'orderValue', 'taxValue', 'currencyCode', 'items'],
    properties: {
      orderDate: {
        type: 'string',
        description: 'Date of Order Capture',
        // example: '2021-07-17'
      },
      soldToID: {
        type: 'string',
        description: 'Unique identifier of the person whom the order was sold to',
      },
      billToID: {
        type: 'string',
        description: 'Unique identifier of the person whom the order is billed to',
      },
      shipToID: {
        type: 'string',
        description: 'Unique identifier of the person whom the order is sold to',
      },
      orderValue: {
        description: 'Value of the Order incl. taxes',
        type: 'number',
      },
      taxValue: {
        description: 'Total taxes of the Order',
        type: 'number',
      },
      currencyCode: {
        type: 'string',
        description: 'Order Currency',
      },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          $ref: 'OrderItem#'
        }
      }
    }
  });

  app.addSchema({
    $id: 'InputOrderPatch',
    type: 'object',
    properties: {
      orderDate: {
        type: 'string',
        description: 'Date of Order Capture',
        // example: '2021-07-17'
      },
      soldToID: {
        type: 'string',
        description: 'Unique identifier of the person whom the order was sold to',
      },
      billToID: {
        type: 'string',
        description: 'Unique identifier of the person whom the order is billed to',
      },
      shipToID: {
        type: 'string',
        description: 'Unique identifier of the person whom the order is sold to',
      },
      orderValue: {
        description: 'Value of the Order incl. taxes',
        type: 'number',
      },
      taxValue: {
        description: 'Total taxes of the Order',
        type: 'number',
      },
      currencyCode: {
        type: 'string',
        description: 'Order Currency',
      },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          $ref: 'OrderItem#'
        }
      }
    }
  });
}
