collection: "Facilities"

validation:
{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'serviceProviderId',
      'facilityType',
      'status',
      'details',
      'features',
      'address',
      'city',
      'pincode',
      'state',
      'country',
      'isFeatured'
    ],
    properties: {
      serviceProviderId: {
        bsonType: 'objectId',
        description: 'must be an ObjectId and is required'
      },
      facilityType: {
        'enum': [
          'individual-cabin',
          'coworking-spaces',
          'meeting-rooms',
          'bio-allied-labs',
          'manufacturing-labs',
          'prototyping-labs',
          'software',
          'saas-allied',
          'raw-space-office',
          'raw-space-lab'
        ],
        description: 'must be one of the enum values and is required'
      },
      status: {
        'enum': [
          'active',
          'pending',
          'rejected'
        ],
        description: 'must be one of the enum values and is required'
      },
      details: {
        bsonType: 'object',
        required: [
          'name',
          'description',
          'images',
          'rentalPlans'
        ],
        properties: {
          name: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          description: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          images: {
            bsonType: 'array',
            items: {
              bsonType: 'string'
            },
            description: 'must be an array of strings and is required'
          },
          videoLink: {
            bsonType: 'string',
            description: 'must be a string if present'
          },
          equipment: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                labName: {
                  bsonType: 'string',
                  description: 'must be a string if present'
                },
                equipmentName: {
                  bsonType: 'string',
                  description: 'must be a string and is required'
                },
                capacityAndMake: {
                  bsonType: 'string',
                  description: 'must be a string and is required'
                },
                softwareName: {
                  bsonType: 'string',
                  description: 'must be a string if present'
                },
                version: {
                  bsonType: 'string',
                  description: 'must be a string if present'
                }
              }
            }
          },
          areaDetails: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: [
                'area',
                'type',
                'furnishing',
                'customisation'
              ],
              properties: {
                area: {
                  bsonType: 'number',
                  description: 'must be a number and is required'
                },
                type: {
                  'enum': [
                    'Covered',
                    'Uncovered'
                  ],
                  description: 'must be one of the enum values and is required'
                },
                furnishing: {
                  'enum': [
                    'Furnished',
                    'Not Furnished'
                  ],
                  description: 'must be one of the enum values and is required'
                },
                customisation: {
                  'enum': [
                    'Open to Customisation',
                    'Cannot be Customised'
                  ],
                  description: 'must be one of the enum values and is required'
                }
              }
            }
          },
          rentalPlans: {
            bsonType: 'array',
            minItems: 1,
            items: {
              bsonType: 'object',
              required: [
                'name',
                'price',
                'duration'
              ],
              properties: {
                name: {
                  'enum': [
                    'Annual',
                    'Monthly',
                    'Weekly',
                    'One Day (24 Hours)'
                  ],
                  description: 'must be one of the enum values and is required'
                },
                price: {
                  bsonType: 'number',
                  description: 'must be a number and is required'
                },
                duration: {
                  'enum': [
                    'Annual',
                    'Monthly',
                    'Weekly',
                    'One Day (24 Hours)'
                  ],
                  description: 'must be one of the enum values and is required'
                }
              }
            }
          },
          totalCabins: {
            bsonType: 'number',
            description: 'must be a number if present'
          },
          availableCabins: {
            bsonType: 'number',
            description: 'must be a number if present'
          },
          totalSeats: {
            bsonType: 'number',
            description: 'must be a number if present'
          },
          availableSeats: {
            bsonType: 'number',
            description: 'must be a number if present'
          },
          totalRooms: {
            bsonType: 'number',
            description: 'must be a number if present'
          },
          seatingCapacity: {
            bsonType: 'number',
            description: 'must be a number if present'
          },
          totalTrainingRoomSeaters: {
            bsonType: 'number',
            description: 'must be a number if present'
          }
        }
      },
      features: {
        bsonType: 'array',
        items: {
          bsonType: 'string'
        }
      },
      address: {
        bsonType: 'string'
      },
      city: {
        bsonType: 'string'
      },
      pincode: {
        bsonType: 'string'
      },
      state: {
        bsonType: 'string'
      },
      country: {
        bsonType: 'string'
      },
      isFeatured: {
        bsonType: 'bool'
      },
      createdAt: {
        bsonType: 'date',
        description: 'must be a date and is required'
      },
      updatedAt: {
        bsonType: 'date',
        description: 'must be a date and is required'
      }
    }
  }
}

