import express from "express";
import { createItem, findAllItems, generateRandomOpenSearchData, searchItems } from "./dao.js";
import cors from "cors";

const app = express();
const port = 80;

app.use(cors({
    origin: '*'
}));

app.get('/healthcheck', (req, res) => {

    res.status(200).json({
            message: "ok"
        });
});

app.get('/items', async (req, res) => {

    const items = await findAllItems();

    res.status(200).json({
            items: items
        });
}) 


app.put('/item', async (req, res) => {

    const name = "";
    
    if(typeof req.query.name !== 'string') {
        res.status(400).json({
            'error': 'please provide a name'
        });
        return;
    }

    if(typeof req.query.price !== 'string' || Number.parseInt(req.query.price) <= 0) {
        res.status(400).json({
            'error': 'please provide a valid price'
        });
        return;
    }
    
    const idItemCreated = await createItem(req.query.name, Number.parseInt(req.query.price));

    res.status(200).json({
        id: idItemCreated
    });
});

app.get('/search', async (req, res) => {

    let query = "";

    if(typeof req.query.query == 'string') {
        query = req.query.query;
    }

    const items = await searchItems(query);

    res.status(200).json({
            items: items
        });
});

// Generates fake open search data
app.put('/generate', async (req, res) => { 

    const inserted = await generateRandomOpenSearchData();

    res.status(200).json({
        inserted: inserted
    });
});

app.listen(port, () => {
    console.log(`started app on port ${port} - env : ${process.env.ENV_NAME}`)
})

