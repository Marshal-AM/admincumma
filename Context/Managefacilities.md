Now, let's move on to create the "Manage Facilities" section.

- When I click on the "Manage Facilities" button, the relevant details should appear on the right

- There should be a table with three values such as "Facility Title", "Date Published" and "Action"
- Below this, all the facilities should be displayed, in such a way that under the Facility Title, there should be a rectangular image of the facility, and on the right to the image there should be the facility name, and below which the address of the facility should be present, and under the address there could be multiple boxes displaying the various pricing plans the facility has
- Under the Date Published section, there should be the date in which the facility was published
- Under the action button, there should be an "Approve" and "Decline" button next to every facility
- Upon pressing the Approve button, the facility is approved and the value under the attribue "status" shoulbe be changed from "pending" to "active" and the facility should be removed from being displayed
- Upon pressing the Decline button, the facility is rejected and the value under the attribue "status" shoulbe be changed from "pending" to "rejected" and the facility should be removed from being displayed
- Note: ONLY display the facilities with "status" as "pending" in this section
- Whenever I press a facility listed here, I should be able to view a pop up window in which ALL the OTHER details of the facility should be displayed in a proper formatted clean UI
- In order to fetch and display the relevant data, you should use this MongoDB URL mongodb+srv://Marshal:Marshal2004@facilitease.qimoe.mongodb.net/ under which there is a DB named "Cumma" in which there is a collection named "Facilities"
- A sample record present in the "Facilities" collection looks something luke this:

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
    "$date": "2025-02-22T18:43:20.896Z"
  }
}

And the validation for this Collection is given below:

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

Note: The data present in EVERY document may VARY, so look into the validation CAREFULLY while building this page