Sample document:

{
  "_id": {
    "$oid": "67ba1ac8cfb19f9280241ec1"
  },
  "serviceProviderId": {
    "$oid": "67a661e8e49797580e3894a9"
  },
  "facilityType": "individual-cabin",
  "status": "active",
  "details": {
    "name": "Google",
    "description": "Google LLC (/ˈɡuːɡəl/ ⓘ, GOO-gəl) is an American multinational corporation and technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, consumer electronics, and artificial intelligence (AI).[9] It has been referred to as \"the most powerful company in the world\" by the BBC[10] and is one of the world's most valuable brands due to its market dominance, data collection, and technological advantages in the field of AI.[11][12][13] Alongside Amazon, Apple, Meta, and Microsoft, Google's parent company, Alphabet Inc. is one of the five Big Tech companies.\n\nGoogle was founded on September 4, 1998, by American computer scientists Larry Page and Sergey Brin while they were PhD students at Stanford University in California. Together, they own about 14% of its publicly listed shares and control 56% of its stockholder voting power through super-voting stock. The company went public via an initial public offering (IPO) in 2004. In 2015, Google was reorganized as a wholly owned subsidiary of Alphabet Inc. Google is Alphabet's largest subsidiary and is a holding company for Alphabet's internet properties and interests. Sundar Pichai was appointed CEO of Google on October 24, 2015, replacing Larry Page, who became the CEO of Alphabet. On December 3, 2019, Pichai also became the CEO of Alphabet",
    "images": [
      "https://cummaimages.s3.eu-north-1.amazonaws.com/cb64128c7934311e223997698e143014-1740249733226.png"
    ],
    "videoLink": "",
    "rentalPlans": [
      {
        "name": "Annual",
        "price": 22222,
        "duration": "Annual"
      },
      {
        "name": "Monthly",
        "price": 2222,
        "duration": "Monthly"
      },
      {
        "name": "Weekly",
        "price": 222,
        "duration": "Weekly"
      },
      {
        "name": "One Day (24 Hours)",
        "price": 22,
        "duration": "One Day (24 Hours)"
      }
    ],
    "totalCabins": 222,
    "availableCabins": 22
  },
  "features": [
    "Access to In-House Mentors",
    "Air Conditioned",
    "Printers & Accessories",
    "CCTV Enabled",
    "Car Parking",
    "Two Wheeler Parking",
    "Phone Booths"
  ],
  "address": "Google park, googleplex",
  "city": "Silicon Valley",
  "pincode": "28394",
  "state": "California",
  "country": "United States",
  "isFeatured": true,
  "createdAt": {
    "$date": "2025-02-22T18:43:20.896Z"
  },
  "updatedAt": {
    "$date": "2025-02-23T16:48:45.235Z"
  }
}


collection: "bookings"

validation:

{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'facilityId',
      'startupId',
      'incubatorId',
      'rentalPlan',
      'whatsappNumber',
      'status',
      'paymentStatus',
      'amount',
      'requestedAt',
      'createdAt',
      'updatedAt'
    ],
    properties: {
      facilityId: {
        bsonType: 'objectId',
        description: 'Must be an ObjectId and is required'
      },
      startupId: {
        bsonType: 'objectId',
        description: 'Must be an ObjectId and is required'
      },
      incubatorId: {
        bsonType: 'objectId',
        description: 'Must be an ObjectId and is required'
      },
      whatsappNumber: {
        bsonType: 'string'
      },
      rentalPlan: {
        'enum': [
          'Annual',
          'Monthly',
          'Weekly',
          'Hourly',
          'One Day (24 Hours)'
        ],
        description: 'Must be one of the predefined values and is required'
      },
      status: {
        'enum': [
          'pending',
          'approved',
          'rejected'
        ],
        description: 'Must be \'pending\', \'approved\', or \'rejected\' and is required'
      },
      paymentStatus: {
        'enum': [
          'pending',
          'completed',
          'failed'
        ],
        description: 'Must be \'pending\', \'completed\', or \'failed\' and is required'
      },
      amount: {
        bsonType: 'number',
        description: 'Must be a number and is required'
      },
      requestedAt: {
        bsonType: 'date',
        description: 'Must be a date and is required'
      },
      processedAt: {
        bsonType: [
          'date',
          'null'
        ],
        description: 'Must be a date or null'
      },
      createdAt: {
        bsonType: 'date',
        description: 'Must be a date and is required'
      },
      updatedAt: {
        bsonType: 'date',
        description: 'Must be a date and is required'
      }
    }
  }
}

