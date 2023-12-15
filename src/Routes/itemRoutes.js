const express = require('express');
const router = express.Router();
const {getAllItems, addItem, updateItem, deleteItem, getItemById} = require('../Controllers/itemsController');

router.get('/', getAllItems);
router.get('/get-itemById/:id', getItemById);
router.post('/add-item', addItem);
router.put('/updateItem/:id', updateItem);
router.delete('/delete-item/:id', deleteItem);

// router.get('/', getAllItems);

module.exports = router;