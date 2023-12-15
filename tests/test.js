const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Update the path accordingly
const expect = chai.expect;

chai.use(chaiHttp);

describe('API Tests', () => {
  // ... Other test cases

  describe('CRUD Operations', () => {
    // ... Other CRUD test cases

    it('should add a new item', async () => {
      const newItem = {
        name: 'Test Item3',
        category: 'Test Category',
        price: 199
      };
    
      const res = await chai.request(app)
        .post('/items/add-item')
        .send(newItem);
    
      expect(res).to.have.status(201); // Updated this line to expect a status of 201
      expect(res.body).to.have.property('id');
      expect(res.body).to.deep.include(newItem);
    });
    it('should get all items', async () => {
      const res = await chai.request(app)
        .get('/items');

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });

    it('should get an item by ID', async () => {
      // Assuming you have an existing item ID for testing
      const itemId = '1f55ac6b-6d8e-4948-994f-01cf75c65f3f';

      const res = await chai.request(app)
        .get(`/items/get-itemByID/${itemId}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('id', itemId);
    });

    it('should update an item', async () => {
      // Assuming you have an existing item ID for testing
      const itemId = 'ce3b0439-6d31-49df-ba89-b1dcb0538347';
      const updatedItem = {
        name: 'Updated Item',
        category: 'Updated Category',
        price: 29.99
      };

      const res = await chai.request(app)
        .put(`/items/updateItem/${itemId}`)
        .send(updatedItem);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Item updated successfully');
    });

    it('should delete an item', async () => {
      // Assuming you have an existing item ID for testing
      const itemId = '2894b2e4-cfd4-4aac-8dfd-7db2bb80e784';

      const res = await chai.request(app)
        .delete(`/items/delete-item/${itemId}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Item deleted successfully');
    });
  });

  // Test Pagination
  describe('Pagination', () => {
    it('should get paginated items', async () => {
      const response = await chai.request(app).get('/items?limit=2');

      expect(response).to.have.status(200);
      expect(response.body).to.have.lengthOf(2);
    });
  });

  // Test Filtering
  describe('Filtering', () => {
    it('should get filtered items', async () => {
      const response = await chai.request(app).get('/items?filter=Test Category');

      expect(response).to.have.status(200);
      expect(response.body).to.be.an('array');
      expect(response.body.every(item => item.category === 'Test Category')).to.be.true;
    });
  });

  // Test Sorting
  describe('Sorting', () => {
    it('should get sorted items', async () => {
      const response = await chai.request(app).get('/items?sort[field]=price&sort[order]=1');

      expect(response).to.have.status(200);
      expect(response.body).to.be.an('array');
      const prices = response.body.map(item => item.price);
      expect(prices).to.eql(prices.slice().sort((a, b) => a - b));
    });
  });
});