collection: "Startups"

validation:

The validation under the startups collection looks like this:
{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'userId',
      'startupName',
      'contactName',
      'contactNumber',
      'createdAt',
      'updatedAt',
      'founderName',
      'founderDesignation',
      'entityType',
      'teamSize',
      'startupMailId',
      'industry',
      'sector',
      'stagecompleted'
    ],
    properties: {
      userId: {
        bsonType: 'objectId'
      },
      startupName: {
        bsonType: 'string',
        minLength: 1
      },
      contactName: {
        bsonType: 'string',
        minLength: 1
      },
      contactNumber: {
        bsonType: 'string',
        minLength: 1
      },
      founderName: {
        bsonType: 'string',
        minLength: 1
      },
      founderDesignation: {
        bsonType: 'string',
        minLength: 1
      },
      entityType: {
        bsonType: 'string',
        'enum': [
          'LLP',
          'Private Limited',
          'Sole Proprietorship'
        ]
      },
      teamSize: {
        bsonType: 'int',
        minimum: 0
      },
      dpiitNumber: {
        bsonType: [
          'string',
          'null'
        ],
        minLength: 1
      },
      sector: {
        bsonType: 'string',
        minLength: 1
      },
      industry: {
        bsonType: 'string',
        minLength: 1
      },
      stagecompleted: {
        bsonType: 'string',
        minLength: 1
      },
      startupMailId: {
        bsonType: 'string',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      },
      website: {
        bsonType: [
          'string',
          'null'
        ],
        pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-])\\/?$'
      },
      linkedinStartupUrl: {
        bsonType: [
          'string',
          'null'
        ]
      },
      linkedinFounderUrl: {
        bsonType: [
          'string',
          'null'
        ]
      },
      lookingFor: {
        bsonType: [
          'array',
          'null'
        ],
        items: {
          bsonType: 'string',
          minLength: 1
        }
      },
      address: {
        bsonType: [
          'string',
          'null'
        ]
      },
      logoUrl: {
        bsonType: [
          'string',
          'null'
        ]
      },
      createdAt: {
        bsonType: 'date'
      },
      updatedAt: {
        bsonType: 'date'
      }
    }
  }
}

sample document:

{
  "_id": {
    "$oid": "67b47c3fa119ef2c1e341cf0"
  },
  "userId": {
    "$oid": "67b47c3ea119ef2c1e341cee"
  },
  "startupName": "joker",
  "contactName": "Marshal",
  "contactNumber": "09876543210",
  "founderName": "erde32qr4",
  "founderDesignation": "3r32r423r",
  "entityType": "Sole Proprietorship",
  "teamSize": 23,
  "dpiitNumber": "234fdsgvref",
  "industry": "Automotive",
  "sector": "Robotics and Automation",
  "stagecompleted": "Product Development",
  "startupMailId": "marshal.25ec@licet.ac.in",
  "website": "https://wb.com",
  "linkedinStartupUrl": "https://www.linkedin.com/in/marshal-am-32b029226/",
  "linkedinFounderUrl": "https://www.linkedin.com/in/marshal-am-32b029226/",
  "lookingFor": [
    "Coworking Spaces"
  ],
  "address": "No: 181",
  "logoUrl": null,
  "createdAt": {
    "$date": "2025-02-18T12:25:35.375Z"
  },
  "updatedAt": {
    "$date": "2025-02-18T12:25:35.377Z"
  },
  "__v": 0
}
