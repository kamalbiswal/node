const fs = require('fs').promises;
const path = require('path');
const {uuid} = require('uuidv4');

const itemsPath = path.join(__dirname, '../Data/itemsData.json');

//functions to read and write items to the json file

const readItems = async () => {
    try {
        const data = await fs.readFile(itemsPath);
        return JSON.parse(data);
    } catch (err) {
        console.log('error reading items from file', err);
        throw err;
    }
};

const writeItems = async (items) => {
    try {
        // Read existing items
        const existingItems = await readItems();

        // Filter items with existing id
        const newUniqueItems = items.filter((newItem) => !existingItems.some((existingItem) => existingItem.id === newItem.id));

        // Combine existing items with new items
        const updatedItems = [...existingItems, ...newUniqueItems];

        // Write the updated items to the file
        await fs.writeFile(itemsPath, JSON.stringify(updatedItems, null, 2));
    } catch (err) {
        console.log('Error writing files', err);
        throw err;
    }
};


// should use for deleteItem function
const writeItemsForDelete = async (items) => {
    try {
        // Writing the entire array of items to the file
        await fs.writeFile(itemsPath, JSON.stringify(items, null, 2));
    } catch (err) {
        console.log('Error writing files', err);
        throw err;
    }
};


// Get all Items
exports.getAllItems = async (req, res) => {
    try {
      const items = await readItems();
  
      // Applying filtering which can be called as ?filter=category name
      const filteredItems = req.query.filter
        ? items.filter((item) => item.category === req.query.filter)
        : items;
  
      // Applying sorting which can be called as ?sort[field]=name&sort[order]=-1
      if (req.query.sort) {
        const sort = req.query.sort;
        filteredItems.sort((a, b) => (a[sort.field] > b[sort.field] ? sort.order : -sort.order));
      }
  
      // Applying pagination using limit, which can be called as ?limit=5
      const limit = parseInt(req.query.limit) || filteredItems.length;
      const paginatedItems = filteredItems.slice(0, limit);
  
      res.status(200).json(paginatedItems);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };


//Item find by it's id
exports.getItemById = async(req, res) => {
    try{
        const itemId = req.params.id;

    // Checking if the itemId provided
    if(!itemId){
        return res.status(400).json({message: 'item not found;'})
    }

    // getting all the items
    const items = await readItems();

    // finding the item that mathches with the itemId
    const selectedItem = items.find((item) => item?.id === itemId);

    //Checking if the item with that id available or not
    if(!selectedItem){
        return res(400).json({message: 'item not found'})
    }
    return res.status(200).json(selectedItem);

    } catch (err) {
        return res.status(500).json({message: 'Server error'})
    }
}
//Create new item
exports.addItem = async(req, res) => {
    try{
        const {name, category, price} = req.body;

    // Checking if name is astring and not including any special character
    const nameRegex = /^[a-zA-Z0-9\s]+$/; 
    if (typeof name !== 'string' || !nameRegex.test(name)) {
        return res.status(400).json({ error: 'Invalid name. It should be a string without special characters.' });
    }

    // Checking if category is a string
    if (typeof category !== 'string') {
        return res.status(400).json({ error: 'Invalid category. It should be a string.' });
    }

    // Checking if price is a number
    if (typeof price !== 'number') {
        return res.status(400).json({ error: 'Invalid price. It should be a number.' });
    }


    if(!name || !category || !price) {
        return res.status(400).json({message: 'Provide all details of the item'});
    }

    let items = await readItems();
    // console.log('Items', items.data);
     // This will ensure that items is an array
     if (!Array.isArray(items)) {
        items = [];
      }
  
    const existedItem = items.find(item => item.name === name);
    // console.log(existedItem)
    if(existedItem){
        return res.status(400).json({message: 'An item with same name already exists'});
    }

    const newItem = {
        id: uuid(),
        name, 
        category, 
        price
    };

    items.push(newItem);

    await writeItems(items);

    res.status(201).json(newItem);
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: 'Server error'});
    }
}


//update item
exports.updateItem = async(req, res) => {
    try{
        const {name, category, price}  = req.body;

        console.log(req.body.name)
        const itemId = req.params.id;

    if(!name || !category || !price){
        return res.status(400).json({message: 'Please provide atleast one field to update'});
    }

    const items = await readItems();

    const updatedItems = items.map((item) => {
        if(item.id === itemId){
            return {
                id: item.id,
                name: name || item.name,
                category: category || item.category,
                price: price || item.price
            };
        }

        return item;
    });

    await writeItems(updatedItems);
    res.json({message: 'Item updated successfully'});
    } catch (err) {
        return res.status(500).json({message: 'Error updating item'})
    }
}


//delete item
exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;

    try {
        let items = await readItems();

        // console.log('Items', items);
        const separatedItems = items.filter(item => item.id !== itemId);

        if (items.length === separatedItems.length) {
            // If the lengths are same, then the item was not found.
            return res.status(400).json({ message: 'Item not found' });
        }

        // console.log('separatedItems', separatedItems);

        await writeItemsForDelete(separatedItems);

        return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.log('Error deleting item', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};